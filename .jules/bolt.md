
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Memoize Context Calculations to Prevent O(N) Recalculations
**Learning:** Context provider functions like `getTotalItems` and `getTotalPrice` that iterate over an array (using `.reduce` or similar) can cause O(N) recalculations on *every single render* for every component that consumes them, if they are recreated on every render or evaluated continuously.
**Action:** Extract expensive calculations within Context Providers into `useMemo` hooks. Only the memoized values should be passed to the `useCallback` functions so that they operate in O(1) time complexity when accessed by consumer components during renders.
