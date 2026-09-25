"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  itemId: string;
  name: string;
  flavor: string;
  size: string;
  quantity: number;
  minQuantity: number;
  price?: string;
  image: string;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  totalCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addLine = useCallback((line: Omit<CartLine, "id">) => {
    const id = `${line.itemId}-${line.flavor}-${line.size}-${Date.now()}`;
    setLines((prev) => {
      const existing = prev.find(
        (l) =>
          l.itemId === line.itemId &&
          l.flavor === line.flavor &&
          l.size === line.size
      );
      if (existing) {
        return prev.map((l) =>
          l.id === existing.id
            ? { ...l, quantity: l.quantity + line.quantity }
            : l
        );
      }
      return [...prev, { ...line, id }];
    });
    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, quantity: Math.max(l.minQuantity, quantity) }
          : l
      )
    );
  }, []);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const totalCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      isOpen,
      openCart,
      closeCart,
      addLine,
      updateQuantity,
      removeLine,
      clearCart,
      totalCount,
    }),
    [lines, isOpen, openCart, closeCart, addLine, updateQuantity, removeLine, clearCart, totalCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
