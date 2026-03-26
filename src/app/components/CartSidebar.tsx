import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import { useCart } from "../context/CartContext";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, getTotalPrice, clearCart } = useCart();

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;

    const orderText = items
      .map((item) => {
        const textureInfo = item.texture ? ` - ${item.texture}` : "";
        return `${item.item} (${item.size}${textureInfo}) x${item.quantity} - $${(
          item.price * item.quantity
        ).toFixed(2)}`;
      })
      .join("\n");

    const total = getTotalPrice().toFixed(2);
    const message = `Hi! I'd like to order:\n\n${orderText}\n\nTotal: $${total}`;
    const whatsappUrl = `https://wa.me/96170465465?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 h-full w-full max-w-md bg-white shadow-2xl z-[10000] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#C4915F]" />
                <h2 className="text-2xl font-bold text-[#3E2723]">Your Cart</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#3E2723]" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add some delicious items!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.itemCode}-${item.size}-${item.texture || "none"}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-[#FFF8E7] rounded-2xl p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#3E2723] text-lg">
                            {item.item}
                          </h3>
                          <p className="text-sm text-[#8D6E63]">
                            {item.category}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            removeItem(item.itemCode, item.size, item.texture)
                          }
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="space-y-1">
                          <p className="text-[#5D4037]">
                            <span className="font-medium">Size:</span>{" "}
                            {item.size}
                          </p>
                          {item.texture && (
                            <p className="text-[#5D4037]">
                              <span className="font-medium">Texture:</span>{" "}
                              {item.texture}
                            </p>
                          )}
                          <p className="text-[#5D4037]">
                            <span className="font-medium">Quantity:</span>{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#C4915F]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-[#3E2723]">Total:</span>
                  <span className="text-[#C4915F]">
                    ${getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Order via WhatsApp
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearCart}
                  className="w-full bg-gray-200 text-[#3E2723] py-3 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                >
                  Clear Cart
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
