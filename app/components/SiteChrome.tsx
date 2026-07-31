import type { RentalCycle } from "@/lib/catalog";
import { LOCATIONS } from "@/lib/constants";
import { DateField } from "./ui/DateField";
import { SelectField } from "./ui/SelectField";

// The active/idle background is picked as a whole rather than layering `bg-ink`
// over a base `bg-transparent`: two utilities for the same property resolve by
// stylesheet order, not by the order they appear in the class list.
const cycleButton =
  "min-h-[42px] rounded-full border-0 px-[17px] font-mona text-xs font-bold max-mob:flex-1 max-mob:px-2.5";
const cycleIdle = "bg-transparent";
const cycleActive = "bg-ink text-white";

function Brand({ label }: { label?: string }) {
  return (
    <a
      className="font-mona text-[28px] leading-none font-extrabold tracking-[-0.07em] no-underline"
      href="#"
      aria-label={label}
    >
      roomie<span className="text-accent">.</span>
    </a>
  );
}

export function SiteHeader({
  location,
  onLocationChange,
  deliveryDate,
  minDeliveryDate,
  onDeliveryDateChange,
  selectedCount,
  onReview,
}: {
  location: string;
  onLocationChange: (value: string) => void;
  deliveryDate: string;
  minDeliveryDate: string;
  onDeliveryDateChange: (value: string) => void;
  selectedCount: number;
  onReview: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 grid h-[var(--header-height)] grid-cols-[1fr_auto_1fr] items-center border-b border-line bg-[rgba(246,244,237,0.92)] px-[3.25vw] backdrop-blur-[18px] max-lap:grid-cols-[1fr_auto] max-lap:px-[18px]">
      <Brand label="Roomie home" />

      {/* Hidden below the lap breakpoint, where the mobile rent bar takes over. */}
      <div className="rental-context flex min-w-[410px] items-stretch rounded-full border border-line-strong max-lap:hidden">
        <SelectField
          label="Location"
          value={location}
          options={LOCATIONS}
          onChange={onLocationChange}
        />
        <DateField
          label="Delivery"
          value={deliveryDate}
          min={minDeliveryDate}
          onChange={onDeliveryDateChange}
        />
      </div>

      <button
        type="button"
        className="flex min-h-[46px] items-center justify-self-end gap-[15px] rounded-full border-0 bg-ink py-[7px] pr-2 pl-5 font-mona text-xs font-bold text-white max-lap:min-h-[44px] max-lap:p-1.5"
        onClick={onReview}
      >
        <span className="max-lap:hidden">Review setup</span>
        <b className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-ink">
          {selectedCount}
        </b>
      </button>
    </header>
  );
}

export function IntroSection({
  cycle,
  onCycleChange,
}: {
  cycle: RentalCycle;
  onCycleChange: (cycle: RentalCycle) => void;
}) {
  return (
    <section className="flex min-h-[470px] items-end justify-between px-[5.5vw] pt-20 pb-[76px] max-lap:min-h-0 max-lap:flex-col max-lap:items-start max-lap:gap-9 max-lap:px-5 max-lap:pt-[55px] max-lap:pb-12 max-tiny:px-4">
      <div>
        <p className="eyebrow">Workspace rental, made personal</p>
        <h1 className="m-0 font-mona text-[clamp(55px,6.2vw,98px)] leading-[0.88] font-[650] tracking-[-0.072em] max-lap:text-[clamp(44px,13.4vw,62px)] max-tiny:text-[41px]">
          Build your room.
          <br />
          <em className="font-serif font-normal text-accent">See it come alive.</em>
        </h1>
      </div>
      <div className="max-w-[430px] max-lap:max-w-[500px]">
        <p className="mt-0 mb-7 text-[15px] leading-[1.6] opacity-[0.68]">
          Select real equipment, preview the complete setup, and have it delivered and
          assembled at your door.
        </p>
        <div
          className="inline-flex rounded-full bg-paper-deep p-[5px] max-mob:flex max-mob:w-full"
          aria-label="Rental period"
        >
          <button
            type="button"
            className={`${cycleButton} ${cycle === "weekly" ? cycleActive : cycleIdle}`}
            onClick={() => onCycleChange("weekly")}
            aria-pressed={cycle === "weekly"}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`${cycleButton} ${cycle === "monthly" ? cycleActive : cycleIdle}`}
            onClick={() => onCycleChange("monthly")}
            aria-pressed={cycle === "monthly"}
          >
            Monthly{" "}
            <span className="ml-1.5 rounded-full bg-lime px-1.5 py-[3px] text-[9px] text-ink">
              Save 25%
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="flex min-h-[120px] items-center justify-between px-[5.5vw] max-lap:min-h-[170px] max-lap:flex-col max-lap:items-start max-lap:justify-center max-lap:gap-[10px] max-lap:px-5">
      <Brand />
      <p className="text-[11px] opacity-50">Workspaces that work for you.</p>
      <span className="text-[11px] opacity-50">Demo experience · 2026</span>
    </footer>
  );
}
