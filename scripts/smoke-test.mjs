import { readFileSync } from "node:fs";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const widgetSource = readFileSync("src/app/components/ChefSophieWidget.tsx", "utf8");
const resolverSource = readFileSync("src/app/utils/productResolver.ts", "utf8");
const viteConfigSource = readFileSync("vite.config.ts", "utf8");
const liveProductsSource = readFileSync("src/app/utils/liveProducts.ts", "utf8");

const permissionsPolicy = vercel.headers
  ?.flatMap((entry) => entry.headers ?? [])
  .find((header) => header.key === "Permissions-Policy")
  ?.value;

if (!permissionsPolicy?.includes("microphone=(self)")) {
  throw new Error("Permissions-Policy must allow microphone=(self) for Sophie voice calls.");
}

if (widgetSource.includes('console.log("[ChefSophieWidget] dynamic variables:"')) {
  throw new Error("Chef Sophie dynamic variable logging must stay dev-only.");
}

if (resolverSource.includes("nameKey.includes(itemNameKey)") || resolverSource.includes("itemNameKey.includes(nameKey)")) {
  throw new Error("Product resolver must not use fuzzy or partial item-name matching.");
}

if (!resolverSource.includes("is not an exact menu item")) {
  throw new Error("Product resolver must reject non-exact menu item names.");
}

if (resolverSource.includes("productsPromise")) {
  throw new Error("Product resolver must not cache the first live menu response forever.");
}

if (!resolverSource.includes("loadLiveProducts()")) {
  throw new Error("Product resolver must validate cart additions against the live menu.");
}

if (!widgetSource.includes("startLiveProductSync")) {
  throw new Error("Chef Sophie must stay subscribed to live menu updates.");
}

if (widgetSource.includes("Pudding, Platter, Finger Food, or Biscuit")) {
  throw new Error("Chef Sophie menu prompt must not show stale Finger Food/Biscuit categories.");
}

if (!widgetSource.includes("Sweet Finger Food") || !widgetSource.includes("Savory Finger Food")) {
  throw new Error("Chef Sophie menu prompt must support the live sweet and savory finger-food categories.");
}

if (!widgetSource.includes('category === "Finger Food"')) {
  throw new Error("Generic finger food requests must be handled as a combined live category response.");
}

if (!liveProductsSource.includes('cache: "no-store"')) {
  throw new Error("Live product fetches must bypass browser cache.");
}

if (!viteConfigSource.includes("server.middlewares.use('/api/products'")) {
  throw new Error("Vite dev server must serve /api/products as product JSON.");
}

if (!viteConfigSource.includes("'Cache-Control', 'no-store'")) {
  throw new Error("Local /api/products responses must not cache stale menu data.");
}

console.log("Smoke checks passed.");
