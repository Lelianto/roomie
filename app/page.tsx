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

      {/* The named grid areas the authored CSS used were redundant: with two
          columns the source order already places the catalog then the preview. */}
      <section
        className="relative grid grid-cols-[minmax(580px,52%)_1fr] items-start border-y border-line bg-[#ded9cd] max-wide:grid-cols-[minmax(500px,54%)_1fr] max-lap:block"
        id="customize"
        aria-labelledby="customize-title"
      >
        <div className="min-w-0 border-r border-line px-[3.25vw] pt-[55px] pb-[70px] max-lap:w-full max-lap:border-r-0 max-lap:px-5 max-lap:pt-11 max-lap:pb-[65px] max-tiny:px-4">
          <div className="flex items-end justify-between max-lap:flex-col max-lap:items-start max-lap:gap-[14px]">
            <div>
              <p className="eyebrow mb-[11px]">Customize</p>
              <h2
                id="customize-title"
                className="m-0 font-mona text-[clamp(34px,3.4vw,50px)] leading-[0.98] font-[650] tracking-[-0.055em]"
              >
                Shape every detail.
              </h2>
            </div>
            <span className="mb-[3px] text-[10px] opacity-[0.52]">
              Demo inventory · {location}
            </span>
          </div>

          <div className="hidden max-lap:sticky max-lap:top-[var(--header-height)] max-lap:z-20 max-lap:-mx-5 max-lap:mt-[26px] max-lap:block max-lap:w-[calc(100%+40px)] max-tiny:-mx-4 max-tiny:w-[calc(100%+32px)]">
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
            className="grid grid-cols-2 gap-[13px] max-wide:grid-cols-1 max-lap:-mx-5 max-lap:flex max-lap:snap-x max-lap:snap-mandatory max-lap:gap-[11px] max-lap:overflow-x-auto max-lap:px-5 max-lap:pb-[13px] max-tiny:-mx-4 max-tiny:px-4"
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

          <div className="mt-[18px] flex min-h-[85px] items-center justify-between bg-ink py-[15px] pr-4 pl-[22px] text-white max-lap:hidden">
            <div>
              <span className="mb-[5px] block font-mona text-[9px] tracking-[0.1em] uppercase opacity-[0.48]">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <p className="m-0 font-mona text-xs font-[650]">
                {activeStep === "accessory"
                  ? `${setup.accessoryIds.length} add-ons selected`
                  : `${visibleProducts.find(isSelected)?.name ?? "None"} selected`}
              </p>
            </div>
            <button
              type="button"
              className="min-h-[48px] border-0 bg-lime px-[18px] font-mona text-[11px] font-[750] text-ink"
              onClick={goToNextStep}
            >
              {currentStepIndex === steps.length - 1 ? "Review setup" : "Continue"}
              <span aria-hidden="true" className="ml-[22px]">
                →
              </span>
            </button>
          </div>
        </div>

        <aside className="min-w-0 p-[3.25vw] max-lap:hidden">
          <div className="sticky top-[calc(var(--header-height)+24px)]">
            <WorkspaceScene
              setup={setup}
              cycle={cycle}
              total={total}
              sceneId="desktop-scene-title"
            />
            <div className="flex min-h-[97px] items-center justify-between bg-ink py-[17px] pr-[19px] pl-[23px] text-white">
              <div>
                <span className="mb-1 block font-mona text-[8px] tracking-[0.12em] uppercase opacity-[0.46]">
                  Selected setup
                </span>
                <strong className="block font-mona text-[15px]">
                  {activeBundle ? activeBundle.name : "Custom workspace"}
                </strong>
                <p className="mt-1 mb-0 text-[10px] opacity-[0.56]">
                  {selectedProducts.length} pieces · delivery from {deliveryDate}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {discount > 0 && (
                  <span className="font-mona text-[9px] font-bold text-lime">
                    You save {formatMoney(discount)}
                  </span>
                )}
                <button
                  type="button"
                  className="min-h-[43px] border-0 bg-lime px-4 font-mona text-[10px] font-[750] text-ink"
                  onClick={openReview}
                >
                  Review &amp; rent
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <TrustSection />

      <SiteFooter />

      <div className="hidden max-lap:fixed max-lap:bottom-0 max-lap:z-40 max-lap:flex max-lap:min-h-[calc(76px+env(safe-area-inset-bottom))] max-lap:w-full max-lap:items-center max-lap:justify-between max-lap:bg-[rgba(31,37,36,0.96)] max-lap:pt-2.5 max-lap:pr-[13px] max-lap:pb-[calc(10px+env(safe-area-inset-bottom))] max-lap:pl-[18px] max-lap:text-white">
        <div>
          <span className="mb-[3px] block text-[9px] opacity-[0.52]">
            {selectedProducts.length} pieces · {cycleLabel(cycle)}ly
          </span>
          <strong className="block font-mona text-[22px]">{formatMoney(total)}</strong>
        </div>
        <button
          type="button"
          className="min-h-[48px] border-0 bg-lime px-[18px] font-mona text-[11px] font-[750] text-ink"
          onClick={openReview}
        >
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
