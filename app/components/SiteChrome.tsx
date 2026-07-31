import type { RentalCycle } from "@/lib/catalog";

// The active/idle background is picked as a whole rather than layering `bg-ink`
// over a base `bg-transparent`: two utilities for the same property resolve by
// stylesheet order, not by the order they appear in the class list.
const cycleButton =
  "min-h-[42px] rounded-full border-0 px-[17px] font-mona text-xs font-bold max-mob:flex-1 max-mob:px-2.5";
const cycleIdle = "bg-transparent";
const cycleActive = "bg-ink text-white";

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
      <a className="brand" href="#">
        roomie<span>.</span>
      </a>
      <p className="text-[11px] opacity-50">Workspaces that work for you.</p>
      <span className="text-[11px] opacity-50">Demo experience · 2026</span>
    </footer>
  );
}
