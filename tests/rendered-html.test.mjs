import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function prerenderedHtml() {
  return readFile(new URL("../.next/server/app/index.html", import.meta.url), "utf8");
}

test("prerenders the complete workspace builder", async () => {
  const html = await prerenderedHtml();
  assert.match(html, /<title>Roomie — Build a workspace that works<\/title>/i);
  assert.match(html, /Build your room/);
  assert.match(html, /See it come alive/);
  assert.match(html, /AeroLift 120/);
  assert.match(html, /ErgoFlex 4D/);
  assert.match(html, /Live setup/);
  assert.match(html, /Curated bundles/);
  assert.match(html, /Monthly/);
  assert.match(html, /Demo inventory/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships typed catalog data and local persistence", async () => {
  const [page, catalog, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(catalog, /export type Product = \{/);
  assert.match(catalog, /weeklyPrice: number/);
  assert.match(catalog, /products\/generated\/line-task-lamp\.webp/);
  assert.equal(
    catalog.match(/image: "\/products\/generated\//g)?.length,
    9,
  );
  assert.match(catalog, /export function getSceneRender/);
  assert.match(catalog, /-equipped/);
  assert.match(catalog, /inventory|stock:/i);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /showModal/);
  assert.match(page, /scene-accessory-stage/);
  assert.match(page, /placement\.overlay/);
  assert.match(page, /aria-checked=\{selected\}/);
  assert.match(page, /<DateField/);
  assert.match(page, /<SelectField/);
  assert.doesNotMatch(page, /type="date"|<select/);
  assert.match(layout, /Roomie — Build a workspace that works/);
  assert.match(
    await readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    /scene-composite/,
  );
  assert.doesNotMatch(page, /scene-placement-rail|scene-cutout|product\.sceneImage/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|wrangler|vinext|drizzle/);
  assert.match(packageJson, /"build": "next build"/);
});

test("ships a complete set of precomposed room scenes", async () => {
  const files = await readdir(
    new URL("../public/scene/renders/", import.meta.url),
  );
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

  assert.deepEqual(
    files.filter((file) => file.endsWith(".webp")).sort(),
    expected.sort(),
  );
  assert.equal(files.some((file) => file.endsWith(".png")), false);
});

test("uses generated catalog images that match the room scenes", async () => {
  const files = await readdir(
    new URL("../public/products/generated/", import.meta.url),
  );
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

  assert.deepEqual(
    files.filter((file) => file.endsWith(".webp")).sort(),
    expected.sort(),
  );
  assert.equal(files.some((file) => file.endsWith(".png")), false);
});
