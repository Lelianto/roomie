import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete workspace builder", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
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
  assert.match(catalog, /sceneImage: string/);
  assert.match(catalog, /lamp-generated\.png/);
  assert.match(catalog, /sceneClass: string/);
  assert.match(catalog, /inventory|stock:/i);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /showModal/);
  assert.match(page, /aria-checked=\{selected\}/);
  assert.match(page, /type="date"/);
  assert.match(layout, /Roomie — Build a workspace that works/);
  assert.match(
    await readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    /room-base\.webp/,
  );
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
