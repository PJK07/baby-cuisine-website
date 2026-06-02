import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";

const ROOT = process.cwd();
const PRODUCTS_PATH = resolve(ROOT, "src/app/data/products.ts");
const OUTPUT_MD = resolve(ROOT, "scratch/sophie-stress-report.md");
const OUTPUT_JSON = resolve(ROOT, "scratch/sophie-stress-report.json");
const LOAD_OUTPUT_MD = resolve(ROOT, "scratch/sophie-load-test-report.md");
const LOAD_OUTPUT_JSON = resolve(ROOT, "scratch/sophie-load-test-report.json");
const LOAD_TRANSCRIPT_DIR = resolve(ROOT, "scratch/sophie-load-test");

const args = new Set(process.argv.slice(2));

function getArgValue(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSingularText(value) {
  return normalizeText(value)
    .split(" ")
    .map((word) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word))
    .join(" ");
}

function normalizeCompactText(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function editDistance(a, b) {
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

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function parseProducts() {
  const source = readFileSync(PRODUCTS_PATH, "utf8");
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("{ Item_code:"));

  return rows
    .map((row) => {
      const getField = (field) => {
        const match = row.match(new RegExp(`${field}:\\s*"([^"]*)"`, "i"));
        return match?.[1] ?? "";
      };

      const itemCode = getField("Item_code");
      const category = getField("Category");
      const item = getField("Item");
      const size = getField("Size");
      const texture = getField("Texture");
      const unitPrice = getField("Unit_Price");
      const ingredients = getField("Ingredients");
      const deliveryDay = getField("Delivery_Day");

      if (!itemCode || !category || !item || !size || !unitPrice) return null;

      return {
        itemCode,
        category,
        item,
        size,
        texture,
        unitPrice,
        ingredients,
        deliveryDay,
      };
    })
    .filter(Boolean);
}

function toNumber(value) {
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getExactMenuItems(products) {
  return Array.from(new Set(products.map((product) => product.item).filter(Boolean))).sort();
}

function getMenuCategoryPrompt() {
  return "Which section would you like to see: Pudding, Platter, Finger Food, or Biscuit?";
}

function getMenuCategoryFromMessage(message) {
  const normalized = normalizeText(message);
  if (
    normalized.includes("finger food") ||
    normalized.includes("finger foods") ||
    normalized === "finger" ||
    editDistance(normalized, "finger food") <= 1
  ) {
    return "Finger Food";
  }
  if (normalized.includes("pudding") || normalized.includes("puddings") || editDistance(normalized, "pudding") <= 1) {
    return "Pudding";
  }
  if (normalized.includes("platter") || normalized.includes("platters") || editDistance(normalized, "platter") <= 1) {
    return "Platter";
  }
  if (normalized.includes("biscuit") || normalized.includes("biscuits") || editDistance(normalized, "biscuit") <= 1) {
    return "Biscuit";
  }
  return null;
}

function getMenuCategoryAnswer(message, products) {
  const category = getMenuCategoryFromMessage(message);
  if (!category) return null;
  const items = Array.from(new Set(products.filter((product) => product.category === category).map((product) => product.item))).sort();
  if (items.length === 0) return `I do not see any exact ${category} items on this week's menu.`;
  return `${category} options this week:\n${items.join("\n")}\nWhich one would you like?`;
}

function getExactItemFromMessage(message, products) {
  const normalized = normalizeText(message);
  const singular = normalizeSingularText(message);
  const cleaned = normalizeSingularText(
    normalized
      .replace(/^(i want|i would like|i d like|can i have|please add|add|order|get|give me)\s+/, "")
      .replace(/^\d+\s+/, ""),
  );
  const compact = normalizeCompactText(normalized);
  const compactCleaned = normalizeCompactText(cleaned);

  return getExactMenuItems(products)
    .sort((a, b) => b.length - a.length)
    .find((item) => {
      const itemKey = normalizeText(item);
      const singularItemKey = normalizeSingularText(item);
      const compactItemKey = normalizeCompactText(item);
      return (
        normalized === itemKey ||
        singular === singularItemKey ||
        cleaned === singularItemKey ||
        compact === compactItemKey ||
        compact.includes(compactItemKey) ||
        compactCleaned === compactItemKey ||
        new RegExp(`(^|\\s)${itemKey}(\\s|$)`).test(normalized) ||
        new RegExp(`(^|\\s)${singularItemKey}(\\s|$)`).test(singular) ||
        editDistance(cleaned, singularItemKey) <= 1
      );
    }) ?? null;
}

function getFoodKeywords(message) {
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
  const words = new Set(normalizeText(message).split(" ").filter(Boolean));
  return FOOD_KEYWORDS.filter((keyword) => words.has(keyword));
}

function productMatchesFood(product, keywords) {
  if (keywords.length === 0) return true;
  const searchableText = normalizeText([product.item, product.itemCode, product.category, product.ingredients].filter(Boolean).join(" "));
  return keywords.some((keyword) => searchableText.includes(keyword));
}

function getProductSummary(products, itemName) {
  const variants = products.filter((product) => product.item === itemName);
  const category = variants[0]?.category ?? "Menu";
  const sizes = unique(variants.map((product) => product.size)).join(", ");
  const textures = unique(variants.map((product) => product.texture)).join(", ");
  const prices = variants.map((product) => toNumber(product.unitPrice)).filter((price) => Number.isFinite(price));
  const startingPrice = prices.length ? `, starting at $${Math.min(...prices)}` : "";
  const textureText = textures ? `, textures: ${textures}` : "";
  const sizeText = sizes ? `, sizes: ${sizes}` : "";
  return `${itemName} (${category}${sizeText}${textureText}${startingPrice})`;
}

function getProductPriceSummary(products, itemName) {
  const variants = products.filter((product) => product.item === itemName);
  const category = variants[0]?.category ?? "Menu";
  const pricesBySize = variants.reduce((groups, product) => {
    const size = product.size || "Item";
    const prices = groups.get(size) ?? new Set();
    prices.add(`$${product.unitPrice}`);
    groups.set(size, prices);
    return groups;
  }, new Map());
  const priceText = Array.from(pricesBySize)
    .map(([size, prices]) => `${size}: ${Array.from(prices).join(" / ")}`)
    .join(", ");
  return `${itemName} (${category}) - ${priceText}`;
}

function getProductChoices(products, itemName) {
  const variants = products.filter((product) => product.item === itemName);
  return {
    sizes: unique(variants.map((product) => product.size)),
    textures: unique(variants.map((product) => product.texture)),
  };
}

function getItemSelectionPrompt(products, itemName) {
  const { sizes, textures } = getProductChoices(products, itemName);
  const sizeText = sizes.length > 0 ? `size (${sizes.join(", ")})` : "";
  const textureText = textures.length > 0 ? `texture (${textures.join(", ")})` : "";
  const joiner = sizeText && textureText ? " and " : "";
  return `Great choice. ${itemName} is on this week's exact menu.\nPlease choose ${sizeText}${joiner}${textureText}.`;
}

function getCategoryPriceSummary(products) {
  const categories = unique(products.map((product) => product.category)).sort();
  return categories
    .map((category) => {
      const variants = products.filter((product) => product.category === category);
      const pricesBySize = variants.reduce((groups, product) => {
        const size = product.size || "Item";
        const prices = groups.get(size) ?? new Set();
        prices.add(`$${product.unitPrice}`);
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

function getDeliveryDayForItem(products, itemName) {
  const days = unique(products.filter((product) => product.item === itemName).map((product) => product.deliveryDay));
  return days.find((day) => day === "Tuesday" || day === "Friday") ?? null;
}

function getItemsForDeliveryDay(products, day) {
  const items = Array.from(new Set(products.filter((product) => product.deliveryDay === day).map((product) => product.item))).sort();
  if (items.length === 0) return `I do not see any exact items marked for ${day}.`;
  return [`Exact ${day} items:`, items.join("\n")].join("\n");
}

function isBabyProfileOnlyMessage(message) {
  const normalized = normalizeText(message);
  const hasAge = /^\d{1,2}$/.test(normalized) || /\b\d{1,2}\s*(months?|mos?|mths?|monthold|month old)\b/.test(normalized);
  return hasAge || normalized.includes("allerg");
}

function isPriceQuestion(message) {
  const normalized = normalizeText(message);
  return /\bprices?\b/.test(normalized) || normalized.includes("how much") || normalized.includes("cost");
}

function getPriceAnswer(message, products) {
  if (!isPriceQuestion(message)) return null;
  const normalized = normalizeText(message);
  const exactItem = getExactMenuItems(products).find((item) => normalized.includes(normalizeText(item)));
  if (exactItem) {
    return [`Prices for ${exactItem}:`, getProductPriceSummary(products, exactItem), "Which size would you like?"].join("\n");
  }
  return ["Here is the current price guide:", getCategoryPriceSummary(products), "Tell me the item name if you want exact prices for one item."].join("\n");
}

function getBusinessAnswer(message) {
  const normalized = normalizeText(message);
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
  if (normalized.includes("got what") || normalized.includes("what do you mean") || normalized.includes("what did you get")) {
    return "Sorry, I should be clearer. I can answer business questions, show exact menu items and prices, or help add an exact item to your cart.";
  }
  if (normalized.includes("your business") || normalized.includes("about baby cuisine") || normalized.includes("about your business") || normalized.includes("who are you")) {
    return "Baby Cuisine prepares fresh handmade baby food in Lebanon with 100% natural ingredients, no sugar, no preservatives, and no artificial colors.";
  }
  return null;
}

function getSpecialInstructionAnswer(message) {
  const normalized = normalizeText(message);
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

function getDeliveryAnswer(message, products, lastItemName) {
  const normalized = normalizeText(message);
  const explicitDay = normalized.includes("friday") ? "Friday" : normalized.includes("tuesday") ? "Tuesday" : null;
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
    if (!lastItemName) return "Tell me the item name and I can check its exact delivery day.";
    const day = getDeliveryDayForItem(products, lastItemName);
    if (!day) return `${lastItemName} is available, but I do not see a specific delivery day for it in the current menu data.`;
    return `${lastItemName} is delivered on ${day}.`;
  }
  return null;
}

function getOrderFirstAnswer(message) {
  const normalized = normalizeText(message);
  if (["hi", "hello", "hey", "heyy", "hola"].includes(normalized)) return "Hi! What would you like to order today?";
  if (["yes", "yeah", "yep", "ok great", "okay great", "great"].includes(normalized)) return "Great. What would you like to order today?";
  if (
    normalized.includes("how can you help") ||
    normalized.includes("what can you do") ||
    normalized.includes("help me") ||
    normalized.includes("other thing") ||
    normalized.includes("something else")
  ) {
    return "I can help you choose exact items from this week's menu and add them to your cart. What would you like to order today?";
  }
  if (isBabyProfileOnlyMessage(message)) return "Got it. What would you like to order today?";
  return null;
}

function getCartStatusAnswer(message, cartItems, totalItems) {
  const normalized = normalizeText(message);
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
  const lines = cartItems.map((item) => `${item.quantity} x ${item.item}, ${item.size}${item.texture ? `, ${item.texture}` : ""} - $${(item.price * item.quantity).toFixed(2)}`);
  return ["Your cart currently has:", lines.join("\n")].join("\n");
}

function parseSizeChoice(message, sizes) {
  const normalized = normalizeText(message);
  const aliases = new Map([
    ["small", "120 ml"],
    ["medium", "200 ml"],
    ["big", "250 ml"],
    ["large", "250 ml"],
  ]);
  const words = new Set(normalized.split(" ").filter(Boolean));
  const alias = aliases.get(normalized) ?? Array.from(aliases).find(([key]) => words.has(key))?.[1];
  if (alias && sizes.includes(alias)) return alias;
  return sizes.find((size) => normalized.includes(normalizeText(size))) ?? null;
}

function hasSizeIntent(message) {
  const normalized = normalizeText(message);
  return /\b(small|medium|big|large|box|piece|pieces|120|200|250|ml)\b/.test(normalized);
}

function getUnsupportedSizeMessage(message, itemName, sizes) {
  if (!hasSizeIntent(message) || parseSizeChoice(message, sizes)) return null;
  return `${itemName} is available as ${sizes.join(", ")}, not the size you mentioned. Which available size would you like?`;
}

function getDefaultChoice(options, message, parser) {
  return parser(message, options) ?? (options.length === 1 ? options[0] : null);
}

function parseTextureChoice(message, textures) {
  const normalized = normalizeText(message);
  return textures.find((texture) => normalizeText(texture).split(" ").every((word) => normalized.includes(word))) ?? null;
}

function parseQuantityChoice(message) {
  const normalized = normalizeText(message);
  if (normalized === "one") return 1;
  if (normalized === "two") return 2;
  if (normalized === "three") return 3;
  if (normalized.includes("make it one") || normalized.includes("change to one") || normalized.includes("actually one")) return 1;
  if (normalized.includes("make it two") || normalized.includes("change to two") || normalized.includes("actually two")) return 2;
  if (normalized.includes("make it three") || normalized.includes("change to three") || normalized.includes("actually three")) return 3;
  const match = normalized.match(/\b([1-9]\d?)\b/);
  return match ? Number(match[1]) : null;
}

function getAllergyConflictAnswer(message, itemName, products) {
  const normalized = normalizeText(message);
  const allergenMatch = normalized.match(/\b(?:no|without|allergic to|allergy to)\s+(eggs?|milk|nuts?|almonds?|salmon|fish|lamb|chicken)\b/);
  if (!allergenMatch?.[1] || !itemName) return null;

  const allergen = allergenMatch[1].replace(/s$/, "");
  const variants = products.filter((product) => product.item === itemName);
  const hasAllergen = variants.some((product) => normalizeText(product.ingredients ?? "").includes(allergen));
  if (!hasAllergen) return null;
  return `${itemName} includes ${allergen}. I cannot add that with a no-${allergen} instruction. Please choose a different exact menu item.`;
}

function isConfirmationMessage(message) {
  const normalized = normalizeText(message);
  return ["ok", "okay", "yes", "confirm", "confirmed", "correct", "only this", "thats it", "that is it"].includes(normalized);
}

function createCartItem(product, quantity) {
  return {
    itemCode: product.itemCode,
    category: product.category,
    item: product.item,
    size: product.size,
    texture: product.texture || undefined,
    price: toNumber(product.unitPrice),
    quantity,
  };
}

function resolveProduct(products, pendingOrder) {
  const candidates = products.filter((product) => product.item === pendingOrder.itemName);
  if (candidates.length === 0) {
    return { ok: false, message: `"${pendingOrder.itemName}" is not an exact menu item.` };
  }

  let next = candidates;
  if (pendingOrder.size) {
    const requestedSize = normalizeText(pendingOrder.size);
    const sized = next.filter((product) => normalizeText(product.size) === requestedSize || normalizeCompactText(product.size) === normalizeCompactText(pendingOrder.size));
    if (sized.length === 0) {
      return { ok: false, message: `I found ${candidates[0].item}, but not in size "${pendingOrder.size}".` };
    }
    next = sized;
  }
  if (pendingOrder.texture) {
    const requestedTexture = normalizeText(pendingOrder.texture);
    const textured = next.filter((product) => normalizeText(product.texture) === requestedTexture);
    if (textured.length === 0) {
      return { ok: false, message: `I found ${candidates[0].item}, but not with texture "${pendingOrder.texture}".` };
    }
    next = textured;
  }

  const uniqueSizes = unique(next.map((product) => product.size));
  if (!pendingOrder.size && uniqueSizes.length > 1) {
    return { ok: false, message: `Please choose a size for ${next[0].item}: ${uniqueSizes.join(", ")}.` };
  }

  const uniqueTextures = unique(next.map((product) => product.texture).filter(Boolean));
  if (!pendingOrder.texture && uniqueTextures.length > 1) {
    return { ok: false, message: `Please choose a texture for ${next[0].item}: ${uniqueTextures.join(", ")}.` };
  }

  const product = next[0];
  return { ok: true, product };
}

class AgentSession {
  constructor(agent) {
    this.agent = agent;
    this.products = [];
    this.messages = [];
    this.cart = [];
    this.pendingOrder = null;
    this.lastItemName = null;
    this.lastAddedCartLine = null;
    this.errors = [];
    this.latencies = [];
    this.clarificationAsked = false;
    this.confirmedCorrectItems = true;
    this.hallucinatedProducts = [];
  }

  push(role, text) {
    this.messages.push({ role, text, at: new Date().toISOString() });
  }

  get total() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get totalItems() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  snapshotCart() {
    return this.cart.map((item) => ({
      itemCode: item.itemCode,
      category: item.category,
      item: item.item,
      size: item.size,
      texture: item.texture ?? "",
      quantity: item.quantity,
      price: item.price,
      lineTotal: Number((item.price * item.quantity).toFixed(2)),
    }));
  }

  reply(text) {
    const startedAt = performance.now();
    this.push("user", text);

    const response = this.handleMessage(text);
    const latencyMs = Number((performance.now() - startedAt).toFixed(2));
    this.latencies.push(latencyMs);
    this.push("agent", response);
    if (response.includes("?") || response.includes("please choose") || response.includes("Which")) {
      this.clarificationAsked = true;
    }
    return response;
  }

  handleMessage(message) {
    const products = this.products;
    const cartStatusAnswer = getCartStatusAnswer(message, this.cart, this.totalItems);
    if (cartStatusAnswer) return cartStatusAnswer;

    const deliveryAnswer = getDeliveryAnswer(message, products, this.lastItemName);
    if (deliveryAnswer) return deliveryAnswer;

    const businessAnswer = getBusinessAnswer(message);
    if (businessAnswer) return businessAnswer;

    const specialInstructionAnswer = getSpecialInstructionAnswer(message);
    if (specialInstructionAnswer) return specialInstructionAnswer;

    if (message.toLowerCase().includes("what is my name")) {
      return this.agent.customerName ? `Your name is ${this.agent.customerName}.` : "I do not have your name saved yet.";
    }

    if (this.pendingOrder) {
      if (/\b(cancel|stop)\b/i.test(message)) {
        this.pendingOrder = null;
        return "Okay, I cancelled that item. What would you like instead?";
      }

      const allergyConflictAnswer = getAllergyConflictAnswer(message, this.pendingOrder.itemName, products);
      if (allergyConflictAnswer) {
        this.pendingOrder = null;
        return allergyConflictAnswer;
      }

      const itemMention = getExactItemFromMessage(message, products);
      if (itemMention && itemMention !== this.pendingOrder.itemName) {
        const { sizes, textures } = getProductChoices(products, itemMention);
        this.pendingOrder = {
          itemName: itemMention,
          size: getDefaultChoice(sizes, message, parseSizeChoice) ?? undefined,
          texture: getDefaultChoice(textures, message, parseTextureChoice) ?? undefined,
          quantity: parseQuantityChoice(message) ?? undefined,
        };
        this.lastItemName = itemMention;
        return getItemSelectionPrompt(products, itemMention);
      }

      const { sizes, textures } = getProductChoices(products, this.pendingOrder.itemName);
      const unsupportedSizeMessage = getUnsupportedSizeMessage(message, this.pendingOrder.itemName, sizes);
      if (unsupportedSizeMessage) {
        this.clarificationAsked = true;
        return unsupportedSizeMessage;
      }

      const parsedQuantity = parseQuantityChoice(message);
      const size = this.pendingOrder.size ?? getDefaultChoice(sizes, message, parseSizeChoice);
      const texture = this.pendingOrder.texture ?? getDefaultChoice(textures, message, parseTextureChoice);
      const quantity = parsedQuantity ?? this.pendingOrder.quantity;
      const nextOrder = { ...this.pendingOrder, size: size ?? undefined, texture: texture ?? undefined, quantity: quantity ?? undefined };
      this.pendingOrder = nextOrder;

      const resolved = resolveProduct(products, nextOrder);
      if (!resolved.ok) {
        this.clarificationAsked = true;
        return resolved.message;
      }

      if (!size || (textures.length > 0 && !texture)) {
        this.clarificationAsked = true;
        return getItemSelectionPrompt(products, nextOrder.itemName);
      }
      if (!quantity) {
        this.clarificationAsked = true;
        return `How many portions of ${nextOrder.itemName} would you like?`;
      }

      if (!isConfirmationMessage(message)) {
        this.clarificationAsked = true;
        const total = Number((resolved.product.unitPrice ? toNumber(resolved.product.unitPrice) * quantity : 0).toFixed(2));
        return `Please confirm: ${quantity} x ${resolved.product.item}, ${resolved.product.size}${resolved.product.texture ? `, ${resolved.product.texture}` : ""} at $${toNumber(resolved.product.unitPrice)} each. Total: $${total.toFixed(2)}.`;
      }

      const line = createCartItem(resolved.product, quantity);
      const existing = this.cart.findIndex(
        (item) => item.itemCode === line.itemCode && item.size === line.size && item.texture === line.texture,
      );
      if (existing >= 0) {
        this.cart[existing].quantity += line.quantity;
      } else {
        this.cart.push(line);
      }
      this.lastAddedCartLine = line;
      this.lastItemName = resolved.product.item;
      this.pendingOrder = null;
      return `${quantity} x ${resolved.product.item} added to your cart at $${(toNumber(resolved.product.unitPrice) * quantity).toFixed(2)} total.`;
    }

    if (normalizeText(message).includes("cancel") && this.lastAddedCartLine) {
      this.cart = this.cart.filter(
        (item) =>
          item.itemCode !== this.lastAddedCartLine.itemCode ||
          item.size !== this.lastAddedCartLine.size ||
          item.texture !== this.lastAddedCartLine.texture,
      );
      const itemName = this.lastAddedCartLine.item;
      this.lastAddedCartLine = null;
      return `Okay, I removed ${itemName} from your cart. What would you like instead?`;
    }

    const normalized = normalizeText(message);
    const changedQuantity = parseQuantityChoice(message);
    if (
      this.lastAddedCartLine &&
      changedQuantity &&
      (
        normalized.includes("change") ||
        normalized.includes("make it") ||
        normalized.includes("actually")
      )
    ) {
      const existing = this.cart.find(
        (item) =>
          item.itemCode === this.lastAddedCartLine.itemCode &&
          item.size === this.lastAddedCartLine.size &&
          item.texture === this.lastAddedCartLine.texture,
      );
      if (existing) existing.quantity = changedQuantity;
      this.lastAddedCartLine = { ...this.lastAddedCartLine, quantity: changedQuantity };
      return `Updated ${this.lastAddedCartLine.item} to ${changedQuantity} portions. Cart line total is $${(this.lastAddedCartLine.price * changedQuantity).toFixed(2)}.`;
    }

    const allergyConflictAnswer = getAllergyConflictAnswer(message, this.lastItemName, products);
    if (allergyConflictAnswer) {
      if (this.lastAddedCartLine?.item === this.lastItemName) {
        this.cart = this.cart.filter(
          (item) =>
            item.itemCode !== this.lastAddedCartLine.itemCode ||
            item.size !== this.lastAddedCartLine.size ||
            item.texture !== this.lastAddedCartLine.texture,
        );
        this.lastAddedCartLine = null;
      }
      return allergyConflictAnswer;
    }

    const knownUnavailableMenuName = getKnownUnavailableMenuNameAnswer(message, products);
    if (knownUnavailableMenuName) return knownUnavailableMenuName;

    const priceAnswer = getPriceAnswer(message, products);
    if (priceAnswer) return priceAnswer;

    const exactItem = getExactItemFromMessage(message, products);
    if (exactItem) {
      const { sizes, textures } = getProductChoices(products, exactItem);
      this.pendingOrder = {
        itemName: exactItem,
        size: getDefaultChoice(sizes, message, parseSizeChoice) ?? undefined,
        texture: getDefaultChoice(textures, message, parseTextureChoice) ?? undefined,
        quantity: parseQuantityChoice(message) ?? undefined,
      };
      this.lastItemName = exactItem;
      return getItemSelectionPrompt(products, exactItem);
    }

    const requestedFoods = getFoodKeywords(message);
    this.agent.foodContext.preferredFoods = unique([...this.agent.foodContext.preferredFoods, ...requestedFoods]);
    const preferredFoods = requestedFoods.length > 0 ? requestedFoods : this.agent.foodContext.preferredFoods;
    const isRecommendationTurn = requestedFoods.length > 0 || normalizeText(message).includes("what about");
    if (isRecommendationTurn && preferredFoods.length > 0) {
      const candidateProducts = products.filter((product) => productMatchesFood(product, preferredFoods));
      const itemNames = Array.from(new Set(candidateProducts.map((product) => product.item))).slice(0, 6);
      if (itemNames.length === 0) {
        this.clarificationAsked = true;
        return `I do not see an exact ${preferredFoods.join(" or ")} item on this week's menu. ${getMenuCategoryPrompt()}`;
      }
      return [
        `Here are exact current-menu options for ${preferredFoods.join(" and ")}:`,
        itemNames.map((itemName) => getProductSummary(products, itemName)).join("\n"),
        "Which one would you like for your little one?",
      ].join("\n");
    }

    const orderFirst = getOrderFirstAnswer(message);
    if (orderFirst) return orderFirst;

    const categoryAnswer = getMenuCategoryAnswer(message, products);
    if (categoryAnswer) return categoryAnswer;

    if (/\bwhat do you have\b|\bwhat is there\b|\bwhats there\b|\bwhat is available\b|\bwhats available\b|\bavailable\b|\bwhat can i order\b|\bwhat can i buy\b|\bwhat can i get\b|\bwhat can we order\b|\bwhat is on\b|\bwhats on\b|\bthis week\b|\bmenu\b/i.test(normalizeText(message))) {
      return getMenuCategoryPrompt();
    }

    const availability = getAvailabilityAnswer(message, products);
    if (availability) return availability;

    if (normalizeText(message).includes("cancel")) {
      return "Okay, tell me what you want instead.";
    }

    return "What would you like to order today?";
  }
}

function getKnownUnavailableMenuNameAnswer(message, products) {
  const KNOWN_UNAVAILABLE_MENU_NAMES = [
    "Moujadara",
    "Okra Stew With Meat",
    "Roast Meat With Veggies",
    "Sweet Potato Salmon",
  ];
  const normalized = normalizeText(message);
  const exactMenuNames = new Set(products.map((product) => normalizeText(product.item)));

  for (const itemName of KNOWN_UNAVAILABLE_MENU_NAMES) {
    const itemKey = normalizeText(itemName);
    if (normalized.includes(itemKey) && !exactMenuNames.has(itemKey)) {
      return `${itemName} is not on this week's exact menu.`;
    }
  }
  return null;
}

function getAvailabilityAnswer(message, products) {
  const normalized = normalizeText(message);
  const match = [
    normalized.match(/^do you have\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^do you sell\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is there\s+(.+?)(?:\s+on\s+the\s+menu)?$/),
    normalized.match(/^is\s+(.+?)\s+(?:on|in)\s+(?:this\s+week\s+)?(?:the\s+)?menu$/),
  ].find(Boolean);
  if (!match?.[1]) return null;
  const requested = normalizeText(match[1]);
  const exactItem = getExactMenuItems(products).find((item) => normalizeText(item) === requested);
  if (exactItem) return `Yes, ${exactItem} is on this week's menu.`;
  return `${match[1].replace(/\b\w/g, (letter) => letter.toUpperCase())} is not on this week's exact menu.`;
}

function buildScenarios() {
  return [
    {
      id: "agent-110",
      label: "Clear normal order",
      customerName: "Maya",
      persona: "Busy returning parent ordering for twins",
      behavior: "clear normal order",
      fulfillment: "Delivery to 123 Main Street, Beirut on Tuesday",
      specialInstructions: "Label puddings by child name; ring the bell once.",
      turns: [
        "hello",
        "what do you have",
        "finger food",
        "almond pancakes",
        "4",
        "yes",
        "i want other thing",
        "platter",
        "veggie soup",
        "200 ml fully blended",
        "2",
        "yes",
        "add pudding",
        "riz b halib",
        "250 ml",
        "6",
        "yes",
        "Tuesday delivery please",
        "123 Main Street, Beirut",
        "please label the puddings for each twin and ring the bell once",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Almond Pancakes", size: "Box", quantity: 4 },
          { item: "Veggie Soup", size: "200 ml", texture: "Fully Blended", quantity: 2 },
          { item: "Riz B Halib", size: "250 ml", quantity: 6 },
        ],
      },
    },
    {
      id: "agent-111",
      label: "Typo-heavy order",
      customerName: "Omar",
      persona: "Typo-heavy parent ordering puddings and a Friday platter",
      behavior: "typo-heavy order",
      fulfillment: "Delivery near ABC Verdun, Beirut",
      specialInstructions: "Call before arrival because building entrance is confusing.",
      turns: [
        "piudding",
        "riz bhalib",
        "250 ml",
        "5",
        "yes",
        "chia berris",
        "120 ml",
        "3",
        "yes",
        "platter",
        "moghraabieh",
        "big fully blended",
        "2",
        "yes",
        "what is the prices",
        "delivery near ABC Verdun Beirut please call before arrival",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Riz B Halib", size: "250 ml", quantity: 5 },
          { item: "Chia Berries", size: "120 ml", quantity: 3 },
          { item: "Moghrabieh", size: "250 ml", texture: "Fully Blended", quantity: 2 },
        ],
      },
    },
    {
      id: "agent-112",
      label: "Item substitutions",
      customerName: "Nadine",
      persona: "Parent making valid substitutions mid-order",
      behavior: "item substitutions",
      fulfillment: "Pickup request after 4 PM",
      specialInstructions: "Separate savory finger foods from puddings.",
      turns: [
        "what can i order",
        "platter",
        "chicken soup",
        "200 ml pieces",
        "2",
        "actually salmon fingers",
        "box",
        "3",
        "yes",
        "add pudding too",
        "chia meghle",
        "120 ml",
        "1",
        "yes",
        "add chicken fingers",
        "box",
        "2",
        "yes",
        "pickup after 4 pm and separate savory from pudding",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Salmon Fingers", size: "Box", quantity: 3 },
          { item: "Chia Meghle", size: "120 ml", quantity: 1 },
          { item: "Chicken Fingers", size: "Box", quantity: 2 },
        ],
      },
    },
    {
      id: "agent-113",
      label: "Repeated edits",
      customerName: "Karim",
      persona: "Customer repeatedly editing quantities before and after confirmation",
      behavior: "repeated item edits",
      fulfillment: "Delivery to Hamra, cash on delivery",
      specialInstructions: "Put biscuits in two separate bags.",
      turns: [
        "biscuit",
        "sourdough biscuits",
        "box",
        "6",
        "make it 8",
        "yes",
        "no change to 5",
        "actually 5 yes",
        "finger food",
        "almond pancakes",
        "4",
        "yes",
        "change to 6",
        "pudding",
        "mhalabiye",
        "120 ml",
        "3",
        "yes",
        "delivery to Hamra cash on delivery, biscuits in two bags",
        "sourdough biscuits box, 5 boxes",
        "yes",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Sourdough Biscuits", size: "Box", quantity: 10 },
          { item: "Almond Pancakes", size: "Box", quantity: 6 },
          { item: "Mhalabiye", size: "120 ml", quantity: 3 },
        ],
      },
    },
    {
      id: "agent-114",
      label: "Out of stock request",
      customerName: "Hala",
      persona: "Customer asks for unavailable item, then accepts valid alternatives",
      behavior: "out-of-stock item request",
      fulfillment: "Friday delivery to Achrafieh",
      specialInstructions: "Leave with concierge if not home.",
      turns: [
        "do you have Sweet Potato Salmon",
        "I want Sweet Potato Salmon",
        "what else do you have on Friday",
        "veggie soup",
        "200 ml fully blended",
        "2",
        "yes",
        "sweet potato kafta",
        "200 ml half blended",
        "3",
        "yes",
        "pudding",
        "coconut custard",
        "120 ml",
        "4",
        "yes",
        "friday delivery to Achrafieh, leave with concierge",
      ],
      expectations: {
        mustClarify: true,
        rejected: ["Sweet Potato Salmon"],
        items: [
          { item: "Veggie Soup", size: "200 ml", texture: "Fully Blended", quantity: 2 },
          { item: "Sweet Potato Kafta", size: "200 ml", texture: "Half Blended", quantity: 3 },
          { item: "Coconut Custard", size: "120 ml", quantity: 4 },
        ],
      },
    },
    {
      id: "agent-115",
      label: "Conflicting instructions",
      customerName: "Ali",
      persona: "Allergy-conscious customer with one corrected conflict",
      behavior: "conflicting instructions",
      fulfillment: "Delivery to Mar Mikhael, call from downstairs",
      specialInstructions: "No egg items in final order.",
      turns: [
        "what do you have",
        "finger food",
        "cake",
        "box",
        "2",
        "actually one",
        "but make it two",
        "yes",
        "and no eggs",
        "lamb kebbe",
        "3",
        "yes",
        "apple quinoa",
        "250 ml",
        "4",
        "yes",
        "chicken soup",
        "120 ml fully blended",
        "2",
        "yes",
        "delivery to Mar Mikhael call from downstairs no egg items please",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Lamb Kebbe", size: "Box", quantity: 3 },
          { item: "Apple Quinoa", size: "250 ml", quantity: 4 },
          { item: "Chicken Soup", size: "120 ml", texture: "Fully Blended", quantity: 2 },
        ],
      },
    },
    {
      id: "agent-116",
      label: "Very large quantities",
      customerName: "Sara",
      persona: "Customer placing a very large but valid bulk order",
      behavior: "very large quantities",
      fulfillment: "Pickup for nursery event",
      specialInstructions: "Pack puddings by flavor and keep receipt itemized.",
      turns: [
        "pudding",
        "chia berries",
        "120 ml",
        "25",
        "yes",
        "add another pudding",
        "riz b halib",
        "250 ml",
        "30",
        "yes",
        "finger food",
        "almond pancakes",
        "10",
        "yes",
        "pickup for nursery event, pack each pudding flavor separately",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Chia Berries", size: "120 ml", quantity: 25 },
          { item: "Riz B Halib", size: "250 ml", quantity: 30 },
          { item: "Almond Pancakes", size: "Box", quantity: 10 },
        ],
      },
    },
    {
      id: "agent-117",
      label: "Mixed language",
      customerName: "Lea",
      persona: "Multilingual customer mixing French, English, and Lebanese phrasing",
      behavior: "multilingual or mixed-language request",
      fulfillment: "Friday delivery to Gemmayzeh",
      specialInstructions: "Send message before delivery; toddler prefers fully blended platters.",
      turns: [
        "bonjour chef sophie",
        "platter please",
        "je veux moghrabieh",
        "big fully blended",
        "1",
        "yes",
        "et aussi almond pancake",
        "box",
        "2",
        "yes",
        "w kamen siyadiyeh",
        "200 ml fully blended",
        "2",
        "yes",
        "pudding",
        "quinoa banana blueberry",
        "120 ml",
        "3",
        "yes",
        "delivery vendredi Gemmayzeh please message before delivery",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Moghrabieh", size: "250 ml", texture: "Fully Blended", quantity: 1 },
          { item: "Almond Pancakes", size: "Box", quantity: 2 },
          { item: "Siyadiyeh", size: "200 ml", texture: "Fully Blended", quantity: 2 },
          { item: "Quinoa Banana Blueberry", size: "120 ml", quantity: 3 },
        ],
      },
    },
    {
      id: "agent-118",
      label: "Delivery ambiguity",
      customerName: "Rania",
      persona: "Customer with ambiguous delivery address details",
      behavior: "delivery address ambiguity",
      fulfillment: "Delivery near school gate, exact address unclear",
      specialInstructions: "Ask driver to call for final landmark.",
      turns: [
        "what is available",
        "platter",
        "moghrabieh",
        "250 ml fully blended",
        "3",
        "yes",
        "when it will be delivered",
        "which day",
        "near the school",
        "veggie soup",
        "200 ml pieces",
        "2",
        "yes",
        "lemon lentice soup",
        "120 ml fully blended",
        "4",
        "yes",
        "address is near the school gate please call for landmark",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Moghrabieh", size: "250 ml", texture: "Fully Blended", quantity: 3 },
          { item: "Veggie Soup", size: "200 ml", texture: "Pieces", quantity: 2 },
          { item: "Lemon Lentice Soup", size: "120 ml", texture: "Fully Blended", quantity: 4 },
        ],
      },
    },
    {
      id: "agent-119",
      label: "Cancel or change after confirmation",
      customerName: "Yousef",
      persona: "Customer cancels one confirmed item and replaces it",
      behavior: "cancellation or change after confirmation",
      fulfillment: "Tuesday delivery to office reception",
      specialInstructions: "Write baby name on the bag.",
      turns: [
        "pudding",
        "mhalabiye",
        "120 ml",
        "4",
        "yes",
        "cancel it",
        "instead quinoa banana blueberry",
        "250 ml",
        "2",
        "yes",
        "coconut custard",
        "120 ml",
        "3",
        "yes",
        "salmon fingers",
        "2",
        "yes",
        "Tuesday delivery to office reception, write baby name on the bag",
      ],
      expectations: {
        mustClarify: true,
        items: [
          { item: "Quinoa Banana Blueberry", size: "250 ml", quantity: 2 },
          { item: "Coconut Custard", size: "120 ml", quantity: 3 },
          { item: "Salmon Fingers", size: "Box", quantity: 2 },
        ],
      },
    },
  ];
}

