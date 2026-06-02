# Chef Sophie Chat Fixes

Record of the local chat fixes made on the `codex/feature-experiment` branch.

## Goal

Reduce Chef Sophie hallucinations by answering common website chat flows locally from exact Baby Cuisine data before falling back to the ElevenLabs agent.

Primary source of truth:

- Menu items, sizes, textures, prices, and delivery days come from `src/app/data/products.ts` and the `/api/products` response.
- Cart additions use `resolveCanonicalProduct` so item name, size, texture, and price must match exact product data.
- Business facts come from site metadata in `index.html`.

## Issues Observed

### Greeting

Problem:

- The chat showed a greeting placeholder.
- After the user sent a message, the placeholder disappeared and the agent sometimes sent another greeting.

Fix:

- Opening greeting is now inserted as a real local chat message when the chat opens.
- The duplicate ElevenLabs first-message event is hidden when it matches the local opening greeting.

### Menu List Formatting

Problem:

- Menu lists were rendered as one long line because newline characters collapsed in the chat bubble.

Fix:

- Sophie message bubbles now preserve line breaks with `whitespace-pre-line`.

### Menu Availability Hallucinations

Problem:

- Questions like `what can I order` and `what is available` sometimes went to the external agent.
- The agent returned old or invented items such as `Sweet Potato Salmon`, `Moujadara`, `Okra Stew with Meat`, `Baby Knefeh`, `Organic Chicken Liver`, and other non-current items.

Fix:

- Weekly menu questions are answered locally.
- The local answer asks the user to choose a section: `Pudding`, `Platter`, `Finger Food`, or `Biscuit`.
- Category follow-ups list exact current items only.

Handled examples:

- `what can i order`
- `what do you have`
- `what is available`
- `whats available`
- `menu`
- `this week`

### Category Lists

Problem:

- Category lists sometimes had no visible separators.

Fix:

- Category answers use newline-separated item lists and the UI preserves line breaks.

Expected examples:

```text
Finger Food options this week:
Almond Pancakes
Cake
Chicken Fingers
Lamb Kebbe
Salmon Fingers
Which one would you like?
```

### Exact Item Detection

Problem:

- Exact menu items embedded in phrases were not detected.
- Examples like `i want chia berries` fell through to generic recommendation logic.
- Singular or slightly misspelled item names were missed.
- Compact spellings such as `riz bhalib` were missed because the exact item is stored as `Riz B Halib`.

Fix:

- Exact item detection now works inside intent phrases.
- Item matching handles simple singulars.
- Item matching allows one-character typo tolerance for near exact menu names.
- Item matching also compares compact normalized text, so spacing differences like `bhalib` vs `b halib` can map to the exact item.
- Leading quantities are stripped before item matching, so `5 riz bhalib` maps to `Riz B Halib`.

Handled examples:

- `i want chia berries` -> `Chia Berries`
- `almond pancake` -> `Almond Pancakes`
- `moghraabieh` -> `Moghrabieh`
- `5 riz bhalib` -> quantity `5`, item `Riz B Halib`

### Category Typo Handling

Problem:

- Category typos like `piudding` fell through to the external agent, which listed renamed items such as `Apple Quinoa Pudding` instead of exact menu names.

Fix:

- Category matching now allows one-character typo tolerance for menu sections.

Handled examples:

- `piudding` -> `Pudding`
- `platter` -> `Platter`
- `finger food` -> `Finger Food`

### Price Questions

Problem:

- `prices` was interpreted as `rice` because `rice` is a substring of `prices`.
- This caused the chat to recommend `Riz B Halib` instead of answering prices.

Fix:

- Food matching now uses whole words.
- Price questions are answered locally before food recommendation logic.

Handled examples:

- `what is the prices`
- `prices not rice`
- `how much`
- `cost`
- `give me an idea about the other prices`

Price answer behavior:

- If an exact item is mentioned, show that item's exact price by size.
- If no exact item is mentioned, show a category-level price guide from current products.

### Local Order Flow

Problem:

- After an item was selected, the external agent sometimes took over and invented prices or forgot context.
- The chat said items were added to the cart, but the cart ignored them because local `addItem` calls were missing the required `category` field.
- Examples:
  - `Veggie Soup 200 ml Fully Blended` was confirmed as `$6` even though exact data says `$5.5`.
  - `Almond Pancakes`, quantity `5`, later became `one box`.
  - `Moghrabieh 250 ml` was described as `$8.5` even though exact data says `$8`.

Fix:

- Exact item ordering now stays local.
- The chat keeps a `pendingOrder` state containing item, size, texture, and quantity.
- Confirmation text is generated from exact product data.
- Cart additions use exact resolved product data.
- Local cart additions now include `category`, so `CartContext` accepts and persists the item.

Local order flow:

