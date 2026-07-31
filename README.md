# Roomie — Workspace Configurator

Roomie is a workspace rental configurator. Users assemble a desk, a chair, and
accessories, then see the result composited into a photorealistic room preview in
real time, with weekly or monthly pricing and a demo checkout flow.

The core engineering problem is not the catalog — it is the preview. Every
partial selection must still look like a real photograph: objects sit on the
tabletop, respect perspective, and are occluded by the chair in front of them.

- **Live preview** — the room updates on every selection change
- **Data-driven placement** — object positions live in a typed anchor/slot model,
  not in per-product CSS
- **Fully custom form controls** — no native `<select>`, no native date picker, no
  `alert()` and no browser validation bubbles
- **Persistent state** — the current setup is restored from `localStorage`

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Styling | Plain CSS (`app/globals.css`) with Tailwind CSS 4 via PostCSS |
| Language | TypeScript 5.9 (`strict`) |
| Tests | `node --test` against the production build output |
| Runtime | Node.js >= 22.13 |

The page is a client component and the route is statically prerendered — there is
no database, no API route, and no server-side state.

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # production build (prerenders / to .next/server/app/index.html)
npm start            # serve the production build
npm run lint         # eslint (next core-web-vitals + typescript)
npm test             # build, then assert on the prerendered HTML and assets
```

## Deployment

The project targets Vercel with zero configuration: import the repository, keep
the defaults (`next build`), and deploy. Optionally set `NEXT_PUBLIC_SITE_URL` to
your production origin so Open Graph and Twitter image URLs resolve absolutely
(`metadataBase` in `app/layout.tsx` falls back to `http://localhost:3000`).

---

## Project Structure

```
app/
  layout.tsx      Root layout and metadata (OG/Twitter, favicon, metadataBase)
  page.tsx        The configurator: steps, scene, review dialog, checkout
  ui.tsx          Custom form primitives (select, date picker, alerts)
  globals.css     Design system, scene layers, component styles
lib/
  catalog.ts      Products, bundles, pricing, and the whole scene placement model
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

## How the Room Preview Works

### 1. Layer stack

The scene is a stack of absolutely positioned layers inside `.scene-room`, which
is locked to the source photo's 3:2 aspect ratio:

```
room-base.webp                     CSS background
└─ .scene-composite <img>          pre-baked room photograph (object-fit: cover)
   └─ .scene-stage-back            overlays with z-index < 3
      └─ .scene-chair-mask         the room photo re-drawn and masked to the chair
         └─ .scene-stage-front     overlays with z-index >= 3
