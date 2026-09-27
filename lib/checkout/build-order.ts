import "server-only";
import type { Square } from "square";
import { priceKey } from "@/lib/menu-data";
import { businessDateTimeToRfc3339 } from "@/lib/order-dates";
import type { CatalogMatch } from "@/lib/square/catalog";
import type { DeliveryMode } from "@/lib/square/client";
import type { ValidOrder } from "@/lib/checkout/validate";

const MAX_NOTE_LENGTH = 500;
const ASAP_PREP_TIME = "PT4H";

export class CatalogMismatchError extends Error {
  name = "CatalogMismatchError";
}

function formatScheduledDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function deliveryAddressText(f: Extract<ValidOrder["fulfillment"], { type: "delivery" }>) {
  return [f.address, f.address2, `${f.city} ${f.zip}`].filter(Boolean).join(", ");
}

/**
 * The note the owner reads in Square: timing, pickup or delivery, the address,
 * and the customer's notes. In note-only delivery mode it starts with the
 * customer's name and phone ("Name, +1… | ASAP | Delivery to …"), because there
 * is no fulfillment recipient and Square shows the card holder's name instead.
 */
export function buildOrderNote(order: ValidOrder, includeContact: boolean): string {
  const timing =
    order.timing.type === "asap"
      ? "ASAP"
      : `Scheduled: ${formatScheduledDate(order.timing.date)}, ${order.timing.window}`;
  const fulfillment =
    order.fulfillment.type === "pickup"
      ? "Curbside pickup"
      : `Delivery to ${deliveryAddressText(order.fulfillment)}`;
  const parts = [timing, fulfillment];
  if (includeContact) {
    parts.unshift(`${order.customer.name}, ${order.customer.phoneE164}`);
  }
  const base = parts.join(" | ");
  if (!order.notes) return base.slice(0, MAX_NOTE_LENGTH);
  const prefix = `${base} | Customer notes: `;
  const room = MAX_NOTE_LENGTH - prefix.length;
  if (room <= 0) return base.slice(0, MAX_NOTE_LENGTH);
  const notes = order.notes.length > room ? `${order.notes.slice(0, room - 1)}…` : order.notes;
  return prefix + notes;
}

export function buildPaymentLinkRequest(params: {
  order: ValidOrder;
  catalog: CatalogMatch;
  locationId: string;
  deliveryMode: DeliveryMode;
  redirectUrl: string;
}): Square.checkout.CreatePaymentLinkRequest {
  const { order, catalog, locationId, deliveryMode, redirectUrl } = params;

  const lineItems: Square.OrderLineItem[] = order.lines.map(({ variant, quantity }) => {
    const match = catalog.variations[priceKey(variant.item.id, variant.flavor, variant.size)];
    if (!match) throw new CatalogMismatchError();
    return { catalogObjectId: match.variationId, quantity: String(quantity) };
  });

  const scheduled = order.timing.type === "scheduled";
  const scheduledAt =
    order.timing.type === "scheduled"
      ? businessDateTimeToRfc3339(order.timing.date, order.timing.startHour, order.timing.startMinute)
      : undefined;

  const recipient: Square.FulfillmentRecipient = {
    displayName: order.customer.name,
    emailAddress: order.customer.email,
    phoneNumber: order.customer.phoneE164,
  };

  const noteOnlyDelivery =
    order.fulfillment.type === "delivery" && deliveryMode === "note_only";
  const note = buildOrderNote(order, noteOnlyDelivery);

  let fulfillments: Square.Fulfillment[] | undefined;
  if (order.fulfillment.type === "pickup") {
    fulfillments = [
      {
        type: "PICKUP",
        state: "PROPOSED",
        pickupDetails: {
          recipient,
          scheduleType: scheduled ? "SCHEDULED" : "ASAP",
          ...(scheduled ? { pickupAt: scheduledAt } : { prepTimeDuration: ASAP_PREP_TIME }),
          note,
        },
      },
    ];
  } else if (!noteOnlyDelivery) {
    const f = order.fulfillment;
    fulfillments = [
      {
        type: "DELIVERY",
        state: "PROPOSED",
        deliveryDetails: {
          recipient: {
            ...recipient,
            address: {
              addressLine1: f.address,
              ...(f.address2 ? { addressLine2: f.address2 } : {}),
              locality: f.city,
              administrativeDistrictLevel1: "NV",
              postalCode: f.zip,
              country: "US",
            },
          },
          scheduleType: scheduled ? "SCHEDULED" : "ASAP",
          ...(scheduled ? { deliverAt: scheduledAt } : { prepTimeDuration: ASAP_PREP_TIME }),
          note,
        },
      },
    ];
  }

  const serviceCharges: Square.OrderServiceCharge[] | undefined =
    order.fulfillment.type === "delivery"
      ? [
          {
            name: `Delivery (${order.fulfillment.zone})`,
            amountMoney: {
              amount: BigInt(Math.round(order.fulfillment.feeDollars * 100)),
              currency: "USD",
            },
            calculationPhase: "SUBTOTAL_PHASE",
            taxable: false,
          },
        ]
      : undefined;

  return {
    idempotencyKey: order.idempotencyKey,
    order: {
      locationId,
      lineItems,
      pricingOptions: { autoApplyTaxes: true },
      ...(serviceCharges ? { serviceCharges } : {}),
      ...(fulfillments ? { fulfillments } : {}),
    },
    checkoutOptions: {
      allowTipping: false,
      redirectUrl,
      askForShippingAddress: false,
    },
    // Square rejects buyer email together with a fulfillment; with a
    // fulfillment, the recipient's email and phone pre-fill the checkout page.
    ...(fulfillments
      ? {}
      : {
          prePopulatedData: {
            buyerEmail: order.customer.email,
            buyerPhoneNumber: order.customer.phoneE164,
          },
        }),
    paymentNote: note,
  };
}
