import type { RentalCycle } from "@/lib/catalog";

export function IntroSection({
  cycle,
  onCycleChange,
}: {
  cycle: RentalCycle;
  onCycleChange: (cycle: RentalCycle) => void;
}) {
  return (
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
          Select real equipment, preview the complete setup, and have it delivered and
          assembled at your door.
        </p>
        <div className="cycle-switch" aria-label="Rental period">
          <button
            type="button"
            className={cycle === "weekly" ? "active" : ""}
            onClick={() => onCycleChange("weekly")}
            aria-pressed={cycle === "weekly"}
          >
            Weekly
          </button>
          <button
            type="button"
            className={cycle === "monthly" ? "active" : ""}
            onClick={() => onCycleChange("monthly")}
            aria-pressed={cycle === "monthly"}
          >
            Monthly <span>Save 25%</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <a className="brand" href="#">
        roomie<span>.</span>
      </a>
      <p>Workspaces that work for you.</p>
      <span>Demo experience · 2026</span>
    </footer>
  );
}
