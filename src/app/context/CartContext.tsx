import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";

export interface CartItem {
  itemCode: string;
  category: string;
  item: string;
  size: string;
  texture?: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (itemCode: string, size: string, texture?: string) => void;
  updateQuantity: (itemCode: string, size: string, texture: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const STORAGE_KEY = "baby-cuisine-cart";

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage quota exceeded or private browsing — silently skip
    }
  }, [items]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.itemCode === newItem.itemCode &&
          item.size === newItem.size &&
          item.texture === newItem.texture
      );

      if (existing) {
        return prev.map((item) =>
          item.itemCode === newItem.itemCode &&
          item.size === newItem.size &&
          item.texture === newItem.texture
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...newItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemCode: string, size: string, texture?: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.itemCode === itemCode &&
            item.size === size &&
            item.texture === texture
          )
      )
    );
  }, []);

  const updateQuantity = useCallback((itemCode: string, size: string, texture: string | undefined, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.itemCode === itemCode && item.size === size && item.texture === texture
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getTotalItems = useCallback(() =>
    items.reduce((total, item) => total + item.quantity, 0), [items]);

  const getTotalPrice = useCallback(() =>
    items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }), [items, addItem, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
