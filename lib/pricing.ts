import {
  bundles,
  getSetupProducts,
  type Product,
  type RentalCycle,
  type WorkspaceSetup,
} from "./catalog.ts";

/** A monthly rental is billed as four weeks, discounted for the commitment. */
export const MONTHLY_WEEKS = 4;
export const MONTHLY_DISCOUNT = 0.25;

/** One-off surcharge for a booked two-hour delivery window. */
export const PRIORITY_DELIVERY_FEE = 5;

export type DeliveryType = "regular" | "priority";

export function productPrice(product: Product, cycle: RentalCycle) {
  return cycle === "weekly"
    ? product.weeklyPrice
    : product.weeklyPrice * MONTHLY_WEEKS * (1 - MONTHLY_DISCOUNT);
}

/** List price of the selected pieces, before any bundle discount. */
export function subtotalOf(products: Product[], cycle: RentalCycle) {
  return products.reduce((sum, product) => sum + productPrice(product, cycle), 0);
}

/** Recurring rental price, with the bundle discount applied when one holds. */
export function setupPrice(setup: WorkspaceSetup, cycle: RentalCycle) {
  const subtotal = subtotalOf(getSetupProducts(setup), cycle);
  const bundle = bundles.find((item) => item.id === setup.bundleId);
  return bundle ? subtotal * (1 - bundle.discount) : subtotal;
}

export function deliveryFeeFor(delivery: DeliveryType) {
  return delivery === "priority" ? PRIORITY_DELIVERY_FEE : 0;
}

/**
 * Charged at checkout: the first rental period plus the one-off delivery fee.
 * The recurring amount stays `setupPrice`, so the two must not be conflated.
 */
export function orderTotalOf(
  setup: WorkspaceSetup,
  cycle: RentalCycle,
  delivery: DeliveryType,
) {
  return setupPrice(setup, cycle) + deliveryFeeFor(delivery);
}