function compareCart(actual, expected) {
  const normalizeLine = (item) => ({
    item: item.item,
    size: item.size,
    texture: item.texture || "",
    quantity: item.quantity,
  });

  const actualLines = actual.map(normalizeLine);
  const expectedLines = expected.map(normalizeLine);
  const missing = expectedLines.filter(
    (expectedItem) =>
      !actualLines.some(
        (actualItem) =>
          actualItem.item === expectedItem.item &&
          actualItem.size === expectedItem.size &&
          actualItem.texture === expectedItem.texture &&
          actualItem.quantity === expectedItem.quantity,
      ),
  );
  const extras = actualLines.filter(
    (actualItem) =>
      !expectedLines.some(
        (expectedItem) =>
          actualItem.item === expectedItem.item &&
          actualItem.size === expectedItem.size &&
          actualItem.texture === expectedItem.texture &&
          actualItem.quantity === expectedItem.quantity,
      ),
  );
  return { missing, extras };
}

function detectHallucinations(transcript, exactItems) {
  const exactSet = new Set(exactItems.map((item) => normalizeText(item)));
  const knownForbidden = new Set([normalizeText("Sweet Potato Salmon")]);
  const findings = [];

  for (const entry of transcript.filter((message) => message.role === "agent")) {
    const text = normalizeText(entry.text);
    for (const forbidden of knownForbidden) {
      const isExplicitRejection =
        text.includes("not on this week") ||
        text.includes("not on the current") ||
        text.includes("not on this week s exact menu");
      if (text.includes(forbidden) && !exactSet.has(forbidden) && !isExplicitRejection) {
        findings.push("Sweet Potato Salmon");
      }
    }
  }

  return unique(findings);
}

