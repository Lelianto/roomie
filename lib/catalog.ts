export type Category = "desk" | "chair" | "accessory";
export type RentalCycle = "weekly" | "monthly";

/**
 * Where an accessory sits on the desk. All values are fractions of the
 * `.scene-room` box, so they stay correct at any render size.
 * `depth` picks the perspective row: it drives both the contact baseline and
 * the paint order, so items in the same row always share a baseline and
 * nearer rows always paint over farther ones.
 */
export type SceneDepth = "back" | "front";

export type SceneSlot = {
  /** Horizontal centre of the visible object, ignoring transparent padding. */
  x: number;
  depth: SceneDepth;
  /** Width of the visible object, ignoring transparent padding. */
  width: number;
  /** Per-item nudge off the row baseline, for items that hang or float. */
  baselineOffset?: number;
};

export type Product = {
  id: string;
  category: Category;
  brand: string;
  name: string;
  model: string;
  description: string;
  weeklyPrice: number;
  compareAtPrice?: number;
  image: string;
  sceneOverlay?: string;
  sceneSlot?: SceneSlot;
  badge?: "Instant" | "Popular" | "New";
  condition: "Excellent" | "Like new";
  stock: number;
  color: string;
  dimensions: string;
  weight?: string;
  features: string[];
  included: string[];
};

export type WorkspaceSetup = {
  deskId: string;
  chairId: string;
  accessoryIds: string[];
  bundleId: string | null;
};

export type Bundle = {
  id: string;
  name: string;
  label: string;
  description: string;
  discount: number;
  setup: Omit<WorkspaceSetup, "bundleId">;
};

