import type { FormEvent, RefObject } from "react";
import type { Bundle, Product, RentalCycle } from "@/lib/catalog";
import { productPrice, type DeliveryType } from "@/lib/pricing";
import { cycleLabel, formatMoney } from "@/lib/format";
import { LOCATIONS } from "@/lib/constants";
import { DateField } from "./ui/DateField";
import { SelectField } from "./ui/SelectField";
import { ProductPhoto } from "./ProductPhoto";
import { SheetDialog, SheetHeader } from "./ui/SheetDialog";

export type ReviewDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  products: Product[];
  cycle: RentalCycle;
  activeBundle: Bundle | undefined;
  subtotal: number;
  discount: number;
  total: number;
  deliveryFee: number;
  orderTotal: number;
  location: string;
  onLocationChange: (value: string) => void;
  deliveryDate: string;
  minDeliveryDate: string;
  onDeliveryDateChange: (value: string) => void;
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (value: DeliveryType) => void;
  address: string;
  addressError: string;
  onAddressChange: (value: string) => void;
  isConfirmed: boolean;
  reference: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveProduct: (product: Product) => void;
  onEditSetup: () => void;
  onDismiss: () => void;
};

export function ReviewDialog({
  dialogRef,
  products,
  cycle,
  activeBundle,
  subtotal,
  discount,
  total,
  deliveryFee,
  orderTotal,
  location,
  onLocationChange,
  deliveryDate,
  minDeliveryDate,
  onDeliveryDateChange,
  deliveryType,
  onDeliveryTypeChange,
  address,
  addressError,
  onAddressChange,
  isConfirmed,
  reference,
  onSubmit,
  onRemoveProduct,
  onEditSetup,
  onDismiss,
}: ReviewDialogProps) {
  return (
    <SheetDialog dialogRef={dialogRef} onDismiss={onDismiss}>
      <>
        <SheetHeader
          label={isConfirmed ? "Request received" : "Review your room"}
          title={
            isConfirmed
              ? "You’re ready to work."
              : `${products.length} pieces · ${location}`
          }
          closeLabel="Close review"
          onDismiss={onDismiss}
        />

        {isConfirmed ? (
          <div className="success-state">
            <span aria-hidden="true">✓</span>
            <p className="eyebrow mt-[27px] mb-[15px]">Demo request confirmed</p>
            <h2>Your workspace is taking shape.</h2>
            <p>
              We&apos;ve reserved these demo items for {deliveryDate}. In a live
              version, this request would now be sent to the operations team to
              schedule delivery and assembly.
            </p>
            <div className="success-reference">
              <span>Reference</span>
              <strong>{reference}</strong>
            </div>
            <button type="button" onClick={onDismiss}>
              Back to your workspace
            </button>
          </div>
        ) : (
          <form className="review-layout" noValidate onSubmit={onSubmit}>
            <div className="review-items">
              <p className="eyebrow mb-5">Your equipment</p>
              {products.map((product) => (
                <article key={product.id}>
                  <div className="review-product-photo">
                    <ProductPhoto product={product} />
                  </div>
                  <div>
                    <span>
                      {product.brand} · {product.category}
                    </span>
                    <strong>{product.name}</strong>
                    <small>
                      {product.condition} · {product.color}
                    </small>
                  </div>
                  <b>{formatMoney(productPrice(product, cycle))}</b>
                  {product.category === "accessory" && (
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(product)}
                      aria-label={`Remove ${product.name}`}
                    >
                      ×
                    </button>
                  )}
                </article>
              ))}
              <button type="button" className="edit-setup" onClick={onEditSetup}>
                + Edit your setup
              </button>
            </div>

            <div className="checkout-panel">
              <p className="eyebrow mb-5">Delivery details</p>
              <div className="checkout-fields">
                <SelectField
                  label="Location"
                  value={location}
                  options={LOCATIONS}
                  onChange={onLocationChange}
                />
                <DateField
                  label="Delivery date"
                  value={deliveryDate}
                  min={minDeliveryDate}
                  onChange={onDeliveryDateChange}
                />
                <label className="address-field">
                  <span>Delivery address</span>
                  <textarea
                    value={address}
                    aria-invalid={addressError ? true : undefined}
                    onChange={(event) => onAddressChange(event.target.value)}
                    placeholder="Villa, hotel, office, or coworking address"
                  />
                  {addressError && <em className="field-error">{addressError}</em>}
                </label>
              </div>

              <fieldset className="delivery-options">
                <legend>Delivery service</legend>
                <label className={deliveryType === "regular" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === "regular"}
                    onChange={() => onDeliveryTypeChange("regular")}
                  />
                  <span>
                    <strong>Roomie Setup</strong>
                    <small>Next day · delivery and assembly included</small>
                  </span>
                  <b>Free</b>
                </label>
                <label className={deliveryType === "priority" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryType === "priority"}
                    onChange={() => onDeliveryTypeChange("priority")}
                  />
                  <span>
                    <strong>Priority Setup</strong>
                    <small>Choose a 2-hour window · live tracking</small>
                  </span>
                  <b>$5</b>
                </label>
              </fieldset>

              <div className="order-summary">
                <div>
                  <span>Equipment subtotal</span>
                  <b>{formatMoney(subtotal)}</b>
                </div>
                {discount > 0 && (
                  <div className="saving-line">
                    <span>{activeBundle?.name} saving</span>
                    <b>-{formatMoney(discount)}</b>
                  </div>
                )}
                <div>
                  <span>Delivery &amp; assembly</span>
                  <b>{deliveryFee ? formatMoney(deliveryFee) : "Included"}</b>
                </div>
                <div className="total-line">
                  <span>
                    Due today
                    <small>
                      Then {formatMoney(total)}/{cycleLabel(cycle)}
                    </small>
                  </span>
                  <b>{formatMoney(orderTotal)}</b>
                </div>
              </div>

              <button className="confirm-rental" type="submit">
                Confirm demo rental <span aria-hidden="true">→</span>
              </button>
              <p className="demo-note">
                Demo only — no payment is collected and no external request is sent.
              </p>
            </div>
          </form>
        )}
      </>
    </SheetDialog>
  );
}
