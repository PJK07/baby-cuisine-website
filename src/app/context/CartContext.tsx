import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";

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
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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

  const clearCart = useCallback(() => setItems([]), []);

  const getTotalItems = useCallback(() =>
    items.reduce((total, item) => total + item.quantity, 0), [items]);

  const getTotalPrice = useCallback(() =>
    items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);

  const value = useMemo(() => ({
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }), [items, addItem, removeItem, clearCart, getTotalItems, getTotalPrice]);

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
