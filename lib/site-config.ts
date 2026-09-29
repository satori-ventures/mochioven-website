export const siteConfig = {
  name: "The Mochi Oven",
  tagline: "Asian-inspired mochi treats, handmade in Summerlin, Las Vegas.",
  location: "Summerlin, Las Vegas",
  squareShopUrl: "https://themochiovenbakery.square.site",
  instagram: {
    handle: "@themochiovenbakery",
    url: "https://www.instagram.com/themochiovenbakery/",
  },
  contact: {
    email: "hello@mochioven.com",
    phoneDisplay: "(702) 706-6255",
    phoneHref: "tel:+17027066255",
    smsHref: "sms:+17027066255",
  },
  inquiryFormEndpoint: "https://formspree.io/f/mkjgzqld",
  responseTime: "4 hours",
  order: {
    mode: "cart" as "cart" | "square_store",
    leadTimeHours: 48,
    pickupWindows: ["9am–11am", "11am–1pm", "1pm–3pm", "3pm–6pm"],
    pickupLocation: "Crossbridge Dr. & Oatwood Mast Ave",
    pickupFee: 0,
    summerlinDeliveryFee: 5,
    outsideSummerlinDeliveryFee: 10,
    /** Delivery only: the subtotal before the delivery fee and tax, in dollars. */
    deliveryMinimum: 45,
    summerlinZips: ["89134", "89135", "89138", "89144"],
    deliveryZipsOutsideSummerlin: [
      "89109", "89117", "89128", "89129", "89145", "89147", "89148",
      "89149", "89178",
    ],
    confirmationTime: "4 hours",
  },
  nav: [
    { label: "Catering", href: "/catering" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
