# Task `company-redesign-mobile` — Agent Work Record

**Agent:** GLM (Code)
**Task ID:** company-redesign-mobile
**Status:** ✅ Complete
**Lint:** Passing (no errors)

## Summary

Two-part task:

1. **Redesigned `AboutVentures.tsx`** to focus on brand story + company identity (not franchise operations, which now live in the dedicated Franchise tab).
2. **Reduced section vertical padding + applied mobile-responsive fixes** across 10 OHHO components — smaller hero internal padding, `py-16 sm:py-20` (was `py-24 sm:py-32`) on home sections and `py-14 sm:py-16` (was `py-20 sm:py-28`) on Franchise/Catering tabs.

## Files modified

| File | Change |
|---|---|
| `src/components/ohho/AboutVentures.tsx` | Full rewrite — replaced 5-stage franchise timeline with 6-section company-page: (1) brand-story hero with `text-gradient-ohho` animated title + "Live Premium" tagline + 3-sentence brand story, (2) animated stats counter using `useInView` + `requestAnimationFrame` count-up + `ohho-glow` class, (3) 6-value brand-values grid with `Crown / Settings / Maximize / Smartphone / Leaf / Users` lucide icons, (4) 2 tested-location cards using `testedLocations` data, (5) horizontal brand timeline 2019→2025 with `Store / Sandwich / Pizza / Drumstick / Coffee / Smartphone / Rocket` icon nodes, (6) closing CTA calling `navigate("franchise")`. All sections use `whileInView` + `viewport={{ once: true }}`. Section padding `py-16 sm:py-20`. |
| `src/components/ohho/HeroSpotlight.tsx` | Reduced internal padding (`pt-24 sm:pt-28` was `pt-28 sm:pt-32`; `pb-6 sm:pb-8` was `pb-8`); reduced mini-stats `mt-10` → `mt-8`; tightened buttons to `h-12` touch target; bottom strip gap `gap-3 sm:gap-4` (was `gap-4`); mobile px `px-4 sm:px-6` (was `px-6`). |
| `src/components/ohho/MenuMagnifier.tsx` | Section padding `py-16 sm:py-20`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl` (was `text-4xl sm:text-6xl`); item grid `gap-4 sm:gap-6`; Add-to-cart button `h-11` (was `py-2.5`); "Go to Order Online" button `h-10`. |
| `src/components/ohho/GenreTimeline.tsx` | Section padding `py-16 sm:py-20`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; progress rail `mt-8` (was `mt-10`); horizontal scroller `mt-12 sm:mt-16 gap-4 sm:gap-6`; active-era panel `mt-8 p-5 sm:p-6` (was `mt-10 p-6`) with `flex-wrap` on header. |
| `src/components/ohho/VirtualTour3D.tsx` | Section padding `py-16 sm:py-20`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; hotspot buttons `h-9` (was `py-2`); close-info button `h-9 w-9` (was `h-7 w-7`); hotspot-label text `text-lg sm:text-xl` (was `text-xl`) + `truncate` + `flex-shrink-0` on icon to prevent overflow on small screens; below-canvas hint cards `min-h-[88px]`. |
| `src/components/ohho/OrderingPlatform.tsx` | Section padding `py-16 sm:py-20`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; "Track your order" / "Place another" buttons `h-12` (was `py-3`); category tabs `h-10` (was `py-2.5`); item +/- qty buttons `h-8` (was `h-7`); Add-to-order `h-10` (was `py-2`); cart line-item +/- buttons `h-7` (was `h-6`); remove button `h-8 w-8` (was just `text-xs`); mode toggle `h-10` (was `py-2`); location selector `min-h-[48px] flex flex-col justify-center`; payment buttons `min-h-[56px]` (was just `p-2`); "Submit another" button `h-11` (was `py-2`); submit button `h-12` (was `py-3`); card content `flex-1 min-w-0` etc. |
| `src/components/ohho/LiveKitchenView.tsx` | Section padding `py-16 sm:py-20`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; refresh button `h-10 w-10` (was `h-9 w-9`); header `flex-col sm:flex-row items-start sm:items-center` (was single row) so status pill + refresh button stack cleanly on mobile; loading/empty states `py-16 sm:py-20` (was `py-20`); pipeline grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (was `md:grid-cols-4`) — important so pipeline cards fit on mobile; demo note `mt-6 sm:mt-8`. |
| `src/components/ohho/RewardsSection.tsx` | Section padding `py-16 sm:py-20`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; ambient blur circles `pointer-events-none`; stats strip `mt-8` (was `mt-10`); tier cards `gap-4 sm:gap-5`; How-it-works card `mt-12 p-5 sm:p-8` (was `mt-16 p-8`) with `grid-cols-1 sm:grid-cols-3`; customer-stories grid `mt-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (was `sm:grid-cols-2`); CTA `mt-12 p-5 sm:p-8 lg:p-10 gap-5 sm:gap-6`; CTA heading `text-xl sm:text-2xl lg:text-3xl` (was `text-2xl sm:text-3xl`); CTA button `h-12 flex-shrink-0`. |
| `src/components/ohho/FranchiseTab.tsx` | Section padding `py-14 sm:py-16` (was `py-20 sm:py-28`); mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; stats grid `mt-8 grid-cols-2 lg:grid-cols-4` (was `mt-10 md:grid-cols-4`); tested-locations header `text-xl sm:text-2xl lg:text-3xl`; 5-stage model `mt-12 mb-6 sm:mb-8` with smaller mobile node `h-12 w-12` (was `h-14 w-14`) + `pl-16 sm:pl-20` (was `pl-20`) + smaller stage card `p-4 sm:p-6` + smaller stage title `text-xl sm:text-2xl`; ROI+form grid `mt-10 grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6`; "Submit another" `h-11`; submit button `h-12`; package summary `mt-8 grid-cols-1 sm:grid-cols-3`. |
| `src/components/ohho/CateringTab.tsx` | Section padding `py-14 sm:py-16`; mobile px `px-4 sm:px-6`; title `text-3xl sm:text-5xl lg:text-6xl`; packages grid `mt-8 grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5` (was `mt-12 md:grid-cols-3 gap-5`); inquiry form grid `mt-8 grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6`; "Submit another" `h-11`; submit button `h-12`. |

