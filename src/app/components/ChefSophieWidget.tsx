import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ConversationProvider,
  useConversationStatus,
  useConversation,
} from "@elevenlabs/react";
import { MessageCircle, Mic, Phone, PhoneOff, Send, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { CartItem, useCart } from "../context/CartContext";
import { resolveCanonicalProduct } from "../utils/productResolver";
import { PRODUCTS, type ProductData } from "../data/products";

const AGENT_ID = "agent_9001kshhvbjcfhp8qmxcheks3ajx";
const KNOWN_UNAVAILABLE_MENU_NAMES = [
  "Moujadara",
  "Okra Stew With Meat",
  "Roast Meat With Veggies",
  "Sweet Potato Salmon",
];
const isDev = import.meta.env.DEV;

const devLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

const devWarn = (...args: unknown[]) => {
  if (isDev) console.warn(...args);
};

const devError = (...args: unknown[]) => {
  if (isDev) console.error(...args);
};

type DynamicVariables = {
  customer_name: string;
  user_name: string;
  name: string;
  customer_id: string;
  is_returning: string;
  last_order_summary: string;
  baby_name: string;
  baby_age_months: string;
  baby_preferences: string;
  baby_allergies: string;
};

type AddToCartParams = {
  item_name: string;
  quantity: number | string;
  size?: string;
  texture?: string;
  unit_price: number | string;
  total_price: number | string;
  customer_id: string;
  item_code?: string;
  category?: string;
};

type ClearCartParams = {
  customer_id?: string;
  reason?: string;
};

type ChatFoodContext = {
  preferredFoods: string[];
};

type PendingOrder = {
  itemName: string;
  size?: string;
  texture?: string;
  quantity?: number;
};

type DeliveryDay = "Tuesday" | "Friday";

type BabyRow = {
  name: string | null;
  birth_date: string | null;
  preferences: string | null;
  allergies: string | null;
};

type ContactRow = {
  full_name: string | null;
};

type OrderRow = {
  items: CartItem[] | null;
};

function calculateAgeMonths(birthDate: string | null): string {
  if (!birthDate) return "";

  const now = new Date();
  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) return "";

  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  return months >= 0 ? months.toString() : "";
}

function getDefaultVariables(): DynamicVariables {
  return {
    customer_name: "there",
    user_name: "there",
    name: "there",
    customer_id: "",
    is_returning: "false",
    last_order_summary: "",
    baby_name: "",
    baby_age_months: "",
    baby_preferences: "",
    baby_allergies: "",
  };
}

function getFirstName(contact: ContactRow | null, userMetadata: Record<string, unknown>): string {
  const fullName = contact?.full_name?.trim();
  const metadataFirstName = userMetadata.first_name;
  const metadataName = userMetadata.name;

  if (fullName && normalizeMenuText(fullName) !== "anonymous") return fullName.split(/\s+/)[0];
  if (
    typeof metadataFirstName === "string" &&
    metadataFirstName.trim() &&
    normalizeMenuText(metadataFirstName) !== "anonymous"
  ) {
    return metadataFirstName.trim();
  }
  if (
    typeof metadataName === "string" &&
    metadataName.trim() &&
    normalizeMenuText(metadataName) !== "anonymous"
  ) {
    return metadataName.trim().split(/\s+/)[0];
  }

  return "there";
}

function getLastOrderSummary(order: OrderRow | null): string {
  if (!Array.isArray(order?.items)) return "";

  return order.items
    .map((item) => item.item)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
}

function getFirstMessage(variables: DynamicVariables): string {
  const greetingName = variables.customer_name || "there";

  return `Hi ${greetingName}, I'm Chef Sophie from Baby Cuisine. What would you like to order today?`;
}

