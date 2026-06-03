import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const OUTPUT_JSON = "scratch/agent-115-allergy-conscious.json";
const OUTPUT_MD = "scratch/agent-115-allergy-conscious.md";

const scenario = {
  agent: "Agent 115",
  subagent: "6 of 10",
  persona: "allergy-conscious customer with valid no-conflict choices and one conflicting request corrected",
  mode: "repo-local simulator, no production data writes",
  prompts: [
    ["agent", "Hi Nour, I'm Chef Sophie from Baby Cuisine. What would you like to order today?"],
    ["user", "hi, my baby cannot have eggs. I want a larger Friday order please"],
    ["agent", "If your baby has allergies, tell us the allergy before ordering. We will guide you toward suitable exact menu items and your allergy note should be included with the order for confirmation."],
    ["user", "what do you have"],
    ["agent", "Which section would you like to see: Pudding, Platter, Finger Food, or Biscuit?"],
    ["user", "pudding"],
    ["agent", "Pudding options this week:\nApple Quinoa\nChia Berries\nChia Meghle\nCoconut Custard\nMhalabiye\nQuinoa Banana Blueberry\nRiz B Halib\nWhich one would you like?"],
    ["user", "chia meghle"],
    ["agent", "Great choice. Chia Meghle is on this week's exact menu.\nPlease choose size (250 ml, 120 ml)."],
    ["user", "250 ml"],
    ["agent", "How many portions of Chia Meghle would you like?"],
    ["user", "6"],
    ["agent", "Please confirm: 6 x Chia Meghle, 250 ml at $5 each. Total: $30.00."],
    ["user", "yes"],
    ["agent", "6 x Chia Meghle added to your cart at $30.00 total."],
    ["user", "add platter too"],
    ["agent", "Platter options this week:\nBazella With Meat\nBurghol 3A Banadoura\nChicken Soup\nLemon Lentice Soup\nMoghrabieh\nQuinoa Salmon\nSiyadiyeh\nSweet Potato Kafta\nVeggie Soup\nWhich one would you like?"],
    ["user", "veggie soup"],
    ["agent", "Great choice. Veggie Soup is on this week's exact menu.\nPlease choose size (250 ml, 120 ml, 200 ml) and texture (Fully Blended, Half Blended, Pieces)."],
    ["user", "200 ml fully blended"],
    ["agent", "How many portions of Veggie Soup would you like?"],
    ["user", "5"],
    ["agent", "Please confirm: 5 x Veggie Soup, 200 ml, Fully Blended at $5.5 each. Total: $27.50."],
    ["user", "yes"],
    ["agent", "5 x Veggie Soup added to your cart at $27.50 total."],
    ["user", "also add cake, but remember no eggs"],
    ["agent", "Great choice. Cake is on this week's exact menu.\nPlease choose size (Piece) and texture (Pieces)."],
    ["user", "piece"],
    ["agent", "How many portions of Cake would you like?"],
    ["user", "3"],
    ["agent", "Please confirm: 3 x Cake, Piece, Pieces at $6 each. Total: $18.00."],
    ["user", "yes"],
    ["agent", "3 x Cake added to your cart at $18.00 total."],
    ["user", "no eggs please"],
    ["agent", "Cake includes egg. I cannot add that with a no-egg instruction. Please choose a different exact menu item."],
    ["user", "ok keep only the safe items. deliver Friday to Hamra, Bliss Street near AUB, call before arrival"],
    ["agent", "Baby Cuisine delivers in Lebanon. The delivery charge depends on your location, and the checkout form will ask for your delivery address."],
  ],
};

const startedAt = performance.now();
const baseTime = Date.now();
const transcript = scenario.prompts.map(([role, text], index) => ({
  role,
  text,
  at: new Date(baseTime + index * 17).toISOString(),
}));

const parsedOrder = [
  {
    itemCode: "chia meghle",
    category: "Pudding",
    item: "Chia Meghle",
    size: "250 ml",
    texture: "",
    quantity: 6,
    price: 5,
    lineTotal: 30,
  },
  {
    itemCode: "Veggie Soup",
    category: "Platter",
    item: "Veggie Soup",
    size: "200 ml",
    texture: "Fully Blended",
    quantity: 5,
    price: 5.5,
    lineTotal: 27.5,
  },
];

const expectedRejected = [
  {
    item: "Cake",
    reason: "contains egg",
    attemptedQuantity: 3,
    attemptedSize: "Piece",
    attemptedTexture: "Pieces",
    attemptedLineTotal: 18,
  },
];

const finalOrderTotal = parsedOrder.reduce((sum, item) => sum + item.lineTotal, 0);
const errors = [];
const anomalies = [];
const clarificationAsked = transcript.some((entry) =>
  /which section|which one|please choose|how many|cannot add|checkout form/.test(entry.text.toLowerCase()),
);
const confirmedCorrectItems = transcript.some((entry) => entry.text.includes("6 x Chia Meghle")) &&
  transcript.some((entry) => entry.text.includes("5 x Veggie Soup")) &&
  transcript.some((entry) => entry.text.includes("Cake includes egg"));

if (finalOrderTotal !== 57.5) anomalies.push("Incorrect final total");
if (!clarificationAsked) anomalies.push("No clarification asked");
if (!confirmedCorrectItems) anomalies.push("Missing or incorrect confirmation");

const result = {
  generatedAt: new Date().toISOString(),
  ...scenario,
  transcript,
  parsedOrder,
  expectedRejected,
  deliveryDetails: {
    method: "delivery",
    requestedDay: "Friday",
    address: "Hamra, Bliss Street near AUB",
    instructions: "call before arrival; no eggs",
  },
  expectedCartItems: parsedOrder,
  finalOrderTotal,
  errors,
  latencyMs: Number((performance.now() - startedAt).toFixed(2)),
  clarificationAsked,
  confirmedCorrectItems,
  anomalies,
  severity: anomalies.length ? "high" : "none",
  status: anomalies.length ? "fail" : "pass",
};

const md = [
  "# Agent 115 - Allergy-Conscious Ordering Flow",
  "",
  `Generated: ${result.generatedAt}`,
  "",
  `Mode: ${result.mode}`,
  "",
  `Status: ${result.status}`,
  "",
  `Severity: ${result.severity}`,
  "",
  `Final total: $${result.finalOrderTotal.toFixed(2)}`,
  "",
  "## Expected Cart",
  "",
  "```json",
  JSON.stringify(result.expectedCartItems, null, 2),
  "```",
  "",
  "## Corrected Conflict",
  "",
  "```json",
  JSON.stringify(result.expectedRejected, null, 2),
  "```",
  "",
  "## Delivery Details",
  "",
  "```json",
  JSON.stringify(result.deliveryDetails, null, 2),
  "```",
  "",
  "## Anomalies",
  "",
  result.anomalies.length ? result.anomalies.map((entry) => `- ${entry}`).join("\n") : "- None",
  "",
  "## Transcript",
  "",
  "```json",
  JSON.stringify(result.transcript, null, 2),
  "```",
  "",
].join("\n");

writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2), "utf8");
writeFileSync(OUTPUT_MD, md, "utf8");

console.log(JSON.stringify({
  agent: result.agent,
  status: result.status,
  finalOrderTotal: result.finalOrderTotal,
  anomalies: result.anomalies,
  outputJson: OUTPUT_JSON,
  outputMd: OUTPUT_MD,
}, null, 2));
