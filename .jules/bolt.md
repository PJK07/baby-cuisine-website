
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-06-10 - Avoid Derived State Calculation Functions in React Context
**Learning:** Exposing functions from React Context that calculate derived state (e.g., `getTotalItems()` and `getTotalPrice()` running array reductions) forces consuming components to execute O(N) calculations on every render. If multiple components consume the context, this work is duplicated needlessly.
**Action:** Replace derived state calculation functions with memoized properties using `useMemo` in the Context Provider. Consumers should read the memoized property (`totalItems`) instead of executing a function, shifting the O(N) work to a single, memoized O(1) operation per state change.
