# Chef Sophie Chat: Problems, Causes, Dos and Donts

This document records the issues we hit while testing Chef Sophie so future changes do not reintroduce them.

## Core Rule

Chef Sophie must use the exact current weekly menu. Do not invent items, do not fuzzy-match item names, and do not substitute similar products.

The menu rotates weekly, so the chat must load the current menu before starting recommendations or taking cart actions.

## Problems Encountered

### 1. Chat Button Appeared Late

Problem:
- The "Chat with Sophie" button took too long to appear.

Cause:
- `ChefSophieWidget` returned `null` while customer/Supabase context was still loading.

Rule:
- Render the widget immediately with safe defaults.
- Delay session start or agent messages until customer context and menu context are ready.

### 2. Sophie Forgot the Customer Name

Problem:
- Sophie greeted the user as Paul, then later said she did not have access to the name.

Cause:
- Hosted agent dynamic variables were not reliable enough for repeated identity questions.

Rule:
- Keep a local guard for name questions.
- If `customer_name` is known, answer locally: `Your name is Paul.`
- Handle typo/compact forms like `whatis my name` and `whatismyname`.

### 3. Duplicate First Greeting

Problem:
- User said "hello"; Sophie showed the configured first message and then generated another answer.

Cause:
- ElevenLabs first message was inserted after the user's first text message.

Rule:
- Hide the opening greeting if it arrives after the first pending user message.
- Do not show the same greeting twice in text chat.

### 4. Connection Closed Unexpectedly

Problem:
- The chat showed: `Connection closed unexpectedly before session could be established.`

Cause:
- Context updates or messages were sent too early, before the ElevenLabs session had settled.

Rule:
- Start the session only after context and menu are ready.
- After `status === "connected"`, wait briefly before `sendContextualUpdate`.
- Only send pending user messages after the contextual update has been sent.
- Clear pending typing state if the session enters an error state.

### 5. Prompt Override Broke Text Sessions

Problem:
- Direct text sessions connected but produced no replies.

Cause:
- Using `overrides.agent.prompt` with this hosted ElevenLabs agent broke text responses.

Rule:
- Do not use `overrides.agent.prompt` for Sophie.
- Use `sendContextualUpdate` after connection instead.
- Keep `overrides.agent.firstMessage` only if needed.

### 6. Sophie Invented or Used Non-Exact Menu Items

Problem:
- Sophie recommended "Sweet Potato Salmon", but that was not an exact item in the local menu data.
- Cart add failed because the item did not exist exactly.

Cause:
- The hosted agent relied on older/base knowledge or inferred names.
- Earlier resolver behavior tried close matches, which is unsafe for baby food and allergens.

Rule:
- Reject non-exact product names.
- Do not silently map close matches.
- If an item is not in the current menu, say it is not on this week's exact menu.
- Cart tools must only receive exact item names from the loaded menu.

### 7. Weekly Menu Local Dev Caveat

Problem:
- The menu rotates weekly, but local Vite dev does not behave exactly like production for `/api/products`.

Cause:
- In local Vite, `http://127.0.0.1:5173/api/products` can serve source/fallback behavior instead of the Vercel Edge function.
- Production/Vercel fetches the Google Sheet CSV through `api/products.ts`.

Rule:
- Test current menu loading separately when changing weekly menu logic.
- Use Vercel dev or production-like API testing when verifying the Google Sheet path.
- Keep static `PRODUCTS` only as fallback, not as the source of truth for production.

### 8. Context Alone Did Not Stop Hallucinated Recommendations

Problem:
- Even after contextual menu updates, the hosted agent could still mention unavailable items during general recommendation turns.

Cause:
- Hosted agent behavior can ignore or dilute context on broad prompts like "6 months".

Rule:
- Use local exact-menu guards for:
  - weekly menu questions
  - item availability questions
  - customer name questions
- For future improvements, prefer local/menu-driven recommendation logic before handing broad recommendation turns to the hosted agent.

## Dos

- Do load the current weekly menu before starting meaningful chat flow.
- Do send a contextual update after the ElevenLabs session is connected and stable.
- Do keep exact item names, sizes, textures, prices, delivery days, and categories in the session context.
- Do answer deterministic questions locally when possible:
  - customer name
  - current weekly menu
  - whether a named item is available
- Do reject non-exact product names at cart/add-order boundaries.
- Do treat baby food item names as safety-sensitive because ingredients and allergens matter.
- Do keep the resolver strict.
- Do test with a real conversation path after changes:
  - hello
  - what is my name
  - what do you have this week
  - 6 months
  - do you have Sweet Potato Salmon
  - add exact menu items to cart
- Do capture both `onMessage` and `onAgentChatResponsePart` in direct ElevenLabs tests.
- Do use `npm.cmd` on Windows because PowerShell can block `npm.ps1`.

## Donts

- Do not use fuzzy matching to add items to cart.
- Do not convert "Sweet Potato Salmon" into another salmon product.
- Do not invent weekly menu items.
- Do not trust hosted agent memory for exact catalog state.
- Do not send `sendContextualUpdate` immediately at the first connected event without a short delay.
- Do not send user messages before the session context is sent.
- Do not add `overrides.agent.prompt` to the ElevenLabs session for Sophie.
- Do not rely on local Vite `/api/products` as proof that the production weekly Google Sheet integration works.
- Do not show the opening greeting twice.
- Do not let broad recommendation turns bypass exact-menu enforcement.

## Testing Checklist

Run after any Sophie chat/menu/cart change:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run build
& 'C:\Program Files\nodejs\npm.cmd' test
& 'C:\Program Files\nodejs\node.exe' scripts\test-sophie-conversation.mjs
```

Expected behavior:
- The chat button appears quickly.
- Sophie answers `what is my name` with the known customer name when available.
- `what do you have this week` lists exact current menu items only.
- Asking for an unavailable item returns that it is not on this week's exact menu.
- Adding to cart works only with exact product names from the current menu.
- No duplicate first greeting appears in text chat.
- No connection-closed error appears during normal startup.

Note:
- `scripts\test-sophie-conversation.mjs` requires network access to ElevenLabs.
- `npm run lint` is not available in this project unless a lint script is added.

## Important Files

- `src/app/components/ChefSophieWidget.tsx`
  - Chat UI, local guards, ElevenLabs session startup, contextual updates.
- `src/app/utils/productResolver.ts`
  - Exact product resolution and cart safety checks.
- `src/app/data/products.ts`
  - Static fallback menu.
- `api/products.ts`
  - Production weekly menu fetch from Google Sheet CSV.
- `scripts/test-sophie-conversation.mjs`
  - Direct Sophie conversation smoke test.

## Troubleshooting Map

Button is slow:
- Check that the widget renders with defaults before Supabase/menu loading finishes.

Name is forgotten:
- Check the local name-question guard before sending to the agent.

Duplicate greeting:
- Check first-message hiding logic for the first pending user message.

Connection closes:
- Check session readiness, delayed contextual update, and pending message timing.

Agent gives no text response:
- Remove `overrides.agent.prompt`.
- Keep text-only mode and capture response parts.

Wrong menu item appears:
- Check weekly menu context.
- Check local menu/availability guard.
- Check that no fuzzy resolver is mapping names.

Cart cannot find item:
- Confirm the item name passed to cart exactly matches the current menu product name.

## Non-Negotiable Product Rule

For Chef Sophie, exact menu integrity matters more than conversational smoothness.

If the system is unsure whether an item exists in this week's menu, it must say it cannot find that exact item and show exact available choices instead.
