# AGENTS.md

## Project

The Mochi Oven marketing and ordering website.

- Stack: Next.js (currently 16.3.6), TypeScript, Tailwind CSS, hosted on Netlify
- Netlify builds every branch and pull request. Each pull request gets its own preview link. Production publishing is locked, and the owner publishes manually.
- Key files:
  - `lib/site-config.ts`: business settings (ORDER_MODE, pickup windows, delivery fees, Summerlin ZIP codes, contact details, Formspree endpoint)
  - `lib/menu-data.ts`: menu items, flavors, sizes, minimum quantities
  - `lib/delivery-fee.ts`: `getDeliveryFee(fulfillment, zip)`
  - The cart and checkout form, including the `createSquareCheckout` function (currently a TODO)
- `ORDER_MODE` is `"cart"`. Do not change it.
- Agent tools (such as Grok Bot) use the `mochioven-bot` account only. The owner may also work directly, or through Claude Code on the owner's computer, under the same rules.

## Rules

- Never push to `main`. Always create a new branch, and open a pull request into `main`.
- Never merge a pull request. The owner reviews and merges.
- Never change repo settings, collaborators, rules, or GitHub app permissions.
- Never put secrets in the code. Secrets live only in Netlify environment variables. You do not have access to them, and you must not ask for them.
- Do not sign in to Square, Netlify, GoDaddy, Google Workspace, Formspree, or any other business account.
- One pull request per task. Keep each one small and focused.
- Every pull request description must include: what changed, why, any risks, and a step-by-step manual test checklist for the preview link.
- Ask before you guess. If a requirement is unclear, stop and ask in the pull request or in chat.
- Do not change the site's design, wording, or content unless a task asks for it.

### Content rules for any text you write

- Lead with texture (crispy outside, chewy inside), then unique flavors, then quality ingredients. Gluten-free is mentioned last, plainly, and never as inclusivity.
- Never write "baked to order," "made to order," "fresh-baked," or "baked fresh." Use "handmade in small batches" instead.
- Never include the owner's personal name.
- Never invent prices, claims, or facts.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
