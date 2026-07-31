import assert from "node:assert/strict";
import test from "node:test";
import { bundles, getSetupProducts, products } from "../../lib/catalog.ts";
import {
  MONTHLY_DISCOUNT,
  MONTHLY_WEEKS,
  PRIORITY_DELIVERY_FEE,
  deliveryFeeFor,
  orderTotalOf,
  productPrice,
  setupPrice,
  subtotalOf,
} from "../../lib/pricing.ts";

const desk = products.find((product) => product.id === "aerolift-120");
const chair = products.find((product) => product.id === "ergoflex-4d");
const monitor = products.find((product) => product.id === "viewpro-27");

if (!desk || !chair || !monitor) throw new Error("Catalog fixtures missing.");

test("a weekly rental is charged at the list weekly price", () => {
  assert.equal(productPrice(desk, "weekly"), desk.weeklyPrice);
});

test("a monthly rental bills four weeks less the commitment discount", () => {
  assert.equal(
    productPrice(desk, "monthly"),
    desk.weeklyPrice * MONTHLY_WEEKS * (1 - MONTHLY_DISCOUNT),
  );
});

test("monthly is cheaper per week than weekly but costs more up front", () => {
  const weekly = productPrice(desk, "weekly");
  const monthly = productPrice(desk, "monthly");

  assert.ok(monthly > weekly, "a month must cost more than a single week");
  assert.ok(
    monthly / MONTHLY_WEEKS < weekly,
    "the per-week rate must drop when committing to a month",
  );
});

test("the subtotal adds up the selected pieces and ignores the bundle", () => {
  assert.equal(
    subtotalOf([desk, chair, monitor], "weekly"),
    desk.weeklyPrice + chair.weeklyPrice + monitor.weeklyPrice,
  );
});

test("an empty selection subtotals to zero rather than NaN", () => {
  assert.equal(subtotalOf([], "weekly"), 0);
  assert.equal(subtotalOf([], "monthly"), 0);
});

test("a held bundle discounts the whole setup", () => {
  const bundle = bundles.find((item) => item.id === "creator");
  if (!bundle) throw new Error("Missing the creator bundle.");

  const setup = { ...bundle.setup, bundleId: bundle.id };
  const list = subtotalOf(getSetupProducts(setup), "weekly");

  assert.equal(setupPrice(setup, "weekly"), list * (1 - bundle.discount));
  assert.ok(setupPrice(setup, "weekly") < list, "the discount must reduce the price");
});

test("the same pieces cost full price once the bundle no longer holds", () => {
  const bundle = bundles.find((item) => item.id === "creator");
  if (!bundle) throw new Error("Missing the creator bundle.");

  const discounted = { ...bundle.setup, bundleId: bundle.id };
  const undiscounted = { ...bundle.setup, bundleId: null };

  assert.equal(
    setupPrice(undiscounted, "weekly"),
    subtotalOf(getSetupProducts(undiscounted), "weekly"),
  );
  assert.ok(
    setupPrice(undiscounted, "weekly") > setupPrice(discounted, "weekly"),
    "dropping the bundle must cost the customer more, not less",
  );
});

test("a stale bundle id does not silently discount the setup", () => {
  const setup = {
    deskId: desk.id,
    chairId: chair.id,
    accessoryIds: [],
    bundleId: "a-bundle-that-was-deleted",
  };

  assert.equal(setupPrice(setup, "weekly"), desk.weeklyPrice + chair.weeklyPrice);
});

test("only a priority window carries a delivery fee", () => {
  assert.equal(deliveryFeeFor("regular"), 0);
  assert.equal(deliveryFeeFor("priority"), PRIORITY_DELIVERY_FEE);
});

test("the order total is the rental plus the one-off delivery fee", () => {
  const setup = {
    deskId: desk.id,
    chairId: chair.id,
    accessoryIds: [monitor.id],
    bundleId: null,
  };

  assert.equal(orderTotalOf(setup, "weekly", "regular"), setupPrice(setup, "weekly"));
  assert.equal(
    orderTotalOf(setup, "weekly", "priority"),
    setupPrice(setup, "weekly") + PRIORITY_DELIVERY_FEE,
  );
});

test("the delivery fee is charged once, not scaled by the cycle", () => {
  const setup = {
    deskId: desk.id,
    chairId: chair.id,
    accessoryIds: [],
    bundleId: null,
  };

  const weeklyFee =
    orderTotalOf(setup, "weekly", "priority") - orderTotalOf(setup, "weekly", "regular");
  const monthlyFee =
    orderTotalOf(setup, "monthly", "priority") - orderTotalOf(setup, "monthly", "regular");

  assert.equal(weeklyFee, monthlyFee);
});
