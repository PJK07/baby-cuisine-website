
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2026-05-15 - Use pre-computed dictionaries for array filtering in React useMemo hooks
**Learning:** When generating multiple `useMemo` hooks that filter a large array based on category or item (like `itemSummaries` and `itemVariants` in `Shop.tsx`), repeating `products.filter(p => p.Item === item)` leads to redundant O(N) operations. By reusing an existing pre-computed dictionary mapping (like `categoryProductsByItem`), you can reduce O(N) array scans to O(1) property lookups.
**Action:** Audit `useMemo` hooks that iterate over arrays. Identify if a dictionary structure mapping keys to subsets already exists or can be created once, and replace repeated `[].filter()` calls with `dictionary[key] || []` lookups to maintain O(1) read complexity.
