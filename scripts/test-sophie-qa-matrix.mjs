import { readFileSync } from "node:fs";

const files = {
  widget: "src/app/components/ChefSophieWidget.tsx",
  resolver: "src/app/utils/productResolver.ts",
  products: "src/app/data/products.ts",
  apiProducts: "api/products.ts",
  conversationTest: "scripts/test-sophie-conversation.mjs",
};

const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, "utf8")]),
);

const tests = [
  {
    name: "startup button renders while context loads",
    run: () => {
      assert(source.widget.includes("<ChefSophieControl"), "Widget must render ChefSophieControl.");
      assert(!source.widget.includes("if (!isContextReady) return null"), "Widget must not disappear while context loads.");
      assert(source.widget.includes("Getting ready"), "UI should show a loading-ready state instead of hiding.");
    },
  },
  {
    name: "session start is gated by customer context and menu readiness",
    run: () => {
      assert(source.widget.includes("const isSophieReady = isContextReady && isMenuReady"), "Sophie readiness must include menu readiness.");
      assert(source.widget.includes("isContextReady={isSophieReady}"), "Control must receive combined readiness.");
      assert(source.widget.includes("if (!isContextReady) return"), "Start flow must be gated.");
    },
  },
  {
    name: "ElevenLabs prompt override is not used",
    run: () => {
      const overridesBlock = sliceBetween(source.widget, "overrides={{", "clientTools=");
      assert(overridesBlock.includes("firstMessage"), "First message override should remain available.");
      assert(!overridesBlock.includes("prompt:"), "Do not use overrides.agent.prompt.");
    },
  },
  {
    name: "context update is delayed after connection",
    run: () => {
      assert(source.widget.includes("sendContextualUpdate(sessionContext"), "Must send contextual menu update.");
      assert(source.widget.includes("window.setTimeout"), "Context update should be delayed.");
      assert(source.widget.includes("}, 1000)"), "Context update delay should remain 1000 ms.");
      assert(source.widget.includes("pendingMessageRef.current"), "Pending messages must wait for context.");
    },
  },
  {
    name: "name questions are answered locally",
    run: () => {
      assert(source.widget.includes("function isAskingForName"), "Missing local name guard.");
      assert(source.widget.includes("whatismyname"), "Compact typo variant must be covered.");
      assert(source.widget.includes('normalized.includes("what is my name")'), "Prefixed variants like 'hey what is my name' must be covered.");
      assert(source.widget.includes("Your name is ${variables.customer_name}"), "Known name must be answered locally.");
    },
  },
  {
    name: "weekly menu questions are answered from exact menu data",
    run: () => {
      assert(source.widget.includes("function isWeeklyMenuQuestion"), "Missing weekly menu guard.");
      assert(source.widget.includes("function getMenuCategoryPrompt"), "Menu questions should ask the customer to choose a section.");
      assert(source.widget.includes("function getMenuCategoryAnswer"), "Category follow-ups should list exact menu items by category.");
      assert(source.widget.includes("getMenuCategoryPrompt()"), "Menu questions should not dump the full menu.");
      assert(source.widget.includes('normalized.includes("menu")'), "Phrases like 'menu please' must be treated as menu questions.");
      assert(orderOf(source.widget, "if (isWeeklyMenuQuestion(message))", "sendUserMessage(message)") > 0, "Weekly menu guard must run before agent send.");
    },
  },
  {
    name: "order recommendations are answered locally from exact menu data",
    run: () => {
      assert(source.widget.includes("function getRecommendationAnswer"), "Missing local recommendation guard.");
      assert(!source.widget.includes("parseBabyAgeMonths"), "Sophie should not run age-based recommendation logic.");
      assert(source.widget.includes("getOrderFirstAnswer"), "Age/profile-only turns should be redirected to order-first flow.");
      assert(source.widget.includes("getProductSummary(products, itemName)"), "Order recommendations must be assembled from loaded products.");
      assert(source.widget.includes("foodContextRef"), "Recommendation guard must preserve food preferences across follow-up messages.");
      assert(source.widget.includes("productMatchesFood"), "Recommendation guard must filter exact menu products by requested food preference.");
      assert(orderOf(source.widget, "const recommendationAnswer = getRecommendationAnswer(message, menuProducts, foodContextRef.current)", "sendUserMessage(message)") > 0, "Recommendation guard must run before agent send.");
    },
  },
  {
    name: "availability questions use exact item comparison",
    run: () => {
      assert(source.widget.includes("function getAvailabilityAnswer"), "Missing availability guard.");
      assert(source.widget.includes("normalized.match(/^do you have"), "Availability guard must be anchored to explicit availability questions.");
      assert(!source.widget.includes("(?:do you have|have|is|is there|do you sell)"), "Availability guard must not use broad unanchored have/is matching.");
      assert(source.widget.includes("normalizeMenuText(item) === requested"), "Availability must use exact normalized item match.");
      assert(source.widget.includes("is not on this week's exact menu"), "Unavailable items must be rejected clearly.");
    },
  },
  {
    name: "cart resolver rejects partial and fuzzy matches",
    run: () => {
      assert(!source.resolver.includes("nameKey.includes(itemNameKey)"), "Resolver must not accept partial item name matches.");
      assert(!source.resolver.includes("itemNameKey.includes(nameKey)"), "Resolver must not accept partial requested-name matches.");
      assert(source.resolver.includes("(!itemKey || codeMatches) && (!itemNameKey || nameMatches)"), "Resolver must require item_code and item_name to agree when both are supplied.");
      assert(source.resolver.includes("is not an exact menu item"), "Resolver must reject non-exact item names.");
    },
  },
  {
    name: "duplicate first greeting is hidden",
    run: () => {
      assert(source.widget.includes("hideOpeningGreetingRef"), "Missing hidden greeting guard.");
      assert(source.widget.includes("hiddenOpeningGreetingTextRef"), "Missing hidden greeting text tracking.");
      assert(source.widget.includes("payload.message === hiddenOpeningGreetingTextRef.current"), "Opening greeting must be compared before display.");
    },
  },
  {
    name: "weekly menu loads from API with static fallback",
    run: () => {
      assert(source.widget.includes('fetch("/api/products")'), "Widget must attempt current menu API fetch.");
      assert(source.widget.includes("PRODUCTS"), "Widget must retain static fallback.");
      assert(source.apiProducts.includes("stale-while-revalidate=300"), "Production menu API should keep short weekly-menu cache behavior.");
    },
  },
  {
    name: "direct Sophie test captures streamed text responses",
    run: () => {
      assert(source.conversationTest.includes("onAgentChatResponsePart"), "Direct test must capture streamed agent parts.");
      assert(source.conversationTest.includes("sendContextualUpdate"), "Direct test must send contextual menu update.");
      assert(!source.conversationTest.includes("prompt:"), "Direct test must not use agent prompt override.");
    },
  },
  {
    name: "Sweet Potato Salmon is not treated as an exact current item",
    run: () => {
      assert(source.widget.includes("KNOWN_UNAVAILABLE_MENU_NAMES"), "Known hallucinated names should be guarded before agent routing.");
      assert(source.widget.includes("getKnownUnavailableMenuNameAnswer"), "Known unavailable names should be rejected from any phrasing.");
      assert(
        orderOf(source.widget, "const knownUnavailableMenuNameAnswer = getKnownUnavailableMenuNameAnswer(message, menuProducts)", "const recommendationAnswer = getRecommendationAnswer(message, menuProducts, foodContextRef.current)") > 0,
        "Known unavailable names must be rejected before food-preference recommendation logic.",
      );
      assert(!source.products.includes('Item: "Sweet Potato Salmon"'), "Static fallback must not contain Sweet Potato Salmon unless it is truly on the menu.");
      assert(source.products.includes('Item: "Quinoa Salmon"'), "Expected exact salmon item is Quinoa Salmon.");
      assert(source.products.includes('Item: "Sweet Potato Kafta"'), "Expected exact sweet potato item is Sweet Potato Kafta.");
    },
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sliceBetween(value, start, end) {
  const startIndex = value.indexOf(start);
  const endIndex = value.indexOf(end, startIndex + start.length);
  if (startIndex === -1 || endIndex === -1) return "";
  return value.slice(startIndex, endIndex);
}

function orderOf(value, before, after) {
  return value.indexOf(after) - value.indexOf(before);
}

const results = [];

for (const test of tests) {
  try {
    test.run();
    results.push({ name: test.name, status: "PASS" });
  } catch (error) {
    results.push({ name: test.name, status: "FAIL", error: error.message });
  }
}

for (const result of results) {
  console.log(`${result.status} ${result.name}${result.error ? ` - ${result.error}` : ""}`);
}

const failures = results.filter((result) => result.status === "FAIL");
if (failures.length > 0) {
  process.exitCode = 1;
}
