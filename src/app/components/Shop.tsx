import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { PRODUCTS, type ProductData } from "../data/products";
import { getProductImage } from "../utils/imageLoader";
import { FALLBACK_IMAGE } from "../constants";

type ViewMode = "categories" | "items" | "detail";


const categoryColors: Record<string, string> = {
  Platter: "var(--color-brand-primary)",
  Pudding: "var(--color-brand-bg)",
  "Finger Food": "var(--color-brand-primary-hover)",
  "Nut Butter": "var(--color-brand-accent)",
  Biscuit: "var(--color-brand-primary)",
  Bitter: "var(--color-brand-dark)",
};

const fmtPrice = (p: number) => p % 1 === 0 ? `$${p}` : `$${p.toFixed(2)}`;

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
  const { addItem } = useCart();

  // Static data renders instantly. The API fetch silently updates from
  // Google Sheets after mount so any menu changes are live without a redeploy.
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

  const { detailMinPrice, detailHasMultiplePrices } = useMemo(() => {
    const prices = Array.from(new Set(
      itemVariants
        .map(v => {
          const m = v.Unit_Price ? v.Unit_Price.toString().match(/[0-9.]+/) : null;
          return m ? parseFloat(m[0]) : 0;
        })
        .filter(p => p > 0)
    ));
    return {
      detailMinPrice: prices.length > 0 ? Math.min(...prices) : null,
      detailHasMultiplePrices: prices.length > 1,
    };
  }, [itemVariants]);

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

    toast.success(`${selectedVariant.Item} added to cart`);
    setSelectedSize(undefined);
    setSelectedTexture(undefined);
    handleBackToItems();
  };

  return (
    <section
      id="shop"
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
            {categories.map((category) => {
              const itemCount = Array.from(
                new Set(products.filter(p => p.Category === category).map(p => p.Item))
              ).length;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="bg-white border border-brand-dark/5 rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all text-left w-full"
                >
                  <div
                    className="w-24 h-24 rounded-[1.5rem] mb-6 flex items-center justify-center shadow-inner mx-auto overflow-hidden"
                    style={{
                      backgroundColor: (category.toLowerCase().includes("biscuit") || category.toLowerCase().includes("finger food"))
                        ? "white"
                        : (categoryColors[category] || "var(--color-brand-primary)"),
                    }}
                  >
                    <BabyFoodPlaceholder iconSize="w-12 h-12" className="w-full h-full" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-dark text-center mb-2">
                    {category}
                  </h3>
                  <p className="text-sm text-brand-dark/50 text-center">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </p>
                </button>
              );
            })}
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
                const uniquePrices = Array.from(new Set(
                  itemVariants
                    .map(v => { const m = v.Unit_Price ? v.Unit_Price.toString().match(/[0-9.]+/) : null; return m ? parseFloat(m[0]) : 0; })
                    .filter(p => p > 0)
                ));
                const startingPrice = uniquePrices.length > 0 ? Math.min(...uniquePrices) : null;
                const hasMultiplePrices = uniquePrices.length > 1;
                const itemImageUrl = getProductImage(item);

                return (
                <button
                  key={item}
                  onClick={() => handleItemClick(item)}
                  className="bg-white border border-brand-dark/5 rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all flex flex-col text-left w-full"
                >
                  <div
                    className="w-full h-40 rounded-[1.5rem] mb-3 flex-shrink-0 overflow-hidden relative group"
                    style={{
                      backgroundColor: (selectedCategory?.toLowerCase().includes("biscuit") || selectedCategory?.toLowerCase().includes("finger food"))
                        ? "white"
                        : (categoryColors[selectedCategory!] || "var(--color-brand-primary)"),
                    }}
                  >
                    {itemImageUrl ? (
                      <>
                        <img
                          src={itemImageUrl}
                          alt={item}
                          onError={(e) => {
                            const t = e.currentTarget;
                            if (!t.dataset.fallback) {
                              t.src = FALLBACK_IMAGE;
                              t.dataset.fallback = "true";
                            }
                          }}
                          className={`w-full h-full transition-transform group-hover:scale-105 ${
                            (selectedCategory?.toLowerCase().includes("biscuit") || selectedCategory?.toLowerCase().includes("finger food"))
                              ? "object-contain p-4"
                              : "object-cover"
                          }`}
                        />
                        <button
                          type="button"
                          aria-label={`View ${item} full size`}
                          className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage(itemImageUrl);
                          }}
                        />
                      </>
                    ) : (
                      <BabyFoodPlaceholder iconSize="w-20 h-20" className="w-full h-full opacity-90" />
                    )}
                  </div>

                  {startingPrice !== null && (
                    <p className="text-sm font-semibold text-brand-accent mb-1">
                      {hasMultiplePrices ? `Starting from ${fmtPrice(startingPrice)}` : fmtPrice(startingPrice)}
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
                </button>
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
                  style={{
                    backgroundColor: (selectedCategory?.toLowerCase().includes("biscuit") || selectedCategory?.toLowerCase().includes("finger food"))
                      ? "white"
                      : (categoryColors[selectedCategory!] || "var(--color-brand-primary)")
                  }}
                  onClick={() => {
                    const url = getProductImage(selectedItem!);
                    setLightboxImage(url);
                  }}
                >
                  {(() => {
                    const url = getProductImage(selectedItem!);
                    return (
                      <img
                        src={url}
                        alt={selectedItem!}
                        onError={(e) => {
                          const t = e.currentTarget;
                          if (!t.dataset.fallback) {
                            t.src = FALLBACK_IMAGE;
                            t.dataset.fallback = "true";
                          }
                        }}
                        className={`w-full h-full transition-transform group-hover:scale-105 ${
                          (selectedCategory?.toLowerCase().includes("biscuit") || selectedCategory?.toLowerCase().includes("finger food"))
                            ? "object-contain p-6"
                            : "object-cover"
                        }`}
                      />
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

                {/* Price Display */}
                <div className="mb-8 text-center">
                  {selectedVariant ? (
                    <>
                      <p className="text-sm font-semibold text-brand-dark/60 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-5xl font-bold text-brand-primary">
                        {fmtPrice(parseFloat(selectedVariant.Unit_Price.replace(/[^0-9.]/g, '')))}
                      </p>
                    </>
                  ) : detailMinPrice !== null ? (
                    <>
                      {detailHasMultiplePrices && (
                        <p className="text-sm font-semibold text-brand-dark/60 uppercase tracking-widest mb-1">Starting from</p>
                      )}
                      <p className="text-5xl font-bold text-brand-primary">
                        {fmtPrice(detailMinPrice)}
                      </p>
                    </>
                  ) : null}
                </div>

                {/* Size Selector */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-brand-dark mb-4">
                    Select Size:
                  </label>
                  <div className="flex gap-4">
                    {availableSizes.map((size) => {
                      // Size field now contains the ml label directly ("120 ml" / "200 ml" / "250 ml").
                      // Fall back to Size_ml / "Size (ml)" for any legacy API rows still using Big/Small/Medium.
                      const variant = itemVariants.find(v => v.Size === size);
                      const mlRaw = variant?.Size_ml || variant?.["Size (ml)"];
                      const sizeLabel = size.toLowerCase().includes('ml')
                        ? size
                        : mlRaw
                          ? mlRaw.toString().trim().toLowerCase().endsWith('ml')
                            ? mlRaw.toString().trim()
                            : `${mlRaw} ml`
                          : size;
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
                          {sizeLabel}
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
          role="dialog"
          aria-modal="true"
          aria-label={`Full-size image: ${selectedItem || "product"}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            autoFocus
            aria-label="Close image"
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" aria-hidden="true" />
          </button>
          <img
            src={lightboxImage}
            alt={selectedItem ? `${selectedItem} — full view` : "Product full view"}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const t = e.currentTarget;
              if (!t.dataset.fallback) {
                t.src = FALLBACK_IMAGE;
                t.dataset.fallback = "true";
              }
            }}
          />
        </div>
      )}
    </section>
  );
}