export const products: Product[] = [
  {
    id: "aerolift-120",
    category: "desk",
    brand: "Roomie Works",
    name: "AeroLift 120",
    model: "Electric Standing Desk",
    description:
      "A compact sit-stand desk with dual cable ports and a whisper-quiet memory motor.",
    weeklyPrice: 9,
    compareAtPrice: 18,
    image: "/products/generated/aerolift-120.webp",
    badge: "Popular",
    condition: "Like new",
    stock: 4,
    color: "Carbon black",
    dimensions: "120 × 70 × 70–118 cm",
    weight: "31 kg",
    features: [
      "Electric height adjustment",
      "70–118 cm working range",
      "Quiet motor under 45 dB",
      "Two cable-management ports",
    ],
    included: ["Desk", "Power cord", "Assembly & setup"],
  },
  {
    id: "aerolift-160",
    category: "desk",
    brand: "Roomie Works",
    name: "AeroLift 160",
    model: "Wide Electric Standing Desk",
    description:
      "A generous 160 cm surface for dual displays, speakers, and serious creative work.",
    weeklyPrice: 12,
    compareAtPrice: 20,
    image: "/products/generated/aerolift-160.webp",
    badge: "New",
    condition: "Like new",
    stock: 2,
    color: "Graphite",
    dimensions: "160 × 70 × 70–118 cm",
    weight: "38 kg",
    features: [
      "Wide dual-screen surface",
      "Electric sit-stand motor",
      "Three height presets",
      "Integrated cable tray",
    ],
    included: ["Desk", "Cable tray", "Power cord", "Assembly & setup"],
  },
  {
    id: "form-manual-120",
    category: "desk",
    brand: "Roomie Works",
    name: "Form 120",
    model: "Manual Standing Desk",
    description:
      "A warm oak-look desk with smooth mechanical adjustment and no power required.",
    weeklyPrice: 7,
    compareAtPrice: 10,
    image: "/products/generated/form-120.webp",
    badge: "Instant",
    condition: "Excellent",
    stock: 3,
    color: "Natural oak",
    dimensions: "120 × 70 × 70–120 cm",
    weight: "29 kg",
    features: [
      "Mechanical height control",
      "No power connection needed",
      "Scratch-resistant surface",
      "Stable steel frame",
    ],
    included: ["Desk", "Adjustment handle", "Assembly & setup"],
  },
  {
    id: "ergoflex-4d",
    category: "chair",
    brand: "Fantech",
    name: "ErgoFlex 4D",
    model: "Ergonomic Mesh Chair",
    description:
      "Full-day support with adjustable headrest, lumbar control, 4D arms, and leg rest.",
    weeklyPrice: 8,
    compareAtPrice: 16,
    image: "/products/generated/ergoflex-4d.webp",
    badge: "Popular",
    condition: "Like new",
    stock: 5,
    color: "Black mesh",
    dimensions: "68 × 67 × 117–126 cm",
    weight: "22 kg",
    features: [
      "4D adjustable armrests",
      "Height-adjustable lumbar support",
      "Multi-angle reclining lock",
      "Retractable leg rest",
    ],
    included: ["Chair", "Headrest", "Assembly & setup"],
  },
  {
    id: "focus-mesh",
    category: "chair",
    brand: "Fantech",
    name: "Focus Mesh",
    model: "Mid-back Task Chair",
    description:
      "A lighter ergonomic chair with breathable mesh and a compact footprint.",
    weeklyPrice: 6,
    compareAtPrice: 10,
    image: "/products/generated/focus-mesh.webp",
    badge: "Instant",
    condition: "Excellent",
    stock: 3,
    color: "Graphite mesh",
    dimensions: "64 × 64 × 105–115 cm",
    weight: "17 kg",
    features: [
      "Breathable mesh back",
      "Adjustable seat height",
      "Tilt tension control",
      "Silent 60 mm casters",
    ],
    included: ["Chair", "Lumbar insert", "Assembly & setup"],
  },
  {
    id: "viewpro-27",
    category: "accessory",
    brand: "Redmi",
    name: 'ViewPro 27" 4K',
    model: "USB-C Multimedia Monitor",
    description:
      "A sharp 4K IPS display with accurate color, HDR, and single-cable USB-C.",
    weeklyPrice: 9,
    compareAtPrice: 12,
    image: "/products/generated/viewpro-27.webp",
    sceneOverlay: "/products/overlays/monitor.png",
    sceneSlot: { x: 0.523, depth: "back", width: 0.157 },
    badge: "Instant",
    condition: "Like new",
    stock: 6,
    color: "Matte black",
    dimensions: "61 × 18 × 46 cm",
    weight: "5.7 kg",
    features: [
      "3840 × 2160 4K IPS",
      "95% DCI-P3 color",
      "USB-C and HDMI",
      "Tilt-adjustable stand",
    ],
    included: ["Monitor", "HDMI cable", "USB-C cable", "Power cable"],
  },
  {
    id: "mi-lamp-1s",
    category: "accessory",
    brand: "Roomie Works",
    name: "Line Task Lamp",
    model: "Dimmable Desk Light",
    description:
      "A focused, flicker-free light bar with adjustable warmth and a compact weighted base.",
    weeklyPrice: 2.5,
    compareAtPrice: 3.25,
    image: "/products/generated/line-task-lamp.webp",
    sceneOverlay: "/products/overlays/lamp.png",
    sceneSlot: { x: 0.635, depth: "back", width: 0.072 },
    badge: "Instant",
    condition: "Like new",
    stock: 4,
    color: "Matte black",
    dimensions: "18 × 18 × 52 cm",
    weight: "0.8 kg",
    features: [
      "520 lm focused output",
      "2700–5000 K color range",
      "Four lighting modes",
      "Touch dimmer control",
    ],
    included: ["Lamp", "Power adapter", "Quick-start guide"],
  },
  {
    id: "mx-keys",
    category: "accessory",
    brand: "Logitech",
    name: "MX Keys",
    model: "Wireless Keyboard",
    description:
      "Low-profile illuminated keys with multi-device switching for Mac and Windows.",
    weeklyPrice: 3,
    compareAtPrice: 3.75,
    image: "/products/generated/mx-keys.webp",
    sceneOverlay: "/products/overlays/keyboard.png",
    // Read off the `-equipped` render: the keyboard sits directly in front of the
    // monitor. It is drawn on the back layer so the chair silhouette occludes its
    // left end instead of the overlay painting over the chair, with a baseline
    // offset that keeps it on the front edge of the tabletop.
    sceneSlot: { x: 0.583, depth: "back", width: 0.098, baselineOffset: 0.017 },
    badge: "Popular",
    condition: "Excellent",
    stock: 7,
    color: "Graphite",
    dimensions: "43 × 13 × 2 cm",
    weight: "0.8 kg",
    features: [
      "Smart backlit keys",
      "Three-device switching",
      "USB-C charging",
      "Up to five months battery",
    ],
    included: ["Keyboard", "USB receiver", "USB-C cable"],
  },
  {
    id: "mx-master-3s",
    category: "accessory",
    brand: "Logitech",
    name: "MX Master 3S",
    model: "Wireless Performance Mouse",
    description:
      "An ergonomic precision mouse with quiet clicks and an 8K DPI tracking sensor.",
    weeklyPrice: 3,
    compareAtPrice: 3.75,
    image: "/products/generated/mx-master-3s.webp",
    sceneOverlay: "/products/overlays/mouse.png",
    sceneSlot: { x: 0.672, depth: "front", width: 0.022 },
    badge: "Instant",
    condition: "Excellent",
    stock: 8,
    color: "Graphite",
    dimensions: "12.5 × 8.4 × 5.1 cm",
    weight: "141 g",
    features: [
      "8,000 DPI sensor",
      "Quiet tactile clicks",
      "MagSpeed scroll wheel",
      "Up to 70 days battery",
    ],
    included: ["Mouse", "USB receiver", "USB-C cable"],
  },
];

