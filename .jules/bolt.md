
## 2024-05-24 - Avoid O(N) array transformations inside mapping functions
**Learning:** In React components like `Shop.tsx`, calling methods like `products.filter(...)` inside the `.map` render loop of categories and items creates O(N*M) time complexity recalculations on every single render. When rendering a shop with many items and categories, this blocks the main thread.
**Action:** Extract expensive calculations out of render mapping loops and memoize them in `useMemo` as `Record<string, ...>` dictionary lookups to keep render cycles at O(1) time complexity.

## 2024-05-25 - Avoid Undefined Variables in useMemo Optimizations
**Learning:** When extracting expensive operations out of loops into a dictionary/hash map lookup using `useMemo` (e.g. `categoryProductsByItem`), ensure that the new memoized variable is initialized and defined _before_ any other `useMemo` block tries to reference it, otherwise a critical `ReferenceError` will crash the application.
**Action:** Always check that the declaration of the dictionary variable exists and appears prior to its usage in other hooks.

## 2024-05-26 - Avoid Exposing Derived State Functions in React Context
**Learning:** Exposing functions like `getTotalItems()` or `getTotalPrice()` inside a React Context value object that calculate derived array state using `reduce` causes O(N) recalculations on every consumer component render. This blocks the main thread when many items are in the cart and many components subscribe to the Context.
**Action:** Always extract derived calculations out of Context functions and memoize them directly into properties (e.g. `totalItems`, `totalPrice`) using `useMemo` so the O(N) reduction only runs once when the underlying `items` array changes, ensuring consumers receive an O(1) property lookup on every re-render.
