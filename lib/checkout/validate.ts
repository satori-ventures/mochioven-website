import "server-only";
import { z } from "zod";
import { findMenuVariant, type MenuVariant } from "@/lib/menu-data";
import {
  ADDRESS_ZIP_MISMATCH_MESSAGE,
  addressZipMismatch,
  getDeliveryFee,
} from "@/lib/delivery-fee";
import { siteConfig } from "@/lib/site-config";
import {
  addDays,
  businessDateString,
  isValidDateString,
  parseWindowStart,
} from "@/lib/order-dates";

export const MAX_BODY_BYTES = 16 * 1024;
const MAX_LINES = 20;
const MAX_LINE_QUANTITY = 50;
const MAX_DAYS_AHEAD = 90;

// The browser sends only what the customer chose. Any prices, fees, or totals
// in the request are ignored (unknown keys are stripped).
const requestSchema = z.object({
  idempotencyKey: z.string().uuid(),
  lines: z
    .array(
      z.object({
        itemId: z.string().max(60),
        flavor: z.string().max(60),
        size: z.string().max(60),
        quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
      })
    )
    .min(1)
    .max(MAX_LINES),
  customer: z.object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().max(30),
    email: z.string().trim().max(254),
  }),
  fulfillment: z.discriminatedUnion("type", [
    z.object({ type: z.literal("pickup") }),
    z.object({
      type: z.literal("delivery"),
      address: z.string().trim().min(1).max(200),
      address2: z.string().trim().max(100).default(""),
      city: z.string().trim().min(1).max(100),
      zip: z.string().trim().max(10),
    }),
  ]),
  timing: z.discriminatedUnion("type", [
    z.object({ type: z.literal("asap") }),
    z.object({
      type: z.literal("scheduled"),
      date: z.string().max(10),
      window: z.string().max(40),
    }),
  ]),
  notes: z.string().trim().max(300).default(""),
});

export type ValidOrderLine = { variant: MenuVariant; quantity: number };

export type ValidOrder = {
  idempotencyKey: string;
  lines: ValidOrderLine[];
  customer: { name: string; phoneE164: string; email: string };
  fulfillment:
    | { type: "pickup" }
    | {
        type: "delivery";
        address: string;
        address2: string;
        city: string;
        zip: string;
        feeDollars: number;
        zone: "Summerlin" | "Las Vegas";
      };
  timing:
    | { type: "asap" }
    | { type: "scheduled"; date: string; window: string; startHour: number; startMinute: number };
  notes: string;
};

/**
 * A validation failure. `reason` is logged; `message` is safe to show to the
 * customer (never includes their input).
 */
export class OrderValidationError extends Error {
  name = "OrderValidationError";
  reason: string;
  customerMessage?: string;
  /** Names of the request fields that failed (never their values). */
  fields?: string[];
  constructor(reason: string, customerMessage?: string, fields?: string[]) {
    super(reason);
    this.reason = reason;
    this.customerMessage = customerMessage;
    this.fields = fields;
  }
}

function fail(reason: string, customerMessage?: string, fields?: string[]): never {
  throw new OrderValidationError(reason, customerMessage, fields);
}

/** US phone numbers only: 10 digits, optional leading 1, any formatting. */
function toE164(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  return `+1${digits}`;
}

const emailSchema = z.string().email();

export function validateOrderRequest(body: unknown): ValidOrder {
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    fail(
      "invalid_request_shape",
      undefined,
      Array.from(new Set(parsed.error.issues.map((i) => i.path.join(".") || "(body)"))).slice(0, 10)
    );
  }
  const req = parsed.data;

  const lines = req.lines.map((line) => {
    const variant = findMenuVariant(line.itemId, line.flavor, line.size);
    if (!variant) fail("unknown_menu_item");
    if (line.quantity < variant.item.minQuantity) fail("below_minimum");
    return { variant, quantity: line.quantity };
  });

  const phoneE164 = toE164(req.customer.phone);
  if (!phoneE164) {
    fail("invalid_phone", "Please enter a 10-digit US mobile phone number.");
  }
  if (!emailSchema.safeParse(req.customer.email).success) {
    fail("invalid_email", "Please enter a valid email address.");
  }

  let fulfillment: ValidOrder["fulfillment"];
  if (req.fulfillment.type === "delivery") {
    const fee = getDeliveryFee("delivery", req.fulfillment.zip);
    if (fee === null) {
      fail(
        "delivery_zip_rejected",
        "Sorry, this address is outside our delivery area. Please choose curbside pickup."
      );
    }
    const { address, address2, zip } = req.fulfillment;
    if (addressZipMismatch(address, address2, zip)) {
      fail("address_zip_mismatch", ADDRESS_ZIP_MISMATCH_MESSAGE);
    }
    fulfillment = {
      ...req.fulfillment,
      feeDollars: fee,
      zone:
        fee === siteConfig.order.summerlinDeliveryFee ? "Summerlin" : "Las Vegas",
    };
  } else {
    fulfillment = { type: "pickup" };
  }

  let timing: ValidOrder["timing"];
  if (req.timing.type === "scheduled") {
    const { date, window } = req.timing;
    const today = businessDateString();
    if (!isValidDateString(date) || date < today) {
      fail("invalid_date", "Please choose a date from today onward.");
    }
    if (date > addDays(today, MAX_DAYS_AHEAD)) {
      fail("date_too_far", `Please choose a date within the next ${MAX_DAYS_AHEAD} days.`);
    }
    const start = parseWindowStart(window);
    if (!(siteConfig.order.pickupWindows as readonly string[]).includes(window) || !start) {
      fail("invalid_window", "Please choose a time window.");
    }
    timing = { type: "scheduled", date, window, startHour: start.hour, startMinute: start.minute };
  } else {
    timing = { type: "asap" };
  }

  return {
    idempotencyKey: req.idempotencyKey,
    lines,
    customer: { name: req.customer.name, phoneE164, email: req.customer.email.trim() },
    fulfillment,
    timing,
    notes: req.notes,
  };
}
