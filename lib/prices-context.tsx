"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { priceKey } from "@/lib/menu-data";

type Prices = Record<string, number>;

const PricesContext = createContext<Prices>({});

/** Loads menu prices (in cents) from Square once, through our server. */
export function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices>({});

  useEffect(() => {
    let active = true;
    fetch("/api/menu-prices")
      .then((res) => (res.ok ? res.json() : { prices: {} }))
      .then((data: { prices?: Prices }) => {
        if (active && data.prices) setPrices(data.prices);
      })
      .catch(() => {
        // Prices stay hidden when they cannot be loaded.
      });
    return () => {
      active = false;
    };
  }, []);

  return <PricesContext.Provider value={prices}>{children}</PricesContext.Provider>;
}

/** Price in cents for one item, flavor, and size, or undefined if unknown. */
export function usePriceLookup(): (itemId: string, flavor: string, size: string) => number | undefined {
  const prices = useContext(PricesContext);
  return (itemId, flavor, size) => prices[priceKey(itemId, flavor, size)];
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
