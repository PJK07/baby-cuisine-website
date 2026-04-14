# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Production build to dist/
npm run start    # Preview the production build
```

No test suite is configured. Verify changes by running `npm run dev` and checking the browser.

## Architecture

Single-page React app (no routing) exported from a Figma design. The entire page is one scroll of sections rendered in [src/app/App.tsx](src/app/App.tsx):

`Navigation → Hero → Shop → TrustSection → BrandStory → CallToAction → Footer`

A `FloatingIngredients` animation layer sits behind all content.

### Key areas

**Product data** — [src/app/data/products.ts](src/app/data/products.ts) is the single source of truth for all menu items. Each row has `Item_code`, `Category`, `Item`, `Size`, `Texture`, `Unit_Price`, and `Ingredients`. Products with the same `Item_code` represent size/texture variants of the same dish.

**Shop component** — [src/app/components/Shop.tsx](src/app/components/Shop.tsx) drives the three-view product browser (`categories → items → detail`). It resolves product images by globbing `src/assets/*.{webp,png,jpg}` at build time via `import.meta.glob`. Images are matched by filename against `Item_code`; unmatched items fall back to an inline SVG placeholder.

**Cart** — [src/app/context/CartContext.tsx](src/app/context/CartContext.tsx) provides a React context cart (in-memory, no persistence). Cart items are keyed by `(itemCode, size, texture)`. The slide-out [CartSidebar](src/app/components/CartSidebar.tsx) reads from this context.

**Styling** — Tailwind v4 via `@tailwindcss/vite`. Theme tokens live in [src/styles/theme.css](src/styles/theme.css) under `:root` and are re-exposed via `@theme inline` for Tailwind class usage. Brand color utilities are prefixed `brand-` (e.g. `text-brand-primary`, `bg-brand-bg`). shadcn/ui primitives are in [src/app/components/ui/](src/app/components/ui/).

**Path alias** — `@` resolves to `./src` (configured in [vite.config.ts](vite.config.ts)).

**Deployment** — Vercel. [vercel.json](vercel.json) sets security headers only; no serverless functions in use.

## Adding or updating products

Edit [src/app/data/products.ts](src/app/data/products.ts). To show a product image, add a `webp`/`png`/`jpg` file to [src/assets/](src/assets/) whose filename contains the `Item_code` string (case-insensitive match in Shop.tsx). The build will pick it up automatically via `import.meta.glob`.
