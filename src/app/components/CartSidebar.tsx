import { X, ShoppingCart, Trash2, Plus, Minus, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { WHATSAPP_NUMBER } from "../constants";
import { getSavedContact, saveOrder } from "../services/orders";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user, isConfigured } = useAuth();
  const [deliveryDay, setDeliveryDay] = useState<"Tuesday" | "Friday" | null>(null);
  const [showDeliveryError, setShowDeliveryError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [contactDetails, setContactDetails] = useState({
    fullName: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (!user?.id) {
      setContactDetails({
        fullName: "",
        phone: "",
        address: "",
        notes: "",
      });
      return;
    }
    if (!isConfigured || !isOpen) return;

    let isCurrent = true;

    getSavedContact(user.id)
      .then((savedContact) => {
        if (!isCurrent || !savedContact) return;
        setContactDetails({
          fullName: savedContact.fullName,
          phone: savedContact.phone,
          address: savedContact.address,
          notes: savedContact.notes || "",
        });
      })
      .catch(() => {
        if (isCurrent) {
          toast.error("We could not load your saved delivery details.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isConfigured, isOpen, user?.id]);

  const handleWhatsAppOrder = async () => {
    if (isSubmittingRef.current) return;
    if (items.length === 0) return;
    if (!isConfigured) {
      toast.error("Add Supabase credentials before saving orders.");
      return;
    }
    if (!user?.id || !user.email) {
      toast.error("Please sign in before ordering so we can save your order.");
      return;
    }
    if (!deliveryDay) {
      setShowDeliveryError(true);
      return;
    }
    if (!contactDetails.fullName.trim() || !contactDetails.phone.trim() || !contactDetails.address.trim()) {
      toast.error("Please add your name, phone, and delivery address.");
      return;
    }
    setShowDeliveryError(false);

    const orderText = items
      .map((item) => {
        const textureInfo = item.texture ? ` - ${item.texture}` : "";
        return `${item.item} (${item.size}${textureInfo}) x${item.quantity} - $${(
          item.price * item.quantity
        ).toFixed(2)}`;
      })
      .join("\n");

    const total = getTotalPrice().toFixed(2);
    const message = `Hi! I'd like to order:\n\n${orderText}\n\nTotal: $${total}\n+ Delivery Charge according to the location\nDelivery: ${deliveryDay}\nName: ${contactDetails.fullName}\nPhone: ${contactDetails.phone}\nAddress: ${contactDetails.address}${contactDetails.notes ? `\nNotes: ${contactDetails.notes}` : ""}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      await saveOrder({
        userId: user.id,
        email: user.email,
        contact: {
          fullName: contactDetails.fullName.trim(),
          phone: contactDetails.phone.trim(),
          address: contactDetails.address.trim(),
          notes: contactDetails.notes.trim(),
        },
        deliveryDay,
        items,
        total: getTotalPrice(),
      });

      window.open(whatsappUrl, "_blank");
      clearCart();
      setDeliveryDay(null);
      onClose();
      toast.success("Order saved and sent. We'll confirm via WhatsApp shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save your order.");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={isSubmitting ? undefined : onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 bottom-0 h-full w-full max-w-5xl bg-white shadow-2xl z-[10000] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-brand-primary" />
            <h2 className="text-2xl font-bold text-brand-dark">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close cart"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-brand-dark" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add some delicious items!</p>
            </div>
          ) : (
            <div className="space-y-6 xl:grid xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] xl:items-start xl:gap-6 xl:space-y-0">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={`${item.itemCode}-${item.size}-${item.texture || "none"}-${index}`}
                    className="bg-brand-bg/40 rounded-2xl p-5 shadow-sm xl:p-6"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-brand-dark text-lg leading-tight xl:text-xl">{item.item}</h3>
                        <p className="text-sm text-brand-dark/70 xl:text-base">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.itemCode, item.size, item.texture)}
                        disabled={isSubmitting}
                        aria-label={`Remove ${item.item} from cart`}
                        className="text-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 transition-colors ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="text-sm text-brand-dark/80 space-y-1 mb-4 xl:text-base">
                      <p><span className="font-medium">Size:</span> {item.size}</p>
                      {item.texture && (
                        <p><span className="font-medium">Texture:</span> {item.texture}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.itemCode, item.size, item.texture, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isSubmitting}
                          aria-label={`Decrease quantity of ${item.item}`}
                          className="w-10 h-10 rounded-full bg-white border border-brand-dark/20 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          <Minus className="w-4 h-4 text-brand-dark" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-lg font-bold text-brand-dark">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.itemCode, item.size, item.texture, item.quantity + 1)}
                          disabled={isSubmitting}
                          aria-label={`Increase quantity of ${item.item}`}
                          className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors shadow-sm"
                        >
                          <Plus className="w-4 h-4 text-white" aria-hidden="true" />
                        </button>
                      </div>
                      <p className="text-2xl font-bold text-brand-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4 xl:sticky xl:top-0 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                <div>
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-brand-dark">Total:</span>
                    <span className="text-brand-primary">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-brand-dark/60 mt-1 italic">
                    + Delivery charge according to the location
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-brand-dark mb-2">
                    Delivery Day: <span className="text-red-500">*</span>
                  </p>
                  <div className="flex gap-3">
                    {(["Tuesday", "Friday"] as const).map((day) => (
                      <button
                        key={day}
                        onClick={() => { setDeliveryDay(day); setShowDeliveryError(false); }}
                        aria-pressed={deliveryDay === day}
                        className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all ${
                          deliveryDay === day
                            ? "bg-brand-primary text-white shadow"
                            : "bg-gray-100 text-brand-dark hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  {showDeliveryError && (
                    <p className="flex items-center gap-1.5 text-red-500 text-sm mt-2 font-medium">
                      <AlertCircle className="w-4 h-4" aria-hidden="true" />
                      Please select a delivery day before ordering.
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-brand-dark">
                    Contact Information <span className="text-red-500">*</span>
                  </p>
                  <input
                    type="text"
                    value={contactDetails.fullName}
                    onChange={(event) => setContactDetails((prev) => ({ ...prev, fullName: event.target.value }))}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-brand-dark/15 bg-white px-4 py-3 text-sm text-brand-dark outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <input
                    type="tel"
                    value={contactDetails.phone}
                    onChange={(event) => setContactDetails((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="Phone number"
                    className="w-full rounded-2xl border border-brand-dark/15 bg-white px-4 py-3 text-sm text-brand-dark outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <textarea
                    value={contactDetails.address}
                    onChange={(event) => setContactDetails((prev) => ({ ...prev, address: event.target.value }))}
                    placeholder="Delivery address"
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-brand-dark/15 bg-white px-4 py-3 text-sm text-brand-dark outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                  <textarea
                    value={contactDetails.notes}
                    onChange={(event) => setContactDetails((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Order notes"
                    rows={2}
                    className="w-full resize-none rounded-2xl border border-brand-dark/15 bg-white px-4 py-3 text-sm text-brand-dark outline-none focus:ring-2 focus:ring-brand-primary/30"
                  />
                </div>

                <button
                  onClick={handleWhatsAppOrder}
                  disabled={isSubmitting}
                  className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold text-lg shadow-lg hover:bg-[#20BA5A] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {isSubmitting ? "Saving Order..." : "Order via WhatsApp"}
                </button>
                <button
                  onClick={clearCart}
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 text-brand-dark py-3 rounded-full font-semibold hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
