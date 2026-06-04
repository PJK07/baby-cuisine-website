import assert from "node:assert/strict";
import { PRODUCTS } from "../src/app/data/products.ts";
import {
  getMenuItemMatchFromMessage,
  getNextOrderPrompt,
} from "../src/app/utils/menuItemMatching.ts";

function expectExact(message, itemName) {
  const match = getMenuItemMatchFromMessage(message, PRODUCTS);
  assert.equal(match.kind, "exact");
  assert.equal(match.itemName, itemName);
}

expectExact("biscuits", "Sourdough Biscuits");
expectExact("cake", "Cake");

const biscuitsPrompt = getNextOrderPrompt(PRODUCTS, {
  itemName: "Sourdough Biscuits",
  size: "Box",
});
assert.equal(biscuitsPrompt, "How many portions of Sourdough Biscuits would you like?");
assert.ok(!biscuitsPrompt.includes("Please choose size"));

const cakePrompt = getNextOrderPrompt(PRODUCTS, {
  itemName: "Cake",
  size: "Piece",
});
assert.equal(cakePrompt, "How many portions of Cake would you like?");
assert.ok(!cakePrompt.includes("Please choose size"));

const ambiguousMatch = getMenuItemMatchFromMessage("chicken", PRODUCTS);
assert.equal(ambiguousMatch.kind, "ambiguous");
assert.ok(ambiguousMatch.itemNames.length > 1);
assert.ok(ambiguousMatch.itemNames.every((itemName) => itemName.toLowerCase().includes("chicken")));

const unknownMatch = getMenuItemMatchFromMessage("pizza", PRODUCTS);
assert.equal(unknownMatch.kind, "none");

console.log("Menu item matching regression checks passed.");
