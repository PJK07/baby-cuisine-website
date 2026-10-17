
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-06-10 - O(N) array search inside render loop
**Learning:** In React components with derived state for specific properties (like sizes), calling `Array.find()` inside an `.map()` render loop (e.g., matching a size to a specific product variant) causes unnecessary O(N) searching for each mapped item during every render. In components rendering many UI elements, this compounding O(N*M) search blocks the main thread.
**Action:** Extract expensive `Array.find()` operations out of render loops and into a `useMemo` block that builds a `Record<string, ProductData>` dictionary lookup using a single O(N) iteration, changing the lookup inside the render loop to an O(1) hash map access. Always declare the dictionary lookup before any other `useMemo` hooks that might use it to prevent ReferenceErrors.