```

### 2. Pre-baked renders vs. live overlays

`public/scene/renders/` holds 12 photographs: `{compact,wide,oak}-{ergonomic,focus}`
for the bare desk and chair, plus an `-equipped` variant of each.

`hasCompletePicturedKit()` in `lib/catalog.ts` decides which path to take:

- **All four pictured accessories selected** (monitor, lamp, keyboard, mouse) →
  render the `-equipped` photograph directly. No overlays, no compositing seams.
- **Any partial selection** → render the bare photograph and composite flat PNG
  overlays on top.

This all-or-nothing switch is deliberate: mixing a pre-baked accessory with a
flat overlay of the same object would double it.

### 3. The anchor/slot model

Each pictured accessory declares a slot instead of hardcoded CSS coordinates:

```ts
type SceneSlot = {
  x: number;              // horizontal centre of the *visible* content, 0..1
  depth: "back" | "front";
  width: number;          // width of the visible content, 0..1
  baselineOffset?: number;
};
```

`x` and `width` describe visible pixels only, so transparent padding inside an
overlay PNG never shifts the object. `resolveScenePlacements()` converts a slot
into a CSS box by dividing out that padding (`overlayBounds`) and anchoring the
box's bottom edge to a baseline.

`depth` drives two things at once:

- **Baseline** — `back` contacts the rear edge of the tabletop, `front` the near
  edge. Each desk has its own measured pair, because the three desks are
  photographed at slightly different heights:

  ```ts
  const deskBaselines = {
    "aerolift-120":  { back: 0.519, front: 0.536 },
    "aerolift-160":  { back: 0.516, front: 0.533 },
    "form-manual-120": { back: 0.501, front: 0.521 },
  };
  ```

- **Z-index** — `back: 2`, `front: 4`, i.e. either side of the chair matte at
  `z-index: 3`.

`baselineOffset` is added on top of the depth baseline, which lets an object be
drawn *behind* the chair while still contacting the *front* edge of the desk.
The keyboard uses exactly this combination.

### 4. Chair occlusion

The chair is baked into the photograph, so it cannot be moved. To make the
keyboard read as "behind the chair" rather than painted over it,
`scripts/build-chair-mattes.mjs` traces the chair silhouette into an 8-bit
greyscale matte per render (`public/scene/masks/*.png`). The room photo is then
re-drawn above the back overlay stage and masked with it:

```css
.scene-chair-mask {
  mask-mode: luminance;
  mask-size: 100% 100%;
  z-index: 3;
}
```

A per-pixel luminance matte replaced an earlier rectangular `clip-path`, which
clipped the desk and the wall along with the chair.

All slot coordinates and baselines are measured off the `-equipped` renders and
verified in the browser — the equipped photograph is the compositional ground
truth for the overlay path.

---

## Custom UI Primitives (`app/ui.tsx`)

Native form widgets are OS-rendered and cannot be styled to match the design, so
they are all replaced:

**`SelectField`** — a `role="combobox"` trigger plus a `role="listbox"` popover.
Arrow keys move the active option, `Enter`/`Space` commit, `Escape` and `Tab`
close, and a capture-phase `pointerdown` listener closes it on outside clicks.

**`DateField`** — a calendar popover with month navigation and a 7-column grid
built from local-time `Date` objects (dates are parsed component-wise, never via
`new Date("YYYY-MM-DD")`, to avoid UTC off-by-one shifts). Backdating is blocked
on three levels: past days render `disabled`, the previous-month button is
disabled at the minimum month, and `shiftMonth(-1)` refuses to move past it. The
minimum is `todayKey()`, so it follows the real date instead of a hardcoded one.

**`useAlerts` + `AlertStack`** — replaces `alert()`. Notifications are rendered
into the top layer via `popover="manual"` so they stay visible above the modal
`<dialog>` used for review and checkout, and auto-dismiss after ~5 seconds.

Form validation is hand-rolled as well: the checkout form is `noValidate`, and a
missing delivery address produces an inline message plus a toast instead of a
browser bubble.

---

## Data Model (`lib/catalog.ts`)

`lib/catalog.ts` is the single source of truth:

- `products` — 9 items across `desk` / `chair` / `accessory`, each with weekly and
  monthly prices, condition, stock, and an optional `sceneSlot`
- `bundles` — 3 curated setups, each with a fractional `discount` applied to the
  setup total
- `productPrice()` / `setupPrice()` — pricing, including bundle discounts
- `getSceneRender()` / `getSceneChairMatte()` / `resolveScenePlacements()` — the
  scene resolution described above

`WorkspaceSetup` (`deskId`, `chairId`, `accessoryIds`, `bundleId`) is validated on
read with a type guard before being restored from `localStorage`, so a stale or
tampered payload is discarded rather than rendered.

---

## Testing

`npm test` builds the app first, then asserts on real output rather than mocks:

1. The prerendered `/` HTML contains the title, hero copy, catalog names, and
   section headings.
2. `lib/catalog.ts` and `app/page.tsx` keep their structural contracts — typed
   products, scene helpers, `localStorage` persistence, custom form fields, and
   *no* native `<select>` or `type="date"`.
3. `public/scene/renders/` contains exactly the expected 12 `.webp` renders.
4. `public/products/generated/` contains exactly the expected 9 `.webp`
   thumbnails.

Assertions 3 and 4 guard the preview: a missing render silently falls back to a
blank scene at runtime, which a unit test on the component would not catch.

---

## Notes and Limitations

- The checkout is a demo. Nothing is persisted server-side and no payment or
  external request is made.
- Adding a new pictured accessory means producing an overlay PNG, measuring its
  slot against the `-equipped` render, and — if it should sit behind the chair —
  verifying it against the matte.
- Adding a new desk means adding a measured `deskBaselines` entry, or its
  accessories will float above or sink into the tabletop.
