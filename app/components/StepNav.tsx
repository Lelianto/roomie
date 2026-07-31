import type { Category } from "@/lib/catalog";

export type Step = { id: Category; label: string; shortLabel: string };

export const steps: Step[] = [
  { id: "desk", label: "Choose desk", shortLabel: "Desk" },
  { id: "chair", label: "Choose chair", shortLabel: "Chair" },
  { id: "accessory", label: "Add your tools", shortLabel: "Add-ons" },
];

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
    <nav className="step-nav" aria-label="Workspace configuration steps">
      {steps.map((step, index) => {
        // A desk and a chair are always selected, so those steps only need a
        // tick; add-ons are optional and count as done once one is chosen.
        const complete = step.id === "accessory" ? accessoryCount > 0 : true;
        return (
          <button
            type="button"
            key={step.id}
            className={activeStep === step.id ? "active" : ""}
            onClick={() => onSelect(step.id)}
            aria-current={activeStep === step.id ? "step" : undefined}
          >
            <span>{complete ? "✓" : `0${index + 1}`}</span>
            <b>{step.shortLabel}</b>
          </button>
        );
      })}
    </nav>
  );
}
