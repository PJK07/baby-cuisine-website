import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";

interface ProductData {
  Item_code: string;
  Category: string;
  Item: string;
  Size: string;
  Texture: string;
  Unit_Price: string;
}

type ViewMode = "categories" | "items" | "detail";

const categoryIcons: Record<string, string> = {
  Platter: "🍽️",
  Pudding: "🍮",
  "Finger Food": "🥕",
  "Nut Butter": "🥜",
  Biscuit: "🍪",
  Bitter: "🥬",
};

const categoryColors: Record<string, string> = {
  Platter: "#FFB88C",
  Pudding: "#E8D5E8",
  "Finger Food": "#F5E6C8",
  "Nut Butter": "#C4915F",
  Biscuit: "#F5C542",
  Bitter: "#A8D5BA",
};

export function Shop() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { addItem } = useCart();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedTexture, setSelectedTexture] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vSb_LY48gkyu2Kt8qR64frTRFwSfyy--ih2cjsr4ZmoiPC2ekHJx-jMNyGCzVhZRBuA5pFocaat0h_9/pub?output=csv"
        );
        const text = await response.text();
        console.log("✅ Raw CSV fetched. First 500 chars:", text.substring(0, 500));

        // Parse CSV (comma-separated)
        const rows = text.split("\n").map((row) => row.split(",").map(cell => cell.trim()));
        const headers = rows[0].map(h => h.trim());
        console.log("✅ Headers found:", headers);
        console.log("✅ First 3 raw data rows:", rows.slice(1, 4));

        const data: ProductData[] = rows.slice(1).map((row) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index]?.trim() || "";
          });
          return obj as ProductData;
        }).filter((item) => item.Item && item.Category);

        console.log("✅ Parsed products (first 3):", data.slice(0, 3));
        console.log("✅ Total products after filtering:", data.length);
        console.log("✅ Unique categories:", Array.from(new Set(data.map(p => p.Category))));

        setProducts(data);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => Array.from(
    new Set(products.map((p) => p.Category))
  ).filter(Boolean), [products]);

  console.log("🔍 Rendering - viewMode:", viewMode);
  console.log("🔍 Rendering - categories array:", categories);
  console.log("🔍 Rendering - categories length:", categories.length);

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

  // Price only depends on Size, not Texture
  const selectedVariant = useMemo(() => itemVariants.find(
    (v) => v.Size === selectedSize
  ), [itemVariants, selectedSize]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setViewMode("items");
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setSelectedSize("");
    setSelectedTexture("");
    setViewMode("detail");
  };

  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory("");
  };

  const handleBackToItems = () => {
    setViewMode("items");
    setSelectedItem("");
    setSelectedSize("");
    setSelectedTexture("");
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

    // Reset and go back to items
    setSelectedSize("");
    setSelectedTexture("");
    handleBackToItems();
  };

  if (loading) {
    return (
      <section
        id="shop"
        ref={ref}
        className="py-24 px-6 bg-white overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#C4915F] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="shop"
      ref={ref}
      className="py-24 px-6 bg-white overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2 className="text-5xl lg:text-6xl font-bold text-[#3E2723] mb-6">
            Handmade for <span className="text-[#C4915F]">Your Baby</span>
          </motion.h2>
          <p className="text-xl text-[#5D4037] max-w-2xl mx-auto leading-relaxed">
            Each jar is a promise—soft, fresh, and made with the same care you'd
            give at home.
          </p>
        </motion.div>

        {/* Categories View */}
        {viewMode === "categories" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {console.log("🎨 Rendering categories grid. Count:", categories.length)}
            {categories.map((category, index) => {
              console.log("🎨 Rendering category card:", category);
              return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                onClick={() => handleCategoryClick(category)}
                className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
              >
                <div
                  className="w-24 h-24 rounded-[1.5rem] mb-6 flex items-center justify-center shadow-inner mx-auto"
                  style={{
                    backgroundColor:
                      categoryColors[category] || "#FFB88C",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-6xl"
                  >
                    {categoryIcons[category] || "🍽️"}
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-[#3E2723] text-center">
                  {category}
                </h3>
              </motion.div>
            )})}
          </div>
        )}

        {/* Items View */}
        {viewMode === "items" && (
          <div>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -5 }}
              onClick={handleBackToCategories}
              className="flex items-center gap-2 text-[#C4915F] font-semibold mb-8 hover:text-[#A67C52] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Categories
            </motion.button>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {itemsInCategory.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  whileHover={{ y: -10, transition: { duration: 0.3 } }}
                  onClick={() => handleItemClick(item)}
                  className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-[2rem] p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  <div
                    className="w-full h-32 rounded-[1.5rem] mb-4 flex items-center justify-center shadow-inner"
                    style={{
                      backgroundColor:
                        categoryColors[selectedCategory] || "#FFB88C",
                    }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="text-6xl"
                    >
                      {categoryIcons[selectedCategory] || "🍽️"}
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#3E2723] mb-2">
                    {item}
                  </h3>
                  <p className="text-[#5D4037]">{selectedCategory}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Detail View */}
        {viewMode === "detail" && (
          <div>
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -5 }}
              onClick={handleBackToItems}
              className="flex items-center gap-2 text-[#C4915F] font-semibold mb-8 hover:text-[#A67C52] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to {selectedCategory}
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-gradient-to-br from-[#FFE5D9] to-[#FFEFD5] rounded-[2rem] p-8 lg:p-12 shadow-xl">
                <h3 className="text-4xl lg:text-5xl font-bold text-[#3E2723] mb-8 text-center">
                  {selectedItem}
                </h3>

                {/* Size Selector */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-[#3E2723] mb-4">
                    Select Size:
                  </label>
                  <div className="flex gap-4">
                    {availableSizes.map((size) => (
                      <motion.button
                        key={size}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 py-4 rounded-full font-bold text-lg transition-all ${
                          selectedSize === size
                            ? "bg-[#C4915F] text-white shadow-lg"
                            : "bg-white text-[#3E2723] hover:bg-gray-50 shadow"
                        }`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Texture Selector */}
                {availableTextures.length > 0 && selectedSize && (
                  <div className="mb-8">
                    <label className="block text-lg font-semibold text-[#3E2723] mb-4">
                      Select Texture:
                    </label>
                    <div className="flex flex-col gap-3">
                      {availableTextures.map((texture) => (
                        <motion.button
                          key={texture}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedTexture(texture)}
                          className={`py-3 rounded-full font-semibold transition-all ${
                            selectedTexture === texture
                              ? "bg-[#C4915F] text-white shadow-lg"
                              : "bg-white text-[#3E2723] hover:bg-gray-50 shadow"
                          }`}
                        >
                          {texture}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                {selectedVariant && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 text-center"
                  >
                    <p className="text-lg text-[#5D4037] mb-2">Price:</p>
                    <p className="text-5xl font-bold text-[#C4915F]">
                      ${parseFloat(selectedVariant.Unit_Price.replace(/[^0-9.]/g, '')).toFixed(2)}
                    </p>
                  </motion.div>
                )}

                {/* Add to Cart Button */}
                {selectedVariant && (availableTextures.length === 0 || selectedTexture) && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="w-full bg-[#7CB342] text-white py-4 rounded-full text-lg font-bold shadow-xl hover:bg-[#689F38] transition-colors"
                  >
                    Add to Cart
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
