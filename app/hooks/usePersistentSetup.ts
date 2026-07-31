"use client";

import { useEffect, useState } from "react";
import { initialSetup, products, type WorkspaceSetup } from "@/lib/catalog";
import { STORAGE_KEY } from "@/lib/constants";

const productIds = new Set(products.map((product) => product.id));

/**
 * Anything could be sitting under the storage key: an older schema, a payload
 * edited by hand, or ids for products that have since been retired. Restoring
 * one of those would render a room with missing pieces, so the whole payload is
 * rejected unless every id still resolves.
 */
export function isWorkspaceSetup(value: unknown): value is WorkspaceSetup {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<WorkspaceSetup>;
  return (
    typeof candidate.deskId === "string" &&
    typeof candidate.chairId === "string" &&
    productIds.has(candidate.deskId) &&
    productIds.has(candidate.chairId) &&
    Array.isArray(candidate.accessoryIds) &&
    candidate.accessoryIds.every(
      (id) => typeof id === "string" && productIds.has(id),
    ) &&
    (candidate.bundleId === null || typeof candidate.bundleId === "string")
  );
}

/**
 * Keeps the chosen setup in localStorage. The read is deferred to a timeout so
 * the first paint matches what the server prerendered; restoring during render
 * would trip a hydration mismatch.
 */
export function usePersistentSetup() {
  const [setup, setSetup] = useState<WorkspaceSetup>(initialSetup);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed: unknown = JSON.parse(saved);
          if (isWorkspaceSetup(parsed)) setSetup(parsed);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    // Skipped until the restore has run, otherwise the default setup would
    // overwrite whatever the visitor had saved.
    if (isRestored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
    }
  }, [isRestored, setup]);

  return { setup, setSetup };
}