export const bundles: Bundle[] = [
  {
    id: "essentials",
    name: "The Essentials",
    label: "Start smart",
    description: "The ergonomic foundation: an electric desk and supportive chair.",
    discount: 0.1,
    setup: {
      deskId: "aerolift-120",
      chairId: "focus-mesh",
      accessoryIds: [],
    },
  },
  {
    id: "creator",
    name: "The Creator",
    label: "Most popular",
    description: "A complete 4K setup for focused design, writing, and building.",
    discount: 0.18,
    setup: {
      deskId: "aerolift-120",
      chairId: "ergoflex-4d",
      accessoryIds: ["viewpro-27", "mi-lamp-1s", "mx-keys", "mx-master-3s"],
    },
  },
  {
    id: "founder",
    name: "The Founder",
    label: "Maximum space",
    description: "A wide executive setup with every detail already considered.",
    discount: 0.2,
    setup: {
      deskId: "aerolift-160",
      chairId: "ergoflex-4d",
      accessoryIds: ["viewpro-27", "mi-lamp-1s", "mx-keys", "mx-master-3s"],
    },
  },
];

export const initialSetup: WorkspaceSetup = {
  ...bundles[1].setup,
  bundleId: bundles[1].id,
};

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

// A bundle discount only applies while the setup still is that bundle. Returns
// the matching bundle id, or null once the visitor has changed anything.
export function resolveBundleId(setup: Omit<WorkspaceSetup, "bundleId">) {
  const match = bundles.find(
    (bundle) =>
      bundle.setup.deskId === setup.deskId &&
      bundle.setup.chairId === setup.chairId &&
      bundle.setup.accessoryIds.length === setup.accessoryIds.length &&
      bundle.setup.accessoryIds.every((id) => setup.accessoryIds.includes(id)),
  );
  return match?.id ?? null;
}

export function getSetupProducts(setup: WorkspaceSetup) {
  return products.filter(
    (product) =>
      product.id === setup.deskId ||
      product.id === setup.chairId ||
      setup.accessoryIds.includes(product.id),
  );
}

export const picturedAccessoryIds = [
  "viewpro-27",
  "mi-lamp-1s",
  "mx-keys",
  "mx-master-3s",
] as const;

export function hasCompletePicturedKit(setup: WorkspaceSetup) {
  return picturedAccessoryIds.every((id) => setup.accessoryIds.includes(id));
}

function sceneKey(setup: WorkspaceSetup) {
  const desk =
    ({
      "aerolift-120": "compact",
      "aerolift-160": "wide",
      "form-manual-120": "oak",
    } as Record<string, string>)[setup.deskId] ?? "compact";
  const chair =
    ({
      "ergoflex-4d": "ergonomic",
      "focus-mesh": "focus",
    } as Record<string, string>)[setup.chairId] ?? "ergonomic";

  return `${desk}-${chair}`;
}

export function getSceneRender(setup: WorkspaceSetup) {
  const equipment = hasCompletePicturedKit(setup) ? "-equipped" : "";

  return `/scene/renders/${sceneKey(setup)}${equipment}.webp`;
}

/**
 * Overlays always paint above the scene photo, so the chair back would sit
 * behind a monitor that is meant to stand further away. The photo is re-drawn
 * on top of the overlays and masked down to the chair silhouette, which
 * `scripts/build-chair-mattes.mjs` traces out of the bare render itself. A
 * rectangle cannot do this job: it repaints wall over the overlay and punches a
 * visible pale notch through it.
 */
const chairMatteKeys = new Set([
  "compact-ergonomic",
  "compact-focus",
  "wide-ergonomic",
  "wide-focus",
  "oak-ergonomic",
  "oak-focus",
]);

/** Luminance matte for the chair silhouette, or null when the setup has none. */
export function getSceneChairMatte(setup: WorkspaceSetup) {
  const key = sceneKey(setup);

  return chairMatteKeys.has(key) ? `/scene/masks/${key}.png` : null;
}

