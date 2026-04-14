import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS, type ProductData } from "../data/products";

type ViewMode = "categories" | "items" | "detail";

const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPjwvc3ZnPg==';

const assetImages = import.meta.glob<{ default: string }>('../../assets/*.{webp,png,jpg}', { eager: true });

const categoryIcons: Record<string, string> = {};

const categoryColors: Record<string, string> = {
  Platter: "var(--color-brand-primary)",
  Pudding: "var(--color-brand-bg)",
  "Finger Food": "var(--color-brand-primary-hover)",
  "Nut Butter": "var(--color-brand-accent)",
  Biscuit: "var(--color-brand-primary)",
  Bitter: "var(--color-brand-dark)",
};

const BabyFoodPlaceholder = ({ className = "w-full h-full", iconSize = "w-16 h-16" }) => (
  <div className={`flex flex-col items-center justify-center bg-[#FDFBF7] ${className}`}>
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`text-brand-accent transition-transform group-hover:scale-105 ${iconSize}`}
    >
      <line x1="75" y1="20" x2="60" y2="40" />
      <ellipse cx="56" cy="45" rx="10" ry="6" transform="rotate(-50 56 45)" fill="currentColor" fillOpacity="0.15" />
      <path d="M15 50h70c0 19.33-15.67 35-35 35S15 69.33 15 50z" fill="#FFFFFF" />
      <path d="M40 30 Q35 20 40 10" strokeDasharray="6 6" opacity="0.4" />
      <path d="M60 30 Q65 20 60 10" strokeDasharray="6 6" opacity="0.4" />
      <path d="M15 50h70c0 19.33-15.67 35-35 35S15 69.33 15 50z" />
      <line x1="35" y1="85" x2="65" y2="85" />
      <circle cx="38" cy="65" r="3" fill="currentColor" stroke="none" />
      <circle cx="62" cy="65" r="3" fill="currentColor" stroke="none" />
      <path d="M46 72 Q50 76 54 72" fill="none" strokeWidth="4" />
    </svg>
  </div>
);

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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    if (lightboxImage) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

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
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-4">Our Menu</h2>
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
                  {categoryIcons[category] ? (
                    <img 
                      src={categoryIcons[category]} 
                      alt={category} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <BabyFoodPlaceholder iconSize="w-12 h-12" className="w-full h-full" />
                  )}
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
                const itemVariants = products.filter(p => p.Item === item && p.Category === selectedCategory);
                const startingPrice = itemVariants.length > 0 
                  ? Math.min(...itemVariants.map(v => {
                      const priceMatches = v.Unit_Price.match(/[0-9.]+/);
                      return priceMatches ? parseFloat(priceMatches[0]) : 0;
                    }))
                  : null;
                const formattedName = item.toLowerCase().replace(/ /g, '-');
                const matchedKey = Object.keys(assetImages).find(key => key.endsWith(`/${formattedName}.webp`));
                const itemImageUrl = matchedKey ? assetImages[matchedKey].default : null;

                return (
                <div
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className="bg-white border border-brand-dark/5 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col"
                >
                  <div
                    className="w-full h-40 rounded-[1.5rem] mb-3 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0 cursor-zoom-in relative group"
                    style={{
                      backgroundColor:
                        categoryColors[selectedCategory!] || "var(--color-brand-primary)",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (itemImageUrl) setLightboxImage(itemImageUrl);
                    }}
                  >
                    {itemImageUrl ? (
                      <img 
                        src={itemImageUrl} 
                        alt={item} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      />
                    ) : (
                      <BabyFoodPlaceholder iconSize="w-20 h-20" className="w-full h-full opacity-90" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  
                  {startingPrice !== null && startingPrice > 0 && (
                    <p className="text-sm font-semibold text-brand-accent mb-1">
                      {selectedCategory?.toLowerCase().includes('finger food') 
                        ? `$${startingPrice.toFixed(2)} USD`
                        : `Starting from $${startingPrice.toFixed(2)} USD`
                      }
                    </p>
                  )}
                  
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">
                    {item}
                  </h3>

                  {selectedCategory === "Platter" && productVariant?.Delivery_Day && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black mb-3 self-start uppercase tracking-widest border border-brand-primary/20 shadow-sm">
                      Delivery: {productVariant.Delivery_Day}
                    </div>
                  )}
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
                <div
                  className="w-full h-64 rounded-[1.5rem] mb-8 flex items-center justify-center shadow-inner overflow-hidden cursor-zoom-in relative group"
                  style={{ backgroundColor: categoryColors[selectedCategory!] || "var(--color-brand-primary)" }}
                  onClick={() => {
                    const formatted = selectedItem!.toLowerCase().replace(/ /g, '-');
                    const key = Object.keys(assetImages).find(k => k.endsWith(`/${formatted}.webp`));
                    if (key) setLightboxImage(assetImages[key].default);
                  }}
                >
                  {(() => {
                    const formatted = selectedItem!.toLowerCase().replace(/ /g, '-');
                    const key = Object.keys(assetImages).find(k => k.endsWith(`/${formatted}.webp`));
                    return key ? (
                      <img
                        src={assetImages[key].default}
                        alt={selectedItem!}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <BabyFoodPlaceholder iconSize="w-32 h-32" className="w-full h-full opacity-90" />
                    );
                  })()}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                <h3 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-4 text-center">
                  {selectedItem}
                </h3>

                {selectedCategory === "Platter" && itemVariants[0]?.Delivery_Day && (
                  <div className="flex justify-center mb-8">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-black uppercase tracking-widest border border-brand-primary/20 shadow-sm">
                      Delivery: {itemVariants[0].Delivery_Day}
                    </div>
                  </div>
                )}
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
                    {availableSizes.map((size) => {
                      const variant = itemVariants.find(v => v.Size === size);
                      const mlValue = variant?.Size_ml || 
                                      variant?.["Size (ml)"] || 
                                      variant?.["size_ml"] || 
                                      variant?.["Size ml"];
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`flex-1 py-4 rounded-full font-bold text-lg transition-all ${
                            selectedSize === size
                              ? "bg-brand-primary text-white shadow-lg"
                              : "bg-white text-brand-dark hover:bg-gray-50 shadow"
                          }`}
                        >
                          {size}{mlValue ? ` ${mlValue}${mlValue.toString().toLowerCase().trim().endsWith('ml') ? '' : 'ml'}` : ''}
                        </button>
                      );
                    })}
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

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Fullscreen view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = categoryIcons[selectedCategory || ""] || FALLBACK_IMAGE;
            }}
          />
        </div>
      )}
    </section>
  );
}
