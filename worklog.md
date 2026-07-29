# OHHO BURGERS — Project Worklog

## Task `admin-crud-ui` — Admin CRUD UI for Menu Items, Timeline, Catering Packages, Locations

**Agent:** GLM (Code)
**Status:** ✅ Complete
**Lint:** Passing (no errors)

### Summary

Added 4 new tabs to the existing `AdminPanel` component (`/src/components/ohho/AdminPanel.tsx`):
- **Menu Items** (icon: `Utensils`)
- **Timeline** (icon: `Clock`)
- **Catering Pkg** (icon: `PartyPopper`)
- **Locations** (icon: `MapPin`)

Each tab provides full CRUD against the existing `/api/admin/*` endpoints: list (glass-card style), inline edit (card flips into a compact form), add-new (blank form card), save (POST/PATCH), delete (DELETE with confirm), and inline alert banners for success/error feedback. Existing tabs (Dashboard, Orders, Users, Reviews, Franchise, Catering) and their behaviour are unchanged.

### Files created

| File | Purpose | Lines |
|---|---|---|
| `src/components/ohho/admin/shared.tsx` | Reusable form primitives: `Field`, `TextInput`, `NumberInput`, `TextArea`, `ListInput`, `Toggle`, `AlertBanner`, `EmptyState`, `SectionHeader`, `IconBtn` | 308 |
| `src/components/ohho/admin/MenuItemsView.tsx` | Menu items CRUD view (all fields incl. ingredients list + toggle booleans for `available`, `signature`, `isAddOn`) | 312 |
| `src/components/ohho/admin/TimelineView.tsx` | Timeline eras CRUD view (category, label, emoji, color picker, tagline, year, era, blurb, sortOrder) | 265 |
| `src/components/ohho/admin/CateringPackagesView.tsx` | Catering packages CRUD view (name, pax, price, items list, note, color, sortOrder, available toggle) | 246 |
| `src/components/ohho/admin/LocationsView.tsx` | Locations CRUD view (slug, name, city, area, status, rating, customers, deliveryRadiusKm, prepTimeExtra, image, active toggle) | 264 |

### Files modified

| File | Change |
|---|---|
| `src/components/ohho/AdminPanel.tsx` | Extended `tab` union type with 4 new ids, added 4 state arrays + 4 load callbacks, wired them into the tab-change `useEffect` and the refresh button, added the 4 tab buttons to the nav array, and added the 4 conditional-render branches. Final length: 682 lines (under the 800-line cap). |
| `src/app/globals.css` | Added `--color-ohho-green: #10b981;` token so that success states (used by `AlertBanner` and the existing `FranchiseLeadsView` QUALIFIED badge) actually render. Previously the `ohho-green` Tailwind class was referenced but had no token, so the styling silently fell back. |

### Design decisions

1. **View components extracted to `src/components/ohho/admin/`** — adding all 4 views inline to `AdminPanel.tsx` would have pushed it well past 800 lines. Extraction also keeps each CRUD view self-contained, easier to test, and easier to extend.
2. **Inline alert banner instead of global toast** — chose a small, dismissible banner rendered at the top of each view rather than `useToast`/`Toaster`. Rationale: full visual control over the OHHO dark/orange-gold aesthetic, no dependency on toaster theme styling, and the banner lives right where the user took action.
3. **Inline edit pattern** — each card has an `Edit` button that swaps the card for an editor form with the same width, so the list layout stays stable. A separate "New item" card appears at the top of the list when adding.
4. **Local state mirror** — each view keeps a `local` copy of the items array, seeded from props via `useEffect`, so that optimistic UI updates (create / update / delete) feel instant without waiting for a full refetch. The parent `AdminPanel` still owns the source-of-truth state, so the existing tab-switch refetch pattern is preserved.
5. **Comma-separated list input** — `ListInput` renders a single text input and splits on commas on every change. This matches the task spec for `ingredients[]` and `items[]` arrays.
6. **Toggle switches** for booleans (`available`, `isAddOn`, `signature`, `active`) — small custom switch component matching the brand palette, accessible (`aria-pressed`), keyboard-activatable.
7. **Color picker** for `color` fields (Timeline, Catering Packages) — native `<input type="color">` paired with a hex text input for fine control.
8. **Confirm-before-delete** — uses `confirm()` for delete confirmation to avoid accidental data loss; success/error is then surfaced via the alert banner.
9. **No changes to existing tabs** — Dashboard, Orders, Users, Reviews, Franchise, Catering views, `updateOrderStatus`, the existing tab nav array, the `useEffect` deps for existing loaders — all preserved exactly.

