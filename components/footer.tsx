import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { Instagram, Mail, MessageSquare, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-coral-100/60 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/images/Mochi_logo.webp"
                alt="The Mochi Oven"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="font-serif text-lg font-semibold text-ink">
                The Mochi Oven
              </span>
            </div>
            <p className="text-[15px] text-ink/70">
              Asian-inspired mochi treats, handmade in Summerlin, Las Vegas.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink/50">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-coral-700"
                >
                  <Mail className="h-4 w-4 text-coral-600" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.smsHref}
                  className="flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-coral-700"
                >
                  <MessageSquare className="h-4 w-4 text-coral-600" />
                  Text {siteConfig.contact.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-ink/70">
                <MapPin className="h-4 w-4 text-coral-600" />
                Curbside pickup: {siteConfig.order.pickupLocation}
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink/50">
              Follow
            </h4>
            <a
              href={siteConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink/70 transition-colors hover:text-coral-700"
            >
              <Instagram className="h-4 w-4 text-coral-600" />
              {siteConfig.instagram.handle}
            </a>
            <p className="pt-2 text-xs text-ink/40">
              Checkout powered by Square
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-coral-100/50 pt-6 text-center">
          <p className="text-xs text-ink/40">
            &copy; {new Date().getFullYear()} The Mochi Oven. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