function getSessionContext(variables: DynamicVariables): string {
  const customerName = variables.customer_name || "there";

  return [
    `Known customer context for this session: the customer's name is ${customerName}.`,
    "If the customer asks for their name, answer with this name instead of saying you do not have access to it.",
    "Do not ask for baby age, allergies, or baby profile details. Help the customer choose what they want to order.",
    variables.is_returning === "true" ? "This is a returning customer." : "",
    variables.last_order_summary ? `Recent order included: ${variables.last_order_summary}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function normalizeMenuText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSingularMenuText(value: string): string {
  return normalizeMenuText(value)
    .split(" ")
    .map((word) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word))
    .join(" ");
}

function normalizeCompactMenuText(value: string): string {
  return normalizeMenuText(value).replace(/\s+/g, "");
}

function getEditDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const beforeUpdate = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = beforeUpdate;
    }
  }

  return previous[b.length];
}

function getExactMenuItems(products: ProductData[]): string[] {
  return Array.from(new Set(products.map((product) => product.Item).filter(Boolean))).sort();
}

function getMenuCategoryPrompt(): string {
  return "Which section would you like to see: Pudding, Platter, Finger Food, or Biscuit?";
}

function getMenuCategoryFromMessage(message: string): string | null {
  const normalized = normalizeMenuText(message);

  if (
    normalized.includes("finger food") ||
    normalized.includes("finger foods") ||
    normalized === "finger" ||
    getEditDistance(normalized, "finger food") <= 1
  ) {
    return "Finger Food";
  }
  if (normalized.includes("pudding") || normalized.includes("puddings") || getEditDistance(normalized, "pudding") <= 1) {
    return "Pudding";
  }
  if (normalized.includes("platter") || normalized.includes("platters") || getEditDistance(normalized, "platter") <= 1) {
    return "Platter";
  }
  if (normalized.includes("biscuit") || normalized.includes("biscuits") || getEditDistance(normalized, "biscuit") <= 1) {
    return "Biscuit";
  }

  return null;
}

function getMenuCategoryAnswer(message: string, products: ProductData[]): string | null {
  const category = getMenuCategoryFromMessage(message);
  if (!category) return null;

  const items = Array.from(
    new Set(products.filter((product) => product.Category === category).map((product) => product.Item)),
  ).sort();

  if (items.length === 0) return `I do not see any exact ${category} items on this week's menu.`;

  return `${category} options this week:\n${items.join("\n")}\nWhich one would you like?`;
}

function getExactItemFromMessage(message: string, products: ProductData[]): string | null {
  const normalized = normalizeMenuText(message);
  const singular = normalizeSingularMenuText(message);
  const cleaned = normalizeSingularMenuText(
    normalized
      .replace(/^(i want|i would like|i d like|can i have|please add|add|order|get|give me)\s+/, "")
      .replace(/^\d+\s+/, ""),
  );
  const compact = normalizeCompactMenuText(normalized);
  const compactCleaned = normalizeCompactMenuText(cleaned);

  return getExactMenuItems(products)
    .sort((a, b) => b.length - a.length)
    .find((item) => {
      const itemKey = normalizeMenuText(item);
      const singularItemKey = normalizeSingularMenuText(item);
      const compactItemKey = normalizeCompactMenuText(item);
      return (
        normalized === itemKey ||
        singular === singularItemKey ||
        cleaned === singularItemKey ||
        compact === compactItemKey ||
        compact.includes(compactItemKey) ||
        compactCleaned === compactItemKey ||
        new RegExp(`(^|\\s)${itemKey}(\\s|$)`).test(normalized) ||
        new RegExp(`(^|\\s)${singularItemKey}(\\s|$)`).test(singular) ||
        getEditDistance(cleaned, singularItemKey) <= 1
      );
    }) ?? null;
}

function getProductSummary(products: ProductData[], itemName: string): string {
  const variants = products.filter((product) => product.Item === itemName);
  const category = variants[0]?.Category ?? "Menu";
  const sizes = uniqueValues(variants.map((product) => product.Size)).join(", ");
  const textures = uniqueValues(variants.map((product) => product.Texture)).join(", ");
  const prices = variants
    .map((product) => Number.parseFloat(product.Unit_Price.replace(/[^0-9.]/g, "")))
    .filter((price) => Number.isFinite(price));
  const startingPrice = prices.length ? `, starting at $${Math.min(...prices)}` : "";
  const textureText = textures ? `, textures: ${textures}` : "";
  const sizeText = sizes ? `, sizes: ${sizes}` : "";

  return `${itemName} (${category}${sizeText}${textureText}${startingPrice})`;
}

function getProductPriceSummary(products: ProductData[], itemName: string): string {
  const variants = products.filter((product) => product.Item === itemName);
  const category = variants[0]?.Category ?? "Menu";
  const pricesBySize = variants.reduce<Map<string, Set<string>>>((groups, product) => {
    const size = product.Size || "Item";
    const prices = groups.get(size) ?? new Set<string>();
    prices.add(`$${product.Unit_Price}`);
    groups.set(size, prices);
    return groups;
  }, new Map());
  const priceText = Array.from(pricesBySize)
    .map(([size, prices]) => `${size}: ${Array.from(prices).join(" / ")}`)
    .join(", ");

  return `${itemName} (${category}) - ${priceText}`;
}

function getProductChoices(products: ProductData[], itemName: string) {
  const variants = products.filter((product) => product.Item === itemName);
  return {
    sizes: uniqueValues(variants.map((product) => product.Size)),
    textures: uniqueValues(variants.map((product) => product.Texture)),
  };
}

function getItemSelectionPrompt(products: ProductData[], itemName: string): string {
  const { sizes, textures } = getProductChoices(products, itemName);
  const sizeText = sizes.length > 0 ? `size (${sizes.join(", ")})` : "";
  const textureText = textures.length > 0 ? `texture (${textures.join(", ")})` : "";
  const joiner = sizeText && textureText ? " and " : "";

  return `Great choice. ${itemName} is on this week's exact menu.\nPlease choose ${sizeText}${joiner}${textureText}.`;
}

function getCategoryPriceSummary(products: ProductData[]): string {
  const categories = uniqueValues(products.map((product) => product.Category)).sort();

  return categories
    .map((category) => {
      const variants = products.filter((product) => product.Category === category);
      const pricesBySize = variants.reduce<Map<string, Set<string>>>((groups, product) => {
        const size = product.Size || "Item";
        const prices = groups.get(size) ?? new Set<string>();
        prices.add(`$${product.Unit_Price}`);
        groups.set(size, prices);
        return groups;
      }, new Map());
      const priceText = Array.from(pricesBySize)
        .map(([size, prices]) => `${size}: ${Array.from(prices).sort().join(", ")}`)
        .join("; ");

      return `${category}: ${priceText}`;
    })
    .join("\n");
}

function getDeliveryDayForItem(products: ProductData[], itemName: string): DeliveryDay | null {
  const days = uniqueValues(
    products
      .filter((product) => product.Item === itemName)
      .map((product) => product.Delivery_Day),
  );

  return days.find((day): day is DeliveryDay => day === "Tuesday" || day === "Friday") ?? null;
}

function getItemsForDeliveryDay(products: ProductData[], day: DeliveryDay): string {
  const items = Array.from(
    new Set(
      products
        .filter((product) => product.Delivery_Day === day)
        .map((product) => product.Item),
    ),
  ).sort();

  if (items.length === 0) return `I do not see any exact items marked for ${day}.`;

  return [`Exact ${day} items:`, items.join("\n")].join("\n");
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

function mergeUniqueValues(existing: string[], next: string[]): string[] {
  return Array.from(new Set([...existing, ...next]));
}

function getFoodKeywords(message: string): string[] {
  const words = new Set(normalizeMenuText(message).split(" ").filter(Boolean));
  return FOOD_KEYWORDS.filter((keyword) => words.has(keyword));
}

function productMatchesFood(product: ProductData, keywords: string[]): boolean {
  if (keywords.length === 0) return true;

  const searchableText = normalizeMenuText(
    [product.Item, product.Item_code, product.Category, product.Ingredients].filter(Boolean).join(" "),
  );

  return keywords.some((keyword) => searchableText.includes(keyword));
}

function isBabyProfileOnlyMessage(message: string): boolean {
  const normalized = normalizeMenuText(message);
  const hasAge = /^\d{1,2}$/.test(normalized) ||
    /\b\d{1,2}\s*(months?|mos?|mths?|monthold|month old)\b/.test(normalized);

  return hasAge || normalized.includes("allerg");
}

function getRecommendationAnswer(
  message: string,
  products: ProductData[],
  foodContext: ChatFoodContext,
): string | null {
  const requestedFoods = getFoodKeywords(message);
  const preferredFoods = requestedFoods.length > 0 ? requestedFoods : foodContext.preferredFoods;
  const isRecommendationTurn = requestedFoods.length > 0 || normalizeMenuText(message).includes("what about");

  if (!isRecommendationTurn || preferredFoods.length === 0) return null;

  const candidateProducts = products.filter((product) => productMatchesFood(product, preferredFoods));

  const itemNames = Array.from(new Set(candidateProducts.map((product) => product.Item))).slice(0, 6);
  if (itemNames.length === 0 && preferredFoods.length > 0) {
    return `I do not see an exact ${preferredFoods.join(" or ")} item on this week's menu. ${getMenuCategoryPrompt()}`;
  }

  const choices = itemNames.map((itemName) => getProductSummary(products, itemName)).join("\n");

  return [
    `Here are exact current-menu options for ${preferredFoods.join(" and ")}:`,
    choices,
    "Which one would you like for your little one?",
  ].join("\n");
}

function isPriceQuestion(message: string): boolean {
  const normalized = normalizeMenuText(message);

  return (
    /\bprices?\b/.test(normalized) ||
    normalized.includes("how much") ||
    normalized.includes("cost")
  );
}

function getBusinessAnswer(message: string): string | null {
  const normalized = normalizeMenuText(message);

  if (normalized.includes("allerg")) {
    return "If your baby has allergies, tell us the allergy before ordering. We will guide you toward suitable exact menu items and your allergy note should be included with the order for confirmation.";
  }

  if (
    normalized.includes("where are you located") ||
    normalized.includes("what is your location") ||
    normalized.includes("what is your address") ||
    normalized === "location" ||
    normalized === "address"
  ) {
    return "Baby Cuisine is located on St. Maroun Street, Horch Tabet, Lebanon.";
  }

  if (normalized.includes("where do you deliver") || normalized.includes("delivery") || normalized.includes("deliver")) {
    return "Baby Cuisine delivers in Lebanon. The delivery charge depends on your location, and the checkout form will ask for your delivery address.";
  }

  if (
    normalized.includes("got what") ||
    normalized.includes("what do you mean") ||
    normalized.includes("what did you get")
  ) {
    return "Sorry, I should be clearer. I can answer business questions, show exact menu items and prices, or help add an exact item to your cart.";
  }

  if (
    normalized.includes("your business") ||
    normalized.includes("about baby cuisine") ||
    normalized.includes("about your business") ||
    normalized.includes("who are you")
  ) {
    return "Baby Cuisine prepares fresh handmade baby food in Lebanon with 100% natural ingredients, no sugar, no preservatives, and no artificial colors.";
  }

  return null;
}

function getSpecialInstructionAnswer(message: string): string | null {
  const normalized = normalizeMenuText(message);
  const hasInstructionIntent = [
    "label",
    "ring",
    "call",
    "leave",
    "concierge",
    "pack",
    "separate",
    "bag",
    "bags",
    "receipt",
    "landmark",
    "gate",
    "reception",
  ].some((keyword) => normalized.includes(keyword));

  const hasFulfillmentIntent =
    normalized.includes("delivery") ||
    normalized.includes("deliver") ||
    normalized.includes("pickup") ||
    normalized.includes("address");

  if (!hasInstructionIntent && !hasFulfillmentIntent) return null;

  return "I noted that instruction. Please also include it in the checkout form so the team sees it with your order.";
}

function getDeliveryAnswer(message: string, products: ProductData[], lastItemName: string | null): string | null {
  const normalized = normalizeMenuText(message);
  const explicitDay: DeliveryDay | null = normalized.includes("friday")
    ? "Friday"
    : normalized.includes("tuesday")
      ? "Tuesday"
      : null;

  if (
    explicitDay &&
    (
      normalized.includes("items") ||
      normalized.includes("all") ||
      normalized.includes("available") ||
      normalized.includes("have") ||
      normalized.includes("menu")
    )
  ) {
    return getItemsForDeliveryDay(products, explicitDay);
  }

  if (
    normalized.includes("which day") ||
    normalized.includes("when it will be delivered") ||
    normalized.includes("when will it be delivered") ||
    normalized === "when" ||
    normalized.includes("yeah i know but when")
  ) {
    if (!lastItemName) {
      return "Tell me the item name and I can check its exact delivery day.";
    }

    const day = getDeliveryDayForItem(products, lastItemName);
    if (!day) {
      return `${lastItemName} is available, but I do not see a specific delivery day for it in the current menu data.`;
    }

    return `${lastItemName} is delivered on ${day}.`;
  }

  return null;
}

function parseSizeChoice(message: string, sizes: string[]): string | null {
  const normalized = normalizeMenuText(message);
  const aliases = new Map([
    ["small", "120 ml"],
    ["medium", "200 ml"],
    ["big", "250 ml"],
    ["large", "250 ml"],
  ]);
  const words = new Set(normalized.split(" ").filter(Boolean));
  const alias = aliases.get(normalized) ?? Array.from(aliases).find(([key]) => words.has(key))?.[1];
  if (alias && sizes.includes(alias)) return alias;

  return sizes.find((size) => normalized.includes(normalizeMenuText(size))) ?? null;
}

function hasSizeIntent(message: string): boolean {
  const normalized = normalizeMenuText(message);
  return /\b(small|medium|big|large|box|piece|pieces|120|200|250|ml)\b/.test(normalized);
}

function getUnsupportedSizeMessage(message: string, itemName: string, sizes: string[]): string | null {
  if (!hasSizeIntent(message) || parseSizeChoice(message, sizes)) return null;
  return `${itemName} is available as ${sizes.join(", ")}, not the size you mentioned. Which available size would you like?`;
}

function getDefaultChoice(options: string[], message: string, parser: (message: string, options: string[]) => string | null): string | null {
  return parser(message, options) ?? (options.length === 1 ? options[0] : null);
}

function parseTextureChoice(message: string, textures: string[]): string | null {
  const normalized = normalizeMenuText(message);
  return textures.find((texture) => normalizeMenuText(texture).split(" ").every((word) => normalized.includes(word))) ?? null;
}

function parseQuantityChoice(message: string): number | null {
  const normalized = normalizeMenuText(message);
  if (normalized === "one") return 1;
  if (normalized === "two") return 2;
  if (normalized === "three") return 3;
  if (normalized.includes("make it one") || normalized.includes("change to one") || normalized.includes("actually one")) return 1;
  if (normalized.includes("make it two") || normalized.includes("change to two") || normalized.includes("actually two")) return 2;
  if (normalized.includes("make it three") || normalized.includes("change to three") || normalized.includes("actually three")) return 3;

  const match = normalized.match(/\b([1-9]\d?)\b/);
  return match ? Number(match[1]) : null;
}

function getAllergyConflictAnswer(message: string, itemName: string | null, products: ProductData[]): string | null {
  const normalized = normalizeMenuText(message);
  const allergenMatch = normalized.match(/\b(?:no|without|allergic to|allergy to)\s+(eggs?|milk|nuts?|almonds?|salmon|fish|lamb|chicken)\b/);
  if (!allergenMatch?.[1] || !itemName) return null;

  const allergen = allergenMatch[1].replace(/s$/, "");
  const variants = products.filter((product) => product.Item === itemName);
  const hasAllergen = variants.some((product) => normalizeMenuText(product.Ingredients ?? "").includes(allergen));

  if (!hasAllergen) return null;
  return `${itemName} includes ${allergen}. I cannot add that with a no-${allergen} instruction. Please choose a different exact menu item.`;
}

function getCartStatusAnswer(message: string, cartItems: CartItem[], totalItems: number): string | null {
  const normalized = normalizeMenuText(message);
  if (
    !normalized.includes("cart") &&
    !normalized.includes("they arent") &&
    !normalized.includes("they are not") &&
    !normalized.includes("i told you what i want")
  ) {
    return null;
  }

  if (totalItems === 0) {
    return "Your cart is empty. Tell me the exact item, size, and quantity and I will add it.";
  }

  const lines = cartItems.map((item) => (
    `${item.quantity} x ${item.item}, ${item.size}${item.texture ? `, ${item.texture}` : ""} - $${(item.price * item.quantity).toFixed(2)}`
  ));

  return ["Your cart currently has:", lines.join("\n")].join("\n");
}

function isConfirmationMessage(message: string): boolean {
  const normalized = normalizeMenuText(message);
  return ["ok", "okay", "yes", "confirm", "confirmed", "correct", "only this", "thats it", "that is it"].includes(normalized);
}

function getPriceAnswer(message: string, products: ProductData[]): string | null {
  if (!isPriceQuestion(message)) return null;

  const normalized = normalizeMenuText(message);
  const exactItem = getExactMenuItems(products).find((item) => normalized.includes(normalizeMenuText(item)));

  if (exactItem) {
    return [
      `Prices for ${exactItem}:`,
      getProductPriceSummary(products, exactItem),
      "Which size would you like?",
    ].join("\n");
  }

  return [
    "Here is the current price guide:",
    getCategoryPriceSummary(products),
    "Tell me the item name if you want exact prices for one item.",
  ].join("\n");
}

function getOrderFirstAnswer(message: string): string | null {
  const normalized = normalizeMenuText(message);

  if (["hi", "hello", "hey", "heyy", "hola"].includes(normalized)) {
    return "Hi! What would you like to order today?";
  }

  if (["yes", "yeah", "yep", "ok great", "okay great", "great"].includes(normalized)) {
    return "Great. What would you like to order today?";
  }

  if (
    normalized.includes("how can you help") ||
    normalized.includes("what can you do") ||
    normalized.includes("help me") ||
    normalized.includes("other thing") ||
    normalized.includes("something else")
  ) {
    return "I can help you choose exact items from this week's menu and add them to your cart. What would you like to order today?";
  }

  if (isBabyProfileOnlyMessage(message)) {
    return "Got it. What would you like to order today?";
  }

  return null;
}

function isWeeklyMenuQuestion(message: string): boolean {
  const normalized = normalizeMenuText(message);

  return (
    normalized.includes("what do you have") ||
    normalized.includes("what is there") ||
    normalized.includes("whats there") ||
    normalized.includes("what is available") ||
    normalized.includes("whats available") ||
    normalized.includes("available") ||
    normalized.includes("what can i order") ||
    normalized.includes("what can i buy") ||
    normalized.includes("what can i get") ||
    normalized.includes("what can we order") ||
    normalized.includes("what is on") ||
    normalized.includes("whats on") ||
    normalized.includes("this week") ||
    normalized.includes("menu")
  );
}

function getAvailabilityAnswer(message: string, products: ProductData[]): string | null {
  const normalized = normalizeMenuText(message);
  const match = [
    normalized.match(/^do you have\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^do you sell\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is there\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is\s+(.+?)\s+(?:on|in)\s+(?:this\s+week\s+)?(?:the\s+)?menu$/),
  ].find(Boolean);
  if (!match?.[1]) return null;

  const requested = normalizeMenuText(match[1]);
  const exactItem = getExactMenuItems(products).find((item) => normalizeMenuText(item) === requested);

  if (exactItem) return `Yes, ${exactItem} is on this week's menu.`;

  return `${match[1].replace(/\b\w/g, (letter) => letter.toUpperCase())} is not on this week's exact menu.`;
}

function getKnownUnavailableMenuNameAnswer(message: string, products: ProductData[]): string | null {
  const normalized = normalizeMenuText(message);
  const exactMenuNames = new Set(products.map((product) => normalizeMenuText(product.Item)));

  for (const itemName of KNOWN_UNAVAILABLE_MENU_NAMES) {
    const itemKey = normalizeMenuText(itemName);
    if (normalized.includes(itemKey) && !exactMenuNames.has(itemKey)) {
      return `${itemName} is not on this week's exact menu.`;
    }
  }

  return null;
}

async function loadCurrentProducts(): Promise<ProductData[]> {
  if (typeof window === "undefined") return PRODUCTS;

  return fetch("/api/products")
    .then((response) => {
      if (!response.ok) throw new Error(`Product API returned ${response.status}`);
      return response.json();
    })
    .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data as ProductData[] : PRODUCTS))
    .catch((error) => {
      devWarn("Chef Sophie menu load failed; using fallback products:", error);
      return PRODUCTS;
    });
}

