"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { priceKey } from "@/lib/menu-data";

type Prices = Record<string, number>;

/** `loaded` turns true once the price request has finished (even if it failed). */
const PricesContext = createContext<{ prices: Prices; loaded: boolean }>({
  prices: {},
  loaded: false,
});

/** Loads menu prices (in cents) from Square once, through our server. */
export function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/menu-prices")
      .then((res) => (res.ok ? res.json() : { prices: {} }))
      .then((data: { prices?: Prices }) => {
        if (active && data.prices) setPrices(data.prices);
      })
      .catch(() => {
        // Prices stay hidden when they cannot be loaded.
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PricesContext.Provider value={{ prices, loaded }}>{children}</PricesContext.Provider>
  );
}

/** Price in cents for one item, flavor, and size, or undefined if unknown. */
export function usePriceLookup(): (itemId: string, flavor: string, size: string) => number | undefined {
  const { prices } = useContext(PricesContext);
  return (itemId, flavor, size) => prices[priceKey(itemId, flavor, size)];
}

/** True once the prices have loaded (or failed to load). */
export function usePricesLoaded(): boolean {
  return useContext(PricesContext).loaded;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