### Verification

- `bun run lint` → ✅ passes (no errors, no warnings)
- Dev server compiled successfully (`✓ Compiled in 456ms` etc. in `dev.log`)
- `AdminPanel.tsx` final length: 682 lines (under the 800-line cap)
- All existing tab logic preserved (no edits to DashboardView, OrdersView, UsersView, ReviewsView, FranchiseLeadsView, CateringView, or `updateOrderStatus`)

### How to use

Open the admin panel (admin auth required), then click any of the 4 new tabs in the top nav:
- **Menu Items** → see all items (including hidden ones), click `Edit` on any card to inline-edit, click `+ New item` to create. Toggle `Available` / `Signature` / `Add-on`. Save creates or updates via POST/PATCH; Delete removes via `?id=…`.
- **Timeline** → manage the genre-timeline eras shown on the storefront. Each era has a colour-coded card. Color picker for the brand colour.
- **Catering Pkg** → manage the catering packages shown in the Catering tab. Items field is a comma-separated list. Each card has a colored left border matching the package colour.
- **Locations** → manage the delivery locations. Includes rating, customers count, delivery radius, prep-time-extra fields. `Active` toggle controls visibility.

---

## Task `company-redesign-mobile` — Redesign Company tab + mobile-responsive fixes across 10 sections

**Agent:** GLM (Code)
**Status:** ✅ Complete
**Lint:** Passing (no errors)
**Detailed record:** `/agent-ctx/company-redesign-mobile-glm.md`

### Summary

Two-part task:

1. **Redesigned `AboutVentures.tsx`** — replaced the 5-stage franchise timeline (now lives in the dedicated Franchise tab) with a 6-section brand-identity page:
   - Brand-story hero with `text-gradient-ohho` animated title + "Live Premium" tagline + 3-sentence brand story
   - Animated stats counter (4 stats) using `useInView` + `requestAnimationFrame` count-up with `ohho-glow`
   - 6-value brand-values grid with `Crown / Settings / Maximize / Smartphone / Leaf / Users` lucide icons
   - 2 tested-location cards (Kairana flagship + Shamli test cart) using `testedLocations` data
   - Horizontal brand timeline 2019→2025 with `Store / Sandwich / Pizza / Drumstick / Coffee / Smartphone / Rocket` icon nodes
   - Closing CTA "Want to own an OHHO cart?" calling `navigate("franchise")`
   - All sections use `whileInView` + `viewport={{ once: true }}`; section padding `py-16 sm:py-20`.

2. **Reduced section vertical padding + mobile-responsive fixes** across 10 OHHO components:
   - `HeroSpotlight` — kept `min-h-[100svh]`, reduced internal `pt-24 sm:pt-28` / `pb-6 sm:pb-8`, buttons → `h-12`
   - `AboutVentures`, `MenuMagnifier`, `GenreTimeline`, `VirtualTour3D`, `OrderingPlatform`, `LiveKitchenView`, `RewardsSection` — `py-24 sm:py-32` → `py-16 sm:py-20`
   - `FranchiseTab`, `CateringTab` — `py-20 sm:py-28` → `py-14 sm:py-16`
   - All: mobile px `px-4 sm:px-6 lg:px-12`; titles `text-3xl sm:text-5xl lg:text-6xl`; grids collapse to `grid-cols-1 sm:…`; buttons tightened to `h-10`/`h-11`/`h-12` for ≥40–44px touch targets; `pointer-events-none` added to decorative blur circles.

### Files modified

