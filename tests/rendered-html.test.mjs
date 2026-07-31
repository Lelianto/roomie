import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("prerenders the complete workspace builder", async () => {
  const html = await read("../.next/server/app/index.html");

  assert.match(html, /<title>Roomie — Build a workspace that works<\/title>/i);
  assert.match(html, /Build your room/);
  assert.match(html, /See it come alive/);
  assert.match(html, /AeroLift 120/);
  assert.match(html, /ErgoFlex 4D/);
  assert.match(html, /Live setup/);
  assert.match(html, /Curated bundles/);
  assert.match(html, /Monthly/);
  assert.match(html, /Demo inventory/);
});

test("renders the room scene and its controls into the static HTML", async () => {
  const html = await read("../.next/server/app/index.html");

  // The scene is the product: it has to exist before hydration, not appear
  // once client JavaScript runs.
  assert.match(html, /scene-composite/);

  // The default setup owns the complete pictured kit, so the all-or-nothing
  // switch must serve the -equipped render and skip live overlays entirely.
  assert.match(html, /compact-ergonomic-equipped\.webp/);
  assert.doesNotMatch(html, /scene-accessory-stage/);

  // Native widgets were replaced deliberately; their return would be a
  // regression in look and in behaviour.
  assert.doesNotMatch(html, /<select|type="date"/);
  assert.match(html, /role="combobox"/);

  assert.match(html, /role="radio"/);
  assert.match(html, /aria-checked/);
});

test("ships no build tooling from the abandoned stack", async () => {
  const packageJson = await read("../package.json");

  assert.doesNotMatch(packageJson, /react-loading-skeleton|wrangler|vinext|drizzle/);
  assert.match(packageJson, /"build": "next build"/);
});

test("ships a complete set of precomposed room scenes", async () => {
  const files = await readdir(new URL("../public/scene/renders/", import.meta.url));
  const expected = [
    "compact-ergonomic-equipped.webp",
    "compact-ergonomic.webp",
    "compact-focus-equipped.webp",
    "compact-focus.webp",
    "oak-ergonomic-equipped.webp",
    "oak-ergonomic.webp",
    "oak-focus-equipped.webp",
    "oak-focus.webp",
    "wide-ergonomic-equipped.webp",
    "wide-ergonomic.webp",
    "wide-focus-equipped.webp",
    "wide-focus.webp",
  ];

  assert.deepEqual(files.filter((file) => file.endsWith(".webp")).sort(), expected.sort());
  assert.equal(
    files.some((file) => file.endsWith(".png")),
    false,
  );
});

test("uses generated catalog images that match the room scenes", async () => {
  const files = await readdir(new URL("../public/products/generated/", import.meta.url));
  const expected = [
    "aerolift-120.webp",
    "aerolift-160.webp",
    "ergoflex-4d.webp",
    "focus-mesh.webp",
    "form-120.webp",
    "line-task-lamp.webp",
    "mx-keys.webp",
    "mx-master-3s.webp",
    "viewpro-27.webp",
  ];

  assert.deepEqual(files.filter((file) => file.endsWith(".webp")).sort(), expected.sort());
  assert.equal(
    files.some((file) => file.endsWith(".png")),
    false,
  );
});
