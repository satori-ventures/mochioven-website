"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type HashLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link for section links such as "/#products". next/link does not scroll
 * when the current URL has a query string (e.g. "/?utm_source=…") or already
 * ends in the same hash, so on the same page this scrolls to the section
 * itself (smoothly, respecting the section's scroll-margin-top) and keeps the
 * query string. On other pages it navigates as usual.
 */
export function HashLink({ href, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    // Let the browser handle new-tab and other modified clicks.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const [path, hash] = href.split("#");
    // Only same-page links without their own query string are handled here.
    if (!hash || path.includes("?") || (path || pathname) !== pathname) return;
    const target = document.getElementById(hash);
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (window.location.hash !== `#${hash}`) {
      // Passing the current state (which carries Next's own history data)
      // adds the hash to the URL without a router update. Back and Forward
      // still work without a reload.
      window.history.pushState(window.history.state, "", `${window.location.search}#${hash}`);
    }
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
