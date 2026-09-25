"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import {
  CalendarHeart,
  Mail,
  MessageSquare,
  Package,
  Table2,
  Store,
} from "lucide-react";

const packages = [
  {
    icon: Package,
    title: "Packaged favors",
    description: "Gift bags and sampler boxes for guests to take home.",
    price: "From $5 per person",
  },
  {
    icon: Table2,
    title: "Dessert table",
    description: "A full assortment of mochi treats, arranged for self-serve.",
    price: "From $4.75 per person",
  },
  {
    icon: Store,
    title: "Hosted mochi bar",
    description:
      "A staffed tasting station for receptions and conferences.",
    price: "From $1,500",
  },
];

const requestTypes = [
  "Custom order",
  "Large order",
  "Office or corporate event",
  "Wedding",
  "Party",
  "Other",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  dateNeeded: string;
  guestCount: string;
  requestType: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  dateNeeded: "",
  guestCount: "",
  requestType: "",
  message: "",
};

function CateringForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const preselect = searchParams.get("request");
    if (preselect && requestTypes.includes(preselect)) {
      setForm((prev) => ({ ...prev, requestType: preselect }));
    }
  }, [searchParams]);

  function updateField(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (siteConfig.inquiryFormEndpoint) {
      try {
        const res = await fetch(siteConfig.inquiryFormEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Request failed");
        setSubmitted(true);
      } catch {
        setError("Something went wrong. Please try again or email us directly.");
      }
    } else {
      const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nDate needed: ${form.dateNeeded}\nGuest count or quantity: ${form.guestCount}\nRequest type: ${form.requestType}\nMessage: ${form.message}`;
      window.location.href = `mailto:${siteConfig.contact.email}?subject=Catering Inquiry&body=${encodeURIComponent(body)}`;
      setSubmitted(true);
    }
  }

  return (
    <>
      {submitted ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-coral-100">
          <p className="text-pretty text-lg text-ink/80">
            Thank you. We will reply, usually within {siteConfig.responseTime}.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-coral-100 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Name <span className="text-coral-600">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={updateField}
                className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Email <span className="text-coral-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={updateField}
                className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-ink">
                Phone <span className="text-ink/40">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dateNeeded"
                className="text-sm font-medium text-ink"
              >
                Date needed <span className="text-coral-600">*</span>
              </label>
              <input
                id="dateNeeded"
                name="dateNeeded"
                type="date"
                required
                value={form.dateNeeded}
                onChange={updateField}
                className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="guestCount"
                className="text-sm font-medium text-ink"
              >
                Guest count or quantity{" "}
                <span className="text-coral-600">*</span>
              </label>
              <input
                id="guestCount"
                name="guestCount"
                type="text"
                required
                value={form.guestCount}
                onChange={updateField}
                className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="requestType"
                className="text-sm font-medium text-ink"
              >
                Request type <span className="text-coral-600">*</span>
              </label>
              <select
                id="requestType"
                name="requestType"
                required
                value={form.requestType}
                onChange={updateField}
                className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
              >
                <option value="" disabled>
                  Select a request type
                </option>
                {requestTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-ink">
              Message <span className="text-ink/40">(optional)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={updateField}
              className="w-full rounded-lg border border-coral-200 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-coral-500 focus:ring-2 focus:ring-coral-200"
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-coral-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-coral-700 hover:shadow-lg hover:-translate-y-0.5 sm:w-auto"
          >
            <CalendarHeart className="h-5 w-5" />
            Send inquiry
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-pretty text-[15px] text-ink/70">
        Prefer to talk it through?{" "}
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="font-semibold text-coral-700 transition-colors hover:text-coral-600"
        >
          Email {siteConfig.contact.email}
        </a>{" "}
        or text{" "}
        <a
          href={siteConfig.contact.smsHref}
          className="font-semibold text-coral-700 transition-colors hover:text-coral-600"
        >
          {siteConfig.contact.phoneDisplay}
        </a>
        .
      </p>
    </>
  );
}

export default function CateringPage() {
  return (
    <div className="flex flex-col">
      {/* Catering Hero */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/catering/catering.JPG"
            alt="Assorted mochi desserts arranged on a table for a catered event"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hero-gradient" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-24">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Mochi for your next gathering
            </h1>
            <p className="mt-5 text-pretty text-lg text-white/90 sm:text-xl">
              Handmade mochi treats for weddings, offices, parties, and gifts.
            </p>
            <div className="mt-8">
              <a
                href="#inquiry"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-coral-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-coral-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                <CalendarHeart className="h-5 w-5" />
                Send an inquiry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-coral-600">
              Catering packages
            </p>
            <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
              Three ways to serve mochi at your event
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.title}
                className="group flex flex-col rounded-3xl border border-coral-100/80 bg-white p-8 transition-all duration-300 hover:border-coral-200 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-200/70 transition-colors duration-300 group-hover:bg-coral-300">
                  <pkg.icon className="h-7 w-7 text-coral-700" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink">
                  {pkg.title}
                </h3>
                <p className="mt-3 flex-1 text-pretty text-[15px] leading-relaxed text-ink/70">
                  {pkg.description}
                </p>
                <p className="mt-6 text-sm font-semibold text-coral-700">
                  {pkg.price}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-pretty text-[15px] text-ink/70">
            Every event is different. We will send a proposal that fits yours.
          </p>
        </div>
      </section>

      {/* Inquiry form */}
      <section
        id="inquiry"
        className="scroll-mt-24 bg-coral-50/40 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
              Tell us what you need.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-pretty text-[15px] text-ink/70">
              For large orders, catering, or other special requests, we will
              reply with a quote.
            </p>
          </div>

          <Suspense fallback={null}>
            <CateringForm />
          </Suspense>
        </div>
      </section>

      {/* Lead time */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-pretty text-[15px] text-ink/70">
            Please contact us at least 24 to 48 hours ahead. Larger events need
            more notice.
          </p>
        </div>
      </section>
    </div>
  );
}