1. User selects an exact item.
2. Chat asks for size and texture when needed.
3. Chat asks for quantity.
4. Chat shows exact confirmation with unit price and total.
5. User confirms with `yes`, `ok`, `confirm`, `only this`, etc.
6. Item is added to cart with exact product data.

Handled examples:

- `veggie soup` -> ask size and texture.
- `200 fully blended` -> ask quantity.
- `1` -> confirm exact item, size, texture, and total.
- `yes` -> add exact product to cart.
- `almond pancake` -> maps to `Almond Pancakes`.
- `5` -> confirms `5 x Almond Pancakes`, not `1`.
- `moghraabieh` -> maps to `Moghrabieh`.
- `big fully blended` -> maps to `250 ml` and `Fully Blended`.

### Delivery Day Questions

Problem:

- Delivery timing questions sometimes received generic delivery-area answers or fell through to the agent.
- Friday item lists hallucinated old Friday items.

Fix:

- The chat tracks the last selected or added item.
- Delivery-day questions are answered locally from the item's `Delivery_Day`.
- Day-specific item list questions are answered locally from exact current product data.

Handled examples:

- `when it will be delivered`
- `yeah I know but when`
- `which day`
- `what are all the items on friday`
- `what are all the items on tuesday`

Expected behavior:

- If the last item is `Moghrabieh`, `which day` returns `Moghrabieh is delivered on Friday.`
- `what are all the items on friday` lists only exact products where `Delivery_Day` is `Friday`.

### Business, Location, Delivery, And Allergy Questions

Problem:

- The agent gave generic or incorrect answers such as:
  - `I'm a virtual assistant, so I don't have a physical location.`
  - `I don't have access to specific delivery locations.`
  - Allergy questions were answered with `Got it. What would you like to order today?`

Fix:

- Common business questions are answered locally from known site data.

Local answers now cover:

- Business summary.
- Location: St. Maroun Street, Horch Tabet, Lebanon.
- Delivery: Baby Cuisine delivers in Lebanon; charge depends on location and checkout asks for address.
- Allergies: user should mention allergies before ordering; allergy note should be included for confirmation.
- Clarification such as `got what?`.

### Idle Or Continuation Messages

Problem:

- Messages like `yes` or `i want other thing` could fall through to the external agent.
- Messages like `ok great` could also fall through to the external agent.

Fix:

- Idle `yes`, `yeah`, and `yep` receive local order-help replies.
- `ok great`, `okay great`, and `great` receive local order-help replies.
- `i want other thing` and similar phrases receive local menu/order guidance.

### Name Handling

Problem:

- Some auth metadata used `Anonymous` as a display name.
- The chat answered `Your name is Anonymous.`

Fix:

- `Anonymous` is treated as an unknown placeholder, not a real customer name.
- Name questions are always answered locally.
- If no usable name is saved, the chat says it does not have the name saved yet instead of falling through to the external agent.

### Cart Status Follow-Ups

Problem:

- After local confirmation, users could say `they arent in my cart` or `no they arent`.
- These complaints fell through to the external agent, which contradicted the actual local cart state.

Fix:

- Cart-status complaints are answered locally from `CartContext`.
- If the cart is empty, Sophie says the cart is empty and asks for exact item, size, and quantity.
- If the cart has items, Sophie lists the current cart items, sizes, textures, quantities, and totals.

## Local Guard Order

The `sendMessage` flow now prioritizes deterministic local handling before external agent fallback:

1. Delivery-day and day-specific item questions.
2. Business/location/delivery/allergy/clarification questions.
3. Known customer name questions.
4. Pending local order state.
5. Known unavailable hallucinated menu names.
6. Price questions.
7. Exact item detection.
8. Food-based recommendations.
9. Order-help or greeting answers.
10. Category list answers.
11. Weekly menu prompt.
12. Explicit availability checks.
13. External ElevenLabs agent fallback only if no local guard applies.

## Known Unavailable Guard

The chat explicitly blocks known hallucinated item names when they are not in the exact current menu.

Current blocked example:

- `Sweet Potato Salmon`

## Verification Commands

Run from the project root:

```bash
npm test
node scripts/test-sophie-qa-matrix.mjs
npm run build
```

All three passed after the fixes.

## Manual Retest Flows

### Exact Menu And Category Flow

```text
what do you have
finger food
almond pancake
5
yes
```

Expected:

- `almond pancake` maps to `Almond Pancakes`.
- Quantity remains `5`.
- Cart confirmation and add use `$9` per box.

### Platter Typo And Delivery Flow

```text
platter
moghraabieh
big fully blended
1
yes
which day
what are all the items on friday
```

Expected:

- `moghraabieh` maps to `Moghrabieh`.
- `big` maps to `250 ml`.
- Price uses exact current data.
- Delivery day is `Friday`.
- Friday list comes only from exact current product data.

### Availability And Hallucination Prevention

```text
what is available
what can i order
do you have Sweet Potato Salmon?
```

Expected:

