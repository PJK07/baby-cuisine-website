
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2026-06-06 - Avoid exposing derived state functions in React Context
**Learning:** Exposing functions that calculate derived state (e.g., `getTotalItems` and `getTotalPrice` which map/reduce over an array) in a React Context Provider forces any consuming component to recalculate the operation (O(N) time complexity) on every render cycle where those functions are called.
**Action:** Instead of exposing functions, calculate the derived state inside the Provider using `useMemo`, and expose the memoized result (e.g., `totalItems`, `totalPrice`) as a property. This changes the consumer's lookup cost to O(1) and prevents unnecessary array recalculations across the app.
