# AGENTS.md

## Project

The Mochi Oven marketing and ordering website.

- Stack: Next.js (currently 16.3.6), TypeScript, Tailwind CSS, hosted on Vercel
- Vercel builds every branch and pull request. Each pull request gets its own preview link. Merging to `main` deploys to production immediately; there is no manual publish step.
- Key files:
  - `lib/site-config.ts`: business settings (ORDER_MODE, pickup windows, delivery fees, Summerlin ZIP codes, contact details, Formspree endpoint)
  - `lib/menu-data.ts`: menu items, flavors, sizes, minimum quantities
  - `lib/delivery-fee.ts`: `getDeliveryFee(fulfillment, zip)`
  - `lib/order-dates.ts`: order dates and the rush-order window in Las Vegas time
  - `components/cart-panel.tsx`: the cart, checkout form, and review screen; "Confirm order" posts to `/api/checkout`
  - `app/api/checkout/route.ts`: validates the order and creates a Square hosted checkout (payment link); `lib/checkout/*` holds validation and order building
  - `app/api/menu-prices/route.ts` and `lib/square/*`: menu prices from the Square catalog (cached about 5 minutes); server only
  - Square settings are server environment variables in the Vercel project settings: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT` (`sandbox` or `production`), and optional `SQUARE_DELIVERY_MODE` (`delivery` or `note_only`)
  - `lib/mailerlite.ts`: email marketing opt-in. When the customer checks the box in the checkout form, the server adds the email and first name to a MailerLite group after checkout starts; server only. Settings are server environment variables in the Vercel project settings: `MAILERLITE_API_KEY` and `MAILERLITE_GROUP_ID`. When either is missing, the sign-up is skipped.
- `ORDER_MODE` is `"cart"`. Do not change it.
- Agent tools (such as Grok Bot) use the `mochioven-bot` account only. The owner may also work directly, or through Claude Code on the owner's computer, under the same rules.

## Rules

- Never push to `main`. Always create a new branch, and open a pull request into `main`.
- Never merge a pull request. The owner reviews and merges.
- Never change repo settings, collaborators, rules, or GitHub app permissions.
- Never put secrets in the code. Secrets and environment variables live only in the Vercel project settings. You do not have access to them, and you must not ask for them.
- Do not sign in to Square, Vercel, GoDaddy, Google Workspace, Formspree, or any other business account.
- One pull request per task. Keep each one small and focused.
- Every pull request description must include: what changed, why, any risks, and a step-by-step manual test checklist for the preview link.
- Ask before you guess. If a requirement is unclear, stop and ask in the pull request or in chat.
- Do not change the site's design, wording, or content unless a task asks for it.

### Content rules for any text you write

- Lead with texture (Buttery. Chewy. Delightful.), then unique flavors, then quality ingredients. Gluten-free is mentioned last, plainly, and never as inclusivity.
- Never write "baked to order," "made to order," "fresh-baked," or "baked fresh." Use "handmade in small batches" instead.
- Never include the owner's personal name.
- Never invent prices, claims, or facts.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
