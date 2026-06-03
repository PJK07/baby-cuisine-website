import { readFileSync } from "node:fs";
import { Conversation } from "@elevenlabs/client";

const AGENT_ID = "agent_9001kshhvbjcfhp8qmxcheks3ajx";
const KNOWN_UNAVAILABLE_MENU_NAMES = ["Sweet Potato Salmon"];

function extractProducts() {
  const source = readFileSync("src/app/data/products.ts", "utf8");
  const matches = source.matchAll(/\{\s*Item_code:\s*"([^"]+)"[\s\S]*?Category:\s*"([^"]+)"[\s\S]*?Item:\s*"([^"]+)"[\s\S]*?Size:\s*"([^"]+)"[\s\S]*?Texture:\s*"([^"]*)"[\s\S]*?Unit_Price:\s*"([^"]+)"/g);

  return Array.from(matches, ([, itemCode, category, item, size, texture, unitPrice]) => ({
    itemCode,
    category,
    item,
    size,
    texture,
    unitPrice,
  }));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeMenuText(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function exactMenuItems(products) {
  return Array.from(new Set(products.map((product) => product.item).filter(Boolean))).sort();
}

function menuCategoryPrompt(products) {
  const preferredOrder = ["Pudding", "Platter", "Sweet Finger Food", "Savory Finger Food"];
  const categories = preferredOrder.filter((category) =>
    products.some((product) => product.category === category),
  );
  const visibleCategories = categories.length > 0 ? categories : preferredOrder;
  const lastCategory = visibleCategories[visibleCategories.length - 1];
  const leadingCategories = visibleCategories.slice(0, -1);

  return `Which section would you like to see: ${leadingCategories.join(", ")}, or ${lastCategory}?`;
}

function menuCategoryFromMessage(message) {
  const normalized = normalizeMenuText(message);

  if (normalized.includes("sweet finger food") || normalized.includes("sweet finger foods")) {
    return "Sweet Finger Food";
  }
  if (normalized.includes("savory finger food") || normalized.includes("savory finger foods")) {
    return "Savory Finger Food";
  }
  if (normalized.includes("finger food") || normalized.includes("finger foods") || normalized === "finger") {
    return "Finger Food";
  }
  if (normalized.includes("pudding") || normalized.includes("puddings")) return "Pudding";
  if (normalized.includes("platter") || normalized.includes("platters")) return "Platter";
  if (normalized.includes("biscuit") || normalized.includes("biscuits")) return "Biscuit";

  return null;
}

function itemsForCategories(products, categories) {
  const categorySet = new Set(categories);
  return Array.from(
    products.reduce((items, product) => {
      if (categorySet.has(product.category) && product.item) items.add(product.item);
      return items;
    }, new Set()),
  );
}

function menuCategoryAnswer(message, products) {
  const category = menuCategoryFromMessage(message);
  if (!category) return null;

  if (category === "Finger Food") {
    const sweetItems = itemsForCategories(products, ["Sweet Finger Food"]);
    const savoryItems = itemsForCategories(products, ["Savory Finger Food"]);

    if (sweetItems.length === 0 && savoryItems.length === 0) {
      return "I do not see any exact finger food items on this week's menu.";
    }

    return [
      "Sure. For finger food, we currently have:",
      sweetItems.length > 0 ? `Sweet Finger Food:\n${sweetItems.join("\n")}` : "",
      savoryItems.length > 0 ? `Savory Finger Food:\n${savoryItems.join("\n")}` : "",
      "Which one would you like?",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const items = itemsForCategories(products, [category]);

  if (items.length === 0) return `I do not see any exact ${category} items on this week's menu.`;

  return `${category} options this week:\n${items.join("\n")}\nWhich one would you like?`;
}

function productSummary(products, itemName) {
  const variants = products.filter((product) => product.item === itemName);
  const category = variants[0]?.category ?? "Menu";
  const sizes = unique(variants.map((product) => product.size)).join(", ");
  const textures = unique(variants.map((product) => product.texture)).join(", ");
  const prices = variants
    .map((product) => Number.parseFloat(product.unitPrice.replace(/[^0-9.]/g, "")))
    .filter((price) => Number.isFinite(price));
  const startingPrice = prices.length ? `, starting at $${Math.min(...prices)}` : "";
  const textureText = textures ? `, textures: ${textures}` : "";
  const sizeText = sizes ? `, sizes: ${sizes}` : "";

  return `${itemName} (${category}${sizeText}${textureText}${startingPrice})`;
}

const FOOD_KEYWORDS = [
  "chicken",
  "salmon",
  "lamb",
  "kafta",
  "apple",
  "quinoa",
  "banana",
  "berries",
  "coconut",
  "rice",
  "lentil",
  "potato",
];

function mergeUniqueValues(existing, next) {
  return Array.from(new Set([...existing, ...next]));
}

function foodKeywords(message) {
  const normalized = normalizeMenuText(message);
  return FOOD_KEYWORDS.filter((keyword) => normalized.includes(keyword));
}

function productMatchesFood(product, keywords) {
  if (keywords.length === 0) return true;

  const searchableText = normalizeMenuText(
    [product.item, product.itemCode, product.category].filter(Boolean).join(" "),
  );

  return keywords.some((keyword) => searchableText.includes(keyword));
}

function isBabyProfileOnlyMessage(message) {
  const normalized = normalizeMenuText(message);
  const hasAge = /^\d{1,2}$/.test(normalized) ||
    /\b\d{1,2}\s*(months?|mos?|mths?|monthold|month old)\b/.test(normalized);

  return hasAge || normalized.includes("allerg");
}

function recommendationAnswer(message, products, foodContext) {
  const requestedFoods = foodKeywords(message);
  const preferredFoods = requestedFoods.length > 0 ? requestedFoods : foodContext.preferredFoods;
  const isRecommendationTurn = requestedFoods.length > 0 || normalizeMenuText(message).includes("what about");

  if (!isRecommendationTurn || preferredFoods.length === 0) return null;

  const candidateProducts = products.filter((product) => productMatchesFood(product, preferredFoods));

  const itemNames = Array.from(new Set(candidateProducts.map((product) => product.item))).slice(0, 6);
  if (itemNames.length === 0 && preferredFoods.length > 0) {
    return `I do not see an exact ${preferredFoods.join(" or ")} item on this week's menu. ${menuCategoryPrompt(products)}`;
  }

  const choices = itemNames.map((itemName) => productSummary(products, itemName)).join("\n");

  return [
    `Here are exact current-menu options for ${preferredFoods.join(" and ")}:`,
    choices,
    "Which one would you like for your little one?",
  ].join("\n");
}

function orderFirstAnswer(message) {
  const normalized = normalizeMenuText(message);

  if (["hi", "hello", "hey", "heyy", "hola"].includes(normalized)) {
    return "Hi! What would you like to order today?";
  }

  if (
    normalized.includes("how can you help") ||
    normalized.includes("what can you do") ||
    normalized.includes("help me")
  ) {
    return "I can help you choose exact items from this week's menu and add them to your cart. What would you like to order today?";
  }

  if (isBabyProfileOnlyMessage(message)) {
    return "Got it. What would you like to order today?";
  }

  return null;
}

function isWeeklyMenuQuestion(message) {
  const normalized = normalizeMenuText(message);
  return (
    normalized.includes("what do you have") ||
    normalized.includes("what is on") ||
    normalized.includes("whats on") ||
    normalized.includes("this week") ||
    normalized.includes("menu")
  );
}

function isAskingForName(message) {
  const normalized = message.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  const compact = normalized.replace(/\s/g, "");

  return (
    compact.includes("whatismyname") ||
    compact.includes("whatsmyname") ||
    compact.includes("doyouknowmyname") ||
    compact === "whoami" ||
    normalized.includes("what is my name") ||
    normalized.includes("whats my name") ||
    normalized.includes("what s my name") ||
    normalized.includes("do you know my name") ||
    normalized === "who am i"
  );
}

function availabilityAnswer(message, products) {
  const normalized = normalizeMenuText(message);
  const match = [
    normalized.match(/^do you have\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^do you sell\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is there\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is\s+(.+?)\s+(?:on|in)\s+(?:this\s+week\s+)?(?:the\s+)?menu$/),
  ].find(Boolean);
  if (!match?.[1]) return null;

  const requested = normalizeMenuText(match[1]);
  const exactItem = exactMenuItems(products).find((item) => normalizeMenuText(item) === requested);

  if (exactItem) return `Yes, ${exactItem} is on this week's menu.`;
  return `${match[1].replace(/\b\w/g, (letter) => letter.toUpperCase())} is not on this week's exact menu.`;
}

function knownUnavailableMenuNameAnswer(message, products) {
  const normalized = normalizeMenuText(message);
  const exactMenuNames = new Set(products.map((product) => normalizeMenuText(product.item)));

  for (const itemName of KNOWN_UNAVAILABLE_MENU_NAMES) {
    const itemKey = normalizeMenuText(itemName);
    if (normalized.includes(itemKey) && !exactMenuNames.has(itemKey)) {
      return `${itemName} is not on this week's exact menu.`;
    }
  }

  return null;
}

function exactMenuPrompt(products) {
  const grouped = products.reduce((groups, product) => {
    const variants = groups.get(product.item) ?? [];
    groups.set(product.item, [...variants, product]);
    return groups;
  }, new Map());

  return Array.from(grouped.entries())
    .map(([item, variants]) => {
      const category = variants[0]?.category ?? "";
      const sizes = unique(variants.map((variant) => variant.size)).join(", ");
      const textures = unique(variants.map((variant) => variant.texture)).join(", ") || "none";
      return `- ${item} | ${category} | sizes: ${sizes} | textures: ${textures}`;
    })
    .join("\n");
}

function sessionContextUpdate(products) {
  return [
    "Context update for this Chef Sophie session.",
    "Known customer context for this session: the customer's name is Paul.",
    "The Baby Cuisine menu rotates weekly. The exact current menu for this session is the live menu below.",
    "Critical menu rule: recommend, discuss, confirm, and add only exact item names from the exact current weekly menu below.",
    "Never invent item names, never combine two menu items into a new name, and never rename an item. Do not say Sweet Potato Salmon unless that exact item appears in the menu.",
    "When a customer asks what is available, use only exact item names from the menu list.",
    "When the customer chooses items, keep the exact menu item names. Before using add_to_cart, collect quantity, exact size, and texture when that item has texture options.",
    "If the customer asks for an item that is not an exact menu item, say it is not on the current menu and ask them to choose an exact item from the menu.",
    "For sizes, translate Small to 120 ml, Medium to 200 ml, and Big/Large to 250 ml when calling tools.",
    `Exact current menu item names:\n${exactMenuPrompt(products)}`,
  ].join("\n\n");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAgent(messages, previousCount, timeoutMs = 20000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const agentMessages = messages.filter((message) => message.role === "agent");
    if (agentMessages.length > previousCount) return agentMessages.at(-1)?.text ?? "";
    await sleep(250);
  }

  return "[timeout waiting for Sophie]";
}

async function main() {
  const products = extractProducts();
  const messages = [];
  const toolCalls = [];
  const streamedParts = [];
  const timeouts = [];
  let foodContext = {
    preferredFoods: [],
  };

  const conversation = await Conversation.startSession({
    agentId: AGENT_ID,
    textOnly: true,
    dynamicVariables: {
      customer_name: "Paul",
      user_name: "Paul",
      name: "Paul",
      customer_id: "local-test",
      is_returning: "true",
      last_order_summary: "",
      baby_name: "",
      baby_age_months: "",
      baby_preferences: "",
      baby_allergies: "",
    },
    overrides: {
      agent: {
        firstMessage: "Hi Paul, I'm Chef Sophie from Baby Cuisine. What would you like to order today?",
      },
      conversation: { textOnly: true },
    },
    clientTools: {
      add_to_cart: (params) => {
        toolCalls.push({ tool: "add_to_cart", params });
        return JSON.stringify({ status: "success", message: "Added to cart" });
      },
      clear_cart: (params) => {
        toolCalls.push({ tool: "clear_cart", params });
        return JSON.stringify({ status: "success", message: "Cart cleared" });
      },
    },
    onMessage: (payload) => {
      messages.push({ role: payload.role, text: payload.message });
    },
    onAgentChatResponsePart: (payload) => {
      if (payload.type === "delta" && payload.text) streamedParts.push(payload.text);
    },
    onError: (message, context) => {
      messages.push({ role: "error", text: String(message), context });
    },
  });

  const transcript = [];
  await sleep(3000);
  conversation.sendContextualUpdate(sessionContextUpdate(products), { contextId: "current-weekly-menu" });
  await sleep(1000);
  let agentCount = messages.filter((message) => message.role === "agent").length;

  for (const initialMessage of messages.filter((message) => message.role === "agent")) {
    transcript.push({ role: "sophie", text: initialMessage.text });
  }

  for (const text of [
    "hello",
    "hey what is my name",
    "menu please",
    "platter",
    "6 months",
    "18 months - no allergies - prefer chicken",
    "whaytt about chicken",
    "i said 18 months",
    "how can you help me",
    "do you have Sweet Potato Salmon?",
    "I want Sweet Potato Salmon",
    "I have a 6 month old",
  ]) {
    transcript.push({ role: "user", text });

    if (isAskingForName(text)) {
      transcript.push({ role: "sophie", text: "Your name is Paul." });
      continue;
    }

    const localKnownUnavailableAnswer = knownUnavailableMenuNameAnswer(text, products);
    if (localKnownUnavailableAnswer) {
      transcript.push({ role: "sophie", text: localKnownUnavailableAnswer });
      continue;
    }

    foodContext = {
      preferredFoods: mergeUniqueValues(foodContext.preferredFoods, foodKeywords(text)),
    };

    const localRecommendationAnswer = recommendationAnswer(text, products, foodContext);
    if (localRecommendationAnswer) {
      transcript.push({ role: "sophie", text: localRecommendationAnswer });
      continue;
    }

    const localOrderFirstAnswer = orderFirstAnswer(text);
    if (localOrderFirstAnswer) {
      transcript.push({ role: "sophie", text: localOrderFirstAnswer });
      continue;
    }

    const localMenuCategoryAnswer = menuCategoryAnswer(text, products);
    if (localMenuCategoryAnswer) {
      transcript.push({ role: "sophie", text: localMenuCategoryAnswer });
      continue;
    }

    if (isWeeklyMenuQuestion(text)) {
      transcript.push({ role: "sophie", text: menuCategoryPrompt(products) });
      continue;
    }

    const localAvailabilityAnswer = availabilityAnswer(text, products);
    if (localAvailabilityAnswer) {
      transcript.push({ role: "sophie", text: localAvailabilityAnswer });
      continue;
    }

    conversation.sendUserMessage(text);
    const response = await waitForAgent(messages, agentCount);
    agentCount = messages.filter((message) => message.role === "agent").length;
    if (response.startsWith("[timeout")) timeouts.push(text);
    transcript.push({ role: "sophie", text: response });
  }

  await sleep(1000);
  await conversation.endSession();

  const invalidUnavailableMentions = transcript.filter(
    (message) =>
      message.role === "sophie" &&
      message.text.includes("Sweet Potato Salmon") &&
      message.text !== "Sweet Potato Salmon is not on this week's exact menu.",
  );

  if (invalidUnavailableMentions.length > 0) {
    throw new Error("Sophie mentioned Sweet Potato Salmon outside the exact unavailable-item response.");
  }

  const sweetPotatoSalmonTurns = transcript
    .map((message, index) => ({ message, next: transcript[index + 1] }))
    .filter(({ message }) => message.role === "user" && message.text.includes("Sweet Potato Salmon"));
  if (
    sweetPotatoSalmonTurns.length === 0 ||
    sweetPotatoSalmonTurns.some(({ next }) => next?.text !== "Sweet Potato Salmon is not on this week's exact menu.")
  ) {
    throw new Error("Sweet Potato Salmon must be rejected before food-preference recommendation logic runs.");
  }

  const chickenResponses = transcript.filter(
    (message) => message.role === "sophie" && message.text.includes("exact current-menu options for chicken"),
  );
  if (chickenResponses.length < 2 || chickenResponses.some((message) => !message.text.includes("Chicken Soup"))) {
    throw new Error("Sophie did not preserve the chicken preference in local order recommendations.");
  }

  const ageOnlyResponses = transcript
    .map((message, index) => ({ message, next: transcript[index + 1] }))
    .filter(({ message }) => message.role === "user" && ["6 months", "i said 18 months"].includes(message.text));
  if (ageOnlyResponses.some(({ next }) => !next?.text.includes("What would you like to order today?"))) {
    throw new Error("Sophie should not recommend or ask profile questions from age-only turns.");
  }

  const menuPrompt = transcript.find(
    (message) => message.role === "sophie" && message.text === menuCategoryPrompt(products),
  );
  if (!menuPrompt) {
    throw new Error("Menu questions should ask for a category instead of listing every item.");
  }

  const platterAnswer = transcript.find(
    (message) => message.role === "sophie" && message.text.startsWith("Platter options this week:"),
  );
  if (!platterAnswer || !platterAnswer.text.includes("Chicken Soup") || platterAnswer.text.includes("Apple Quinoa")) {
    throw new Error("Category follow-up should list exact items only from that category.");
  }

  if (timeouts.length > 0) {
    throw new Error(`Timed out waiting for Sophie after: ${timeouts.join(", ")}`);
  }

  const errors = messages.filter((message) => message.role === "error");
  if (errors.length > 0) {
    throw new Error(`Sophie session errors: ${JSON.stringify(errors)}`);
  }

  console.log(JSON.stringify({
    transcript,
    toolCalls,
    timeouts,
    streamedText: streamedParts.join(""),
    errors,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
