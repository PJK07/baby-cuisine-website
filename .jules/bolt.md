
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-25 - React Context Derived State Anti-Pattern
**Learning:** Found a specific codebase anti-pattern where React Context (`CartContext`) exposed functions (`getTotalItems`, `getTotalPrice`) that performed array reductions to calculate derived state. This forced all consumer components (like `Navigation` and `CartSidebar`) to redundantly recalculate the O(N) reduction on every render.
**Action:** When managing React Context, do not expose functions for derived state calculations. Instead, calculate derived properties internally using `useMemo` (e.g., `totalItems`, `totalPrice`) and expose these memoized properties to consumers to guarantee O(1) reads.
