import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Poppins } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/lib/cart-context";
import { CartPanel } from "@/components/cart-panel";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://themochioven.com"),
  title: {
    default: `${siteConfig.name} | Mochi Cakes & Treats in ${siteConfig.location}`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Asian-inspired mochi cakes, Mochi Maddies madeleines, mini cupcakes, and gift bags. Handmade in Summerlin, Las Vegas. Order online or plan catering for your next gathering.",
  keywords: [
    "mochi cake",
    "mochi bakery",
    "Las Vegas bakery",
    "Summerlin bakery",
    "madeleines",
    "mini cupcakes",
    "catering Las Vegas",
    "Asian-inspired desserts",
    "gift bags",
  ],
  openGraph: {
    title: `${siteConfig.name} | Mochi Cakes & Treats in ${siteConfig.location}`,
    description:
      "Asian-inspired mochi cakes, Mochi Maddies, mini cupcakes, and gift bags. Handmade in Summerlin, Las Vegas.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Mochi Cakes & Treats in ${siteConfig.location}`,
    description:
      "Asian-inspired mochi cakes, Mochi Maddies, mini cupcakes, and gift bags. Handmade in Summerlin, Las Vegas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartPanel />
        </CartProvider>
      </body>
    </html>
  );
}