| File | Change |
|---|---|
| `src/components/ohho/AboutVentures.tsx` | Full rewrite — 6-section company-identity page with animated count-up, values grid, locations, horizontal timeline, franchise CTA |
| `src/components/ohho/HeroSpotlight.tsx` | Reduced internal padding, `h-12` buttons, mobile px |
| `src/components/ohho/MenuMagnifier.tsx` | Section padding + mobile px + responsive title + `h-11` Add-to-cart button + `h-10` Go-to-Order button |
| `src/components/ohho/GenreTimeline.tsx` | Section padding + mobile px + responsive title + tighter scroller + `flex-wrap` deep-dive panel header |
| `src/components/ohho/VirtualTour3D.tsx` | Section padding + mobile px + responsive title + `h-9` hotspot buttons + `h-9 w-9` close button + `truncate` on label + `min-h-[88px]` hint cards |
| `src/components/ohho/OrderingPlatform.tsx` | Section padding + mobile px + responsive title + `h-12` confirmation buttons + `h-10` category tabs + `h-8/h-10/h-11/h-12` qty/add-to-order/submit buttons + `min-h-[48px]` location buttons + `min-h-[56px]` payment buttons + `h-10` mode toggle |
| `src/components/ohho/LiveKitchenView.tsx` | Section padding + mobile px + responsive title + `h-10 w-10` refresh button + stacking header on mobile + `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` pipeline grid (was `md:grid-cols-4`) |
| `src/components/ohho/RewardsSection.tsx` | Section padding + mobile px + responsive title + tighter tier cards grid + `grid-cols-1 sm:grid-cols-3` how-it-works + `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` customer-stories + `h-12` CTA button |
| `src/components/ohho/FranchiseTab.tsx` | Section padding `py-14 sm:py-16` + mobile px + responsive title + smaller mobile stage nodes (`h-12 w-12`) + `pl-16 sm:pl-20` indent + `p-4 sm:p-6` stage card padding + `h-12` submit button |
| `src/components/ohho/CateringTab.tsx` | Section padding `py-14 sm:py-16` + mobile px + responsive title + `grid-cols-1 md:grid-cols-3` packages + `grid-cols-1 lg:grid-cols-2` inquiry form + `h-12` submit button |

### Verification

- `bun run lint` → ✅ passes (no errors, no warnings)
- Dev server compiles cleanly (`✓ Compiled in 456ms` etc. in `dev.log`)
- All section padding targets from the spec met
- All mobile-responsive checklist items addressed (font scaling, grid collapse, padding reduction, cards stacking, responsive images, no horizontal overflow, ≥44px touch targets on primary CTAs)

### How to view

Open the **Preview Panel** on the right → click **Open in New Tab** to view in a separate browser tab. Click the **Company** tab in the top nav to see the redesigned company page; resize the browser narrow (~375px) to verify mobile layouts.

---

## Task `audit-mobile-perf` — Mobile responsiveness + performance audit (research only)

**Agent:** GLM (Explore)
**Status:** ✅ Complete (audit only — no code changes)
**Detailed report:** `/home/z/my-project/audit-report.md`

### Summary

Audited 13 OHHO storefront component files for mobile responsiveness (320–375 px) and the project's font / image / bundle / config setup for performance bottlenecks. All findings, line numbers, severities, and fix recommendations are documented in `audit-report.md`.

### Files inspected

