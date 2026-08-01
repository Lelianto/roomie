"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a popover on an outside pointer press or Escape. Both listeners run in
 * the capture phase so a click that also activates something else still closes
 * the popover first, and Escape inside a modal dialog closes only the popover
 * rather than the dialog behind it.
 */
export function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, close]);

  return ref;
}

/**
 * The fields appear in exactly two places, and the difference used to be
 * expressed by parent selectors reaching in from `.rental-context` and
 * `.checkout-fields`. Naming the two presentations makes the coupling explicit
 * and keeps the field's own styling inside the field.
 *
 * `pill` is the segmented control in the header; `boxed` is the filled card in
 * the checkout form. Positional rules -- the divider between header fields, the
 * address field spanning both columns -- stay with the container that owns the
 * layout.
 */
export type FieldVariant = "pill" | "boxed";

export const fieldWrap: Record<FieldVariant, string> = {
  pill: "relative min-w-0 px-[17px] pt-[7px] pb-1.5",
  boxed:
    "relative border border-transparent bg-shell px-[13px] pt-[11px] pb-[7px] focus-within:border-ink",
};

// `group` is what lets the caret flip on aria-expanded without a descendant rule.
const triggerBase =
  "group flex min-h-[28px] w-full items-center justify-between gap-2 border-0 bg-transparent p-0 text-left outline-0";

export const fieldTrigger: Record<FieldVariant, string> = {
  // The authored rule also set `height: 22px`, which never applied: the shared
  // `min-height: 28px` always won. Dropped rather than carried over.
  pill: `${triggerBase} font-mona text-xs font-[650]`,
  boxed: `${triggerBase} text-xs`,
};

export const fieldLabel =
  "block font-mona text-[9px] font-bold tracking-[0.08em] uppercase opacity-55";

export const fieldValue = "overflow-hidden text-ellipsis whitespace-nowrap";

/** Padding is left to the caller: the calendar needs more room than the list. */
export const fieldPop =
  "absolute top-[calc(100%+8px)] left-0 z-[60] m-0 min-w-full border border-ink bg-shell shadow-[0_18px_40px_rgba(20,18,14,0.16)]";

export function Caret() {
  return (
    <svg
      className="w-[9px] flex-none opacity-50 group-aria-expanded:rotate-180"
      viewBox="0 0 10 6"
      aria-hidden="true"
    >
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