function getExactMenuPrompt(products: ProductData[]): string {
  const items = Array.from(
    products.reduce<Map<string, ProductData[]>>((groups, product) => {
      const existing = groups.get(product.Item) ?? [];
      groups.set(product.Item, [...existing, product]);
      return groups;
    }, new Map()),
  )
    .map(([item, variants]) => {
      const category = variants[0]?.Category || "";
      const sizes = uniqueValues(variants.map((variant) => variant.Size)).join(", ");
      const textures = uniqueValues(variants.map((variant) => variant.Texture)).join(", ") || "none";
      const days = uniqueValues(variants.map((variant) => variant.Delivery_Day)).join(", ");

      return `- ${item} | ${category} | sizes: ${sizes} | textures: ${textures}${days ? ` | delivery: ${days}` : ""}`;
    })
    .join("\n");

  return `Exact current menu item names:\n${items}`;
}

function getSessionContextUpdate(variables: DynamicVariables, products: ProductData[]): string {
  return [
    "Context update for this Chef Sophie session.",
    getSessionContext(variables),
    "The Baby Cuisine menu rotates weekly. The exact current menu for this session is the live menu below.",
    "Critical menu rule: recommend, discuss, confirm, and add only exact item names from the exact current weekly menu below.",
    "Never invent item names, never combine two menu items into a new name, and never rename an item. For example, do not say Sweet Potato Salmon unless that exact item appears in the menu.",
    "When a customer asks what is available, use only exact item names from the menu list.",
    "Do not ask for baby age, allergies, or baby profile details. The workflow is order-first: ask what the customer wants to order.",
    "When the customer chooses items, keep the exact menu item names. Before using add_to_cart, collect quantity, exact size, and texture when that item has texture options.",
    "If the customer asks for an item that is not an exact menu item, say it is not on the current menu and ask them to choose an exact item from the menu.",
    "For sizes, translate Small to 120 ml, Medium to 200 ml, and Big/Large to 250 ml when calling tools.",
    getExactMenuPrompt(products),
  ].join("\n\n");
}

