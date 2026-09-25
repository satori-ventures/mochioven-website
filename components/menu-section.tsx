"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuItems, type MenuItem } from "@/lib/menu-data";
import { siteConfig } from "@/lib/site-config";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { Plus, Minus, ArrowRight, ShoppingBag, MapPin, Truck } from "lucide-react";

function hasValidPrice(price: string | undefined): boolean {
  if (!price) return false;
  return /\$[\d.]+/.test(price);
}

function ProductCard({ item }: { item: MenuItem }) {
  const { addLine } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState(
    item.flavors[0] ?? ""
  );
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]?.label ?? "");
  const [quantity, setQuantity] = useState(item.minQuantity);

  const selectedSizeObj = item.sizes.find((s) => s.label === selectedSize);
  const minLabel =
    item.minQuantity > 1
      ? `Minimum order: ${item.minQuantity} dozen`
      : "";

  function handleAdd() {
    addLine({
      itemId: item.id,
      name: item.name,
      flavor: selectedFlavor || "N/A",
      size: selectedSize,
      quantity,
      minQuantity: item.minQuantity,
      price: selectedSizeObj?.price || undefined,
      image: item.image,
    });
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-coral-50/40 ring-1 ring-coral-100/80 transition-all duration-300 hover:shadow-xl hover:ring-coral-200">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={item.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold text-ink">{item.name}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
          {item.description}
        </p>

        {/* Flavors */}
        {item.flavorChoice === "single" && item.flavors.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-coral-700">
              Flavor
            </p>
            {item.flavors.length === 1 ? (
              <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
                {item.flavors[0]}
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.flavors.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    onClick={() => setSelectedFlavor(flavor)}
                    className={cn(
                      "min-h-[44px] min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedFlavor === flavor
                        ? "border-coral-600 bg-coral-600 text-white"
                        : "border-coral-200 text-coral-700 hover:bg-coral-100"
                    )}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {item.flavorChoice === "none" && item.flavors.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-coral-700">
              Flavors
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Assorted: Classic Butter, Citrus Matcha, and Velvety Ube.
            </p>
          </div>
        )}

        {/* Sizes */}
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-coral-700">
            Size
          </p>
          {item.sizes.length === 1 ? (
            <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
              {item.sizes[0].label}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.sizes.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  onClick={() => setSelectedSize(size.label)}
                  className={cn(
                    "min-h-[44px] min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    selectedSize === size.label
                      ? "border-coral-600 bg-coral-600 text-white"
                      : "border-coral-200 text-coral-700 hover:bg-coral-100"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-coral-700">
            Quantity
            {item.quantityLabel && ` (${item.quantityLabel})`}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setQuantity((q) => Math.max(item.minQuantity, q - 1))
              }
              disabled={quantity <= item.minQuantity}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral-200 text-ink/70 transition-colors hover:bg-coral-100 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2.5rem] text-center text-sm font-semibold text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral-200 text-ink/70 transition-colors hover:bg-coral-100"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {minLabel && (
            <p className="mt-1.5 text-xs text-ink/50">{minLabel}</p>
          )}
        </div>

        {/* Price */}
        {selectedSizeObj?.price && hasValidPrice(selectedSizeObj.price) && (
          <p className="mt-4 text-sm font-semibold text-ink">
            {selectedSizeObj.price}
          </p>
        )}

        {/* Add to order */}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-coral-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-coral-700 hover:shadow-md"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to order
        </button>
      </div>
    </div>
  );
}

export function MenuSection() {
  return (
    <section id="products" className="scroll-mt-24 bg-white pt-20 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-6 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-coral-600">
            From the oven
          </p>
          <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl lg:text-5xl">
            Our menu
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] text-ink/70">
            Handmade in small batches in Summerlin.
          </p>
          <div className="mx-auto mt-5 flex max-w-2xl flex-col items-start gap-2 text-[15px] text-ink/70">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-coral-600" />
              Free curbside pickup at {siteConfig.order.pickupLocation}
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 shrink-0 text-coral-600" />
              Delivery: $5 within Summerlin, $10 outside Summerlin
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-ink/70">
            Order ahead or ask about same-day. We confirm every order by text or email.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>

        {/* Custom Orders */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-coral-100/80 bg-coral-50/40 p-8 sm:p-10">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h3 className="text-xl font-semibold text-ink sm:text-2xl">
                Something special in mind?
              </h3>
              <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink/70">
                Custom flavors, large orders, and special requests. Tell us what
                you need and we will send you a quote.
              </p>
            </div>
            <Link
              href="/catering?request=Custom%20order#inquiry"
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border-2 border-coral-300 px-6 py-3 text-sm font-semibold text-coral-700 transition-all duration-300 hover:bg-coral-200 hover:border-coral-400"
            >
              Request a custom order
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
