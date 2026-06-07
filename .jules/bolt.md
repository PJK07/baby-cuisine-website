
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Expose derived state as memoized properties in React Context
**Learning:** Returning calculation functions like `getTotalItems` or `getTotalPrice` from a React Context provider forces consumers to re-execute those reductions on every render cycle where they are called. For state containing lists (like a shopping cart), this results in O(N) re-computations simply to access a total.
**Action:** Instead of exposing functions, pre-calculate derived states inside the provider using `useMemo` and expose them as primitive properties (e.g., `totalItems`, `totalPrice`) on the context value. This guarantees O(1) access time for all consumer renders.
