"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

/** Empties the cart and closes the cart panel, e.g. after a completed payment. */
export function ClearCart() {
  const { clearCart, closeCart } = useCart();
  useEffect(() => {
    clearCart();
    closeCart();
  }, [clearCart, closeCart]);
  return null;
}
