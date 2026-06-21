
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Avoid Exposing Derived State Array Reductions as Context Functions
**Learning:** Exposing array reductions (like calculating total cart items or price) as functions on React Context objects (e.g., `getTotalItems()`) causes O(N) recalculations on every render of every consumer component whenever they are called. This wastes CPU cycles when context values haven't actually changed.
**Action:** Always compute derived state in the Context Provider itself using `useMemo` and expose the memoized result as a property (e.g., `totalItems`). This ensures O(1) reads for all consumers and only recalculates when the dependencies change.
