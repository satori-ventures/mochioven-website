"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center justify-center"
      aria-label={`${siteConfig.name} home`}
    >
      <Image
        src="/images/Mochi_logo.webp"
        alt="The Mochi Oven"
        width={64}
        height={64}
        priority
        className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14"
      />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { totalCount, openCart } = useCart();
  const isCartMode = siteConfig.order.mode === "cart";

  const orderButtonHref = isCartMode ? "/#products" : siteConfig.squareShopUrl;
  const orderButtonExternal = !isCartMode;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-coral-100/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Left: logo */}
        <Logo />

        {/* Right: desktop nav + CTA */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="/#products"
            className="text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-ink"
          >
            Menu
          </Link>
          <Link
            href="/catering"
            className={cn(
              "relative text-sm font-medium transition-colors duration-200 after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:rounded-full after:bg-coral-600 after:transition-all after:duration-300",
              pathname === "/catering"
                ? "text-coral-600 after:w-full"
                : "text-ink/70 hover:text-ink after:w-0 hover:after:w-full"
            )}
          >
            Catering
          </Link>
          <Link
            href="/#about"
            className="text-sm font-medium text-ink/70 transition-colors duration-200 hover:text-ink"
          >
            About
          </Link>
          <Link
            href={orderButtonHref}
            {...(orderButtonExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-coral-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-coral-700 hover:shadow-md"
          >
            <ShoppingBag className="h-4 w-4" />
            Order online
          </Link>
          {isCartMode && (
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart (${totalCount} items)`}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-coral-700"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-600 px-1 text-[0.65rem] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Mobile: Catering link + Order button + Cart */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/catering"
            className={cn(
              "text-sm font-medium transition-colors duration-200",
              pathname === "/catering"
                ? "text-coral-600 border-b-2 border-coral-600 pb-0.5"
                : "text-ink/70"
            )}
          >
            Catering
          </Link>
          <Link
            href={orderButtonHref}
            {...(orderButtonExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-coral-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-coral-700"
          >
            <ShoppingBag className="h-4 w-4" />
            Order
          </Link>
          {isCartMode && (
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart (${totalCount} items)`}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-ink/70 transition-colors hover:text-coral-700"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-600 px-1 text-[0.65rem] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
