import { ClearCart } from "@/components/clear-cart";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Order Confirmed",
};

export default function OrderConfirmedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <ClearCart />
      <div className="max-w-lg text-center">
        <h1 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
          Thank you! Your order is in.
        </h1>
        <p className="mt-4 text-pretty text-lg text-ink/60">
          You will receive a confirmation text message and/or email, usually
          within 4 hours, with an estimate of when your order will be
          ready.
        </p>
        <p className="mt-8 rounded-2xl bg-secondary p-5 text-pretty text-[15px] leading-relaxed text-ink/80 ring-1 ring-coral-100/80">
          <span className="font-semibold text-coral-700">{siteConfig.proTip.label}</span>{" "}
          {siteConfig.proTip.confirmation}
        </p>
      </div>
    </div>
  );
}
