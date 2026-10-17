
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-06-01 - Avoid exposing functions for derived state in React Context
**Learning:** Exposing O(N) recalculation functions like `getTotalItems()` or `getTotalPrice()` in a React Context API forces every single component subscribed to that context to re-run those array reduction iterations on every single render, even if the cart hasn't changed.
**Action:** Always compute derived state within the Provider using `useMemo` and expose the calculated primitive values (e.g. `totalItems` and `totalPrice`) instead of the calculation functions. This transforms O(N) operations into O(1) property lookups for consumers.