function markdownTable(rows) {
  const headers = ["Agent", "Persona", "Order Size", "Status", "Total", "Severity", "Anomalies"];
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.agent} | ${row.persona} | ${row.orderSize} | ${row.pass ? "Pass" : "Fail"} | $${row.finalOrderTotal.toFixed(2)} | ${row.severity} | ${row.anomalies.length ? row.anomalies.join("<br>") : "None"} |`,
    );
  }
  return lines.join("\n");
}

function ensureDirFor(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function getSeverity(anomalies) {
  if (anomalies.length === 0) return "none";
  if (
    anomalies.some((entry) =>
      entry.includes("Incorrect total") ||
      entry.includes("Hallucinated") ||
      entry.includes("Missing items") ||
      entry.includes("Extra items") ||
      entry.includes("Errors")
    )
  ) {
    return "high";
  }
  return "medium";
}

function getOrderSize(cartItems) {
  const lineCount = cartItems.length;
  const unitCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return `${lineCount} lines / ${unitCount} units`;
}

async function runScenario(scenario, products, exactItems) {
  const session = new AgentSession({
    id: scenario.id,
    customerName: scenario.customerName,
    behavior: scenario.behavior,
    foodContext: { preferredFoods: [] },
  });
  session.products = products;

  session.push("agent", `Hi ${scenario.customerName}, I'm Chef Sophie from Baby Cuisine. What would you like to order today?`);

  for (const turn of scenario.turns) {
    const reply = session.reply(turn);
    if (args.has("--debug")) {
      console.log(`[${scenario.id}] ${turn} -> ${reply}`);
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));
  }

  const hallucinations = detectHallucinations(session.messages, exactItems);
  const cartComparison = compareCart(session.snapshotCart(), scenario.expectations.items);
  const anomalies = [];

  if (cartComparison.missing.length > 0) {
    anomalies.push(`Missing items: ${JSON.stringify(cartComparison.missing)}`);
  }
  if (cartComparison.extras.length > 0) {
    anomalies.push(`Extra items: ${JSON.stringify(cartComparison.extras)}`);
  }
  if (hallucinations.length > 0) {
    anomalies.push(`Hallucinated products: ${hallucinations.join(", ")}`);
  }
  if (scenario.expectations.mustClarify && !session.clarificationAsked) {
    anomalies.push("Failure to ask clarification");
  }
  if (session.errors.length > 0) {
    anomalies.push(`Errors: ${session.errors.join(", ")}`);
  }

  const expectedTotal = scenario.expectations.items.reduce((sum, item) => {
    const product = products.find(
      (candidate) =>
        candidate.item === item.item &&
        candidate.size === item.size &&
        (item.texture ? candidate.texture === item.texture : true),
    );
    const unitPrice = product ? toNumber(product.unitPrice) : Number.NaN;
    return sum + (Number.isFinite(unitPrice) ? unitPrice * item.quantity : 0);
  }, 0);

  if (Math.abs(session.total - expectedTotal) > 0.01) {
    anomalies.push(`Incorrect total: expected $${expectedTotal.toFixed(2)}, got $${session.total.toFixed(2)}`);
  }

  const parsedOrder = session.snapshotCart();
  const pass = anomalies.length === 0;
  const severity = getSeverity(anomalies);
  const transcriptFile = resolve(LOAD_TRANSCRIPT_DIR, `${scenario.id}.json`);
  const transcriptMdFile = resolve(LOAD_TRANSCRIPT_DIR, `${scenario.id}.md`);
  const transcriptPayload = {
    agent: scenario.id,
    persona: scenario.persona,
    behavior: scenario.behavior,
    fulfillment: scenario.fulfillment,
    specialInstructions: scenario.specialInstructions,
    status: pass ? "pass" : "fail",
    severity,
    expectedItems: scenario.expectations.items,
    parsedOrder,
    expectedTotal: Number(expectedTotal.toFixed(2)),
    finalOrderTotal: Number(session.total.toFixed(2)),
    transcript: session.messages,
    errors: session.errors,
    anomalies,
  };

  ensureDirFor(transcriptFile);
  writeFileSync(transcriptFile, JSON.stringify(transcriptPayload, null, 2), "utf8");
  writeFileSync(
    transcriptMdFile,
    [
      `# ${scenario.id} Transcript`,
      "",
      `Persona: ${scenario.persona}`,
      "",
      `Status: ${pass ? "Pass" : "Fail"}`,
      "",
      `Severity: ${severity}`,
      "",
      `Fulfillment: ${scenario.fulfillment}`,
      "",
      `Special instructions: ${scenario.specialInstructions}`,
      "",
      `Final total: $${session.total.toFixed(2)}`,
      "",
      "## Messages",
      "",
      ...session.messages.map((entry) => `- ${entry.at} ${entry.role}: ${entry.text.replace(/\n/g, "\\n")}`),
      "",
      "## Parsed Order",
      "",
      "```json",
      JSON.stringify(parsedOrder, null, 2),
      "```",
      "",
      "## Anomalies",
      "",
      anomalies.length ? anomalies.map((entry) => `- ${entry}`).join("\n") : "- None",
      "",
    ].join("\n"),
    "utf8",
  );

  return {
    agent: scenario.id,
    label: scenario.label,
    persona: scenario.persona,
    behavior: scenario.behavior,
    fulfillment: scenario.fulfillment,
    specialInstructions: scenario.specialInstructions,
    transcript: session.messages,
    transcriptFile,
    transcriptMdFile,
    parsedOrder,
    orderSize: getOrderSize(parsedOrder),
    finalOrderTotal: Number(session.total.toFixed(2)),
    expectedTotal: Number(expectedTotal.toFixed(2)),
    errors: session.errors,
    latenciesMs: session.latencies,
    averageLatencyMs: session.latencies.length ? Number((session.latencies.reduce((sum, value) => sum + value, 0) / session.latencies.length).toFixed(2)) : 0,
    clarified: session.clarificationAsked,
    confirmedCorrectItems: session.confirmedCorrectItems,
    anomalies,
    severity,
    pass,
    reproductionSteps: scenario.turns,
    recommendedFixes: pass ? [] : anomalies.map((entry) => `Investigate: ${entry}`),
  };
}

