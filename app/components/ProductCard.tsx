import type { Product, RentalCycle } from "@/lib/catalog";
import { productPrice } from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { Availability } from "./Availability";
import { ProductPhoto } from "./ProductPhoto";

export function ProductCard({
  product,
  cycle,
  location,
  selected,
  multiSelect,
  priority,
  onSelect,
  onOpenDetails,
}: {
  product: Product;
  cycle: RentalCycle;
  location: string;
  selected: boolean;
  /** Accessories are a checkbox set; desks and chairs are a radio group. */
  multiSelect: boolean;
  priority: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
}) {
  const compareAt = product.compareAtPrice;

  return (
    <article className={`real-product-card ${selected ? "selected" : ""}`}>
      <button
        type="button"
        className="product-select"
        onClick={onSelect}
        role={multiSelect ? "checkbox" : "radio"}
        aria-checked={selected}
        aria-label={`${selected ? "Selected" : "Select"} ${product.name}`}
      >
        <div className="photo-wrap">
          <ProductPhoto product={product} priority={priority} />
          <span className="scene-match-badge">
            <i aria-hidden="true" />
            Scene matched
          </span>
          <div className="card-badges">
            {compareAt && (
              <span className="discount-badge">
                -{Math.round((1 - product.weeklyPrice / compareAt) * 100)}%
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
          <Availability product={product} location={location} />
          <div className="card-price">
            <div>
              {compareAt && (
                <del>
                  {formatMoney(cycle === "weekly" ? compareAt : compareAt * 4)}
                </del>
              )}
              <strong>{formatMoney(productPrice(product, cycle))}</strong>
              <small>/{cycleLabel(cycle)}</small>
            </div>
            <span>{selected ? "Selected" : "Add to room"}</span>
          </div>
        </div>
      </button>
      <button type="button" className="details-link" onClick={onOpenDetails}>
        View details <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}
