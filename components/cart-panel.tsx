"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart, type CartLine } from "@/lib/cart-context";
import { formatMinimum } from "@/lib/menu-data";
import { siteConfig } from "@/lib/site-config";
import {
  ADDRESS_ZIP_MISMATCH_MESSAGE,
  addressZipMismatch,
  deliveryMinimumMessage,
  deliveryShortfallCents,
  getDeliveryFee,
  formatFee,
  isValidZip,
  isSummerlinZip,
} from "@/lib/delivery-fee";
import { formatCents, usePriceLookup } from "@/lib/prices-context";
import { businessDateString, isWithinLeadTime } from "@/lib/order-dates";
import { X, Minus, Plus, Trash2, ShoppingBag, Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type TimingChoice = "asap" | "scheduled" | "";

type CheckoutInfo = {
  name: string;
  phone: string;
  email: string;
  fulfillment: "pickup" | "delivery" | "";
  address: string;
  address2: string;
  city: string;
  zip: string;
  timing: TimingChoice;
  date: string;
  timeWindow: string;
  notes: string;
};

const initialCheckout: CheckoutInfo = {
  name: "",
  phone: "",
  email: "",
  fulfillment: "",
  address: "",
  address2: "",
  city: "Las Vegas",
  zip: "",
  timing: "",
  date: "",
  timeWindow: "",
  notes: "",
};

function lineDetails(line: CartLine): string {
  const details = [line.flavor, line.size].filter(Boolean).join(" · ");
  return line.minQuantity > 1
    ? `${details} (${formatMinimum(line.minQuantity, line.quantityLabel)} minimum)`
    : details;
}

const CHECKOUT_FAILED_MESSAGE =
  "We could not start checkout. Please try again, or order through our Square shop.";

type CheckoutError = { message: string; showShopLink: boolean };

/**
 * The order request for /api/checkout: only what the customer chose. Prices,
 * fees, and taxes are calculated on the server from Square.
 */
function buildCheckoutRequest(
  lines: CartLine[],
  checkout: CheckoutInfo,
  idempotencyKey: string
) {
  return {
    idempotencyKey,
    lines: lines.map((l) => ({
      itemId: l.itemId,
      flavor: l.flavor,
      size: l.size,
      quantity: l.quantity,
    })),
    customer: { name: checkout.name, phone: checkout.phone, email: checkout.email },
    fulfillment:
      checkout.fulfillment === "delivery"
        ? {
            type: "delivery",
            address: checkout.address,
            address2: checkout.address2,
            city: checkout.city,
            zip: checkout.zip,
          }
        : { type: "pickup" },
    timing:
      checkout.timing === "scheduled"
        ? { type: "scheduled", date: checkout.date, window: checkout.timeWindow }
        : { type: "asap" },
    notes: checkout.notes,
  };
}

export function CartPanel() {
  const {
    lines,
    isOpen,
    closeCart,
    updateQuantity,
    removeLine,
    totalCount,
  } = useCart();
  const priceOf = usePriceLookup();
  const [checkout, setCheckout] = useState<CheckoutInfo>(initialCheckout);
  const [showSummary, setShowSummary] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<CheckoutError | null>(null);

  // When the customer comes back from Square with the browser's Back button,
  // the browser may restore this page from its back-forward cache exactly as it
  // was, still "Starting checkout…". Reset so "Edit order" and "Confirm order"
  // work again, with a new idempotency key so confirming creates a new link.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      setSubmitting(false);
      setCheckoutError(null);
      setIdempotencyKey(crypto.randomUUID());
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  if (!isOpen) return null;

  const today = businessDateString();
  const unitPrice = (line: CartLine) => priceOf(line.itemId, line.flavor, line.size);
  const allLinesPriced = lines.length > 0 && lines.every((l) => unitPrice(l) !== undefined);
  const subtotalCents = allLinesPriced
    ? lines.reduce((sum, l) => sum + (unitPrice(l) ?? 0) * l.quantity, 0)
    : null;
  const zipValid = isValidZip(checkout.zip);
  const feeAmount =
    checkout.fulfillment === "pickup"
      ? getDeliveryFee("pickup")
      : checkout.fulfillment === "delivery"
        ? getDeliveryFee("delivery", checkout.zip)
        : null;
  const outsideDeliveryArea =
    checkout.fulfillment === "delivery" && zipValid && feeAmount === null;
  const zipMismatch =
    checkout.fulfillment === "delivery" &&
    addressZipMismatch(checkout.address, checkout.address2, checkout.zip);
  const estimatedTotalCents =
    subtotalCents !== null && feeAmount !== null
      ? subtotalCents + feeAmount * 100
      : null;
  // Delivery only: the items subtotal must reach the minimum. Recomputed on
  // every render, so adding items or choosing pickup clears it at once.
  const deliveryShortfall =
    checkout.fulfillment === "delivery" && subtotalCents !== null
      ? deliveryShortfallCents("delivery", subtotalCents)
      : 0;
  const belowDeliveryMinimum = deliveryShortfall > 0;

  const deliveryFeeLabel =
    checkout.fulfillment === "pickup"
      ? "Free"
      : feeAmount !== null
        ? formatFee(feeAmount)
        : outsideDeliveryArea
          ? "Not available"
          : "Enter ZIP code";

  function updateField(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setCheckout({ ...checkout, [e.target.name]: e.target.value });
  }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!checkout.fulfillment) {
      setTriedSubmit(true);
      return;
    }
    if (belowDeliveryMinimum) return;
    if (
      checkout.fulfillment === "delivery" &&
      (!zipValid || outsideDeliveryArea || zipMismatch)
    ) {
      setTriedSubmit(true);
      return;
    }
    if (!checkout.timing) {
      setTriedSubmit(true);
      return;
    }
    if (checkout.timing === "scheduled" && !checkout.timeWindow) {
      setTriedSubmit(true);
      return;
    }
    // One idempotency key per review: retries and double clicks reuse it, so
    // Square returns the same checkout; "Edit order" starts a new one.
    setIdempotencyKey(crypto.randomUUID());
    setCheckoutError(null);
    setShowSummary(true);
  }

  function handleEditOrder() {
    setCheckoutError(null);
    setShowSummary(false);
  }

  async function handleConfirm() {
    if (submitting || belowDeliveryMinimum) return;
    setSubmitting(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCheckoutRequest(lines, checkout, idempotencyKey)),
      });
      const data: { url?: string; message?: string } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.url) {
        // Leave the site for Square's hosted checkout; the cart is cleared on
        // /order-confirmed after payment.
        window.location.assign(data.url);
        return;
      }
      setCheckoutError(
        data.message
          ? { message: data.message, showShopLink: false }
          : { message: CHECKOUT_FAILED_MESSAGE, showShopLink: true }
      );
    } catch {
      setCheckoutError({ message: CHECKOUT_FAILED_MESSAGE, showShopLink: true });
    }
    setSubmitting(false);
  }

  const timingLabel =
    checkout.timing === "asap"
      ? "As soon as possible"
      : checkout.timing === "scheduled"
        ? `${checkout.date} · ${checkout.timeWindow}`
        : "";

  function renderDeliveryMinimumNotice() {
    if (!belowDeliveryMinimum) return null;
    return (
      <p
        id="delivery-minimum-notice"
        className="rounded-xl bg-coral-50 p-3 text-pretty text-sm font-medium text-coral-700"
      >
        {deliveryMinimumMessage(deliveryShortfall)}
      </p>
    );
  }

  function renderOrderSummary() {
    return (
      <div className="space-y-2 rounded-xl border border-coral-100 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-ink/70">Subtotal</span>
          <span className="font-medium text-ink">
            {subtotalCents !== null ? formatCents(subtotalCents) : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/70">
            {checkout.fulfillment === "pickup" ? "Pickup" : "Delivery"}
          </span>
          <span className="font-medium text-ink">{deliveryFeeLabel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/70">Tax</span>
          <span className="text-ink/50">Calculated at checkout</span>
        </div>
        <div className="flex justify-between border-t border-coral-100 pt-2 text-sm">
          <span className="font-semibold text-ink">Estimated total</span>
          <span className="font-semibold text-ink">
            {estimatedTotalCents !== null ? formatCents(estimatedTotalCents) : "—"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full flex-col bg-white shadow-2xl sm:w-[440px]",
          "animate-fade-in"
        )}
        role="dialog"
        aria-label="Your order"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-coral-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <ShoppingBag className="h-5 w-5 text-coral-600" />
            Your order
            {totalCount > 0 && (
              <span className="ml-1 rounded-full bg-coral-100 px-2 py-0.5 text-xs font-semibold text-coral-700">
                {totalCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/60 transition-colors hover:text-coral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {showSummary ? (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink/50">
                  Order summary
                </h3>
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="border-b border-coral-50 py-3 text-sm"
                  >
                    <p className="font-medium text-ink">{line.name}</p>
                    <p className="text-ink/60">
                      {lineDetails(line)} · Qty {line.quantity}
                    </p>
                    {unitPrice(line) !== undefined && (
                      <p className="text-ink/60">
                        {formatCents(unitPrice(line)!)} each
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {renderOrderSummary()}
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-ink/50">
                  Customer details
                </h3>
                <dl className="space-y-1 text-sm text-ink/70">
                  <div>
                    <dt className="inline font-medium">Name: </dt>
                    <dd className="inline">{checkout.name}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Phone: </dt>
                    <dd className="inline">{checkout.phone}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Email: </dt>
                    <dd className="inline">{checkout.email}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Fulfillment: </dt>
                    <dd className="inline">
                      {checkout.fulfillment === "pickup"
                        ? "Curbside pickup"
                        : `Delivery to ${checkout.address}, ${checkout.city}, ${checkout.zip}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Timing: </dt>
                    <dd className="inline">{timingLabel}</dd>
                  </div>
                  {checkout.notes && (
                    <div>
                      <dt className="inline font-medium">Notes: </dt>
                      <dd className="inline">{checkout.notes}</dd>
                    </div>
                  )}
                </dl>
              </div>
              {checkoutError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3">
                  <p className="text-pretty text-sm text-red-700">
                    {checkoutError.showShopLink ? (
                      <>
                        We could not start checkout. Please try again, or order
                        through{" "}
                        <a
                          href={siteConfig.squareShopUrl}
                          className="font-medium underline underline-offset-2"
                        >
                          our Square shop
                        </a>
                        .
                      </>
                    ) : (
                      checkoutError.message
                    )}
                  </p>
                </div>
              )}
              <div aria-live="polite">{renderDeliveryMinimumNotice()}</div>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting || belowDeliveryMinimum}
                aria-describedby={belowDeliveryMinimum ? "delivery-minimum-notice" : undefined}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-coral-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-coral-700 disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {submitting ? "Starting checkout…" : "Confirm order"}
              </button>
              <p className="text-pretty text-xs text-ink/50">
                {"You'll pay on Square's secure page. To change your order, use your browser's Back button."}
              </p>
              <button
                type="button"
                onClick={handleEditOrder}
                disabled={submitting}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border-2 border-coral-300 px-6 py-3 text-base font-semibold text-coral-700 transition-all duration-200 hover:border-coral-400 hover:bg-coral-100"
              >
                <Pencil className="h-4 w-4" />
                Edit order
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-coral-200" />
              <p className="mt-4 text-pretty text-ink/60">
                Your order is empty. Add some treats from the menu.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart lines */}
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex gap-3 rounded-xl border border-coral-50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {line.name}
                    </p>
                    <p className="text-xs text-ink/60">{lineDetails(line)}</p>
                    {unitPrice(line) !== undefined && (
                      <p className="mt-1 text-xs text-ink/60">
                        {formatCents(unitPrice(line)!)}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.id, line.quantity - 1)
                        }
                        disabled={line.quantity <= line.minQuantity}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral-200 text-ink/70 transition-colors hover:bg-coral-100 disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-medium text-ink">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.id, line.quantity + 1)
                        }
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-coral-200 text-ink/70 transition-colors hover:bg-coral-100"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/40 transition-colors hover:text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Checkout form */}
              <form
                id="cart-checkout-form"
                onSubmit={handleCheckout}
                className="space-y-4 border-t border-coral-100 pt-4"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/50">
                  Checkout
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="ck-name" className="text-sm font-medium text-ink">
                    Name <span className="text-coral-600">*</span>
                  </label>
                  <input
                    id="ck-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={checkout.name}
                    onChange={updateField}
                    className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ck-phone" className="text-sm font-medium text-ink">
                    Mobile phone <span className="text-coral-600">*</span>
                  </label>
                  <input
                    id="ck-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={checkout.phone}
                    onChange={updateField}
                    className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                  />
                  <p className="text-xs text-ink/50">
                    We will text you to confirm your order.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="ck-email" className="text-sm font-medium text-ink">
                    Email <span className="text-coral-600">*</span>
                  </label>
                  <input
                    id="ck-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={checkout.email}
                    onChange={updateField}
                    className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                  />
                  <p className="text-xs text-ink/50">For your receipt.</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-ink">
                    Pickup or delivery <span className="text-coral-600">*</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCheckout({ ...checkout, fulfillment: "pickup" })
                      }
                      className={cn(
                        "min-h-[44px] min-w-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        checkout.fulfillment === "pickup"
                          ? "border-coral-600 bg-coral-600 text-white"
                          : "border-coral-200 text-ink/70 hover:bg-coral-100"
                      )}
                    >
                      Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCheckout({ ...checkout, fulfillment: "delivery" })
                      }
                      className={cn(
                        "min-h-[44px] min-w-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        checkout.fulfillment === "delivery"
                          ? "border-coral-600 bg-coral-600 text-white"
                          : "border-coral-200 text-ink/70 hover:bg-coral-100"
                      )}
                    >
                      Delivery
                    </button>
                  </div>
                  {triedSubmit && !checkout.fulfillment && (
                    <p className="text-xs text-red-600">
                      Please choose pickup or delivery.
                    </p>
                  )}
                  {checkout.fulfillment === "pickup" && (
                    <p className="text-xs text-ink/50">
                      Curbside pickup at {siteConfig.order.pickupLocation}.
                    </p>
                  )}
                </div>

                {checkout.fulfillment === "delivery" && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="ck-address"
                        className="text-sm font-medium text-ink"
                      >
                        Street address <span className="text-coral-600">*</span>
                      </label>
                      <input
                        id="ck-address"
                        name="address"
                        type="text"
                        autoComplete="address-line1"
                        placeholder="Street address only (e.g., 123 Main St)"
                        required={checkout.fulfillment === "delivery"}
                        value={checkout.address}
                        onChange={updateField}
                        className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="ck-address2"
                        className="text-sm font-medium text-ink"
                      >
                        Apt, suite, etc.{" "}
                        <span className="text-ink/40">(optional)</span>
                      </label>
                      <input
                        id="ck-address2"
                        name="address2"
                        type="text"
                        autoComplete="address-line2"
                        value={checkout.address2}
                        onChange={updateField}
                        className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="ck-city"
                          className="text-sm font-medium text-ink"
                        >
                          City <span className="text-coral-600">*</span>
                        </label>
                        <input
                          id="ck-city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          required={checkout.fulfillment === "delivery"}
                          value={checkout.city}
                          onChange={updateField}
                          className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="ck-zip"
                          className="text-sm font-medium text-ink"
                        >
                          ZIP code <span className="text-coral-600">*</span>
                        </label>
                        <input
                          id="ck-zip"
                          name="zip"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={5}
                          pattern="\d{5}"
                          required={checkout.fulfillment === "delivery"}
                          value={checkout.zip}
                          onChange={updateField}
                          className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                        />
                      </div>
                    </div>

                    {triedSubmit && !zipValid && (
                      <p className="text-xs text-red-600">
                        Please enter a 5-digit ZIP code.
                      </p>
                    )}

                    {zipMismatch && (
                      <p className="text-xs text-red-600">
                        {ADDRESS_ZIP_MISMATCH_MESSAGE}
                      </p>
                    )}

                    {outsideDeliveryArea && (
                      <p className="text-xs text-red-600">
                        Sorry, this address is outside our delivery area.
                        Please choose curbside pickup, or{" "}
                        <Link
                          href="/catering#inquiry"
                          onClick={closeCart}
                          className="font-medium underline underline-offset-2"
                        >
                          contact us
                        </Link>
                        .
                      </p>
                    )}

                    {zipValid && feeAmount !== null && (
                      <p className="text-xs font-medium text-coral-700">
                        Delivery fee: {formatFee(feeAmount)}{" "}
                        ({isSummerlinZip(checkout.zip) ? "Summerlin" : "outside Summerlin"})
                      </p>
                    )}
                  </>
                )}

                {/* Timing choice */}
                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-ink">
                    Timing <span className="text-coral-600">*</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCheckout({ ...checkout, timing: "asap" })
                      }
                      className={cn(
                        "min-h-[44px] min-w-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        checkout.timing === "asap"
                          ? "border-coral-600 bg-coral-600 text-white"
                          : "border-coral-200 text-ink/70 hover:bg-coral-100"
                      )}
                    >
                      As soon as possible
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCheckout({ ...checkout, timing: "scheduled" })
                      }
                      className={cn(
                        "min-h-[44px] min-w-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-all",
                        checkout.timing === "scheduled"
                          ? "border-coral-600 bg-coral-600 text-white"
                          : "border-coral-200 text-ink/70 hover:bg-coral-100"
                      )}
                    >
                      Schedule for later
                    </button>
                  </div>
                  {triedSubmit && !checkout.timing && (
                    <p className="text-xs text-red-600">
                      Please choose a timing option.
                    </p>
                  )}
                </div>

                {checkout.timing === "asap" && (
                  <div className="rounded-lg bg-coral-50 px-3 py-2">
                    <p className="text-pretty text-xs text-ink/60">
                      We will reach out to confirm your order and let you know
                      when it will be ready. Same-day orders depend on
                      availability.
                    </p>
                  </div>
                )}

                {checkout.timing === "scheduled" && (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="ck-date"
                        className="text-sm font-medium text-ink"
                      >
                        Preferred date <span className="text-coral-600">*</span>
                      </label>
                      <input
                        id="ck-date"
                        name="date"
                        type="date"
                        required={checkout.timing === "scheduled"}
                        min={today}
                        value={checkout.date}
                        onChange={updateField}
                        className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                      />
                      {checkout.date &&
                        isWithinLeadTime(checkout.date, siteConfig.order.leadTimeHours) && (
                        <p className="text-xs text-ink/55">
                          Same-day and rush orders depend on availability. We
                          will reach out to confirm.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-sm font-medium text-ink">
                        Preferred time window{" "}
                        <span className="text-coral-600">*</span>
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {siteConfig.order.pickupWindows.map((window) => (
                          <button
                            key={window}
                            type="button"
                            onClick={() =>
                              setCheckout({ ...checkout, timeWindow: window })
                            }
                            className={cn(
                              "min-h-[44px] min-w-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-all",
                              checkout.timeWindow === window
                                ? "border-coral-600 bg-coral-600 text-white"
                                : "border-coral-200 text-ink/70 hover:bg-coral-100"
                            )}
                          >
                            {window}
                          </button>
                        ))}
                      </div>
                      {triedSubmit && !checkout.timeWindow && (
                        <p className="text-xs text-red-600">
                          Please choose a time window.
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="ck-notes"
                    className="text-sm font-medium text-ink"
                  >
                    Notes <span className="text-ink/40">(optional)</span>
                  </label>
                  <textarea
                    id="ck-notes"
                    name="notes"
                    rows={3}
                    value={checkout.notes}
                    onChange={updateField}
                    className="w-full rounded-lg border border-coral-200 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
                  />
                </div>

                {/* Order summary */}
                {renderOrderSummary()}

                {/* Confirmation note */}
                <div className="rounded-xl bg-coral-50 p-3">
                  <p className="text-pretty text-xs text-ink/60">
                    You will receive a confirmation text message and/or email,
                    usually within {siteConfig.order.confirmationTime}, with an
                    estimate of when your order will be ready. If the timing
                    does not work, we will find another time or give you a full
                    refund.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sticky bar with total and pay button */}
        {!showSummary && lines.length > 0 && (
          <div className="border-t border-coral-100 bg-white px-5 py-3">
            <div aria-live="polite" className={belowDeliveryMinimum ? "mb-3" : undefined}>
              {renderDeliveryMinimumNotice()}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0">
                <p className="text-xs text-ink/50">Estimated total</p>
                <p className="text-lg font-semibold text-ink">
                  {estimatedTotalCents !== null
                    ? formatCents(estimatedTotalCents)
                    : "—"}
                </p>
              </div>
              <button
                type="submit"
                form="cart-checkout-form"
                disabled={belowDeliveryMinimum}
                aria-describedby={belowDeliveryMinimum ? "delivery-minimum-notice" : undefined}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-coral-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-coral-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-coral-600 disabled:hover:shadow-md"
              >
                <Lock className="h-4 w-4 shrink-0" />
                <span>Continue to secure payment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