function isAskingForName(message: string): boolean {
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

function toToolResult(status: "success" | "error", message: string) {
  return JSON.stringify({ status, message });
}

function parseNumber(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function ChefSophieControl({
  variables,
  isContextReady,
  sessionContext,
  menuProducts,
}: {
  variables: DynamicVariables;
  isContextReady: boolean;
  sessionContext: string;
  menuProducts: ProductData[];
}) {
  const [messages, setMessages] = useState<Array<{ role: "agent" | "user"; text: string }>>([]);
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const hideOpeningGreetingRef = useRef(false);
  const hiddenOpeningGreetingTextRef = useRef<string | null>(null);
  const contextSentForSessionRef = useRef<string | null>(null);
  const foodContextRef = useRef<ChatFoodContext>({
    preferredFoods: getFoodKeywords(variables.baby_preferences),
  });
  const { startSession, endSession, sendUserMessage, sendContextualUpdate, getId } = useConversation({
    onMessage: (payload) => {
      if (
        payload.role === "agent" &&
        hideOpeningGreetingRef.current &&
        payload.message === hiddenOpeningGreetingTextRef.current
      ) {
        hideOpeningGreetingRef.current = false;
        hiddenOpeningGreetingTextRef.current = null;
        return;
      }

      if (payload.role === "agent") setIsWaitingForReply(false);

      setMessages((prev) => {
        const role = payload.role === "user" ? "user" : "agent";
        if (prev[prev.length - 1]?.role === role && prev[prev.length - 1]?.text === payload.message) {
          return prev;
        }
        return [...prev, { role, text: payload.message }];
      });
    },
  });
  const { status, message: statusMessage } = useConversationStatus();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [lastItemName, setLastItemName] = useState<string | null>(null);
  const [lastAddedCartLine, setLastAddedCartLine] = useState<CartItem | null>(null);
  const { addItem, removeItem, updateQuantity, items: cartItems, getTotalItems } = useCart();

  const isActive = status === "connected" || status === "connecting";
  const isConnecting = status === "connecting";

  useEffect(() => {
    foodContextRef.current = {
      preferredFoods: mergeUniqueValues(foodContextRef.current.preferredFoods, getFoodKeywords(variables.baby_preferences)),
    };
  }, [variables.baby_preferences]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isWaitingForReply]);

  useEffect(() => {
    if (status !== "connected") return;

    const sessionId = getId();
    if (contextSentForSessionRef.current === sessionId) {
      if (!pendingMessageRef.current) return;

      sendUserMessage(pendingMessageRef.current);
      pendingMessageRef.current = null;
      return;
    }

    const timer = window.setTimeout(() => {
      sendContextualUpdate(sessionContext, { contextId: "current-weekly-menu" });
      contextSentForSessionRef.current = sessionId;

      if (!pendingMessageRef.current) return;

      sendUserMessage(pendingMessageRef.current);
      pendingMessageRef.current = null;
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [getId, sendContextualUpdate, sendUserMessage, sessionContext, status]);

  useEffect(() => {
    if (status !== "error") return;

    pendingMessageRef.current = null;
    hideOpeningGreetingRef.current = false;
    hiddenOpeningGreetingTextRef.current = null;
    setIsWaitingForReply(false);
  }, [status]);

  useEffect(() => {
    if (!isContextReady || isActive || !pendingMessageRef.current) return;

    hideOpeningGreetingRef.current = true;
    hiddenOpeningGreetingTextRef.current = getFirstMessage(variables);
    startSession({ textOnly: true });
  }, [isActive, isContextReady, startSession, variables]);

  const handleClick = () => {
    if (isActive) {
      endSession();
      return;
    }

    if (!isContextReady) return;

    startSession({ textOnly: false });
  };

  const openChat = () => {
    setIsChatOpen(true);
    setMessages((prev) => (
      prev.length === 0 ? [{ role: "agent", text: getFirstMessage(variables) }] : prev
    ));
    if (isContextReady && !isActive) {
      hideOpeningGreetingRef.current = true;
      hiddenOpeningGreetingTextRef.current = getFirstMessage(variables);
      startSession({ textOnly: true });
    }
  };

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setDraft("");

    const cartStatusAnswer = getCartStatusAnswer(message, cartItems, getTotalItems());
    if (cartStatusAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: cartStatusAnswer }]);
      return;
    }

    const deliveryAnswer = getDeliveryAnswer(message, menuProducts, pendingOrder?.itemName ?? lastItemName);
    if (deliveryAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: deliveryAnswer }]);
      return;
    }

    const businessAnswer = getBusinessAnswer(message);
    if (businessAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: businessAnswer }]);
      return;
    }

    const specialInstructionAnswer = getSpecialInstructionAnswer(message);
    if (specialInstructionAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: specialInstructionAnswer }]);
      return;
    }

    if (isAskingForName(message)) {
      const nameAnswer = variables.customer_name && variables.customer_name !== "there"
        ? `Your name is ${variables.customer_name}.`
        : "I do not have your name saved yet.";
      setMessages((prev) => [...prev, { role: "agent", text: nameAnswer }]);
      return;
    }

    if (pendingOrder) {
      const normalized = normalizeMenuText(message);
      if (normalized.includes("cancel") || normalized.includes("stop")) {
        setPendingOrder(null);
        setMessages((prev) => [...prev, { role: "agent", text: "Okay, I cancelled that item. What would you like instead?" }]);
        return;
      }

      const allergyConflictAnswer = getAllergyConflictAnswer(message, pendingOrder.itemName, menuProducts);
      if (allergyConflictAnswer) {
        setPendingOrder(null);
        setMessages((prev) => [...prev, { role: "agent", text: allergyConflictAnswer }]);
        return;
      }

      const itemMention = getExactItemFromMessage(message, menuProducts);
      if (itemMention && itemMention !== pendingOrder.itemName) {
        const { sizes, textures } = getProductChoices(menuProducts, itemMention);
        const nextOrder = {
          itemName: itemMention,
          size: getDefaultChoice(sizes, message, parseSizeChoice) ?? undefined,
          texture: getDefaultChoice(textures, message, parseTextureChoice) ?? undefined,
          quantity: parseQuantityChoice(message) ?? undefined,
        };
        setPendingOrder(nextOrder);
        setLastItemName(itemMention);
        setMessages((prev) => [...prev, { role: "agent", text: getItemSelectionPrompt(menuProducts, itemMention) }]);
        return;
      }

      const { sizes, textures } = getProductChoices(menuProducts, pendingOrder.itemName);
      const unsupportedSizeMessage = getUnsupportedSizeMessage(message, pendingOrder.itemName, sizes);
      if (unsupportedSizeMessage) {
        setMessages((prev) => [...prev, { role: "agent", text: unsupportedSizeMessage }]);
        return;
      }

      const parsedQuantity = parseQuantityChoice(message);
      const size = pendingOrder.size ?? getDefaultChoice(sizes, message, parseSizeChoice);
      const texture = pendingOrder.texture ?? getDefaultChoice(textures, message, parseTextureChoice);
      const quantity = parsedQuantity ?? pendingOrder.quantity;
      const nextOrder = { ...pendingOrder, size, texture, quantity };

      if (!size || (textures.length > 0 && !texture)) {
        setPendingOrder(nextOrder);
        setMessages((prev) => [...prev, { role: "agent", text: getItemSelectionPrompt(menuProducts, pendingOrder.itemName) }]);
        return;
      }

      if (!quantity) {
        setPendingOrder(nextOrder);
        setMessages((prev) => [...prev, { role: "agent", text: `How many portions of ${pendingOrder.itemName} would you like?` }]);
        return;
      }

      const resolvedProduct = await resolveCanonicalProduct({
        itemName: pendingOrder.itemName,
        size,
        texture,
        products: menuProducts,
      });

      if (!resolvedProduct.ok) {
        setPendingOrder(null);
        setMessages((prev) => [...prev, { role: "agent", text: resolvedProduct.details }]);
        return;
      }

      const { product, price } = resolvedProduct;
      if (!isConfirmationMessage(message)) {
        setPendingOrder(nextOrder);
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            text: `Please confirm: ${quantity} x ${product.Item}, ${product.Size}${product.Texture ? `, ${product.Texture}` : ""} at $${price} each. Total: $${(price * quantity).toFixed(2)}.`,
          },
        ]);
        return;
      }

      for (let i = 0; i < quantity; i += 1) {
        addItem({
          itemCode: product.Item_code,
          category: product.Category,
          item: product.Item,
          size: product.Size,
          texture: product.Texture || undefined,
          price,
        });
      }
      setLastAddedCartLine({
        itemCode: product.Item_code,
        category: product.Category,
        item: product.Item,
        size: product.Size,
        texture: product.Texture || undefined,
        price,
        quantity,
      });
      setPendingOrder(null);
      setLastItemName(product.Item);
      setMessages((prev) => [...prev, { role: "agent", text: `${quantity} x ${product.Item} added to your cart at $${(price * quantity).toFixed(2)} total.` }]);
      return;
    }

    const normalized = normalizeMenuText(message);
    if (normalized.includes("cancel") && lastAddedCartLine) {
      removeItem(lastAddedCartLine.itemCode, lastAddedCartLine.size, lastAddedCartLine.texture);
      setLastAddedCartLine(null);
      setMessages((prev) => [...prev, { role: "agent", text: `Okay, I removed ${lastAddedCartLine.item} from your cart. What would you like instead?` }]);
      return;
    }

    const changedQuantity = parseQuantityChoice(message);
    if (
      lastAddedCartLine &&
      changedQuantity &&
      (
        normalized.includes("change") ||
        normalized.includes("make it") ||
        normalized.includes("actually")
      )
    ) {
      updateQuantity(lastAddedCartLine.itemCode, lastAddedCartLine.size, lastAddedCartLine.texture, changedQuantity);
      setLastAddedCartLine({ ...lastAddedCartLine, quantity: changedQuantity });
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: `Updated ${lastAddedCartLine.item} to ${changedQuantity} portions. Cart line total is $${(lastAddedCartLine.price * changedQuantity).toFixed(2)}.` },
      ]);
      return;
    }

    const allergyConflictAnswer = getAllergyConflictAnswer(message, lastItemName, menuProducts);
    if (allergyConflictAnswer) {
      if (lastAddedCartLine?.item === lastItemName) {
        removeItem(lastAddedCartLine.itemCode, lastAddedCartLine.size, lastAddedCartLine.texture);
        setLastAddedCartLine(null);
      }
      setMessages((prev) => [...prev, { role: "agent", text: allergyConflictAnswer }]);
      return;
    }

    const knownUnavailableMenuNameAnswer = getKnownUnavailableMenuNameAnswer(message, menuProducts);
    if (knownUnavailableMenuNameAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: knownUnavailableMenuNameAnswer }]);
      return;
    }

    const priceAnswer = getPriceAnswer(message, menuProducts);
    if (priceAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: priceAnswer }]);
      return;
    }

    const exactItem = getExactItemFromMessage(message, menuProducts);
    if (exactItem) {
      const { sizes, textures } = getProductChoices(menuProducts, exactItem);
      const nextOrder = {
        itemName: exactItem,
        size: getDefaultChoice(sizes, message, parseSizeChoice) ?? undefined,
        texture: getDefaultChoice(textures, message, parseTextureChoice) ?? undefined,
        quantity: parseQuantityChoice(message) ?? undefined,
      };
      setPendingOrder(nextOrder);
      setLastItemName(exactItem);
      setMessages((prev) => [...prev, { role: "agent", text: getItemSelectionPrompt(menuProducts, exactItem) }]);
      return;
    }

    const preferredFoods = getFoodKeywords(message);
    foodContextRef.current = {
      preferredFoods: mergeUniqueValues(foodContextRef.current.preferredFoods, preferredFoods),
    };

    const recommendationAnswer = getRecommendationAnswer(message, menuProducts, foodContextRef.current);
    if (recommendationAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: recommendationAnswer }]);
      return;
    }

    const orderFirstAnswer = getOrderFirstAnswer(message);
    if (orderFirstAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: orderFirstAnswer }]);
      return;
    }

    const menuCategoryAnswer = getMenuCategoryAnswer(message, menuProducts);
    if (menuCategoryAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: menuCategoryAnswer }]);
      return;
    }

    if (isWeeklyMenuQuestion(message)) {
      setMessages((prev) => [...prev, { role: "agent", text: getMenuCategoryPrompt() }]);
      return;
    }

    const availabilityAnswer = getAvailabilityAnswer(message, menuProducts);
    if (availabilityAnswer) {
      setMessages((prev) => [...prev, { role: "agent", text: availabilityAnswer }]);
      return;
    }

    setIsWaitingForReply(true);

    if (!isContextReady) {
      pendingMessageRef.current = message;
      return;
    }

    if (!isActive) {
      pendingMessageRef.current = message;
      hideOpeningGreetingRef.current = true;
      hiddenOpeningGreetingTextRef.current = getFirstMessage(variables);
      startSession({ textOnly: true });
      return;
    }

    if (status === "connecting") {
      pendingMessageRef.current = message;
      return;
    }

    sendUserMessage(message);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-2">
      {isChatOpen && (
        <div className="flex h-[28rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
          <div className="flex items-center justify-between bg-brand-primary px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">Chef Sophie</p>
              <p className="text-xs opacity-80">
                {isActive ? "Online" : isContextReady ? "Ready to help" : "Getting ready"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="rounded-full p-1 transition hover:bg-white/15"
              aria-label="Close Chef Sophie chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#FDFBF7] p-4">
            {messages.length === 0 ? (
              <div className="rounded-xl bg-white p-3 text-sm text-brand-dark shadow-sm">
                {getFirstMessage(variables)}
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                        message.role === "user"
                          ? "bg-brand-primary text-white"
                          : "whitespace-pre-line bg-white text-brand-dark"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isWaitingForReply && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white px-3 py-2 text-sm text-brand-dark/60 shadow-sm">
                      Sophie is typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex gap-2 border-t border-brand-dark/10 bg-white p-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void sendMessage();
              }}
              className="min-w-0 flex-1 rounded-full border border-brand-dark/15 px-4 py-2 text-sm outline-none focus:border-brand-primary"
              placeholder="Type your message..."
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white transition hover:bg-brand-primary-hover"
              aria-label="Send message to Chef Sophie"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {statusMessage && status === "error" && (
        <div className="max-w-64 rounded-lg bg-white px-3 py-2 text-xs font-medium text-red-700 shadow-lg">
          {statusMessage}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openChat}
          className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-brand-primary shadow-xl ring-1 ring-brand-primary/15 transition hover:bg-[#FDFBF7]"
          aria-label="Chat with Chef Sophie"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Chat</span>
        </button>
        <button
          type="button"
          onClick={handleClick}
          disabled={isConnecting || !isContextReady}
          className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-bold text-white shadow-xl transition hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-70"
          aria-label={isActive ? "End Chef Sophie call" : "Start Chef Sophie call"}
        >
          {isActive ? <PhoneOff className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
          <span className="hidden sm:inline">
            {isConnecting ? "Connecting" : isActive ? "End" : "Call"}
          </span>
          {!isActive && <Mic className="h-4 w-4 sm:hidden" />}
        </button>
      </div>
    </div>
  );
}

export default function ChefSophieWidget() {
  const [variables, setVariables] = useState<DynamicVariables>(() => getDefaultVariables());
  const [isContextReady, setIsContextReady] = useState(false);
  const [menuProducts, setMenuProducts] = useState<ProductData[]>(PRODUCTS);
  const [isMenuReady, setIsMenuReady] = useState(false);
  const { addItem, clearCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    loadCurrentProducts().then((products) => {
      if (cancelled) return;
      setMenuProducts(products);
      setIsMenuReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      if (!supabase) {
        if (!cancelled) {
          setVariables(getDefaultVariables());
          setIsContextReady(true);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setVariables(getDefaultVariables());
          setIsContextReady(true);
        }
        return;
      }

      const [contactRes, lastOrderRes] = await Promise.all([
        supabase
          .from("contacts")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle<ContactRow>(),
        supabase
          .from("orders")
          .select("items")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<OrderRow>(),
      ]);

      if (contactRes.error) throw contactRes.error;
      if (lastOrderRes.error) throw lastOrderRes.error;

      if (!cancelled) {
        const customerName = getFirstName(contactRes.data, user.user_metadata ?? {});

        setVariables({
          customer_name: customerName,
          user_name: customerName,
          name: customerName,
          customer_id: user.id,
          is_returning: lastOrderRes.data ? "true" : "false",
          last_order_summary: getLastOrderSummary(lastOrderRes.data),
          baby_name: "",
          baby_age_months: "",
          baby_preferences: "",
          baby_allergies: "",
        });
        setIsContextReady(true);
      }
    }

    loadContext().catch((error) => {
      devError("Chef Sophie context failed:", error);
      if (!cancelled) {
        setVariables(getDefaultVariables());
        setIsContextReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = useCallback(
    async (params: AddToCartParams): Promise<string> => {
      devLog("[add_to_cart] received params:", {
        item_code: params.item_code,
        item_name: params.item_name,
        category: params.category,
        quantity: params.quantity,
        size: params.size,
        texture: params.texture,
        unit_price: params.unit_price,
        total_price: params.total_price,
        has_customer_id: Boolean(params.customer_id),
      });

      try {
        if (!params.item_name) {
          devError("[add_to_cart] missing item_name");
          return toToolResult("error", "Missing item_name");
        }

        const parsedQuantity = parseNumber(params.quantity);
        if (params.quantity !== undefined && Number.isNaN(parsedQuantity)) {
          devError("[add_to_cart] invalid quantity:", { quantity: params.quantity });
          return toToolResult("error", "Invalid quantity");
        }

        const quantity = Math.max(1, Math.floor(parsedQuantity || 1));
        const resolvedProduct = await resolveCanonicalProduct({
          itemCode: params.item_code,
          itemName: params.item_name,
          size: params.size,
          texture: params.texture,
        });

        if (!resolvedProduct.ok) {
          devError("[add_to_cart] canonical product lookup failed:", resolvedProduct.details);
          return toToolResult("error", resolvedProduct.message);
        }

        const { product, price } = resolvedProduct;

        for (let i = 0; i < quantity; i += 1) {
          addItem({
            itemCode: product.Item_code,
            category: product.Category,
            item: product.Item,
            size: product.Size,
            texture: product.Texture || undefined,
            price,
          });
        }

        devLog(`[add_to_cart] success: added ${quantity} x ${product.Item}`, {
          itemCode: product.Item_code,
          size: product.Size,
          texture: product.Texture,
          price,
        });
        return toToolResult("success", "Added to cart");
      } catch (error) {
        devError("[add_to_cart] addItem threw:", error);
        return toToolResult(
          "error",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },
    [addItem],
  );

  const handleClearCart = useCallback(
    async (params: ClearCartParams = {}): Promise<string> => {
      devLog("[clear_cart] received params:", params);

      try {
        clearCart();
        devLog("[clear_cart] success: cart cleared");
        return toToolResult("success", "Cart cleared");
      } catch (error) {
        devError("[clear_cart] clearCart threw:", { error, params });
        return toToolResult(
          "error",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    },
    [clearCart],
  );

  const clientTools = useMemo(
    () => ({
      add_to_cart: handleAddToCart,
      clear_cart: handleClearCart,
    }),
    [handleAddToCart, handleClearCart],
  );
  const sessionContext = useMemo(
    () => getSessionContextUpdate(variables, menuProducts),
    [menuProducts, variables],
  );
  const isSophieReady = isContextReady && isMenuReady;

  devLog("[ChefSophieWidget] dynamic variables loaded:", {
    customer_name: variables.customer_name,
    has_customer_id: Boolean(variables.customer_id),
    is_returning: variables.is_returning,
    has_last_order_summary: Boolean(variables.last_order_summary),
    has_baby_name: Boolean(variables.baby_name),
    has_baby_age_months: Boolean(variables.baby_age_months),
    has_baby_preferences: Boolean(variables.baby_preferences),
    has_baby_allergies: Boolean(variables.baby_allergies),
  });

  return (
    <ConversationProvider
      agentId={AGENT_ID}
      dynamicVariables={variables}
      userId={variables.customer_id || undefined}
      overrides={{
        agent: {
          firstMessage: getFirstMessage(variables),
        },
      }}
      clientTools={clientTools}
      onError={(error) => devError("[ChefSophieWidget] conversation error:", error)}
      onUnhandledClientToolCall={(toolCall) =>
        devError("[ChefSophieWidget] unhandled client tool:", toolCall)
      }
    >
      <ChefSophieControl
        variables={variables}
        isContextReady={isSophieReady}
        sessionContext={sessionContext}
        menuProducts={menuProducts}
      />
    </ConversationProvider>
  );
}