- Availability questions ask for a section instead of dumping hallucinated menu items.
- `Sweet Potato Salmon` is rejected unless it exists as an exact current item.

## Main File Changed

- `src/app/components/ChefSophieWidget.tsx`

## WhatsApp Order Save Fix

Problem:

- Clicking `Order via WhatsApp` could show `Unable to save your order.`
- In local Vite development, `/api/orders` is not served by Vite because it is a Vercel API function.
- The frontend expected `/api/orders` to return a saved order response before opening WhatsApp.

Fix:

- `src/app/services/orders.ts` now tries `/api/orders` first.
- If the API route is unavailable, returns HTML, returns `404`/`405`, or reports missing server Supabase config, it falls back to saving directly with the Supabase browser client.
- Direct fallback still requires the signed-in Supabase session.
- Direct fallback writes:
  - `contacts` via `upsert` on `user_id`.
  - `orders` with `status: "whatsapp_sent"`, exact cart items, delivery day, contact info, and total.
- Normal validation errors are not hidden by the fallback.

Verification:

```bash
npm test
node scripts/test-sophie-qa-matrix.mjs
npm run build
```

All three passed after the WhatsApp save fallback.

## Stress Harness Ordering Fixes

Problem:

- The new 10-agent stress harness exposed order-state issues in large and messy conversations.
- Single-option items such as `Almond Pancakes` could keep asking for `Box` instead of moving to quantity.
- Quantity edits like `make it 8` or `change to 5` were ignored in pending or already-confirmed order states.
- `big fully blended` did not map to `250 ml` when the message contained both size and texture words.
- `cancel it` after confirmation did not remove the previously added cart item.
- Friday availability questions like `what else do you have on Friday` did not list exact Friday items.
- Conflicting allergy instructions after a cart add could leave an impossible item in the cart.

Fix:

- Single available sizes/textures are now treated as default choices when the customer has not supplied a conflicting size.
- Size aliases are recognized inside longer messages, so `big fully blended` maps to `250 ml` and `Fully Blended`.
- Quantity edits overwrite the pending quantity before confirmation.
- Quantity edits after a cart add update the last added cart line.
- Cancellation after confirmation removes the last added cart line.
- Day-specific availability questions return exact current items for Tuesday or Friday.
- If an allergy/no-ingredient instruction conflicts with the last added item, Sophie removes that item and asks the customer to choose another exact menu item.
- The stress harness was updated to mirror these local rules and to treat explicit rejection of unavailable items as correct behavior, not hallucination.

Verification:

```bash
npm test
node scripts/test-sophie-qa-matrix.mjs
npm run build
npm run stress:sophie
```

All four passed. The stress harness result is now `10 / 10` agents passed.

## Parallel Load Test Update

Problem:

- The user requested 10 parallel customer agents with large orders, delivery/pickup details, and edge-case-but-valid requests.
- The multi-agent tool could only run six true subagents concurrently in this session.
- Worker feedback exposed one additional regression risk: one-message single-size item orders like `Sourdough Biscuits box, 5 boxes` must preserve the requested quantity.
- The generated transcripts also showed delivery and special-instruction messages could be misread as menu requests.

Fix:

- `scripts/sophie-stress-harness.mjs` now runs all 10 customer personas concurrently with `Promise.all`.
- Agents are numbered `agent-110` through `agent-119`.
- Each agent writes raw Markdown and JSON transcript files under `scratch/sophie-load-test/`.
- The full report is written to:
  - `scratch/sophie-load-test-report.md`
  - `scratch/sophie-load-test-report.json`
- The parser now preserves quantity for one-message single-size orders.
- Delivery and special-instruction messages are acknowledged and directed to checkout notes instead of opening menu sections.
- Business location detection was narrowed so customer address messages are not treated as questions about Baby Cuisine's address.

Verification:

```bash
npm test
node scripts/test-sophie-qa-matrix.mjs
npm run build
npm run stress:sophie
```

All four passed. The latest parallel load-test result is `10 / 10` agents passed with `0` anomalies.

## `What Is There` Hallucinated Menu Fix

Problem:

- The phrase `what is there` was not covered by the local weekly-menu guard.
- That allowed the fallback agent to answer with old hallucinated products such as:
  - `Moujadara`
  - `Okra Stew With Meat`
  - `Roast Meat With Veggies`
  - `Sweet Potato Salmon`
- After the hallucinated answer, the customer could select `Moujadara`, causing a repeated failed add-to-cart loop because `Moujadara` is not in the exact current menu.

Fix:

- `what is there` and `whats there` now route locally to the section prompt.
- Old hallucinated platter names are now included in the known-unavailable guard.
- The QA matrix now checks that these names are blocked unless they are actually present in `products.ts`.

Verification:

```bash
node scripts/test-sophie-qa-matrix.mjs
npm run stress:sophie
npm test
npm run build
```

All four passed after the fix.