/** Must stay in sync with the `aspect-ratio` of `.scene-room` in globals.css. */
const ROOM_ASPECT = 3 / 2;

/**
 * Opaque bounds of each overlay PNG, measured once from its pixels. Every asset
 * has a different amount of transparent padding, so the bottom of the file is
 * not the point where the object touches the desk. Without these numbers a
 * shared baseline puts each item at a different apparent height.
 */
const overlayBounds: Record<
  string,
  { w: number; h: number; minX: number; maxX: number; minY: number; maxY: number }
> = {
  "viewpro-27": { w: 1536, h: 1024, minX: 323, maxX: 1211, minY: 166, maxY: 873 },
  "mi-lamp-1s": { w: 1086, h: 1448, minX: 228, maxX: 748, minY: 157, maxY: 1282 },
  "mx-master-3s": { w: 1254, h: 1254, minX: 120, maxX: 1122, minY: 288, maxY: 946 },
  "mx-keys": { w: 1536, h: 1024, minX: 109, maxX: 1416, minY: 369, maxY: 640 },
};

const depthLayer: Record<SceneDepth, number> = {
  back: 2,
  front: 4,
};

/**
 * Contact line for each perspective row, as a fraction of room height. The
 * camera looks slightly down at the desk, so rows further back touch the
 * surface higher up the frame: back < mid < front. Each desk render is shot at
 * its own height, so the rows are measured per desk.
 */
const deskBaselines: Record<string, Record<SceneDepth, number>> = {
  // Read off the `-equipped` renders, where the same objects are photographed
  // in place: the back row contacts the tabletop's rear edge, the front row sits
  // a little ahead of it.
  "aerolift-120": { back: 0.519, front: 0.536 }, // surface 0.515 → apron 0.540
  "aerolift-160": { back: 0.516, front: 0.533 }, // surface 0.512 → apron 0.537
  "form-manual-120": { back: 0.501, front: 0.521 }, // surface 0.496 → apron 0.534
};

/** Per-desk horizontal re-centring, since each desk render has its own width. */
const deskSlotShift: Record<string, Record<string, number>> = {};

export type ScenePlacement = {
  id: string;
  overlay: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
};

/**
 * Turn the selected accessories into absolute placements. The box we emit is
 * sized to the whole PNG but derived from the visible object, so the object
 * lands at its slot centre and its row baseline whatever else is selected.
 * Sorted back to front so paint order matches depth.
 */
export function resolveScenePlacements(
  accessories: Product[],
  deskId: string,
): ScenePlacement[] {
  const shifts = deskSlotShift[deskId] ?? {};
  const baselines = deskBaselines[deskId] ?? deskBaselines["aerolift-120"];

  return accessories
    .flatMap((product) => {
      const slot = product.sceneSlot;
      const bounds = overlayBounds[product.id];
      if (!slot || !bounds || !product.sceneOverlay) return [];

      const contentWidth = (bounds.maxX - bounds.minX + 1) / bounds.w;
      const contentCentreX = (bounds.minX + bounds.maxX + 1) / 2 / bounds.w;
      const padBottom = (bounds.h - 1 - bounds.maxY) / bounds.h;

      // Scale the full PNG up so its visible part matches the requested width,
      // then take the height from the PNG's own ratio to avoid letterboxing.
      const boxWidth = slot.width / contentWidth;
      const boxHeight = boxWidth * ROOM_ASPECT * (bounds.h / bounds.w);
      const baseline = baselines[slot.depth] + (slot.baselineOffset ?? 0);
      const x = shifts[product.id] ?? slot.x;

      return [
        {
          id: product.id,
          overlay: product.sceneOverlay,
          left: (x - boxWidth * contentCentreX) * 100,
          top: (baseline - boxHeight * (1 - padBottom)) * 100,
          width: boxWidth * 100,
          height: boxHeight * 100,
          zIndex: depthLayer[slot.depth],
        },
      ];
    })
    .sort((a, b) => a.zIndex - b.zIndex);
}

export function productPrice(product: Product, cycle: RentalCycle) {
  return cycle === "weekly" ? product.weeklyPrice : product.weeklyPrice * 4 * 0.75;
}

export function setupPrice(setup: WorkspaceSetup, cycle: RentalCycle) {
  const subtotal = getSetupProducts(setup).reduce(
    (sum, product) => sum + productPrice(product, cycle),
    0,
  );
  const bundle = bundles.find((item) => item.id === setup.bundleId);
  return bundle ? subtotal * (1 - bundle.discount) : subtotal;
}
