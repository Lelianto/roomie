"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "desk" | "chair" | "accessory";
type Finish = "walnut" | "oak" | "black";

type Product = {
  id: string;
  category: Category;
  name: string;
  eyebrow: string;
  description: string;
  price: number;
  finish: Finish;
};

type Setup = {
  deskId: string;
  chairId: string;
  accessoryIds: string[];
};

const products: Product[] = [
  {
    id: "frame-desk",
    category: "desk",
    name: "Frame Desk",
    eyebrow: "Calm & focused",
    description: "A slim oak desk with soft edges and cable management.",
    price: 320,
    finish: "oak",
  },
  {
    id: "studio-desk",
    category: "desk",
    name: "Studio Desk",
    eyebrow: "Room to create",
    description: "A wider walnut surface for bigger ideas and dual screens.",
    price: 460,
    finish: "walnut",
  },
  {
    id: "rise-desk",
    category: "desk",
    name: "Rise Desk",
    eyebrow: "Sit. Stand. Repeat.",
    description: "An adjustable black desk built for long, flexible days.",
    price: 590,
    finish: "black",
  },
  {
    id: "form-chair",
    category: "chair",
    name: "Form Chair",
    eyebrow: "Support, simplified",
    description: "Breathable ergonomic support with a compact silhouette.",
    price: 180,
    finish: "black",
  },
  {
    id: "soft-chair",
    category: "chair",
    name: "Soft Chair",
    eyebrow: "Comfort first",
    description: "Generous cushioning in a warm neutral woven fabric.",
    price: 240,
    finish: "oak",
  },
  {
    id: "arc-chair",
    category: "chair",
    name: "Arc Chair",
    eyebrow: "A design classic",
    description: "Sculpted walnut and leather for a considered workspace.",
    price: 310,
    finish: "walnut",
  },
  {
    id: "wide-monitor",
    category: "accessory",
    name: "Studio Display",
    eyebrow: "32-inch 4K",
    description: "A crisp, generous canvas for deep work.",
    price: 210,
    finish: "black",
  },
  {
    id: "task-lamp",
    category: "accessory",
    name: "Task Lamp",
    eyebrow: "Warm dimmable light",
    description: "Focused light that keeps evenings comfortable.",
    price: 48,
    finish: "black",
  },
  {
    id: "desk-plant",
    category: "accessory",
    name: "Desk Plant",
    eyebrow: "A little life",
    description: "Low-maintenance greenery in a stone pot.",
    price: 24,
    finish: "oak",
  },
  {
    id: "organizer",
    category: "accessory",
    name: "Desk Organizer",
    eyebrow: "Everything in place",
    description: "A compact tray for notes, cables, and daily tools.",
    price: 36,
    finish: "walnut",
  },
];

