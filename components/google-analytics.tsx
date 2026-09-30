import Script from "next/script";

// GA4 measurement IDs look like "G-XXXXXXXXXX". Anything else is ignored so
// that no arbitrary string is ever written into the inline script below.
const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

/**
 * Loads Google Analytics 4 (gtag.js) when NEXT_PUBLIC_GA_ID is set to a valid
 * measurement ID. When it is unset, empty, or invalid, this renders nothing
 * and the site makes no requests to Google.
 *
 * NEXT_PUBLIC_ variables are inlined at build time, so a change in Netlify
 * needs a new deploy to take effect.
 */
export function GoogleAnalytics() {
  const gaId = (process.env.NEXT_PUBLIC_GA_ID ?? "").trim();
  if (!GA_ID_PATTERN.test(gaId)) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
