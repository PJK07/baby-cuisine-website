import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

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

const LEGACY_STORAGE_KEY = "baby-cuisine-cart";
const STORAGE_KEY_PREFIX = "baby-cuisine-cart";
const GUEST_STORAGE_KEY = `${STORAGE_KEY_PREFIX}:guest`;

function getUserStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:user:${userId}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toValidCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<CartItem>;
  const price = Number(item.price);
  const quantity = Number(item.quantity);

  if (
    !isNonEmptyString(item.itemCode) ||
    !isNonEmptyString(item.category) ||
    !isNonEmptyString(item.item) ||
    !isNonEmptyString(item.size) ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  return {
    itemCode: item.itemCode.trim(),
    category: item.category.trim(),
    item: item.item.trim(),
    size: item.size.trim(),
    texture: isNonEmptyString(item.texture) ? item.texture.trim() : undefined,
    price,
    quantity,
  };
}

function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<CartItem[]>((validItems, entry) => {
    const cartItem = toValidCartItem(entry);
    if (cartItem) validItems.push(cartItem);
    return validItems;
  }, []);
}

function loadFromStorage(storageKey: string): CartItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    return sanitizeCartItems(JSON.parse(raw));
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const storageKey = isLoading ? null : user ? getUserStorageKey(user.id) : GUEST_STORAGE_KEY;
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;

    let nextItems = loadFromStorage(storageKey);
    if (storageKey === GUEST_STORAGE_KEY && nextItems.length === 0) {
      nextItems = loadFromStorage(LEGACY_STORAGE_KEY);
    }

    setItems(nextItems);
    setHydratedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || hydratedStorageKey !== storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
      if (storageKey === GUEST_STORAGE_KEY) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    } catch {
      // storage quota exceeded or private browsing - silently skip
    }
  }, [hydratedStorageKey, items, storageKey]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity">) => {
    const validItem = toValidCartItem({ ...newItem, quantity: 1 });
    if (!validItem) return;

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.itemCode === validItem.itemCode &&
          item.size === validItem.size &&
          item.texture === validItem.texture
      );

      if (existing) {
        return prev.map((item) =>
          item.itemCode === validItem.itemCode &&
          item.size === validItem.size &&
          item.texture === validItem.texture
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, validItem];
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
    if (!Number.isInteger(quantity) || quantity < 1) return;
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
