"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { menuItems, formatMinimum, type MenuItem } from "@/lib/menu-data";
import { siteConfig } from "@/lib/site-config";
import { useCart } from "@/lib/cart-context";
import { formatCents, usePriceLookup, usePricesLoaded } from "@/lib/prices-context";
import { cn } from "@/lib/utils";
import { Plus, Minus, ArrowRight, ShoppingBag, MapPin, Truck } from "lucide-react";

/** A price difference such as "+$4" or "+$4.50". */
function formatPriceDifference(cents: number): string {
  const sign = cents < 0 ? "−" : "+";
  const abs = Math.abs(cents);
  return `${sign}$${abs % 100 === 0 ? abs / 100 : (abs / 100).toFixed(2)}`;
}

function ProductCard({ item }: { item: MenuItem }) {
  const { addLine } = useCart();
  const priceOf = usePriceLookup();
  const pricesLoaded = usePricesLoaded();
  const [selectedFlavor, setSelectedFlavor] = useState(
    item.flavors[0] ?? ""
  );
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]?.label ?? "");
  const [quantity, setQuantity] = useState(item.minQuantity);
  const [withOption, setWithOption] = useState(false);

  // The extra (e.g. toasted almonds) is offered only for its flavor, and only
  // when Square has a price for it in the selected size.
  const option = item.flavorOption;
  const optionPrice = option ? priceOf(item.id, option.flavor, selectedSize) : undefined;
  const optionAvailable =
    !!option && selectedFlavor === option.baseFlavor && optionPrice !== undefined;
  const optionChosen = optionAvailable && withOption;
  const cartFlavor = optionChosen ? option.flavor : selectedFlavor;
  const plainPrice = option ? priceOf(item.id, option.baseFlavor, selectedSize) : undefined;
  const optionDifference =
    optionPrice !== undefined && plainPrice !== undefined && optionPrice !== plainPrice
      ? formatPriceDifference(optionPrice - plainPrice)
      : "";

  const selectedSizeObj = item.sizes.find((s) => s.label === selectedSize);
  const selectedPrice = priceOf(item.id, cartFlavor, selectedSize);
  const minLabel =
    item.minQuantity > 1
      ? `Minimum order: ${formatMinimum(item.minQuantity, item.quantityLabel)}`
      : "";

  // A choice without a Square price cannot be ordered online.
  const unavailable = pricesLoaded && selectedPrice === undefined;

  function handleAdd() {
    if (unavailable) return;
    addLine({
      itemId: item.id,
      name: item.name,
      flavor: cartFlavor,
      size: selectedSize,
      quantity,
      minQuantity: item.minQuantity,
      quantityLabel: item.quantityLabel,
      image: item.image ?? "",
    });
  }

  // Each card spans 8 rows of the menu grid and shares them with the card next
  // to it (subgrid), so flavor, size, quantity, and the button line up. The
  // card background covers rows 1-7; row 8 is the space between cards.
  return (
    <div className="group relative isolate grid [grid-row:span_8] [grid-template-rows:subgrid]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-3xl bg-secondary ring-1 ring-coral-100/80 transition-all duration-300 [grid-row:1/8] group-hover:shadow-xl group-hover:ring-coral-200"
      />
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-3xl">
        {item.image && item.imageWidth && item.imageHeight ? (
          <Image
            src={item.image}
            alt={item.alt}
            width={item.imageWidth}
            height={item.imageHeight}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : item.image ? (
          <Image
            src={item.image}
            alt={item.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        ) : (
          <div
            role="img"
            aria-label={item.alt}
            className="flex h-full w-full items-center justify-center bg-coral-100/60 text-sm font-semibold uppercase tracking-widest text-coral-700"
          >
            {item.imagePlaceholder}
          </div>
        )}
      </div>

      {item.imageCaption ? (
        // The caption fits in the title row's 24px top padding (6px + 16px
        // line + 2px), so the title and the rows of the next card stay aligned.
        <div className="px-6 pt-1.5">
          <p className="text-xs text-ink/70">{item.imageCaption}</p>
          <h3 className="mt-0.5 text-xl font-semibold text-ink">{item.name}</h3>
        </div>
      ) : (
        <div className="px-6 pt-6">
          <h3 className="text-xl font-semibold text-ink">{item.name}</h3>
        </div>
      )}
      <div className="px-6">
        <p className="mt-2 text-[15px] leading-relaxed text-ink/70">
          {item.description}
        </p>
      </div>

      <div className="px-6">
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
                    onClick={() => {
                      setSelectedFlavor(flavor);
                      setWithOption(false);
                    }}
                    className={cn(
                      "min-h-[44px] min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedFlavor === flavor
                        ? "border-coral-600 bg-coral-600 text-white"
                        : "border-coral-200 bg-white text-coral-700 hover:bg-coral-50"
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
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              Assorted: Classic Butter, Citrus Matcha, and Velvety Ube.
            </p>
          </div>
        )}
      </div>

      {/* Sizes, and "Add almonds" beside them (below when there is no room) */}
      <div className="px-6">
        <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-4">
          <div className="min-w-0 max-w-full">
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
                        : "border-coral-200 bg-white text-coral-700 hover:bg-coral-50"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            )}
            {selectedSizeObj?.contents && (
              <p className="mt-1.5 text-xs text-ink/70">
                {selectedSizeObj.contents}
              </p>
            )}
          </div>
          {option && optionAvailable && (
            <div role="group" aria-labelledby={`${item.id}-option-heading`}>
              <p
                id={`${item.id}-option-heading`}
                className="text-xs font-semibold uppercase tracking-wider text-coral-700"
              >
                {option.heading}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[false, true].map((yes) => (
                  <button
                    key={String(yes)}
                    type="button"
                    aria-pressed={optionChosen === yes}
                    onClick={() => setWithOption(yes)}
                    className={cn(
                      "min-h-[44px] min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      optionChosen === yes
                        ? "border-coral-600 bg-coral-600 text-white"
                        : "border-coral-200 bg-white text-coral-700 hover:bg-coral-50"
                    )}
                  >
                    {yes ? option.yesLabel : option.noLabel}
                    {yes && optionDifference && ` ${optionDifference}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantity, and the price beside it (below when there is no room) */}
      <div className="px-6">
        <div className="mt-4 flex flex-wrap items-start gap-x-8 gap-y-4">
          <div>
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
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral-200 bg-white text-ink/70 transition-colors hover:bg-coral-50 disabled:opacity-40"
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
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral-200 bg-white text-ink/70 transition-colors hover:bg-coral-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {minLabel && (
              <p className="mt-1.5 text-xs text-ink/70">{minLabel}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-coral-700">
              Price each
            </p>
            <p className="mt-2 flex min-h-[44px] items-center text-sm font-semibold text-ink">
              {selectedPrice !== undefined
                ? formatCents(selectedPrice)
                : unavailable && (
                    <span className="font-normal text-ink/70">Not available online</span>
                  )}
            </p>
          </div>
        </div>
      </div>

      {/* Add to order */}
      <div className="flex flex-col px-6 pb-6">
        <button
          type="button"
          onClick={handleAdd}
          disabled={unavailable}
          className="mt-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-coral-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-coral-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-coral-600 disabled:hover:shadow-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          Add to order
          {selectedPrice !== undefined && ` · ${formatCents(selectedPrice * quantity)}`}
        </button>
      </div>

      <div aria-hidden="true" className="h-6" />
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
          {/* Phones: centered as a block, lines left-aligned. Tablet and up:
              each line (icon + text) centered on its own. Each icon sits in a
              first-line-high box so wrapped text stays beside it. */}
          <div className="mx-auto mt-5 flex w-fit max-w-4xl flex-col gap-2 text-left text-[15px] leading-6 text-ink/70 md:w-full md:items-center">
            <p className="flex items-start gap-2">
              <span className="flex h-6 shrink-0 items-center">
                <MapPin className="h-4 w-4 text-coral-600" />
              </span>
              <span>Free curbside pickup at {siteConfig.order.pickupLocation}</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="flex h-6 shrink-0 items-center">
                <Truck className="h-4 w-4 text-coral-600" />
              </span>
              <span>
                Delivery (${siteConfig.order.deliveryMinimum} minimum) is $5 within Summerlin and $10 to select areas of Las Vegas, including the Strip.
              </span>
            </p>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-balance text-[15px] text-ink/70">
            Order ahead or ask about same-day. We confirm every order by text or email.
          </p>
        </div>

        <div className="grid gap-x-6 sm:grid-cols-2">
          {menuItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>

        {/* Custom Orders */}
        <div className="overflow-hidden rounded-3xl border border-coral-100/80 bg-coral-50/40 p-8 sm:p-10">
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
