# Roomie — Workspace Configurator

Roomie is a workspace rental configurator. A visitor assembles a desk, a chair,
and accessories, sees the result composited into a photorealistic room in real
time, switches between weekly and monthly pricing, and completes a demo checkout
with a delivery date and address.

The interesting engineering problem is not the catalog. It is the preview: every
*partial* selection must still read as a real photograph. Objects have to sit on
the tabletop, respect the camera's perspective, and be occluded by the chair
standing in front of them — otherwise the product stops feeling like a rental
service and starts feeling like a collage.

---

## Table of Contents

- [Business Flow](#business-flow)
- [UI/UX Design](#uiux-design)
- [Technical Decisions](#technical-decisions)
- [How the Room Preview Works](#how-the-room-preview-works)
- [Custom UI Primitives](#custom-ui-primitives)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Limitations and Extension Points](#limitations-and-extension-points)

---

## Business Flow

The product is a **rental**, not a sale. That single fact drives the whole
information architecture: the visitor is not buying objects, they are committing
to a recurring cost and a delivery appointment. So the funnel is built to answer
three questions in order — *what will my room look like*, *what will it cost per
period*, and *when does it arrive*.

### The funnel

```
Landing  →  Bundle  →  Customize (3 steps)  →  Review  →  Delivery  →  Confirmed
             ↑              │
             └──────────────┘   bundle stays editable; every change re-prices
```

**1. Land and set context.** The header carries the two commercial variables that
change every price on the page: **location** (Bali / Jakarta / Surabaya, which
frames stock as *"4 available in Bali"*) and **delivery date**. They are global
and always visible, because a rental quote is meaningless without them.

**2. Choose a rental period.** A weekly/monthly switch sits in the hero. Monthly
is `weeklyPrice × 4 × 0.75`, surfaced as **"Save 25%"** — the standard rental
lever for pushing longer commitments. The switch reprices the catalog, the
preview, and the checkout at once.

**3. Start from a bundle (optional but promoted).** Three curated setups —
The Essentials (10% off), The Creator (18%, marked *Most popular*), The Founder
(20%) — let a visitor reach a complete room in one tap. Deeper discounts on
larger setups is the deliberate incentive. Bundles are a *starting point*, never
a lock-in: `selectBundle()` loads the setup and returns the visitor to step one
of customization. The app opens with The Creator preloaded, so the first paint is
already a full, believable room rather than an empty desk.

The bundle price, however, is not a coupon. `resolveBundleId()` re-evaluates the
setup on every change: the discount survives only while the selection *is* that
bundle, and the label falls back to "Custom workspace" the moment an item is
added, removed, or swapped. Rebuilding the exact bundle re-attaches it. Without
this rule a visitor could load the 20%-off Founder bundle, strip it to a single
desk, and keep the discount.

**4. Customize in three steps.** Desk → Chair → Add-ons. Desk and chair are
single-choice (`role="radio"`), add-ons are multi-choice (`role="checkbox"`).
This mirrors the physical constraint — one desk, one chair, any number of tools —
and it also guarantees the preview always has a valid base to render.

**5. Understand each item.** Every card shows brand, model, dimensions, finish,
condition (*Like new* / *Excellent*), stock, a strikethrough retail
`compareAtPrice` with a computed discount badge, and the rental price per period.
A details dialog adds the spec grid, feature list, and what is included in the
box. Renting used equipment requires more disclosure than selling new equipment;
condition and inclusions are the two objections that must be answered up front.

**6. Review and commit.** The review dialog lists every piece with its price,
then breaks the order down: equipment subtotal → bundle saving → delivery fee →
**due today**, with *"then $X/week"* underneath. Delivery is either **Roomie
Setup** (free, next day, assembly included) or **Priority Setup** ($5, 2-hour
window, live tracking) — a paid-upgrade slot that does not gate the core
promise. Trust content ("quality checked", "delivery & setup", "swap as you
grow", "flexible returns") sits directly above, pre-empting the four objections
specific to renting.

**7. Confirm.** Submitting validates the address, then swaps the dialog for a
success state with a per-confirmation reference (`ROOM-<delivery date>-<code>`).
This is a demo: nothing is persisted server-side and no payment is taken. The
success copy says so explicitly rather than faking a transaction.

### Pricing model

| Concept | Rule |
| --- | --- |
| Weekly price | `product.weeklyPrice` |
| Monthly price | `weeklyPrice × 4 × 0.75` (25% off) |
| Setup subtotal | sum of every selected product |
| Bundle discount | `subtotal × (1 - bundle.discount)`, only while the setup still matches the bundle exactly |
| Delivery | free, or $5 for Priority |
| Due today | discounted setup total + delivery fee |

All of it lives in `productPrice()` and `setupPrice()` in `lib/catalog.ts`. No
price is ever computed in a component, so the header, the cards, the preview, and
the checkout can never disagree.

---

## UI/UX Design

### The preview is the product

The configurator is a two-column layout: catalog on the left, **sticky** preview
on the right. The preview never scrolls out of view on desktop, because the
entire value proposition is *see it before you rent it*. On mobile the preview
moves inline above the step navigation, and a sticky bottom bar keeps the running
total and the review action reachable.

Selection feedback is immediate and multi-channel: the card gets a `selected`
state, the room re-composites, the piece count and total update, and a
`aria-live="polite"` region announces *"MX Keys added to your workspace"* for
screen readers.

### Progressive disclosure

Three named steps with `✓` / `01`-`02`-`03` markers and `aria-current="step"`
give a sense of progress without blocking navigation — any step can be revisited
at any time. A footer shows *"Step 1 of 3"* plus what is currently selected, and
the primary action is **Continue** until the last step, where it becomes
**Review setup**. Product detail lives behind a *View details* dialog so cards
stay scannable.

### Honest scarcity and honest discounts

Stock is shown per item (*"4 available in Bali"*) and discounts are computed from
a real `compareAtPrice` rather than typed in as marketing copy. Both are derived
from catalog data, so they cannot drift from the actual numbers.

### Every form control is hand-built

Native `<select>` and `<input type="date">` are rendered by the operating system.
They cannot inherit the type scale, they cannot be pill-shaped inside the header
capsule, and they look completely different on macOS, Windows and Android. On a
site whose entire pitch is visual credibility, an OS-styled grey dropdown next to
a photorealistic room is a jarring seam. So they were replaced — along with
`alert()` and the browser's validation bubble — with in-app components that share
the design system. See [Custom UI Primitives](#custom-ui-primitives) for the
implementation and its accessibility contract.

### Accessibility as a constraint, not a pass

- Roles match semantics: `radiogroup`/`radio` for single choice, `checkbox` for
  add-ons, `combobox`+`listbox` for the select, `dialog` for the date popover.
- Keyboard paths for everything custom: arrow keys, `Enter`/`Space`, `Escape`,
  `Tab`.
- A visually hidden live region narrates selection changes.
- Decorative scene layers are `alt=""`; overlays are never announced as content.
- Notifications render in the top layer so they are reachable while a modal is
  open, instead of being trapped behind the backdrop.

---

## Technical Decisions

Each decision below is stated with the alternative that was rejected and why.

### 1. Pre-baked photographs over 3D rendering

**Decision:** ship 12 pre-rendered room photographs (`{compact,wide,oak}` desk ×
`{ergonomic,focus}` chair, each with a bare and an `-equipped` variant) and
composite flat PNG overlays for partial states.

**Rejected:** a real-time 3D scene (three.js / model-viewer). It would give
perfect occlusion and free camera control, but costs megabytes of models, a
noticeable time-to-first-paint, GPU variance across devices, and a look that
reads as "3D render" rather than "photo of a room". The preview's job is
believability, not interactivity.

**Cost accepted:** the desk × chair matrix is combinatorial. Three desks and two
chairs is 12 files; adding a chair adds six.

### 2. All-or-nothing switch between `-equipped` renders and overlays

**Decision:** if all four pictured accessories are selected, show the
`-equipped` photograph and draw *no* overlays. Otherwise show the bare
photograph and composite overlays (`hasCompletePicturedKit()`).

**Rejected:** always compositing overlays. The fully-equipped state is the most
common (it is the default and it is what every bundle loads), and a real
photograph of the complete kit beats any composite. Mixing the two paths would
double each object — the baked monitor plus an overlay monitor.

**Consequence:** the `-equipped` renders are separate photographs, not diffs of
the bare ones. The chair is even framed slightly differently between them, which
is why pixel-diffing the two is meaningless and why the equipped render is used
as a *compositional* reference only.

### 3. Data-driven anchor/slot model instead of per-product CSS

**Decision:** each pictured accessory declares a typed `SceneSlot`
(`x`, `width`, `depth`, `baselineOffset`) in `lib/catalog.ts`, and
`resolveScenePlacements()` derives the CSS box.

**Rejected:** hardcoded `.scene-desk-x .accessory-y { top: …; left: … }` rules.
That was the original approach and it broke the moment an accessory was removed:
each product needed rules per desk, and nothing shared a baseline, so a partial
selection left objects floating. The slot model makes "sitting on the desk" a
property of the data, so a new product means one measured entry, not a new CSS
block.

### 4. Slots describe visible content, not the image box

**Decision:** `x` and `width` refer to the visible pixels of the overlay, and
`overlayBounds` divides out the transparent padding.

**Rejected:** positioning by the PNG's bounding box. Re-exporting an asset with
different padding would then silently shift the object in the scene. Decoupling
the two makes assets replaceable.

### 5. Depth as a single axis controlling baseline *and* z-order

**Decision:** `depth: "back" | "front"` selects both the contact line on the
tabletop (rear or near edge, per-desk measured) and the z-index (`2` or `4`,
either side of the chair matte at `3`). `baselineOffset` then allows the
combination "drawn behind the chair, but contacting the front edge".

**Rejected:** independent `top`/`zIndex` fields. In a fixed-camera photograph
depth and stacking are the same physical fact; letting them diverge only invites
states that cannot exist in reality (an object in front of the chair but standing
at the back of the desk).

### 6. Per-pixel luminance matte for chair occlusion

**Decision:** re-draw the room photograph above the back overlay layer and mask
it with an 8-bit greyscale matte that traces the chair silhouette
(`scripts/build-chair-mattes.mjs` → `public/scene/masks/*.png`).

**Rejected #1:** moving the keyboard out of the chair's way. It solved the
collision but put the keyboard somewhere no one puts a keyboard.

**Rejected #2:** a rectangular `clip-path` over the chair. Cheaper, but it clips
the desk and the wall along with the chair, so the seam is visible.

**Rejected #3:** hiding the keyboard overlay entirely in partial states. Fastest
fix, worst outcome — the visitor selects a keyboard and sees nothing appear.

The chair is baked into the photograph and therefore cannot move. Correct
occlusion is the only physically honest answer, and a per-pixel matte is what
makes it exact.

### 7. Measured coordinates, verified in a browser

Every slot coordinate and desk baseline is *measured* off the `-equipped`
renders, then verified by reading back `getBoundingClientRect()` percentages in
the running app across desks, chairs, and accessory combinations. Guessed
coordinates were the single largest source of "floating object" regressions.

### 8. Client-side state with a validating guard

**Decision:** `useState` plus `localStorage` (`roomie-workspace-v2`), restored
through an `isWorkspaceSetup()` type guard that checks every id against the
catalog.

**Rejected:** a database or server session. There is no account, no cart to
share, and no inventory to reserve in a demo; the setup is a client concern.
The guard matters because a stale payload from an earlier catalog version would
otherwise render a broken scene, so an invalid payload is discarded instead.

### 9. Plain CSS for the scene, utilities for the rest

**Decision:** the scene, layout and components live in a single authored
stylesheet (`app/globals.css`); Tailwind is wired through PostCSS for utility
work.

**Rejected:** expressing the scene in utility classes. The preview needs
`mask-mode`, computed percentage geometry, a strict aspect-ratio box and layered
stacking contexts — all of which are clearer as named, documented rules than as
long class strings.

### 10. Next.js App Router on Vercel, not Cloudflare Workers

**Decision:** a plain Next.js 16 app; the route is statically prerendered.

**Rejected:** the original Cloudflare Workers/D1 scaffold (`vinext`, `wrangler`,
Drizzle, a Worker entry, an image-optimization proxy). None of it was used —
there is no database, no API route and no server state — and it forced a
non-standard build. Removing it made the project deploy on Vercel with zero
configuration and eliminated the type errors that came with the Workers globals.

### 11. Tests assert on build output and assets, not components

**Decision:** `npm test` runs `next build`, then asserts against the prerendered
HTML, the catalog's structural contracts, and the exact contents of the asset
directories.

**Rejected:** a component test suite. The failure modes that actually hurt this
app are *a missing render file* (the scene silently goes blank) and *a native
control creeping back in*. A DOM-level component test would catch neither; a
filesystem and build-output assertion catches both.

---

## How the Room Preview Works

### Layer stack

Inside `.scene-room`, locked to the source photo's 3:2 aspect ratio:

```
room-base.webp                     CSS background
└─ .scene-composite <img>          pre-baked room photograph (object-fit: cover)
   └─ .scene-stage-back            overlays with z-index < 3
      └─ .scene-chair-mask         the room photo re-drawn, masked to the chair
         └─ .scene-stage-front     overlays with z-index >= 3
```

The mask layer is only mounted when there is something behind the chair to
occlude (`chairMatte && backPlacements.length > 0`), so the fully-equipped and
front-only states pay nothing for it.

### The slot model

```ts
type SceneSlot = {
  x: number;              // horizontal centre of the visible content, 0..1
  depth: "back" | "front";
  width: number;          // width of the visible content, 0..1
  baselineOffset?: number;
};
```

`resolveScenePlacements(accessories, deskId)` turns a slot into a CSS box:
it divides out the overlay's transparent padding, derives the height from the
asset's aspect ratio, centres the box on `x`, and anchors its bottom edge to
`baseline + (baselineOffset ?? 0)`.

Baselines are measured per desk, because the three desks are photographed at
slightly different heights:

```ts
const depthLayer = { back: 2, front: 4 };

const deskBaselines = {
  "aerolift-120":    { back: 0.519, front: 0.536 },
  "aerolift-160":    { back: 0.516, front: 0.533 },
  "form-manual-120": { back: 0.501, front: 0.521 },
};
```

Worked example — the keyboard:

```ts
sceneSlot: { x: 0.583, depth: "back", width: 0.098, baselineOffset: 0.017 }
```

It sits directly in front of the monitor (`x` read off the `-equipped` render),
on the **back** layer so the chair silhouette cuts across its left end, but with
a `baselineOffset` that puts it on the *front* edge of the tabletop where a
keyboard actually is.

### Chair occlusion

```css
.scene-chair-mask {
  mask-mode: luminance;
  mask-size: 100% 100%;
  z-index: 3;
}
```

White pixels in the matte keep the re-drawn photograph (the chair), black pixels
let the overlay layer below show through. `scripts/build-chair-mattes.mjs`
regenerates all six mattes from the renders.

---

## Custom UI Primitives

All in `app/ui.tsx`.

**`SelectField`** — a `role="combobox"` trigger and a `role="listbox"` popover.
Arrow keys move the active option, `Enter`/`Space` commits, `Escape` and `Tab`
close, and a capture-phase `pointerdown` listener closes it on an outside click.
Options carry `aria-selected`, and the trigger is wired to the field label with
`aria-labelledby`.

**`DateField`** — a calendar popover with month navigation and a 7-column,
Monday-first grid. Dates are parsed component-wise (`new Date(y, m - 1, d)`),
never through `new Date("YYYY-MM-DD")`, which would be interpreted as UTC and
shift the calendar by a day in negative offsets.

Backdating is blocked at three levels, so no path reaches an invalid date:

1. days before the minimum render `disabled`;
2. the previous-month button is `disabled` once the cursor reaches the minimum
   month;
3. `shiftMonth(-1)` refuses to move past it even if invoked programmatically.

The minimum is `todayKey()` — derived from the current date rather than a
hardcoded string, so it cannot go stale.

**`useAlerts` + `AlertStack`** — replaces `alert()`. Notifications are rendered
into the top layer via `popover="manual"`, which is what keeps them visible above
the modal `<dialog>` used for review and checkout; a `z-index` alone cannot
escape a modal's backdrop. Each alert has a tone (`info` / `error` / `success`),
`role="alert"`, a manual dismiss, and auto-dismisses after ~5 seconds.

**Validation** is hand-rolled too: the checkout form is `noValidate`, and a
missing delivery address produces an inline message plus an error toast instead
of a browser bubble. `aria-invalid` is set on the field, and the message clears
as soon as the visitor types.

---

## Data Model

`lib/catalog.ts` is the single source of truth:

- `products` — 9 items across `desk` / `chair` / `accessory`, each with weekly
  price, optional `compareAtPrice`, condition, stock, dimensions, features,
  inclusions, and an optional `sceneSlot`
- `bundles` — 3 curated setups, each with a fractional `discount` applied to the
  setup total
- `productPrice()` / `setupPrice()` — all pricing, including bundle discounts
- `resolveBundleId()` — re-derives the active bundle from the current selection,
  so a discount cannot outlive the setup that earned it
- `getSceneRender()` / `getSceneChairMatte()` / `hasCompletePicturedKit()` /
  `resolveScenePlacements()` — scene resolution
- `WorkspaceSetup` — `deskId`, `chairId`, `accessoryIds`, `bundleId`; validated
  by a type guard before being restored from `localStorage`

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build; prerenders `/` |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next/core-web-vitals` + TypeScript) |
| `npm test` | Build, then assert on output and assets |

Requires Node.js `>= 22.13`.

## Deployment

Zero-config on Vercel: import the repository, keep the defaults (`next build`),
deploy. Optionally set `NEXT_PUBLIC_SITE_URL` to the production origin so Open
Graph and Twitter image URLs resolve absolutely — `metadataBase` in
`app/layout.tsx` falls back to `http://localhost:3000`.

The route is statically prerendered and there is no database, API route, or
runtime binding to configure.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Authored CSS + Tailwind CSS 4 via PostCSS |
| Language | TypeScript 5.9 (`strict`) |
| Tests | `node --test` against the production build |
| Runtime | Node.js >= 22.13 |

---

## Project Structure

```
app/
  layout.tsx      Root layout, metadata (OG/Twitter, favicon, metadataBase)
  page.tsx        Configurator: steps, scene, details dialog, review, checkout
  ui.tsx          Custom form primitives (select, date picker, alerts)
  globals.css     Design system, scene layers, component styles
lib/
  catalog.ts      Products, bundles, pricing, and the scene placement model
public/
  scene/renders/  12 pre-baked room photographs
  scene/masks/    6 greyscale chair-occlusion mattes
  products/       Catalog thumbnails (webp) and overlay cut-outs (png)
scripts/
  build-chair-mattes.mjs   Regenerates the chair mattes from the room renders
tests/
  rendered-html.test.mjs   Build-output and asset-integrity assertions
```

---

## Testing

`npm test` builds first, then asserts on real output:

1. the prerendered `/` HTML contains the title, hero copy, catalog names, and
   section headings;
2. `lib/catalog.ts` and `app/page.tsx` keep their structural contracts — typed
   products, scene helpers, `localStorage` persistence, custom form fields, and
   **no** native `<select>` or `type="date"`;
3. `public/scene/renders/` contains exactly the 12 expected `.webp` renders;
4. `public/products/generated/` contains exactly the 9 expected `.webp`
   thumbnails.

---

## Limitations and Extension Points

- **Checkout is a demo.** No payment, no persistence, no outbound request.
- **Adding a pictured accessory** means producing an overlay PNG, measuring its
  slot against an `-equipped` render, and — if it belongs behind the chair —
  verifying it against the matte.
- **Adding a desk** requires a measured `deskBaselines` entry, or its accessories
  will float above or sink into the tabletop.
- **Adding a chair** multiplies the render matrix by six files and needs a new
  matte.
- **Location is presentational.** It frames stock and the review header; it does
  not yet drive availability or pricing.
