
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2026-06-20 - Memoize derived state in Context to avoid O(N) consumer re-renders
**Learning:** When a React Context provides functions that compute derived state from arrays (like calculating total items or total price using `.reduce()`), any component consuming that context will trigger those O(N) recalculations on every render if they call those functions directly in their render path.
**Action:** Replace functions that calculate derived state with memoized properties using `useMemo` in the Context Provider. This ensures the expensive calculations only happen when the underlying dependencies change, rather than on every consumer render.
