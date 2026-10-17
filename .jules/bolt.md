
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Memoize derived state properties in Context instead of exposing functions
**Learning:** Exposing functions that calculate derived state (e.g., array reductions like `getTotalItems()` and `getTotalPrice()`) in a React Context causes those functions to execute O(N) calculations multiple times during a single render cycle when consumed by components (e.g., inside `Navigation` and `CartSidebar`). This wastes computation by running the same reduction repeatedly.
**Action:** Always compute derived state within the context provider using `useMemo` and expose the memoized properties (`totalItems`, `totalPrice`) instead of the calculation functions. This limits recalculation to strictly when the dependency (`items`) changes, ensuring O(1) reads for consumers.
