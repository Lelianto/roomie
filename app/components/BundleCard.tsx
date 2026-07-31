import type { Bundle } from "@/lib/catalog";

// Same-property utilities are selected as a whole set, not layered.
const cardBase =
  "relative min-h-[245px] border border-line p-[25px] text-left transition-[background-color,border-color,transform] duration-[180ms] ease-[ease] hover:-translate-y-[3px] hover:border-line-strong max-lap:min-h-[225px] max-lap:flex-[0_0_min(82vw,335px)] max-lap:snap-start";
const cardIdle = "bg-shell";
const cardActive = "bg-ink text-white";

export function BundleCard({
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
      type="button"
      className={`${cardBase} ${active ? cardActive : cardIdle}`}
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="mb-12 block font-mona text-[10px] font-[750] tracking-[0.11em] uppercase opacity-[0.54]">
        {bundle.label}
      </span>
      <strong className="block font-mona text-[25px] tracking-[-0.04em]">
        {bundle.name}
      </strong>
      <p className="mt-2 mb-[19px] max-w-[310px] text-xs leading-[1.5] opacity-[0.58]">
        {bundle.description}
      </p>
      <span className="inline-block rounded-full bg-lime px-[9px] py-1.5 font-mona text-[10px] font-[750] text-ink">
        Save {Math.round(bundle.discount * 100)}%
      </span>
      <i
        aria-hidden="true"
        className="absolute right-[22px] bottom-[22px] flex h-[38px] w-[38px] items-center justify-center rounded-full border border-current not-italic opacity-65"
      >
        {active ? "✓" : "→"}
      </i>
    </button>
  );
}
