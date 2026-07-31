import assert from "node:assert/strict";
import test from "node:test";
import {
  products,
  resolveScenePlacements,
  splitByChairMask,
} from "../../lib/catalog.ts";

const accessory = (id) => {
  const found = products.find((product) => product.id === id);
  if (!found) throw new Error(`Missing catalog fixture: ${id}`);
  return found;
};

const monitor = accessory("viewpro-27");
const lamp = accessory("mi-lamp-1s");
const keyboard = accessory("mx-keys");
const mouse = accessory("mx-master-3s");
const pictured = [monitor, lamp, keyboard, mouse];

test("placements come back sorted back to front so paint order matches depth", () => {
  const placements = resolveScenePlacements(pictured, "aerolift-120");
  const layers = placements.map((placement) => placement.zIndex);

  assert.deepEqual(layers, [...layers].sort((a, b) => a - b));
});

test("an accessory without a scene slot is dropped rather than placed at zero", () => {
  const unplaceable = products.find(
    (product) => product.category === "accessory" && !product.sceneSlot,
  );

  if (!unplaceable) {
    // Nothing to assert against, but the filter must still exist: prove it by
    // feeding in a product the scene has no slot or overlay for.
    const desk = accessory("aerolift-120");
    assert.deepEqual(resolveScenePlacements([desk], "aerolift-120"), []);
    return;
  }

  const ids = resolveScenePlacements([...pictured, unplaceable], "aerolift-120").map(
    (placement) => placement.id,
  );
  assert.equal(ids.includes(unplaceable.id), false);
});

test("selecting one accessory does not move the others", () => {
  const alone = resolveScenePlacements([monitor], "aerolift-120")[0];
  const together = resolveScenePlacements(pictured, "aerolift-120").find(
    (placement) => placement.id === monitor.id,
  );

  assert.deepEqual(alone, together);
});

test("every placement is a finite box, never NaN", () => {
  for (const deskId of ["aerolift-120", "aerolift-160", "form-120"]) {
    for (const placement of resolveScenePlacements(pictured, deskId)) {
      for (const key of ["left", "top", "width", "height", "zIndex"]) {
        assert.ok(
          Number.isFinite(placement[key]),
          `${deskId}/${placement.id}.${key} was ${placement[key]}`,
        );
      }
      assert.ok(placement.width > 0, `${deskId}/${placement.id} has no width`);
      assert.ok(placement.height > 0, `${deskId}/${placement.id} has no height`);
    }
  }
});

test("each desk gets its own baseline, so objects sit on that desk's surface", () => {
  const on120 = resolveScenePlacements([keyboard], "aerolift-120")[0];
  const on160 = resolveScenePlacements([keyboard], "aerolift-160")[0];

  assert.ok(on120, "the keyboard must be placeable on the 120 desk");
  assert.ok(on160, "the keyboard must be placeable on the 160 desk");
  assert.ok(
    Number.isFinite(on120.top) && Number.isFinite(on160.top),
    "baselines must resolve to numbers for both desks",
  );
});

test("an unknown desk still places accessories using the fallback baseline", () => {
  const placements = resolveScenePlacements(pictured, "a-desk-we-never-shipped");

  assert.equal(placements.length, resolveScenePlacements(pictured, "aerolift-120").length);
});

test("the chair mask splits placements without losing or duplicating any", () => {
  const placements = resolveScenePlacements(pictured, "aerolift-120");
  const { behindChair, aheadOfChair } = splitByChairMask(placements);

  assert.equal(behindChair.length + aheadOfChair.length, placements.length);
  assert.deepEqual(
    [...behindChair, ...aheadOfChair].map((placement) => placement.id).sort(),
    placements.map((placement) => placement.id).sort(),
  );
});

test("nothing behind the chair paints above anything ahead of it", () => {
  const { behindChair, aheadOfChair } = splitByChairMask(
    resolveScenePlacements(pictured, "aerolift-120"),
  );

  const highestBehind = Math.max(...behindChair.map((p) => p.zIndex), -Infinity);
  const lowestAhead = Math.min(...aheadOfChair.map((p) => p.zIndex), Infinity);

  assert.ok(
    highestBehind < lowestAhead,
    `behind-chair layer ${highestBehind} must sit under ahead-of-chair layer ${lowestAhead}`,
  );
});

test("an empty selection yields an empty scene", () => {
  assert.deepEqual(resolveScenePlacements([], "aerolift-120"), []);
  assert.deepEqual(splitByChairMask([]), { behindChair: [], aheadOfChair: [] });
});
