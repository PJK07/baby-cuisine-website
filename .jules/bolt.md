
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2025-02-18 - Replacing O(N) Array Filters inside useMemo with O(1) Hash Map Lookups
**Learning:** Even inside `useMemo`, doing O(N) operations like `products.filter(...)` inside a map loop leads to O(N*M) complexity, especially noticeable when working with larger datasets. When a grouped dictionary or map like `categoryProductsByItem` already exists, using it for O(1) lookups instead of refiltering the parent array significantly boosts performance and reduces render blocking.
**Action:** Always verify if an existing grouped `Record<string, T[]>` can be utilized before writing an O(N) `.filter()` inside another loop or memoized array generation.
