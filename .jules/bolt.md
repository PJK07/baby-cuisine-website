
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-24 - Lazy load images below the fold
**Learning:** The Shop component eagerly loaded all product images in the DOM, including those way below the fold. For a large menu, this wastes bandwidth and delays the `load` event. Adding `loading="lazy"` and `decoding="async"` drastically improves perceived performance.
**Action:** Always verify if large grids of images are visible immediately. If not, slap a `loading="lazy"` on them to prevent network bottlenecks.