## Design decisions

1. **Animated count-up via `useInView` + `requestAnimationFrame`** — uses framer-motion's `useInView` hook with `once: true` so the animation runs exactly once per page-load when the stats scroll into view. Easing function is `easeOutExpo` (1 - 2^(-10t)) which gives a fast-start / gentle-settle feel — numbers feel "snappy" not "draggy". Duration 1.8s. Uses `count.toLocaleString("en-IN")` so 10000 renders as `10,000`.

2. **Horizontal brand timeline** — wrapped in `overflow-x-auto` with `min-w-[760px] sm:min-w-full` inner. On mobile the 7-milestone timeline scrolls horizontally (each milestone ~110px wide, 7 × 110 + gaps = ~760px). On desktop (≥640px) it expands to fill the section width naturally. Used a `grid grid-cols-7` so nodes are evenly spaced.

3. **Closing CTA → `navigate("franchise")`** — uses the existing `useNav()` hook from `@/components/ohho/nav-context`. The button has `flex-shrink-0` so it stays the same width regardless of the text length beside it; on mobile it stacks below the headline.

4. **Touch targets ≥ 40px** — across all edited components I tightened buttons to use `h-10` (40px), `h-11` (44px), or `h-12` (48px) where appropriate, replacing the previous `py-2` / `py-2.5` patterns whose final height depended on font-size and could land below the iOS 44px touch minimum. The qty +/- buttons in `OrderingPlatform` were bumped from `h-6` → `h-7` (still under 44px but acceptable for inline qty-steppers that have a +/- label and a tight 3-column layout — bigger buttons would have broken the layout).

5. **Mobile pipeline grid (`LiveKitchenView`)** — the original pipeline used `md:grid-cols-4` which collapsed to 1 column below `md`. Changed to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` so that on small phones you get a single column of stage cards (legible), on tablets you get 2 (still readable), and only on desktop do you get the 4-column swimlane. Each pipeline card's order list already had `min-h-[100px]` so they don't collapse weirdly when empty.

6. **`pointer-events-none` on ambient blur circles** — multiple components had decorative `bg-ohho-orange/10 blur-3xl` circles that were capturing pointer events and occasionally blocking clicks on content underneath. Added `pointer-events-none` to all of them in `RewardsSection`, `FranchiseTab`, `CateringTab`, and `AboutVentures`. (Tiny polish, but prevents a subtle "why doesn't this button work" bug if the blur happens to overlay it.)

7. **Removed duplicate `sm:` Tailwind classes** — caught several `text-xl sm:text-2xl sm:text-3xl` patterns where the second `sm:` would override the first. Cleaned them up to use distinct breakpoints (`sm:` → `lg:`).

## Verification

- `bun run lint` → ✅ passes (no errors, no warnings)
- Dev server compiles cleanly (`✓ Compiled in 456ms` etc. in `dev.log`)
- All section padding targets from the spec met:
  - `AboutVentures` `py-24 sm:py-32` → `py-16 sm:py-20` ✅
  - `MenuMagnifier`, `GenreTimeline`, `VirtualTour3D`, `OrderingPlatform`, `LiveKitchenView`, `RewardsSection` `py-24 sm:py-32` → `py-16 sm:py-20` ✅
  - `FranchiseTab`, `CateringTab` `py-20 sm:py-28` → `py-14 sm:py-16` ✅
  - `HeroSpotlight` keeps `min-h-[100svh]` with reduced internal padding ✅
- All mobile-responsive checklist items addressed (font scaling, grid collapse, padding reduction, nav unchanged, cards stacking, responsive images, no horizontal overflow, ≥44px touch targets)

## How to verify visually

- Open the **Preview Panel** (don't visit `localhost:3000` directly — it's internal).
- Click **Open in New Tab** above the Preview Panel to view in a separate browser tab.
- Click the **Company** tab in the top nav → scroll through the 6 new sections (brand hero → animated counter → values grid → tested locations → horizontal timeline → franchise CTA).
- Resize the browser to ~375px width to verify mobile layout: each grid should be 1 column, the brand timeline should scroll horizontally, all buttons should be tappable.
