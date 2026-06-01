import { readFileSync } from "node:fs";

const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
const widgetSource = readFileSync("src/app/components/ChefSophieWidget.tsx", "utf8");
const resolverSource = readFileSync("src/app/utils/productResolver.ts", "utf8");

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

console.log("Smoke checks passed.");