| File | Purpose | Lines |
|---|---|---|
| `src/components/ohho/HeroSpotlight.tsx` | Hero section with cross-fading food imagery + spotlight effect | 277 |
| `src/components/ohho/GenreTimeline.tsx` | Horizontal-scroll era cards with progress rail | 372 |
| `src/components/ohho/VirtualTour3D.tsx` | Three.js food-cart tour with hotspot teleporting | 590 |
| `src/components/ohho/OrderingPlatform.tsx` | Menu + cart sidebar + checkout + UPI modal | 870 |
| `src/components/ohho/FranchiseTab.tsx` | 5-stage model + ROI calculator + application form | 328 |
| `src/components/ohho/CateringTab.tsx` | Catering packages grid + inquiry form | 201 |
| `src/components/ohho/LiveKitchenView.tsx` | Real-time 4-stage kitchen pipeline | 205 |
| `src/components/ohho/RewardsSection.tsx` | 4 loyalty tiers with SVG progress rings | 296 |
| `src/components/ohho/HomeFeatures.tsx` | 7 sub-components (TodaySpecialBanner, LiveOrderTicker, LocationPicker, AchievementBadges, CustomerPhotoWall, CountdownTimer, AnimatedCounter) | 419 |
| `src/components/ohho/UserDashboard.tsx` | Slide-in drawer with Orders / Addresses / Wallet / Refer tabs | 698 |
| `src/components/ohho/AdminPanel.tsx` | Slide-in drawer with 10 admin tabs | 685 |
| `src/components/ohho/Nav.tsx` | Top nav + mobile menu + cart drawer | 392 |
| `src/components/ohho/MenuMagnifier.tsx` | Full menu grid (read for image-loading pattern) | 227 |
| `src/app/layout.tsx` | Font loading (Anton, Manrope, Geist_Mono) | 96 |
| `src/app/page.tsx` | Top-level component wiring + view router | 149 |
| `next.config.ts` | Next.js config | 12 |
| `public/ohho-images/` | 23 PNG/JPEG assets (~2.5 MB total) | — |

### Top findings (P0 critical)

**Mobile (3 critical bugs + ~15 touch-target violations):**
1. 🔴 `UserDashboard.tsx` LiveOrderTracker stage-timeline connector has broken `position: absolute` (no `relative` ancestor at line 617).
2. 🔴 `GenreTimeline.tsx` progress-rail year labels at 0 % and 100 % clip off-screen on mobile.
3. 🔴 `Nav.tsx` cart-drawer qty buttons are `h-6 w-6` (24 px) — far below any usable touch target.
4. 🔴 `AdminPanel.tsx` order-status buttons are `py-1 text-[10px]` (~24 px tall) — admin-critical.
5. 🟠 Many `h-10` (40 px) primary buttons across `Nav`, `VirtualTour3D`, `UserDashboard`, `AdminPanel` miss the 44 px iOS/Android touch-target guideline.
6. 🟠 `OrderingPlatform` payment grid (`grid-cols-3` with 4 entries) and add-ons strip (`grid-cols-3` always) are cramped on 320 px.

**Performance (2 structural issues):**
1. 🔴 **Zero `next/image` adoption** — 14 raw `<img>` tags across 10 files, only 2 with `loading="lazy"`. Hero LCP image has no `priority` / `fetchpriority`. Nav logo is an 80 KB PNG.
2. 🔴 **No code-splitting for heavy components** — `page.tsx` statically imports `VirtualTour3D` (Three.js ~600 KB gzip), `UserDashboard`, `AdminPanel`, `AuthModal`, plus all 12+ section components into one initial chunk. No `next/dynamic` usage anywhere.
3. 🔴 `VirtualTour3D` uses `<Environment preset="sunset" />` — fetches 1–4 MB HDRI from CDN at runtime.
4. 🟠 All 18 food images are 1024×1024 baseline JPEGs mis-named as `.png`, served at 100–177 KB each (~2.5 MB total).
5. 🟡 `Geist_Mono` font loads all 7 weights (no `weight` array in `layout.tsx`).
6. 🟡 `next.config.ts` has no `images.formats`, no `compiler.removeConsole`, and `typescript.ignoreBuildErrors: true` is set.

### Expected impact of P0 fixes

- **Initial JS payload:** ~40 % reduction (Three.js + modal components move to route-level chunks via `next/dynamic`).
- **Initial image bytes:** ~50 % reduction (AVIF/WebP auto-conversion + responsive `srcset` via `next/image`).
- **LCP:** ~1.5–2.5 s improvement on 4 G mobile (hero `priority` + logo compression + image format optimization).

### Verification

- `bun run lint` not run — this was a research-only task with no code changes.
- All findings include exact file paths and line numbers in `audit-report.md`.
- No files were modified.
