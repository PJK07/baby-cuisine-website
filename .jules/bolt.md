
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2025-06-27 - Extract array searches like `.find()` into O(1) dictionary lookups
**Learning:** Calling `Array.prototype.find()` inside mapping functions in the render loop, such as rendering sizing options for product variants, introduces O(N) complexity inside an O(M) loop, resulting in O(N*M) time complexity recalculations.
**Action:** Always memoize arrays into dictionary objects (`Record<string, ...>`) using `useMemo` so that looping maps can perform O(1) attribute lookups, significantly reducing component render time.
