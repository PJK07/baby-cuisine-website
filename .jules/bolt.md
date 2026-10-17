
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Avoid exposing unmemoized context values that compute derived state
**Learning:** Exposing context functions that compute derived state via array reductions (like `getTotalItems` or `getTotalPrice`) forces O(N) recalculations on every render for every consumer calling them. In complex state like a shopping cart, this degrades render performance significantly as the cart grows or when multiple components re-render simultaneously.
**Action:** Always memoize derived context state inside the provider using `useMemo`, and expose the result as a property rather than a function. This ensures the calculation only happens once when dependencies change, and consumer renders run in O(1) time.
