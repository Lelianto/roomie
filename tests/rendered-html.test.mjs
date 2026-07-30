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
  assert.match(html, /Make space for/);
  assert.match(html, /Build your room/);
  assert.match(html, /Studio Desk/);
  assert.match(html, /Form Chair/);
  assert.match(html, /Live workspace/);
  assert.match(html, /\$874/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships typed catalog data and local persistence", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /type Product = \{/);
  assert.match(page, /category: Category/);
  assert.match(page, /window\.localStorage/);
  assert.match(page, /role="dialog"/);
  assert.match(page, /aria-pressed=\{selected\}/);
  assert.match(layout, /Roomie — Build a workspace that works/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
