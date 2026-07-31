"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  bundles,
  getSetupProducts,
  products,
  resolveBundleId,
  type Bundle,
  type Category,
  type Product,
  type RentalCycle,
} from "@/lib/catalog";
import {
  deliveryFeeFor,
  setupPrice,
  subtotalOf,
  type DeliveryType,
} from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { todayKey } from "@/lib/date";
import { LOCATIONS } from "@/lib/constants";
import { AlertStack, useAlerts } from "./components/ui/AlertStack";
import { usePersistentSetup } from "./hooks/usePersistentSetup";
import { BundleCard } from "./components/BundleCard";
import { ProductCard } from "./components/ProductCard";
import { ProductDetailsDialog } from "./components/ProductDetailsDialog";
import { ReviewDialog } from "./components/ReviewDialog";
import { IntroSection, SiteFooter, SiteHeader } from "./components/SiteChrome";
import { StepNav, steps } from "./components/StepNav";
import { TrustSection } from "./components/TrustSection";
import { WorkspaceScene } from "./components/WorkspaceScene";

export default function Home() {
  const { setup, setSetup } = usePersistentSetup();
  const [activeStep, setActiveStep] = useState<Category>("desk");
  const [cycle, setCycle] = useState<RentalCycle>("weekly");
  const [location, setLocation] = useState(LOCATIONS[0] ?? "Bali");
  const [minDeliveryDate] = useState(todayKey);
  const [deliveryDate, setDeliveryDate] = useState(todayKey);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("regular");
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [reference, setReference] = useState("");
  const { alerts, notify, dismiss } = useAlerts();
  const detailsDialogRef = useRef<HTMLDialogElement>(null);
  const reviewDialogRef = useRef<HTMLDialogElement>(null);

  const visibleProducts = products.filter(
    (product) => product.category === activeStep,
  );
  const selectedProducts = useMemo(() => getSetupProducts(setup), [setup]);
  const activeBundle = bundles.find((bundle) => bundle.id === setup.bundleId);
  const subtotal = subtotalOf(selectedProducts, cycle);
  const total = setupPrice(setup, cycle);
  const discount = subtotal - total;
  const deliveryFee = deliveryFeeFor(deliveryType);
  const orderTotal = total + deliveryFee;
  const currentStepIndex = steps.findIndex((step) => step.id === activeStep);
  const currentStep = steps[currentStepIndex] ?? steps[0];

  function isSelected(product: Product) {
    if (product.category === "desk") return setup.deskId === product.id;
    if (product.category === "chair") return setup.chairId === product.id;
    return setup.accessoryIds.includes(product.id);
  }

  function selectProduct(product: Product) {
    const selected = isSelected(product);
    setIsConfirmed(false);
    setSetup((current) => {
      const next =
        product.category === "desk"
          ? { ...current, deskId: product.id }
          : product.category === "chair"
            ? { ...current, chairId: product.id }
            : {
                ...current,
                accessoryIds: selected
                  ? current.accessoryIds.filter((id) => id !== product.id)
                  : [...current.accessoryIds, product.id],
              };
      // The bundle price only survives while the setup still is that bundle.
      return { ...next, bundleId: resolveBundleId(next) };
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

  function scrollToCustomize() {
    document
      .getElementById("customize")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToNextStep() {
    const next = steps[currentStepIndex + 1];
    if (!next) {
      openReview();
      return;
    }
    setActiveStep(next.id);
    scrollToCustomize();
  }

  function openDetails(product: Product) {
    setDetailProduct(product);
    // Opened straight away rather than inside requestAnimationFrame: the dialog
    // element already exists, and rAF never fires in a throttled or background
    // tab, which left the dialog permanently closed.
    detailsDialogRef.current?.showModal();
  }

  function openReview() {
    setIsConfirmed(false);
    reviewDialogRef.current?.showModal();
  }

  function submitRental(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!address.trim()) {
      setAddressError("We need an address to plan the delivery.");
      notify(
        "error",
        "Delivery address is missing",
        "Add where we should set the room up.",
      );
      return;
    }
    setAddressError("");
    setReference(
      `ROOM-${deliveryDate.replaceAll("-", "")}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`,
    );
    setIsConfirmed(true);
    notify(
      "success",
      "Demo request confirmed",
      `We reserved your setup for ${deliveryDate}.`,
    );
  }

  return (
    <main>
      <SiteHeader
        location={location}
        onLocationChange={setLocation}
        deliveryDate={deliveryDate}
        minDeliveryDate={minDeliveryDate}
        onDeliveryDateChange={setDeliveryDate}
        selectedCount={selectedProducts.length}
        onReview={openReview}
      />

      <IntroSection cycle={cycle} onCycleChange={setCycle} />

      <section
        className="border-t border-line px-[5.5vw] pt-[62px] pb-[76px] max-lap:px-5 max-lap:pt-12 max-lap:pb-[55px]"
        aria-labelledby="bundles-title"
      >
        <div className="mb-[35px] flex items-end justify-between max-lap:flex-col max-lap:items-start max-lap:gap-[18px]">
          <div>
            <p className="eyebrow mb-3">Curated bundles</p>
            <h2
              id="bundles-title"
              className="m-0 font-mona text-[clamp(34px,3.4vw,50px)] leading-[0.98] font-[650] tracking-[-0.055em]"
            >
              Start complete. Make it yours.
            </h2>
          </div>
          <p className="m-0 max-w-[320px] text-[13px] leading-[1.5] opacity-60">
            Load a proven setup in one tap, then replace or remove anything.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 max-lap:-mx-5 max-lap:flex max-lap:snap-x max-lap:snap-mandatory max-lap:gap-2.5 max-lap:overflow-x-auto max-lap:px-5 max-lap:pb-2">
          {bundles.map((bundle) => (
            <BundleCard
              key={bundle.id}
              bundle={bundle}
              active={setup.bundleId === bundle.id}
              onSelect={() => selectBundle(bundle)}
            />
          ))}
        </div>
      </section>

      <section className="configurator" id="customize" aria-labelledby="customize-title">
        <div className="catalog-panel">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow mb-[11px]">Customize</p>
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

          <StepNav
            activeStep={activeStep}
            accessoryCount={setup.accessoryIds.length}
            onSelect={setActiveStep}
          />

          <div
            className="product-grid"
            role={activeStep === "accessory" ? "group" : "radiogroup"}
            aria-label={currentStep.label}
          >
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                cycle={cycle}
                location={location}
                selected={isSelected(product)}
                multiSelect={activeStep === "accessory"}
                priority={index < 2}
                onSelect={() => selectProduct(product)}
                onOpenDetails={() => openDetails(product)}
              />
            ))}
          </div>

          <div className="catalog-next">
            <div>
              <span>
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <p>
                {activeStep === "accessory"
                  ? `${setup.accessoryIds.length} add-ons selected`
                  : `${visibleProducts.find(isSelected)?.name ?? "None"} selected`}
              </p>
            </div>
            <button type="button" onClick={goToNextStep}>
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
                <strong>{activeBundle ? activeBundle.name : "Custom workspace"}</strong>
                <p>
                  {selectedProducts.length} pieces · delivery from {deliveryDate}
                </p>
              </div>
              <div className="preview-actions">
                {discount > 0 && <span>You save {formatMoney(discount)}</span>}
                <button type="button" onClick={openReview}>
                  Review &amp; rent
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <TrustSection />

      <SiteFooter />

      <div className="mobile-rent-bar">
        <div>
          <span>
            {selectedProducts.length} pieces · {cycleLabel(cycle)}ly
          </span>
          <strong>{formatMoney(total)}</strong>
        </div>
        <button type="button" onClick={openReview}>
          Review setup
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <ProductDetailsDialog
        dialogRef={detailsDialogRef}
        product={detailProduct}
        cycle={cycle}
        location={location}
        selected={detailProduct ? isSelected(detailProduct) : false}
        onClose={() => setDetailProduct(null)}
        onDismiss={() => detailsDialogRef.current?.close()}
        onToggle={() => {
          if (detailProduct) selectProduct(detailProduct);
          detailsDialogRef.current?.close();
        }}
      />

      <ReviewDialog
        dialogRef={reviewDialogRef}
        products={selectedProducts}
        cycle={cycle}
        activeBundle={activeBundle}
        subtotal={subtotal}
        discount={discount}
        total={total}
        deliveryFee={deliveryFee}
        orderTotal={orderTotal}
        location={location}
        onLocationChange={setLocation}
        deliveryDate={deliveryDate}
        minDeliveryDate={minDeliveryDate}
        onDeliveryDateChange={setDeliveryDate}
        deliveryType={deliveryType}
        onDeliveryTypeChange={setDeliveryType}
        address={address}
        addressError={addressError}
        onAddressChange={(value) => {
          setAddress(value);
          if (addressError) setAddressError("");
        }}
        isConfirmed={isConfirmed}
        reference={reference}
        onSubmit={submitRental}
        onRemoveProduct={selectProduct}
        onEditSetup={() => {
          reviewDialogRef.current?.close();
          scrollToCustomize();
        }}
        onDismiss={() => reviewDialogRef.current?.close()}
      />

      <AlertStack alerts={alerts} onDismiss={dismiss} />
    </main>
  );
}
