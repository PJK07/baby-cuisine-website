import { PRODUCTS, type ProductData } from "../data/products";

export const PRODUCT_REFRESH_MS = 30000;

let latestProducts: ProductData[] = PRODUCTS;

export function getProductsSignature(products: ProductData[]): string {
  return products
    .map((product) =>
      [
        product.Item_code,
        product.Category,
        product.Item,
        product.Size,
        product.Texture,
        product.Unit_Price,
        product.Ingredients,
        product.Delivery_Day,
      ].join("|"),
    )
    .join("\n");
}

export async function loadLiveProducts(signal?: AbortSignal): Promise<ProductData[]> {
  if (typeof window === "undefined") return PRODUCTS;

  try {
    const response = await fetch("/api/products", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    });

    if (!response.ok) throw new Error(`Product API returned ${response.status}`);

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      latestProducts = data as ProductData[];
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
  }

  return latestProducts;
}

export function startLiveProductSync(
  onProducts: (products: ProductData[]) => void,
  intervalMs = PRODUCT_REFRESH_MS,
): () => void {
  let stopped = false;
  let signature = getProductsSignature(latestProducts);
  let hasEmitted = false;
  let controller: AbortController | null = null;

  const refresh = async () => {
    controller?.abort();
    controller = new AbortController();

    try {
      const products = await loadLiveProducts(controller.signal);
      if (stopped) return;

      const nextSignature = getProductsSignature(products);
      if (!hasEmitted || nextSignature !== signature) {
        signature = nextSignature;
        hasEmitted = true;
        onProducts(products);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        onProducts(latestProducts);
      }
    }
  };

  void refresh();
  const timer = window.setInterval(refresh, intervalMs);

  return () => {
    stopped = true;
    controller?.abort();
    window.clearInterval(timer);
  };
}
