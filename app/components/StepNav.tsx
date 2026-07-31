import type { Category } from "@/lib/catalog";

export type Step = { id: Category; label: string; shortLabel: string };

export const steps: Step[] = [
  { id: "desk", label: "Choose desk", shortLabel: "Desk" },
  { id: "chair", label: "Choose chair", shortLabel: "Chair" },
  { id: "accessory", label: "Add your tools", shortLabel: "Add-ons" },
];

// Below the lap breakpoint the underline tab strip becomes a pill switch, so the
// bottom border is dropped and the active step is filled instead.
const stepBase =
  "flex min-h-[52px] items-center justify-center gap-[9px] border-0 border-b-[3px] bg-transparent px-2 max-lap:min-h-[45px] max-lap:rounded-full max-lap:border-0";
const stepIdle = "border-b-transparent opacity-50";
const stepActive = "border-b-ink opacity-100 max-lap:bg-ink max-lap:text-white";

export function StepNav({
  activeStep,
  accessoryCount,
  onSelect,
}: {
  activeStep: Category;
  accessoryCount: number;
  onSelect: (step: Category) => void;
}) {
  return (
    <nav
      className="mt-10 mb-6 grid grid-cols-3 border-b border-line max-lap:sticky max-lap:top-[calc(var(--header-height)+clamp(255px,34svh,330px)+68px)] max-lap:z-[18] max-lap:rounded-full max-lap:border-0 max-lap:bg-paper-deep max-lap:p-1"
      aria-label="Workspace configuration steps"
    >
      {steps.map((step, index) => {
        // A desk and a chair are always selected, so those steps only need a
        // tick; add-ons are optional and count as done once one is chosen.
        const complete = step.id === "accessory" ? accessoryCount > 0 : true;
        const active = activeStep === step.id;
        return (
          <button
            type="button"
            key={step.id}
            className={`${stepBase} ${active ? stepActive : stepIdle}`}
            onClick={() => onSelect(step.id)}
            aria-current={active ? "step" : undefined}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line-strong font-mona text-[8px] max-lap:hidden">
              {complete ? "✓" : `0${index + 1}`}
            </span>
            <b className="font-mona text-[11px] font-[720] tracking-[0.02em] max-mob:text-[10px]">
              {step.shortLabel}
            </b>
          </button>
        );
      })}
    </nav>
  );
}
