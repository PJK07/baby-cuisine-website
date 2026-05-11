## 2024-05-11 - Optimized itemsInCategory mapping
**Learning:** Found an `O(N * M)` nested iteration loop inside the render cycle of `itemsInCategory.map` inside `Shop.tsx` when displaying products for a specific category. A `.filter` was being executed repeatedly against the entire static store instead of being appropriately memoized/mapped.
**Action:** Use a memoized dictionary lookup inside `useMemo` mapping categories and items `categoryProductsByItem` to eliminate repeated array iterations and switch filtering complexity to `O(1)` item variants lookups.