const categories: { id: Category; label: string }[] = [
  { id: "desk", label: "Desks" },
  { id: "chair", label: "Chairs" },
  { id: "accessory", label: "Accessories" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const initialSetup: Setup = {
  deskId: "studio-desk",
  chairId: "form-chair",
  accessoryIds: ["wide-monitor", "desk-plant"],
};

function ProductIcon({ product }: { product: Product }) {
  if (product.category === "desk") {
    return (
      <div className={`mini-desk finish-${product.finish}`} aria-hidden="true">
        <span />
      </div>
    );
  }

  if (product.category === "chair") {
    return (
      <div className={`mini-chair finish-${product.finish}`} aria-hidden="true">
        <span />
      </div>
    );
  }

  const symbols: Record<string, string> = {
    "wide-monitor": "▰",
    "task-lamp": "⌁",
    "desk-plant": "✣",
    organizer: "▤",
  };

  return (
    <span className={`accessory-symbol finish-${product.finish}`} aria-hidden="true">
      {symbols[product.id]}
    </span>
  );
}

function WorkspaceScene({
  desk,
  chair,
  accessories,
}: {
  desk: Product;
  chair: Product;
  accessories: Product[];
}) {
  const has = (id: string) => accessories.some((item) => item.id === id);

  return (
    <div className="scene" aria-label={`Preview with ${desk.name}, ${chair.name}, and ${accessories.length} accessories`}>
      <div className="scene-glow" />
      <div className="wall-line" />
      <div className="scene-caption">
        <span>Live workspace</span>
        <strong>Calm corner · 01</strong>
      </div>
      <div className="art art-one" />
      <div className="art art-two" />
      {has("task-lamp") && (
        <div className="lamp" aria-hidden="true">
          <i />
          <b />
        </div>
      )}
      {has("wide-monitor") && (
        <div className="monitor" aria-hidden="true">
          <div className="monitor-screen">
            <span />
            <span />
            <span />
          </div>
          <i />
        </div>
      )}
      {has("desk-plant") && (
        <div className="plant" aria-hidden="true">
          <i />
          <i />
          <i />
          <b />
        </div>
      )}
      {has("organizer") && (
        <div className="organizer" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
      <div className={`workspace-desk finish-${desk.finish}`} aria-hidden="true">
        <div className="desktop" />
        <div className="drawer">
          <span />
          <span />
        </div>
        <i className="leg leg-left" />
        <i className="leg leg-right" />
      </div>
      <div className={`workspace-chair chair-${chair.id} finish-${chair.finish}`} aria-hidden="true">
        <div className="chair-back" />
        <div className="chair-seat" />
        <div className="chair-stem" />
        <div className="chair-base" />
      </div>
      <div className="rug" aria-hidden="true" />
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("desk");
  const [setup, setSetup] = useState<Setup>(initialSetup);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const restoreSavedSetup = window.setTimeout(() => {
      const saved = window.localStorage.getItem("roomie-workspace");
      if (saved) {
        try {
          setSetup(JSON.parse(saved) as Setup);
        } catch {
          window.localStorage.removeItem("roomie-workspace");
        }
      }
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(restoreSavedSetup);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem("roomie-workspace", JSON.stringify(setup));
    }
  }, [isReady, setup]);

  useEffect(() => {
    document.body.style.overflow = isReviewOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isReviewOpen]);

  const visibleProducts = products.filter((product) => product.category === activeCategory);
  const desk = products.find((product) => product.id === setup.deskId) ?? products[0];
  const chair = products.find((product) => product.id === setup.chairId) ?? products[3];
  const accessories = products.filter((product) => setup.accessoryIds.includes(product.id));
  const selectedProducts = useMemo(
    () => [desk, chair, ...accessories],
    [desk, chair, accessories],
  );
  const total = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  function isSelected(product: Product) {
    if (product.category === "desk") return setup.deskId === product.id;
    if (product.category === "chair") return setup.chairId === product.id;
    return setup.accessoryIds.includes(product.id);
  }

  function toggleProduct(product: Product) {
    setIsConfirmed(false);
    setSetup((current) => {
      if (product.category === "desk") return { ...current, deskId: product.id };
      if (product.category === "chair") return { ...current, chairId: product.id };
      const exists = current.accessoryIds.includes(product.id);
      return {
        ...current,
        accessoryIds: exists
          ? current.accessoryIds.filter((id) => id !== product.id)
          : [...current.accessoryIds, product.id],
      };
    });
  }

  function resetSetup() {
    setSetup(initialSetup);
    setIsConfirmed(false);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Roomie home">
          roomie<span>.</span>
        </a>
        <div className="header-step">
          <span>01</span>
          <p>
            Workspace builder
            <small>Design yours in minutes</small>
          </p>
        </div>
        <button className="bag-button" onClick={() => setIsReviewOpen(true)}>
          <span>Review setup</span>
          <b>{selectedProducts.length}</b>
        </button>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Your desk. Your rhythm.</p>
          <h1>
            Make space for
            <br />
            <em>your best work.</em>
          </h1>
          <p className="hero-description">
            Curate a workspace that looks considered, feels comfortable, and arrives ready to use.
          </p>
        </div>
        <div className="hero-note">
          <span className="spark">✦</span>
          <p>
            Choose your pieces.
            <br />
            We&apos;ll handle the rest.
          </p>
        </div>
      </section>

      <section className="builder" aria-labelledby="builder-title">
        <div className="catalog">
          <div className="section-heading">
            <div>
              <p className="kicker">Build your room</p>
              <h2 id="builder-title">Start with the essentials.</h2>
            </div>
            <button className="reset-button" onClick={resetSetup}>
              Reset setup
            </button>
          </div>

          <div className="tabs" role="tablist" aria-label="Product categories">
            {categories.map((category, index) => (
              <button
                key={category.id}
                role="tab"
                aria-selected={activeCategory === category.id}
                className={activeCategory === category.id ? "active" : ""}
                onClick={() => setActiveCategory(category.id)}
              >
                <span>0{index + 1}</span>
                {category.label}
              </button>
            ))}
          </div>

          <div className="product-list">
            {visibleProducts.map((product) => {
              const selected = isSelected(product);
              return (
                <button
                  className={`product-card ${selected ? "selected" : ""}`}
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  aria-pressed={selected}
                >
                  <div className="product-visual">
                    <ProductIcon product={product} />
                    <span className="selection-mark">{selected ? "✓" : "+"}</span>
                  </div>
                  <div className="product-copy">
                    <small>{product.eyebrow}</small>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <strong>{currency.format(product.price)} / mo</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="preview-column">
          <div className="preview-sticky">
            <WorkspaceScene desk={desk} chair={chair} accessories={accessories} />
            <div className="preview-footer">
              <div>
                <span>Your setup</span>
                <p>{desk.name} · {chair.name} · {accessories.length} add-ons</p>
              </div>
              <div className="preview-total">
                <span>Monthly</span>
                <strong>{currency.format(total)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="promise">
        <p className="kicker">The easy part</p>
        <h2>
          Designed by you.
          <br />
          <em>Delivered by us.</em>
        </h2>
        <div className="promise-grid">
          <article>
            <span>01</span>
            <h3>Curated quality</h3>
            <p>Considered pieces from responsible makers, chosen to work beautifully together.</p>
          </article>
          <article>
            <span>02</span>
            <h3>One simple price</h3>
            <p>Your complete workspace, delivery, setup, and support in one monthly payment.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Flexible by design</h3>
            <p>Swap a piece or refresh your setup whenever your work and space change.</p>
          </article>
        </div>
      </section>

      <section className="closing">
        <p className="kicker">Ready when you are</p>
        <h2>Your better workday starts here.</h2>
        <button onClick={() => setIsReviewOpen(true)}>
          Review your setup <span>→</span>
        </button>
      </section>

      <footer>
        <a className="brand" href="#">
          roomie<span>.</span>
        </a>
        <p>Workspaces that work for you.</p>
        <span>© 2026 Roomie Studio</span>
      </footer>

      {isReviewOpen && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setIsReviewOpen(false)}>
          <section
            className="review-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="dialog-top">
              <div>
                <p className="kicker">Almost yours</p>
                <h2 id="review-title">Your workspace</h2>
              </div>
              <button className="close-button" onClick={() => setIsReviewOpen(false)} aria-label="Close review">
                ×
              </button>
            </div>

            {isConfirmed ? (
              <div className="success-state">
                <span>✓</span>
                <h3>You have excellent taste.</h3>
                <p>Your workspace request is ready. We&apos;ll be in touch to arrange delivery and setup.</p>
                <button onClick={() => setIsReviewOpen(false)}>Back to your room</button>
              </div>
            ) : (
              <>
                <div className="review-list">
                  {selectedProducts.map((product) => (
                    <article key={product.id}>
                      <div className="review-icon">
                        <ProductIcon product={product} />
                      </div>
                      <div>
                        <small>{product.category}</small>
                        <h3>{product.name}</h3>
                      </div>
                      <strong>{currency.format(product.price)}</strong>
                      {product.category === "accessory" && (
                        <button onClick={() => toggleProduct(product)} aria-label={`Remove ${product.name}`}>
                          ×
                        </button>
                      )}
                    </article>
                  ))}
                </div>
                <div className="dialog-total">
                  <div>
                    <span>Monthly total</span>
                    <small>Delivery and setup included</small>
                  </div>
                  <strong>{currency.format(total)}</strong>
                </div>
                <button className="confirm-button" onClick={() => setIsConfirmed(true)}>
                  Rent this setup <span>→</span>
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
