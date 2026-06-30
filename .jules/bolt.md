
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Memoize Context Selectors to prevent Derived State recalculations
**Learning:** React Context is a great way to distribute state (e.g. a shopping cart), but exposing functional callbacks to derive state across multiple consumer renders (like `getTotalPrice: () => number` instead of a static property) triggers `O(N)` reductions repeatedly during render cycles across any components using the hook.
**Action:** Expose derived context data (counts, totals) as properties memoized via `useMemo` so that heavy array reductions only run once when the core underlying array (`items`) mutates.
