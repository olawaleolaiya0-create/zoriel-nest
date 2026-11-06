# Zoriel Nest

Shop · Sell · Grow — a marketplace by OlaJesus WEBCORE INNOVATION.

This was written by hand, file by file (this sandbox has no npm
registry access, so `create-next-app` couldn't run) — install
dependencies and run it locally to actually use it.

## How buying and selling actually works

**Zoriel Nest does not process payments and does not deliver digital
files.** It's a discovery and connection layer: buyers browse
products and stores, then tap "Contact Seller" to reach the seller
directly on WhatsApp, email, phone or Telegram — whichever channels
that seller has published. Payment, delivery, and (for e-books/music)
sending the actual file all happen directly between buyer and seller,
outside the platform. See `src/lib/contact-links.ts` and
`src/components/ContactSeller.tsx` for the implementation, and the
"Payments and product delivery are arranged directly..." notice that
accompanies every contact button.

This means: no cart, no checkout, no internal order/payment-status
workflow, and no storage of sellers' actual digital product files.
There's a lightweight `enquiries` table that can record "a buyer
tapped Contact Seller on this product" for the seller's own reference
— it's not a transaction record and confirms nothing.

## Stack — zero-budget by design

- Next.js 14 (App Router) + TypeScript, Tailwind CSS
- **Supabase Free** for auth, Postgres database, and file storage
  (product/cover images and private seller-verification documents
  only — see above for why there's no digital-file storage). No
  Cloudflare R2, no other paid storage, no payment gateway.
- Deploy target: **Netlify** (free tier) — zero-config via
  `@netlify/plugin-nextjs`, configured in `netlify.toml` at the repo
  root. Netlify auto-installs the plugin and auto-detects Next.js; the
  only setup needed is adding the three environment variables below
  in Site configuration → Environment variables, then connecting the
  repo (or running `netlify deploy`).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Open http://localhost:3000.

### Supabase project setup

1. Create a free project at supabase.com.
2. Run `src/lib/supabase/schema.sql` in the SQL editor. It creates
   every table, enables Row Level Security, and writes real policies
   (not placeholders) for customer/seller/admin boundaries — read the
   comments in that file, they explain the reasoning behind each
   policy and call out what still needs your own review.
3. In Storage, create two buckets by hand (the schema deliberately
   doesn't create these in SQL, so bucket access-level is always a
   conscious dashboard action):
   - `product-images` — **Public**
   - `verification-documents` — **Private**
4. Copy the project URL, anon key and service-role key into
   `.env.local` (see `.env.example` for what each one is for).
5. To make your own account an admin (the founder/administrator
   role), sign up normally once auth is live, then in the SQL editor:
   `update public.profiles set role = 'admin' where id = '<your-user-id>';`
   There is no public path to become an admin — this is intentional.

### Deploying to Netlify

`netlify.toml` at the repo root already configures the build
(`npm run build`, publish `.next`) and the `@netlify/plugin-nextjs`
runtime — Netlify auto-installs that plugin and auto-detects Next.js,
so there's no manual adapter setup.

1. Push this repo to GitHub/GitLab/Bitbucket (or use `netlify deploy`
   from the CLI for a manual deploy).
2. In Netlify, "Add new site" → import the repo. Build settings are
   picked up from `netlify.toml` automatically.
3. Under Site configuration → Environment variables, add the same
   three variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — mark this one **"Contains secret
     values"** in the Netlify UI. Never put it in `netlify.toml`
     (that file is read at build time and lives in the repo).
   - `NEXT_PUBLIC_SITE_URL` — set this to your real `*.netlify.app`
     URL (or custom domain) once you have it, not `localhost`.
4. Deploy. Any time you change an env var, trigger a new deploy —
   Netlify only reads them at build time.

## Architecture notes

### Storage abstraction (`src/lib/storage`)

Nothing outside this folder talks to Supabase Storage's SDK directly.
`getActiveProvider()` is the one place that decides which provider
handles a new upload; everything else goes through
`validateAndStoreFile()`. This is what lets a second free storage
provider be added later — once its free-tier terms and compatibility
are actually verified — without rewriting product code. See
`src/lib/storage/types.ts` for the interface every provider
implements.

- `limits.ts` — upload limits (5 MB images, 3 per product) and the
  Supabase free-tier figure tracked against (1 GB — verify this is
  still current before launch).
- `usage.ts` — storage-usage report for the admin dashboard. Supabase's
  free tier doesn't expose a live aggregate-usage API to the JS
  client, so this is computed by summing our own `files` table and
  explicitly labeled as an **estimate**, not an exact figure.
- `upload.ts` — validates type/size, checks quota, uploads, and
  records a `files` row. Only two file categories exist:
  `product_image`/`digital_cover_image` (public) and
  `verification_document` (private, admin-only).

### Contact-seller flow (`src/lib/contact-links.ts`, `src/components/ContactSeller.tsx`)

Builds real WhatsApp (`wa.me`), `mailto:`, `tel:` and Telegram links
from a seller's own configured contact fields on `stores`
(`whatsapp_number`, `contact_email`, `contact_phone`,
`social_links.telegram`). Returns nothing for a channel the seller
hasn't configured — never fabricates a contact method. This is the
entire "purchase" flow; there is no internal cart or checkout.

### Database (`src/lib/supabase/schema.sql`)

Single file for now, applied by hand in the SQL editor — move to the
Supabase CLI's migrations workflow before production, as noted at the
bottom of that file. Covers profiles/roles, stores (with contact
fields), categories, physical + digital products (digital listings
hold format/size info and a cover image, not the file itself), file
metadata, `enquiries` (non-transactional interest log), favourites,
seller verification, reports, and an admin audit log, with RLS
policies for every table.

### Logo

The real Zoriel Nest logo is installed at `public/logo.png` (full
lockup) and `public/logo-mark.png` (trimmed, transparent glyph for
compact spots like the navbar). `src/components/Logo.tsx` renders
these — use `variant="full"` where there's vertical room (footer, auth
pages) and the default compact variant in the navbar. Design tokens in
`tailwind.config.ts` are sampled from the logo's ink color and from
the founder's brand portrait (gold accent).

## What's built so far

- Design system, reusable components (Button, Card, Input, Badge,
  Dialog, Navbar, Footer, States), real logo integration.
- Public content pages: home, browse/search/categories (honest
  empty-state stubs), about, company, creator (with your photo),
  contact (with your phone/WhatsApp), terms, privacy, guidelines —
  copy updated to describe the external buyer–seller transaction
  model honestly.
- **Help Center** at `/help` — getting started, buying physical and
  digital products, becoming a seller, verification/trust, account
  safety, and an FAQ. Linked from the navbar and footer. Every claim
  in it is checked against what's actually implemented: live features
  are marked "Available now," unbuilt ones (sign-in, seller
  dashboard, verification/report UI) are marked "Coming soon" rather
  than described as working. `src/lib/help-content.ts` holds the
  section list the page's table of contents renders from.
- `src/app/sitemap.ts` and `src/app/robots.ts` — static sitemap of
  the real public pages (including `/help`) and a robots policy that
  pre-emptively blocks `/account/`, `/seller/dashboard` and `/admin/`
  once those exist.
- Supabase client/server/admin wrappers, full schema with RLS — **applied
  live** to the real Supabase project (all 12 tables, RLS policies,
  security-definer helper functions, storage buckets). See
  "Supabase project status" below.
- Storage abstraction for images/verification docs, and the
  contact-seller link builders (`src/lib/contact-links.ts`,
  `src/components/ContactSeller.tsx`, with a "How does this work?"
  link into the relevant Help Center section) — **now live** on real
  product and store pages (see below).
- **Customer authentication** — sign up, sign in, sign out, forgot/reset
  password, and a basic account page (view email/role, edit full name).
  `src/middleware.ts` keeps the Supabase session cookie refreshed on
  every request, as required by `@supabase/ssr`. The navbar is now
  session-aware: it shows "Account" + "Sign out" when signed in, "Sign
  in" otherwise. Built with Next.js Server Actions
  (`src/lib/actions/auth.ts`) calling Supabase Auth directly — no
  client-side auth SDK calls, no secrets in the browser.
- **Seller registration and dashboard** — `/seller/register` creates a
  `stores` row for the signed-in user (name, description, contact
  channels, optional location) and automatically promotes their role
  from `customer` to `seller`; one store per account, enforced in the
  Server Action. `/seller/dashboard` shows the store's status,
  verification status, product count, and a form to edit store
  details (`src/lib/actions/seller.ts`, `src/components/SellerForm.tsx`).
  The navbar's "Sell on Zoriel Nest" button now links existing sellers
  straight to their dashboard instead.
- **Product listing** — `/seller/products` (list, with quick
  publish/unavailable/archive actions and delete), `/seller/products/new`
  (create a physical or digital listing), and
  `/seller/products/[id]/edit` (edit details, manage photos/cover
  image). Physical products take up to 3 photos through the storage
  abstraction (`validateAndStoreFile`, 5 MB/JPEG-PNG-WebP each);
  digital listings (e-book/music) take a file format, optional
  approximate size, and an optional cover image — never the actual
  file, in line with the external-delivery model. All of it enforces
  store ownership server-side before touching a row
  (`src/lib/actions/products.ts`). Deleting a product cleans up its
  uploaded images from storage, not just the database rows. Product
  **categories** are still not built — there's no way to sort a
  listing into one yet.
- **Public buying flow** — `/product/[slug]` and `/store/[slug]` are
  real pages now: product photos/cover image, price, description,
  stock (physical) or format/size (digital), the store it belongs to,
  and the Contact Seller buttons wired to that store's actual
  configured contact channels (`src/lib/products.ts` fetches the
  published feed; `src/components/ProductCard.tsx` is the shared grid
  card). The homepage's "Recently added," `/browse`, and `/search`
  (title match only, no store-name search yet) now query real active
  listings instead of showing a static empty state. A signed-in
  owner can preview their own draft/suspended listing or store with a
  clear "you're previewing this" banner — RLS still blocks anyone
  else from seeing it. Tapping a Contact Seller link also writes a
  best-effort, non-blocking row to `enquiries`
  (`src/lib/actions/enquiries.ts`) — never gates or delays the actual
  navigation to the seller.
- **Favourites** — "Save to favourites" on a product page
  (`src/components/FavouriteButton.tsx`, `src/lib/actions/favourites.ts`)
  and `/account/favourites` to view them, linked from the account
  page. Requires an account (the `favourites_own` RLS policy is
  owner-only, so no anonymous favouriting) — the button shows a
  sign-in link instead of a no-op form when signed out. A favourite on
  a product that later goes to draft/archived just stops appearing in
  the list, the same way it would disappear from browse.
- **Seller verification submission** — `/seller/verification`
  (`src/components/VerificationForm.tsx`,
  `src/lib/actions/verification.ts`): a seller attaches up to 3
  documents (PDF/JPEG/PNG, 10 MB each, through the same storage
  abstraction, stored in the private `verification-documents` bucket)
  and an optional note, which creates a new `verification_requests`
  row and sets the store's `verification_status` to `pending`. Linked
  from the seller dashboard, which also now shows the current status
  and any reviewer note.
- **Admin dashboard** — `/admin` (overview counts), `/admin/stores`
  (suspend/reactivate any store), `/admin/users` (suspend/reactivate
  any account — shows real email via `auth.admin.listUsers()`, a
  bounded, gated use of the service-role key), `/admin/verification`
  (review a request's documents via short-lived signed URLs, approve /
  reject / request more info, with an optional note that becomes the
  seller's `decision_reason`), and `/admin/reports` (ready for when a
  report-submission UI exists — currently always empty, since nothing
  files a report yet). Every mutating action writes a row to
  `admin_audit_log` (`src/lib/actions/admin.ts`). Gated by
  `src/lib/require-admin.ts`, checked in both the admin layout (so the
  tab bar itself never renders for a non-admin) and each page; a
  non-admin gets a plain 404, not a "forbidden" page that would
  confirm the area exists. **Deliberately missing:** promoting a user
  to admin — that stays a database-only step (see "Supabase project
  status" below), matching this project's standing rule that there's
  no in-app path to becoming an admin.

## Supabase project status

The live project (`nhvaovlayybaqmugzzuc`) has the full schema applied:
all 12 tables, RLS enabled and policies in place on every one of them,
the `product-images` (public) and `verification-documents` (private)
storage buckets, and the security/performance advisors both come back
clean (aside from expected, harmless notices on an unused/zero-traffic
database). `.env.local` has the real project URL and the public
("anon"/publishable) key filled in.

**What you still need to do by hand**, because they require either a
secret credential or a dashboard-only setting:

1. **Service-role key** — `.env.local` has `SUPABASE_SERVICE_ROLE_KEY=`
   left blank on purpose. This key bypasses every RLS policy in the
   database, so it's never fetched, displayed, or typed by an AI
   assistant in this project — only you, from your own dashboard, into
   your own file. Get it from Settings → API → Service role → Reveal,
   then paste it into `.env.local` after `SUPABASE_SERVICE_ROLE_KEY=`
   and save.
   - If a service-role key for this project was ever pasted into a chat
     session (including this one), treat it as compromised and
     **regenerate it** from that same screen before using it — a key
     that's passed through a chat log isn't a secret anymore.
2. **Auth redirect URLs** — once you have a real domain (or even for
   local dev), set Site URL and Redirect URLs in Supabase under
   Authentication → URL Configuration, so email confirmation and
   password-reset links point somewhere real. No MCP tool can do this
   step; it's dashboard-only.
3. **Make yourself admin** — sign up for a real account through
   `/account/sign-up` once the app is running, then in the SQL editor:
   `update public.profiles set role = 'admin' where id = '<your-user-id>';`
   (find your user id under Authentication → Users). There's no public
   path to become an admin — that's intentional.

## Advertising (Google AdSense)

The site is wired for Google AdSense Auto ads, controlled entirely by
one env var: `NEXT_PUBLIC_ADSENSE_CLIENT_ID`. Leave it unset and
nothing ad-related loads — no script, no empty ad boxes, no console
errors. This matters because AdSense has to review and approve your
site before ads will actually show.

To turn ads on:

1. Apply at [adsense.google.com](https://adsense.google.com) with your
   live site URL once it's deployed and has real content (an empty or
   placeholder-only site gets rejected).
2. Google will ask you to verify ownership — usually by checking for
   `https://yourdomain.com/ads.txt`, which this app already serves
   dynamically (`src/app/ads.txt/route.ts`) once the env var below is
   set, so you don't need to create that file by hand.
3. Once approved, Google gives you a publisher ID like
   `ca-pub-1234567890123456`. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` to
   that value in `.env.local` (local dev) and in Netlify's
   Environment variables (production), then redeploy.
4. Auto ads means Google decides where ads appear on the page — there
   are no manual ad-slot components to place in the code. If you later
   want specific placements (e.g. a fixed banner in one spot instead
   of automatic placement), that's a manual ad-unit component, not
   covered by this setup — ask and I'll add it once you have real ad
   unit/slot IDs from your AdSense dashboard.

Review Google's [AdSense program policies](https://support.google.com/adsense/answer/48182)
before applying — pages with no original content, or sites that
exist mainly to host ads, get rejected or suspended.

## What's still pending

Every planned feature is now built and wired to real data: customer
sign-in/sign-up/sign-out, the account page, seller
registration/dashboard, Store Studio (theme/logo/banner
customization), product listing/editing/photo upload (with real
categories, assignable per listing), the full public buying flow
(homepage/browse/search/categories, product and store pages, Contact
Seller wired to real data), favourites, seller verification
submission, buyer-facing reporting (a "Report this product/store"
action on product and store pages, reviewable in `/admin/reports`),
and the admin dashboard. Deployment target is Netlify — see "Stack"
above and `netlify.toml`.

Two things genuinely out of scope, not gaps: Google sign-in (this app
only has email/password auth) and a "Follow store" feature (no schema
for it) — both would be new functionality, not something this build
ever covered.

None of this has been run in a live `npm run dev` yet — `npm install`
hasn't been possible in this sandbox (no npm registry access), so this
is all written by hand and needs a real install + smoke test on your
end (or Netlify's first build log) before you fully rely on it.