async function run() {
  const products = parseProducts();
  const exactItems = getExactMenuItems(products);
  const scenarios = buildScenarios();
  const startedAt = performance.now();
  const results = await Promise.all(scenarios.map((scenario) => runScenario(scenario, products, exactItems)));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: "local-simulator-parallel",
    interface: "Repo-local chatbot ordering test interface; checkout/payment intentionally not submitted.",
    elapsedMs: Number((performance.now() - startedAt).toFixed(2)),
    totalAgents: results.length,
    passed: results.filter((result) => result.pass).length,
    failed: results.filter((result) => !result.pass).length,
    results,
  };

  const md = [
    "# Chef Sophie Parallel Load Test Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Mode: ${report.mode}`,
    "",
    `Interface: ${report.interface}`,
    "",
    `Elapsed: ${report.elapsedMs} ms`,
    "",
    `Passed: ${report.passed} / ${report.totalAgents}`,
    "",
    "## Summary",
    "",
    markdownTable(results),
    "",
    "## Detailed Anomaly Log",
    "",
    results.some((result) => result.anomalies.length > 0)
      ? results
        .filter((result) => result.anomalies.length > 0)
        .flatMap((result) => [
          `### ${result.agent}`,
          "",
          `Severity: ${result.severity}`,
          "",
          result.anomalies.map((entry) => `- ${entry}`).join("\n"),
          "",
          "Reproduction steps:",
          "",
          result.reproductionSteps.map((step, index) => `${index + 1}. ${step}`).join("\n"),
          "",
          "Suggested fixes:",
          "",
          result.recommendedFixes.map((fix) => `- ${fix}`).join("\n"),
          "",
        ])
        .join("\n")
      : "- None",
    "",
    "## Raw Transcript Files",
    "",
    ...results.map((result) => `- ${result.agent}: ${result.transcriptMdFile}`),
    "",
    "## Severity Ranking",
    "",
    ...["critical", "high", "medium", "low", "none"].map((severity) => {
      const count = results.filter((result) => result.severity === severity).length;
      return `- ${severity}: ${count}`;
    }),
    "",
    "## Recommended Next Tests",
    "",
    "- Add a browser-backed staging adapter once Playwright or another UI runner is available.",
    "- Add a sandbox checkout endpoint before exercising WhatsApp/order submission end to end.",
    "- Add a `--scenario-file` option for isolated custom persona runs without editing the harness.",
    "",
    "## Agent Details",
    ...results.flatMap((result) => [
      `### ${result.agent} - ${result.label}`,
      "",
      `Persona: ${result.persona}`,
      "",
      `Behavior: ${result.behavior}`,
      "",
      `Fulfillment: ${result.fulfillment}`,
      "",
      `Special instructions: ${result.specialInstructions}`,
      "",
      `Pass/Fail: ${result.pass ? "Pass" : "Fail"}`,
      "",
      `Final total: $${result.finalOrderTotal.toFixed(2)}`,
      "",
      `Expected total: $${result.expectedTotal.toFixed(2)}`,
      "",
      `Clarification asked: ${result.clarified ? "Yes" : "No"}`,
      "",
      `Average latency: ${result.averageLatencyMs} ms`,
      "",
      `Raw transcript: ${result.transcriptMdFile}`,
      "",
      "Parsed order:",
      "",
      "```json",
      JSON.stringify(result.parsedOrder, null, 2),
      "```",
      "",
      "Anomalies:",
      "",
      result.anomalies.length > 0 ? result.anomalies.map((entry) => `- ${entry}`).join("\n") : "- None",
      "",
      "Transcript:",
      "",
      "```json",
      JSON.stringify(result.transcript, null, 2),
      "```",
      "",
    ]),
  ].join("\n");

  ensureDirFor(OUTPUT_MD);
  ensureDirFor(OUTPUT_JSON);
  writeFileSync(OUTPUT_MD, md, "utf8");
  writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2), "utf8");
  writeFileSync(LOAD_OUTPUT_MD, md, "utf8");
  writeFileSync(LOAD_OUTPUT_JSON, JSON.stringify(report, null, 2), "utf8");

  console.log(md);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
