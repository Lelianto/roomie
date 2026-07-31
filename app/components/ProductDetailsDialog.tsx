import type { RefObject } from "react";
import type { Product, RentalCycle } from "@/lib/catalog";
import { productPrice } from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { Availability } from "./Availability";
import { ProductPhoto } from "./ProductPhoto";

export function ProductDetailsDialog({
  dialogRef,
  product,
  cycle,
  location,
  selected,
  onClose,
  onDismiss,
  onToggle,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  product: Product | null;
  cycle: RentalCycle;
  location: string;
  selected: boolean;
  /** Runs after the dialog has actually closed, to clear the shown product. */
  onClose: () => void;
  onDismiss: () => void;
  onToggle: () => void;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="sheet-dialog details-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {product && (
        <div className="dialog-shell">
          <header className="dialog-header">
            <div>
              <span>Product details</span>
              <strong>{product.name}</strong>
            </div>
            <button type="button" onClick={onDismiss} aria-label="Close product details">
              ×
            </button>
          </header>
          <div className="detail-layout">
            <div className="detail-photo">
              <ProductPhoto product={product} />
              <span>{product.condition} condition</span>
            </div>
            <div className="detail-content">
              <p className="eyebrow mb-3">
                {product.brand} · {product.model}
              </p>
              <h2>{product.name}</h2>
              <p className="detail-description">{product.description}</p>
              <Availability product={product} location={location} />
              <div className="detail-spec-grid">
                <div>
                  <span>Dimensions</span>
                  <strong>{product.dimensions}</strong>
                </div>
                <div>
                  <span>Finish</span>
                  <strong>{product.color}</strong>
                </div>
                <div>
                  <span>Condition</span>
                  <strong>{product.condition}</strong>
                </div>
                <div>
                  <span>Delivery</span>
                  <strong>Next day</strong>
                </div>
              </div>
              <div className="feature-columns">
                <div>
                  <h3>Under the hood</h3>
                  <ul>
                    {product.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>What&apos;s included</h3>
                  <ul>
                    {product.included.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="detail-cta">
                <div>
                  <strong>{formatMoney(productPrice(product, cycle))}</strong>
                  <span>/{cycleLabel(cycle)}</span>
                </div>
                <button type="button" onClick={onToggle}>
                  {selected ? "Remove from setup" : "Add to setup"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
