
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-06-28 - Memoize Derived Context State to Prevent Consumer Render Bottlenecks
**Learning:** Exposing functions that calculate derived state (e.g., array reductions like `getTotalItems()` and `getTotalPrice()`) in React Context causes O(N) re-calculations on every render for any component consuming that context. This is highly inefficient.
**Action:** Use `useMemo` to evaluate and memoize these derived properties inside the Context provider itself. Expose only the resulting static values (e.g. `totalItems`, `totalPrice`) to consumer components, converting an O(N) render-time operation into an O(1) property lookup.
