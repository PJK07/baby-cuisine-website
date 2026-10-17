
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2026-07-06 - Avoid exposing state derivation functions in Context
**Learning:** When managing React Context with derived state (e.g., `getTotalItems` and `getTotalPrice` which use `Array.reduce` over the items array), exposing these as functions inside the context value forces consumer components (like `Navigation` or `CartSidebar`) to run an O(N) array transformation operation on every render when calling the function.
**Action:** Instead of exposing functions that calculate derived state, calculate the derived state using `useMemo` inside the context provider and expose the memoized properties (`totalItems` and `totalPrice`). This prevents unnecessary O(N) recalculations on consumer renders.
