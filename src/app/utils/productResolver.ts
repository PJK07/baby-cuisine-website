import { PRODUCTS, type ProductData } from "../data/products";

export type ProductLookupRequest = {
  itemCode?: string;
  itemName: string;
  size?: string;
  texture?: string;
};

export type ProductLookupResult =
  | { ok: true; product: ProductData; price: number }
  | { ok: false; message: string; details?: Record<string, unknown> };

let productsPromise: Promise<ProductData[]> | null = null;

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSize(value: string | undefined): string {
  const normalized = normalizeText(value);

  if (!normalized) return "";
  if (["small", "small jar", "120", "120ml", "120 ml"].includes(normalized)) return "120 ml";
  if (["medium", "medium jar", "200", "200ml", "200 ml"].includes(normalized)) return "200 ml";
  if (["big", "large", "big jar", "large jar", "250", "250ml", "250 ml"].includes(normalized)) {
    return "250 ml";
  }
  if (normalized === "box") return "box";
  if (normalized === "piece") return "piece";

  return normalized;
}

function normalizeTexture(value: string | undefined): string {
  const normalized = normalizeText(value);

  if (!normalized) return "";
  if (normalized.includes("fully") || normalized === "blended") return "fully blended";
  if (normalized.includes("half")) return "half blended";
  if (normalized.includes("piece")) return "pieces";

  return normalized;
}

export function parseProductPrice(value: string | undefined): number {
  const parsed = Number.parseFloat((value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

async function loadProducts(): Promise<ProductData[]> {
  if (typeof window === "undefined") return PRODUCTS;

  if (!productsPromise) {
    productsPromise = fetch("/api/products")
      .then((response) => {
        if (!response.ok) throw new Error(`Product API returned ${response.status}`);
        return response.json();
      })
      .then((data: unknown) => (Array.isArray(data) && data.length > 0 ? data as ProductData[] : PRODUCTS))
      .catch(() => PRODUCTS);
  }

  return productsPromise;
}

export async function resolveCanonicalProduct(
  request: ProductLookupRequest,
): Promise<ProductLookupResult> {
  const itemKey = normalizeText(request.itemCode);
  const itemNameKey = normalizeText(request.itemName);

  if (!itemKey && !itemNameKey) {
    return { ok: false, message: "Missing item name" };
  }

  const products = await loadProducts();
  const requestedSize = normalizeSize(request.size);
  const requestedTexture = normalizeTexture(request.texture);

  let candidates = products.filter((product) => {
    const codeKey = normalizeText(product.Item_code);
    const nameKey = normalizeText(product.Item);
    const codeMatches = Boolean(itemKey && (codeKey === itemKey || nameKey === itemKey));
    const nameMatches = Boolean(itemNameKey && (nameKey === itemNameKey || codeKey === itemNameKey));

    return (!itemKey || codeMatches) && (!itemNameKey || nameMatches);
  });

  if (candidates.length === 0) {
    return {
      ok: false,
      message: `"${request.itemName}" is not an exact menu item. Use only exact item names from the menu.`,
      details: {
        itemCode: request.itemCode,
        itemName: request.itemName,
      },
    };
  }

  if (requestedSize) {
    const sizedCandidates = candidates.filter(
      (product) => normalizeSize(product.Size) === requestedSize,
    );

    if (sizedCandidates.length === 0) {
      return {
        ok: false,
        message: `I found ${candidates[0].Item}, but not in size "${request.size}".`,
        details: {
          requestedSize: request.size,
          availableSizes: Array.from(new Set(candidates.map((product) => product.Size).filter(Boolean))),
        },
      };
    }

    candidates = sizedCandidates;
  }

  const availableTextures = Array.from(
    new Set(candidates.map((product) => normalizeTexture(product.Texture)).filter(Boolean)),
  );

  if (requestedTexture && availableTextures.length > 0) {
    const texturedCandidates = candidates.filter(
      (product) => normalizeTexture(product.Texture) === requestedTexture,
    );

    if (texturedCandidates.length === 0) {
      return {
        ok: false,
        message: `I found ${candidates[0].Item}, but not with texture "${request.texture}".`,
        details: {
          requestedTexture: request.texture,
          availableTextures,
        },
      };
    }

    candidates = texturedCandidates;
  }

  const uniqueSizes = Array.from(new Set(candidates.map((product) => product.Size).filter(Boolean)));
  if (!requestedSize && uniqueSizes.length > 1) {
    return {
      ok: false,
      message: `Please choose a size for ${candidates[0].Item}: ${uniqueSizes.join(", ")}.`,
      details: { availableSizes: uniqueSizes },
    };
  }

  const remainingTextures = Array.from(
    new Set(candidates.map((product) => normalizeTexture(product.Texture)).filter(Boolean)),
  );
  if (!requestedTexture && remainingTextures.length > 1) {
    return {
      ok: false,
      message: `Please choose a texture for ${candidates[0].Item}: ${remainingTextures.join(", ")}.`,
      details: { availableTextures: remainingTextures },
    };
  }

  const product = candidates[0];
  const price = parseProductPrice(product.Unit_Price);

  if (Number.isNaN(price)) {
    return {
      ok: false,
      message: `The menu price for ${product.Item} is invalid.`,
      details: { itemCode: product.Item_code, unitPrice: product.Unit_Price },
    };
  }

  return { ok: true, product, price };
}
