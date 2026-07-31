import assert from "node:assert/strict";
import test from "node:test";
import { bundles, initialSetup, resolveBundleId } from "../../lib/catalog.ts";

const creator = bundles.find((bundle) => bundle.id === "creator");
if (!creator) throw new Error("Missing the creator bundle.");

test("every bundle recognises its own setup", () => {
  for (const bundle of bundles) {
    assert.equal(
      resolveBundleId(bundle.setup),
      bundle.id,
      `${bundle.id} failed to recognise itself`,
    );
  }
});

test("the default setup is a real bundle, not a positional guess", () => {
  assert.equal(initialSetup.bundleId, "creator");
  assert.equal(resolveBundleId(initialSetup), "creator");
});

test("accessory order does not affect the match", () => {
  const reversed = {
    ...creator.setup,
    accessoryIds: [...creator.setup.accessoryIds].reverse(),
  };

  assert.equal(resolveBundleId(reversed), "creator");
});

test("dropping an add-on releases the bundle price", () => {
  const stripped = {
    ...creator.setup,
    accessoryIds: creator.setup.accessoryIds.slice(1),
  };

  assert.equal(resolveBundleId(stripped), null);
});

test("adding an extra add-on releases the bundle price", () => {
  const padded = {
    ...creator.setup,
    accessoryIds: [...creator.setup.accessoryIds, "line-task-lamp"],
  };

  assert.equal(resolveBundleId(padded), null);
});

test("swapping the desk for one outside every bundle releases the price", () => {
  assert.equal(resolveBundleId({ ...creator.setup, deskId: "form-120" }), null);
});

test("swapping the desk into another bundle's shape charges that bundle", () => {
  // Creator plus the wider desk is exactly the founder setup, so the customer
  // moves onto the founder discount rather than losing the discount entirely.
  const founder = bundles.find((bundle) => bundle.id === "founder");
  if (!founder) throw new Error("Missing the founder bundle.");

  assert.deepEqual(
    { ...creator.setup, deskId: "aerolift-160" },
    founder.setup,
    "this test only means anything while the two bundles differ by the desk alone",
  );
  assert.equal(resolveBundleId({ ...creator.setup, deskId: "aerolift-160" }), "founder");
});

test("swapping the chair releases the bundle price", () => {
  assert.equal(resolveBundleId({ ...creator.setup, chairId: "focus-mesh" }), null);
});

test("restoring the original piece brings the bundle price back", () => {
  const swapped = { ...creator.setup, deskId: "form-120" };
  assert.equal(resolveBundleId(swapped), null);

  const restored = { ...swapped, deskId: creator.setup.deskId };
  assert.equal(resolveBundleId(restored), "creator");
});

test("a setup matching no bundle resolves to no discount", () => {
  assert.equal(
    resolveBundleId({
      deskId: "form-120",
      chairId: "focus-mesh",
      accessoryIds: ["mx-keys"],
    }),
    null,
  );
});

test("bundle ids are unique, so a match is unambiguous", () => {
  const ids = bundles.map((bundle) => bundle.id);
  assert.equal(new Set(ids).size, ids.length);
});
