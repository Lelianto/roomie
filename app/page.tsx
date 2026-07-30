"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  bundles,
  getProduct,
  getSceneRender,
  getSetupProducts,
  hasCompletePicturedKit,
  initialSetup,
  picturedAccessoryIds,
  productPrice,
  products,
  setupPrice,
  type Bundle,
  type Category,
  type Product,
  type RentalCycle,
  type WorkspaceSetup,
} from "@/lib/catalog";

const formatMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const steps: { id: Category; label: string; shortLabel: string }[] = [
  { id: "desk", label: "Choose desk", shortLabel: "Desk" },
  { id: "chair", label: "Choose chair", shortLabel: "Chair" },
  { id: "accessory", label: "Add your tools", shortLabel: "Add-ons" },
];

const picturedAccessoryIdSet = new Set<string>(picturedAccessoryIds);

function isWorkspaceSetup(value: unknown): value is WorkspaceSetup {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceSetup>;
  const ids = new Set(products.map((product) => product.id));
  return (
    typeof candidate.deskId === "string" &&
    typeof candidate.chairId === "string" &&
    ids.has(candidate.deskId) &&
    ids.has(candidate.chairId) &&
    Array.isArray(candidate.accessoryIds) &&
    candidate.accessoryIds.every((id) => typeof id === "string" && ids.has(id)) &&
    (candidate.bundleId === null || typeof candidate.bundleId === "string")
  );
}

function cycleLabel(cycle: RentalCycle) {
  return cycle === "weekly" ? "week" : "month";
}

