
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Avoid functions for derived state in React Context
**Learning:** In `CartContext.tsx`, exposing functions like `getTotalItems: () => number` and `getTotalPrice: () => number` inside the Context value causes those array reductions to be recalculated from scratch (O(N) time complexity) every time a consumer calls them during a render cycle, which happens frequently in components like `Navigation` and `CartSidebar`.
**Action:** Always memoize derived state calculations using `useMemo` inside the Context Provider and expose them as properties (e.g., `totalItems: number`) rather than functions. This prevents unnecessary O(N) recalculations on consumer renders.
