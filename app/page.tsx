import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { MenuSection } from "@/components/menu-section";
import {
  ShoppingBag,
  CalendarHeart,
  ListChecks,
  Truck,
  ShieldCheck,
} from "lucide-react";

const orderSteps = [
  {
    icon: ListChecks,
    title: "Build your order",
    text: "Choose your treats, flavors, and sizes. Order at least 24 to 48 hours ahead. Same-day orders may be possible depending on availability.",
  },
  {
    icon: Truck,
    title: "Choose pickup or delivery",
    text: "Curbside pickup at Crossbridge Dr. & Oatwood Mast Ave is free. Delivery is $5 within Summerlin and $10 outside Summerlin.",
  },
  {
    icon: ShieldCheck,
    title: "Pay, then we confirm",
    text: "Pay securely through Square. You will receive a confirmation text message and/or email, usually within 1 to 4 hours, with an estimate of when your order will be ready. If the timing does not work, we will find another time or give you a full refund.",
  },
];

const isCartMode = siteConfig.order.mode === "cart";
const startOrderHref = isCartMode ? "/#products" : siteConfig.squareShopUrl;
const startOrderExternal = !isCartMode;

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Hero.jpeg"
            alt="Fresh handmade mochi treats from The Mochi Oven"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 bg-hero-left-gradient" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-28">
          <div className="max-w-2xl animate-fade-up">
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Crispy outside, chewy inside.
            </h1>
            <p className="mt-5 text-pretty text-lg text-white/90 sm:text-xl">
              Mochi cakes, madeleines, and bite-size treats, handmade in
              Summerlin, Las Vegas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href={startOrderHref}
                {...(startOrderExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-coral-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-coral-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                <ShoppingBag className="h-5 w-5" />
                Order online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <MenuSection />

      {/* How ordering works */}
      <section className="bg-coral-200 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
              How ordering works
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {orderSteps.map((step, i) => (
              <div
                key={step.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <step.icon className="h-8 w-8 text-coral-600" />
                </div>
                <div className="mt-5 mb-2 text-sm font-semibold text-coral-700">
                  0{i + 1}
                </div>
                <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 max-w-xs text-pretty text-[15px] leading-relaxed text-ink/70">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-pretty text-[15px] text-ink/70">
            For large orders, catering, or other special requests, please{" "}
            <Link
              href="/catering#inquiry"
              className="font-semibold text-coral-700 transition-colors hover:text-coral-600"
            >
              contact us
            </Link>
            .
          </p>

          <div className="mt-8 text-center">
            <Link
              href={startOrderHref}
              {...(startOrderExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-coral-600 px-7 py-3.5 text-base font-semibold text-white shadow-md transition-all duration-300 hover:bg-coral-700 hover:shadow-lg hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-5 w-5" />
              Start your order
            </Link>
          </div>
        </div>
      </section>

      {/* Catering teaser */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
            Planning an event?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-ink/70">
            Office celebrations, client gifts, weddings, and parties. Tell us
            about your event and we will send you a proposal.
          </p>
          <div className="mt-8">
            <Link
              href="/catering"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-coral-300 px-7 py-3.5 text-base font-semibold text-coral-700 transition-all duration-300 hover:bg-coral-200 hover:border-coral-400"
            >
              <CalendarHeart className="h-5 w-5" />
              Plan an event
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-24 bg-white pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
              <Image
                src="/images/middle_home_page.jpeg"
                alt="Handmade mochi baked goods from The Mochi Oven"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col items-start">
              <p className="mb-3 text-sm font-medium uppercase tracking-widest text-coral-600">
                About The Mochi Oven
              </p>
              <h2 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
                A Summerlin microbakery with a chewy obsession
              </h2>
              <p className="mt-5 text-pretty text-lg leading-relaxed text-ink/70">
                The Mochi Oven is a small, home-based microbakery in Summerlin,
                Las Vegas. We bake Asian-inspired mochi cakes, Mochi Maddies,
                and bite-size treats in small batches.
              </p>
              <p className="mt-4 text-pretty text-base leading-relaxed text-ink/70">
                Everything starts with butter, rice flour, and a love for that
                signature chewy texture. No preservatives, no shortcuts. Just
                handmade treats ready for gifting, gatherings, and everyday
                cravings.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={siteConfig.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-coral-300 px-5 py-2.5 text-sm font-medium text-coral-700 transition-all duration-200 hover:bg-coral-200"
                >
                  {siteConfig.instagram.handle}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