function ProductPhoto({
  product,
  sizes = "160px",
  priority = false,
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={product.image}
      alt={product.name}
      sizes={sizes}
      className="product-photo"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

function Availability({ product }: { product: Product }) {
  return (
    <span className="availability">
      <i aria-hidden="true" />
      {product.stock} available in Bali
    </span>
  );
}

function WorkspaceScene({
  setup,
  cycle,
  total,
  sceneId,
}: {
  setup: WorkspaceSetup;
  cycle: RentalCycle;
  total: number;
  sceneId: string;
}) {
  const selected = getSetupProducts(setup);
  const desk = getProduct(setup.deskId);
  const chair = getProduct(setup.chairId);
  const accessories = selected.filter((product) => product.category === "accessory");
  const sceneImage = getSceneRender(setup);
  const completePicturedKit = hasCompletePicturedKit(setup);
  const livePlacements = completePicturedKit
    ? accessories.filter((product) => !picturedAccessoryIdSet.has(product.id))
    : accessories;

  if (!desk || !chair) return null;

  return (
    <figure
      className={`real-scene scene-desk-${setup.deskId}`}
      aria-labelledby={sceneId}
    >
      <div className="scene-room">
        <img
          key={sceneImage}
          src={sceneImage}
          alt=""
          sizes="(max-width: 900px) 100vw, 54vw"
          className="scene-composite"
          loading="eager"
          fetchPriority="high"
        />

        <div className="scene-accessory-stage" aria-label="Accessories placed in the live setup">
          {livePlacements.map((product) =>
            product.sceneOverlay ? (
              <img
                key={product.id}
                src={product.sceneOverlay}
                alt=""
                className={`scene-accessory scene-accessory-${product.id}`}
                loading="eager"
              />
            ) : null,
          )}
        </div>

        <div className="scene-status">
          <span>
            <i aria-hidden="true" />
            Live setup
          </span>
          <strong id={sceneId}>{selected.length} pieces in your room</strong>
        </div>

        <div className="scene-price">
          <span>Rental total</span>
          <strong>
            {formatMoney.format(total)}
            <small>/{cycleLabel(cycle)}</small>
          </strong>
        </div>
      </div>
      <div className="scene-selection-strip">
        <span>In this setup</span>
        <strong>{desk.name}</strong>
        <strong>{chair.name}</strong>
        <div className="scene-accessory-list">
          {accessories.length > 0 ? (
            accessories.map((product) => (
              <small key={product.id}>
                <i aria-hidden="true">✓</i>
                {product.name}
              </small>
            ))
          ) : (
            <small>No add-ons selected</small>
          )}
        </div>
      </div>
      <figcaption className="sr-only">
        Workspace preview showing {desk.name}, {chair.name}, and{" "}
        {accessories.map((item) => item.name).join(", ") || "no accessories"}.
      </figcaption>
    </figure>
  );
}

function BundleCard({
  bundle,
  active,
  onSelect,
}: {
  bundle: Bundle;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`bundle-card ${active ? "active" : ""}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="bundle-label">{bundle.label}</span>
      <strong>{bundle.name}</strong>
      <p>{bundle.description}</p>
      <span className="bundle-saving">Save {Math.round(bundle.discount * 100)}%</span>
      <i aria-hidden="true">{active ? "✓" : "→"}</i>
    </button>
  );
}

export default function Home() {
  const [activeStep, setActiveStep] = useState<Category>("desk");
  const [setup, setSetup] = useState<WorkspaceSetup>(initialSetup);
  const [cycle, setCycle] = useState<RentalCycle>("weekly");
  const [location, setLocation] = useState("Bali");
  const [deliveryDate, setDeliveryDate] = useState("2026-08-01");
  const [deliveryType, setDeliveryType] = useState<"regular" | "priority">(
    "regular",
  );
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [isRestored, setIsRestored] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [address, setAddress] = useState("");
  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const reviewDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem("roomie-workspace-v2");
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (isWorkspaceSetup(parsed)) setSetup(parsed);
        } catch {
          window.localStorage.removeItem("roomie-workspace-v2");
        }
      }
      setIsRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (isRestored) {
      window.localStorage.setItem("roomie-workspace-v2", JSON.stringify(setup));
    }
  }, [isRestored, setup]);

  const visibleProducts = products.filter(
    (product) => product.category === activeStep,
  );
  const selectedProducts = useMemo(() => getSetupProducts(setup), [setup]);
  const activeBundle = bundles.find((bundle) => bundle.id === setup.bundleId);
  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + productPrice(product, cycle),
    0,
  );
  const total = setupPrice(setup, cycle);
  const discount = subtotal - total;
  const deliveryFee = deliveryType === "priority" ? 5 : 0;
  const orderTotal = total + deliveryFee;
  const currentStepIndex = steps.findIndex((step) => step.id === activeStep);

  function isSelected(product: Product) {
    if (product.category === "desk") return setup.deskId === product.id;
    if (product.category === "chair") return setup.chairId === product.id;
    return setup.accessoryIds.includes(product.id);
  }

  function selectProduct(product: Product) {
    const selected = isSelected(product);
    setIsConfirmed(false);
    setSetup((current) => {
      if (product.category === "desk") {
        return { ...current, deskId: product.id };
      }
      if (product.category === "chair") {
        return { ...current, chairId: product.id };
      }
      return {
        ...current,
        accessoryIds: selected
          ? current.accessoryIds.filter((id) => id !== product.id)
          : [...current.accessoryIds, product.id],
      };
    });
    setAnnouncement(
      product.category === "accessory"
        ? `${product.name} ${selected ? "removed from" : "added to"} your workspace.`
        : `${product.name} selected.`,
    );
  }

  function selectBundle(bundle: Bundle) {
    setSetup({ ...bundle.setup, bundleId: bundle.id });
    setActiveStep("desk");
    setIsConfirmed(false);
    setAnnouncement(`${bundle.name} bundle loaded. You can customize every item.`);
  }

  function goToNextStep() {
    const next = steps[currentStepIndex + 1];
    if (next) {
      setActiveStep(next.id);
      document
        .getElementById("customize")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      openReview();
    }
  }

  function openDetails(product: Product) {
    setDetailProduct(product);
    window.requestAnimationFrame(() => detailsDialogRef.current?.showModal());
  }

  function closeDetails() {
    detailsDialogRef.current?.close();
  }

  function openReview() {
    setIsConfirmed(false);
    window.requestAnimationFrame(() => reviewDialogRef.current?.showModal());
  }

  function closeReview() {
    reviewDialogRef.current?.close();
  }

  function submitRental(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsConfirmed(true);
  }

  return (
    <main>
      <header className="app-header">
        <a className="brand" href="#" aria-label="Roomie home">
          roomie<span>.</span>
        </a>

        <div className="rental-context">
          <label>
            <span>Location</span>
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option>Bali</option>
              <option>Jakarta</option>
              <option>Surabaya</option>
            </select>
          </label>
          <label>
            <span>Delivery</span>
            <input
              type="date"
              value={deliveryDate}
              min="2026-07-31"
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </label>
        </div>

        <button className="header-review" onClick={openReview}>
          <span>Review setup</span>
          <b>{selectedProducts.length}</b>
        </button>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">Workspace rental, made personal</p>
          <h1>
            Build your room.
            <br />
            <em>See it come alive.</em>
          </h1>
        </div>
        <div className="intro-side">
          <p>
            Select real equipment, preview the complete setup, and have it delivered
            and assembled at your door.
          </p>
          <div className="cycle-switch" aria-label="Rental period">
            <button
              className={cycle === "weekly" ? "active" : ""}
              onClick={() => setCycle("weekly")}
              aria-pressed={cycle === "weekly"}
            >
              Weekly
            </button>
            <button
              className={cycle === "monthly" ? "active" : ""}
              onClick={() => setCycle("monthly")}
              aria-pressed={cycle === "monthly"}
            >
              Monthly <span>Save 25%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="bundle-section" aria-labelledby="bundles-title">
        <div className="section-intro">
          <div>
            <p className="eyebrow">Curated bundles</p>
            <h2 id="bundles-title">Start complete. Make it yours.</h2>
          </div>
          <p>
            Load a proven setup in one tap, then replace or remove anything.
          </p>
        </div>
        <div className="bundle-row">
          {bundles.map((bundle) => (
            <BundleCard
              bundle={bundle}
              active={setup.bundleId === bundle.id}
              onSelect={() => selectBundle(bundle)}
              key={bundle.id}
            />
          ))}
        </div>
      </section>

      <section className="configurator" id="customize" aria-labelledby="customize-title">
        <div className="catalog-panel">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">Customize</p>
              <h2 id="customize-title">Shape every detail.</h2>
            </div>
            <span>Demo inventory · {location}</span>
          </div>

          <div className="mobile-scene-panel">
            <WorkspaceScene
              setup={setup}
              cycle={cycle}
              total={total}
              sceneId="mobile-scene-title"
            />
          </div>

          <nav className="step-nav" aria-label="Workspace configuration steps">
            {steps.map((step, index) => {
              const complete =
                step.id === "desk" ||
                step.id === "chair" ||
                (step.id === "accessory" && setup.accessoryIds.length > 0);
              return (
                <button
                  key={step.id}
                  className={activeStep === step.id ? "active" : ""}
                  onClick={() => setActiveStep(step.id)}
                  aria-current={activeStep === step.id ? "step" : undefined}
                >
                  <span>{complete ? "✓" : `0${index + 1}`}</span>
                  <b>{step.shortLabel}</b>
                </button>
              );
            })}
          </nav>

          <div
            className="product-grid"
            role={activeStep === "accessory" ? "group" : "radiogroup"}
            aria-label={steps[currentStepIndex].label}
          >
            {visibleProducts.map((product, index) => {
              const selected = isSelected(product);
              return (
                <article className={`real-product-card ${selected ? "selected" : ""}`} key={product.id}>
                  <button
                    className="product-select"
                    onClick={() => selectProduct(product)}
                    role={activeStep === "accessory" ? "checkbox" : "radio"}
                    aria-checked={selected}
                    aria-label={`${selected ? "Selected" : "Select"} ${product.name}`}
                  >
                    <div className="photo-wrap">
                      <ProductPhoto product={product} priority={index < 2} />
                      <span className="scene-match-badge">
                        <i aria-hidden="true" />
                        Scene matched
                      </span>
                      <div className="card-badges">
                        {product.compareAtPrice && (
                          <span className="discount-badge">
                            -
                            {Math.round(
                              (1 - product.weeklyPrice / product.compareAtPrice) * 100,
                            )}
                            %
                          </span>
                        )}
                        {product.badge && <span>{product.badge}</span>}
                      </div>
                      <span className="select-control">{selected ? "✓" : "+"}</span>
                    </div>
                    <div className="card-content">
                      <span className="brand-model">
                        {product.brand} · {product.model}
                      </span>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="card-facts">
                        <span>{product.dimensions}</span>
                        <span>{product.color}</span>
                      </div>
                      <Availability product={product} />
                      <div className="card-price">
                        <div>
                          {product.compareAtPrice && (
                            <del>
                              {formatMoney.format(
                                cycle === "weekly"
                                  ? product.compareAtPrice
                                  : product.compareAtPrice * 4,
                              )}
                            </del>
                          )}
                          <strong>
                            {formatMoney.format(productPrice(product, cycle))}
                          </strong>
                          <small>/{cycleLabel(cycle)}</small>
                        </div>
                        <span>{selected ? "Selected" : "Add to room"}</span>
                      </div>
                    </div>
                  </button>
                  <button className="details-link" onClick={() => openDetails(product)}>
                    View details <span aria-hidden="true">↗</span>
                  </button>
                </article>
              );
            })}
          </div>

          <div className="catalog-next">
            <div>
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <p>
                {activeStep === "accessory"
                  ? `${setup.accessoryIds.length} add-ons selected`
                  : `${visibleProducts.find(isSelected)?.name} selected`}
              </p>
            </div>
            <button onClick={goToNextStep}>
              {currentStepIndex === steps.length - 1 ? "Review setup" : "Continue"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <aside className="preview-panel">
          <div className="preview-sticky">
            <WorkspaceScene
              setup={setup}
              cycle={cycle}
              total={total}
              sceneId="desktop-scene-title"
            />
            <div className="preview-meta">
              <div>
                <span>Selected setup</span>
                <strong>
                  {activeBundle ? activeBundle.name : "Custom workspace"}
                </strong>
                <p>
                  {selectedProducts.length} pieces · delivery from {deliveryDate}
                </p>
              </div>
              <div className="preview-actions">
                {discount > 0 && (
                  <span>You save {formatMoney.format(discount)}</span>
                )}
                <button onClick={openReview}>Review & rent</button>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="trust-section">
        <div className="trust-heading">
          <p className="eyebrow">The Roomie standard</p>
          <h2>Everything handled.<br />Nothing improvised.</h2>
        </div>
        <div className="trust-grid">
          <article>
            <span>01</span>
            <h3>Quality checked</h3>
            <p>Every piece is inspected, cleaned, and photographed before it enters your room.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Delivery & setup</h3>
            <p>We deliver, assemble, cable-manage, and leave your workspace ready for Monday.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Swap as you grow</h3>
            <p>Change individual pieces or expand the setup without restarting your rental.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Flexible returns</h3>
            <p>Schedule collection when plans change. No boxes or disassembly required.</p>
          </article>
        </div>
      </section>

      <footer>
        <a className="brand" href="#">
          roomie<span>.</span>
        </a>
        <p>Workspaces that work for you.</p>
        <span>Demo experience · 2026</span>
      </footer>

      <div className="mobile-rent-bar">
        <div>
          <span>{selectedProducts.length} pieces · {cycleLabel(cycle)}ly</span>
          <strong>{formatMoney.format(total)}</strong>
        </div>
        <button onClick={openReview}>Review setup</button>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <dialog
        ref={detailsDialogRef}
        className="sheet-dialog details-dialog"
        onClose={() => setDetailProduct(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDetails();
        }}
      >
        {detailProduct && (
          <div className="dialog-shell">
            <header className="dialog-header">
              <div>
                <span>Product details</span>
                <strong>{detailProduct.name}</strong>
              </div>
              <button onClick={closeDetails} aria-label="Close product details">
                ×
              </button>
            </header>
            <div className="detail-layout">
              <div className="detail-photo">
                <ProductPhoto product={detailProduct} sizes="(max-width: 720px) 90vw, 45vw" />
                <span>{detailProduct.condition} condition</span>
              </div>
              <div className="detail-content">
                <p className="eyebrow">{detailProduct.brand} · {detailProduct.model}</p>
                <h2>{detailProduct.name}</h2>
                <p className="detail-description">{detailProduct.description}</p>
                <Availability product={detailProduct} />
                <div className="detail-spec-grid">
                  <div>
                    <span>Dimensions</span>
                    <strong>{detailProduct.dimensions}</strong>
                  </div>
                  <div>
                    <span>Finish</span>
                    <strong>{detailProduct.color}</strong>
                  </div>
                  <div>
                    <span>Condition</span>
                    <strong>{detailProduct.condition}</strong>
                  </div>
                  <div>
                    <span>Delivery</span>
                    <strong>Next day</strong>
                  </div>
                </div>
                <div className="feature-columns">
                  <div>
                    <h3>Under the hood</h3>
                    <ul>
                      {detailProduct.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>What&apos;s included</h3>
                    <ul>
                      {detailProduct.included.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="detail-cta">
                  <div>
                    <strong>{formatMoney.format(productPrice(detailProduct, cycle))}</strong>
                    <span>/{cycleLabel(cycle)}</span>
                  </div>
                  <button
                    onClick={() => {
                      selectProduct(detailProduct);
                      closeDetails();
                    }}
                  >
                    {isSelected(detailProduct) ? "Remove from setup" : "Add to setup"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <dialog
        ref={reviewDialogRef}
        className="sheet-dialog review-dialog"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeReview();
        }}
      >
        <div className="dialog-shell">
          <header className="dialog-header">
            <div>
              <span>{isConfirmed ? "Request received" : "Review your room"}</span>
              <strong>{isConfirmed ? "You’re ready to work." : `${selectedProducts.length} pieces · ${location}`}</strong>
            </div>
            <button onClick={closeReview} aria-label="Close review">
              ×
            </button>
          </header>

          {isConfirmed ? (
            <div className="success-state">
              <span aria-hidden="true">✓</span>
              <p className="eyebrow">Demo request confirmed</p>
              <h2>Your workspace is taking shape.</h2>
              <p>
                We&apos;ve reserved these demo items for {deliveryDate}. In a live
                version, this request would now be written to Firestore and sent to
                the operations team.
              </p>
              <div className="success-reference">
                <span>Reference</span>
                <strong>ROOM-{deliveryDate.replaceAll("-", "")}-24</strong>
              </div>
              <button onClick={closeReview}>Back to your workspace</button>
            </div>
          ) : (
            <form className="review-layout" onSubmit={submitRental}>
              <div className="review-items">
                <p className="eyebrow">Your equipment</p>
                {selectedProducts.map((product) => (
                  <article key={product.id}>
                    <div className="review-product-photo">
                      <ProductPhoto product={product} sizes="72px" />
                    </div>
                    <div>
                      <span>{product.brand} · {product.category}</span>
                      <strong>{product.name}</strong>
                      <small>{product.condition} · {product.color}</small>
                    </div>
                    <b>{formatMoney.format(productPrice(product, cycle))}</b>
                    {product.category === "accessory" && (
                      <button
                        type="button"
                        onClick={() => selectProduct(product)}
                        aria-label={`Remove ${product.name}`}
                      >
                        ×
                      </button>
                    )}
                  </article>
                ))}
                <button
                  type="button"
                  className="edit-setup"
                  onClick={() => {
                    closeReview();
                    document.getElementById("customize")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  + Edit your setup
                </button>
              </div>

              <div className="checkout-panel">
                <p className="eyebrow">Delivery details</p>
                <div className="checkout-fields">
                  <label>
                    <span>Location</span>
                    <select value={location} onChange={(event) => setLocation(event.target.value)}>
                      <option>Bali</option>
                      <option>Jakarta</option>
                      <option>Surabaya</option>
                    </select>
                  </label>
                  <label>
                    <span>Delivery date</span>
                    <input
                      type="date"
                      min="2026-07-31"
                      value={deliveryDate}
                      onChange={(event) => setDeliveryDate(event.target.value)}
                    />
                  </label>
                  <label className="address-field">
                    <span>Delivery address</span>
                    <textarea
                      required
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Villa, hotel, office, or coworking address"
                    />
                  </label>
                </div>

                <fieldset className="delivery-options">
                  <legend>Delivery service</legend>
                  <label className={deliveryType === "regular" ? "selected" : ""}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === "regular"}
                      onChange={() => setDeliveryType("regular")}
                    />
                    <span>
                      <strong>Roomie Setup</strong>
                      <small>Next day · delivery and assembly included</small>
                    </span>
                    <b>Free</b>
                  </label>
                  <label className={deliveryType === "priority" ? "selected" : ""}>
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryType === "priority"}
                      onChange={() => setDeliveryType("priority")}
                    />
                    <span>
                      <strong>Priority Setup</strong>
                      <small>Choose a 2-hour window · live tracking</small>
                    </span>
                    <b>$5</b>
                  </label>
                </fieldset>

                <div className="order-summary">
                  <div>
                    <span>Equipment subtotal</span>
                    <b>{formatMoney.format(subtotal)}</b>
                  </div>
                  {discount > 0 && (
                    <div className="saving-line">
                      <span>{activeBundle?.name} saving</span>
                      <b>-{formatMoney.format(discount)}</b>
                    </div>
                  )}
                  <div>
                    <span>Delivery & assembly</span>
                    <b>{deliveryFee ? formatMoney.format(deliveryFee) : "Included"}</b>
                  </div>
                  <div className="total-line">
                    <span>
                      Due today
                      <small>Then {formatMoney.format(total)}/{cycleLabel(cycle)}</small>
                    </span>
                    <b>{formatMoney.format(orderTotal)}</b>
                  </div>
                </div>

                <button className="confirm-rental" type="submit">
                  Confirm demo rental <span aria-hidden="true">→</span>
                </button>
                <p className="demo-note">
                  Demo only — no payment is collected and no external request is sent.
                </p>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </main>
  );
}
