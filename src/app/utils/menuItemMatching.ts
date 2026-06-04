import type { ProductData } from "../data/products";

export type MenuItemMatch =
  | { kind: "exact"; itemName: string }
  | { kind: "ambiguous"; itemNames: string[] }
  | { kind: "none" };

export type PendingMenuOrder = {
  itemName: string;
  size?: string;
  texture?: string;
};

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

export function getMenuItemMatchFromMessage(message: string, products: ProductData[]): MenuItemMatch {
  const normalized = normalizeMenuText(message);
  const singular = normalizeSingularMenuText(message);
  const cleaned = normalizeSingularMenuText(
    normalized
      .replace(/^(i want|i would like|i d like|can i have|please add|add|order|get|give me)\s+/, "")
      .replace(/^\d+\s+/, ""),
  );
  const compact = normalizeCompactMenuText(normalized);
  const compactCleaned = normalizeCompactMenuText(cleaned);

  const items = getExactMenuItems(products).sort((a, b) => b.length - a.length);
  const exactItem = items.find((item) => {
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
  });

  if (exactItem) return { kind: "exact", itemName: exactItem };

  const cleanedWords = cleaned.split(" ").filter(Boolean);
  if (cleanedWords.length === 0) return { kind: "none" };

  const partialMatches = items.filter((item) => {
    const itemWords = normalizeSingularMenuText(item).split(" ").filter(Boolean);
    return cleanedWords.every((word) => itemWords.includes(word));
  });

  if (partialMatches.length === 1) return { kind: "exact", itemName: partialMatches[0] };
  if (partialMatches.length > 1) return { kind: "ambiguous", itemNames: partialMatches };

  return { kind: "none" };
}

export function getExactItemFromMessage(message: string, products: ProductData[]): string | null {
  const match = getMenuItemMatchFromMessage(message, products);
  return match.kind === "exact" ? match.itemName : null;
}

export function getAmbiguousItemPrompt(itemNames: string[]): string {
  return `I found more than one matching item. Which exact menu item would you like?\n${itemNames.join("\n")}`;
}

function uniqueValues(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[]));
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

export function getNextOrderPrompt(products: ProductData[], order: PendingMenuOrder): string {
  const { textures } = getProductChoices(products, order.itemName);

  if (!order.size || (textures.length > 0 && !order.texture)) {
    return getItemSelectionPrompt(products, order.itemName);
  }

  return `How many portions of ${order.itemName} would you like?`;
}
