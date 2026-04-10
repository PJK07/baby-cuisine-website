import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS, type ProductData } from "../data/products";

type ViewMode = "categories" | "items" | "detail";

import platterImg from "../../assets/platter.png";
import puddingImg from "../../assets/pudding.png";
import fingerFoodImg from "../../assets/finger_food.png";
import nutButterImg from "../../assets/nut_butter.png";
import biscuitImg from "../../assets/biscuit.png";
import bitterImg from "../../assets/bitter.png";

const categoryIcons: Record<string, string> = {
  Platter: platterImg,
  Pudding: puddingImg,
  "Finger Food": fingerFoodImg,
  "Nut Butter": nutButterImg,
  Biscuit: biscuitImg,
  Bitter: bitterImg,
};

const categoryColors: Record<string, string> = {
  Platter: "var(--color-brand-primary)",
  Pudding: "var(--color-brand-bg)",
  "Finger Food": "var(--color-brand-primary-hover)",
  "Nut Butter": "var(--color-brand-accent)",
  Biscuit: "var(--color-brand-primary)",
  Bitter: "var(--color-brand-dark)",
};

export function Shop() {
  const ref = useRef(null);
  const { addItem } = useCart();

  // Start with bundled static data so the menu renders instantly (no spinner).
  // The useEffect below silently refreshes from /api/products after mount so
  // any Google Sheet changes are reflected without a redeploy.
  const [products, setProducts] = useState<ProductData[]>(PRODUCTS);

  useEffect(() => {
    fetch('/api/products')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: ProductData[]) => { if (Array.isArray(data) && data.length > 0) setProducts(data); })
      .catch(() => { /* keep static fallback */ });
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [selectedTexture, setSelectedTexture] = useState<string>();

  const categories = useMemo(() => Array.from(
    new Set(products.map((p) => p.Category))
  ).filter(Boolean), [products]);

  const itemsInCategory = useMemo(() => Array.from(
    new Set(
      products
        .filter((p) => p.Category === selectedCategory)
        .map((p) => p.Item)
    )
  ).filter(Boolean), [products, selectedCategory]);

  const itemVariants = useMemo(() => products.filter(
    (p) => p.Category === selectedCategory && p.Item === selectedItem
  ), [products, selectedCategory, selectedItem]);

  const availableSizes = useMemo(() => Array.from(
    new Set(itemVariants.map((v) => v.Size))
  ).filter(Boolean), [itemVariants]);

  const availableTextures = useMemo(() => Array.from(
    new Set(itemVariants.map((v) => v.Texture))
  ).filter(Boolean), [itemVariants]);

  const selectedVariant = useMemo(() => itemVariants.find(
    (v) => v.Size === selectedSize
  ), [itemVariants, selectedSize]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setViewMode("items");
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setSelectedSize(undefined);
    setSelectedTexture(undefined);
    setViewMode("detail");
  };

  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(undefined);
  };

  const handleBackToItems = () => {
    setViewMode("items");
    setSelectedItem(undefined);
    setSelectedSize(undefined);
    setSelectedTexture(undefined);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      itemCode: selectedVariant.Item_code,
      category: selectedVariant.Category,
      item: selectedVariant.Item,
      size: selectedVariant.Size,
      texture: selectedTexture || undefined,
      price: parseFloat(selectedVariant.Unit_Price.replace(/[^0-9.]/g, '')),
    });

    setSelectedSize(undefined);
    setSelectedTexture(undefined);
    handleBackToItems();
  };

  return (
    <section
      id="shop"
      ref={ref}
      className="py-24 px-6 bg-white overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-xl text-brand-dark/80 max-w-2xl mx-auto leading-relaxed">
            Every jar is a promise: soft texture, rich in nutrients, and immunity-boosting
          </p>
        </div>

        {/* Categories View */}
        {viewMode === "categories" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="bg-white border border-brand-dark/5 rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              >
                <div
                  className="w-24 h-24 rounded-[1.5rem] mb-6 flex items-center justify-center shadow-inner mx-auto overflow-hidden"
                  style={{
                    backgroundColor:
                      categoryColors[category] || "var(--color-brand-primary)",
                  }}
                >
                  <img src={categoryIcons[category] || platterImg} alt={category} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-bold text-brand-dark text-center">
                  {category}
                </h3>
              </div>
            ))}
          </div>
        )}

        {/* Items View */}
        {viewMode === "items" && (
          <div>
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-2 text-brand-primary font-semibold mb-8 hover:text-brand-primary-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Categories
            </button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {itemsInCategory.map((item) => {
                const productVariant = products.find(p => p.Item === item && p.Category === selectedCategory);
                return (
                <div
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className="bg-white border border-brand-dark/5 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col"
                >
                  <div
                    className="w-full h-32 rounded-[1.5rem] mb-4 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0"
                    style={{
                      backgroundColor:
                        categoryColors[selectedCategory!] || "var(--color-brand-primary)",
                    }}
                  >
                    <img src={categoryIcons[selectedCategory!] || platterImg} alt={selectedCategory!} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">
                    {item}
                  </h3>
                  {productVariant?.Ingredients && (
                    <p className="text-xs text-brand-dark/60 mt-1 uppercase tracking-widest leading-relaxed">
                      {productVariant.Ingredients}
                    </p>
                  )}
                </div>
              )})}
            </div>
          </div>
        )}

        {/* Detail View */}
        {viewMode === "detail" && (
          <div>
            <button
              onClick={handleBackToItems}
              className="flex items-center gap-2 text-brand-primary font-semibold mb-8 hover:text-brand-primary-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to {selectedCategory}
            </button>

            <div className="max-w-2xl mx-auto">
              <div className="bg-white border border-brand-dark/5 rounded-[2rem] p-8 lg:p-12 shadow-xl">
                <h3 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-4 text-center">
                  {selectedItem}
                </h3>
                {selectedVariant?.Ingredients && (
                  <p className="text-sm font-medium text-brand-dark/60 uppercase tracking-widest text-center mb-8 flex items-center justify-center gap-2">
                    {selectedVariant.Ingredients}
                  </p>
                )}

                {/* Size Selector */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-brand-dark mb-4">
                    Select Size:
                  </label>
                  <div className="flex gap-4">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 py-4 rounded-full font-bold text-lg transition-all ${
                          selectedSize === size
                            ? "bg-brand-primary text-white shadow-lg"
                            : "bg-white text-brand-dark hover:bg-gray-50 shadow"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texture Selector */}
                {availableTextures.length > 0 && selectedSize && (
                  <div className="mb-8">
                    <label className="block text-lg font-semibold text-brand-dark mb-4">
                      Select Texture:
                    </label>
                    <div className="flex flex-col gap-3">
                      {availableTextures.map((texture) => (
                        <button
                          key={texture}
                          onClick={() => setSelectedTexture(texture)}
                          className={`py-3 rounded-full font-semibold transition-all ${
                            selectedTexture === texture
                              ? "bg-brand-primary text-white shadow-lg"
                              : "bg-white text-brand-dark hover:bg-gray-50 shadow"
                          }`}
                        >
                          {texture}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                {selectedVariant && (
                  <div className="mb-8 text-center">
                    <p className="text-lg text-brand-dark/80 mb-2">Price:</p>
                    <p className="text-5xl font-bold text-brand-primary">
                      ${parseFloat(selectedVariant.Unit_Price.replace(/[^0-9.]/g, '')).toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Add to Cart Button */}
                {selectedVariant && (availableTextures.length === 0 || selectedTexture) && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-brand-primary text-white py-4 rounded-full text-lg font-bold shadow-xl hover:bg-brand-primary-hover transition-colors"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
