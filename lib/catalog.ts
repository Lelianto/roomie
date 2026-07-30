export type Category = "desk" | "chair" | "accessory";
export type RentalCycle = "weekly" | "monthly";

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
  {
    id: "alloy-stand",
    category: "accessory",
    brand: "Twelve",
    name: "Alloy Lift",
    model: "Ergonomic Laptop Stand",
    description:
      "A rigid aluminum riser that brings 10–17 inch laptops to a healthier eye level.",
    weeklyPrice: 1.5,
    compareAtPrice: 2,
    image: "/products/generated/alloy-stand.webp",
    sceneOverlay: "/products/overlays/stand.png",
    badge: "Instant",
    condition: "Excellent",
    stock: 9,
    color: "Aluminum",
    dimensions: "24 × 23 × 15 cm",
    weight: "0.9 kg",
    features: [
      "Fits laptops up to 17 inches",
      "Ventilated aluminum body",
      "Anti-slip silicone pads",
      "Cable pass-through",
    ],
    included: ["Laptop stand"],
  },
  {
    id: "smart-strip",
    category: "accessory",
    brand: "Xiaomi",
    name: "Smart Power Strip",
    model: "Universal Desk Power",
    description:
      "Three universal sockets plus USB charging in a tidy two-meter desktop strip.",
    weeklyPrice: 0.75,
    image: "/products/generated/smart-strip.webp",
    sceneOverlay: "/products/overlays/strip.png",
    badge: "Instant",
    condition: "Excellent",
    stock: 12,
    color: "Black",
    dimensions: "23 × 4.2 × 2.6 cm",
    weight: "420 g",
    features: [
      "Three universal sockets",
      "Three USB charging ports",
      "Two-meter power cable",
      "Overload protection",
    ],
    included: ["Power strip", "EU wall adapter"],
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
      accessoryIds: [
        "viewpro-27",
        "mi-lamp-1s",
        "mx-keys",
        "mx-master-3s",
        "alloy-stand",
        "smart-strip",
      ],
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

export function getSceneRender(setup: WorkspaceSetup) {
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
  const equipment = hasCompletePicturedKit(setup) ? "-equipped" : "";

  return `/scene/renders/${desk}-${chair}${equipment}.webp`;
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
