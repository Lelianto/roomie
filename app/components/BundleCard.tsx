import type { Bundle } from "@/lib/catalog";

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
