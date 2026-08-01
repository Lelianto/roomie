"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ALERT_TIMEOUT_MS } from "@/lib/constants";

export type AppAlert = {
  id: number;
  tone: "info" | "error" | "success";
  title: string;
  body?: string;
};

export function useAlerts() {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Set<number>());

  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current.clear();
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const notify = useCallback(
    (tone: AppAlert["tone"], title: string, body?: string) => {
      const id = nextId.current++;
      setAlerts((current) => [...current, { id, tone, title, body }]);
      const timer = window.setTimeout(() => {
        timers.current.delete(timer);
        dismiss(id);
      }, ALERT_TIMEOUT_MS);
      timers.current.add(timer);
    },
    [dismiss],
  );

  return { alerts, notify, dismiss };
}

// A `manual` popover is display:none until opened, so the closed state has to be
// spelled out rather than relying on the popover default the authored rule set.
const stack =
  "pointer-events-none fixed top-auto right-auto bottom-5 left-1/2 z-[90] grid w-[min(360px,calc(100vw-32px))] -translate-x-1/2 gap-2 overflow-visible border-0 bg-transparent p-0 [&:not(:popover-open)]:hidden";

const alertBase =
  "pointer-events-auto flex items-start justify-between gap-3 px-[14px] py-3 text-shell";

const tones = {
  info: "bg-ink",
  error: "bg-danger",
  success: "bg-[#1f5c3d]",
} as const;

export function AlertStack({
  alerts,
  onDismiss,
}: {
  alerts: AppAlert[];
  onDismiss: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Rendered in the top layer so notifications stay visible above modals.
    // Both calls throw if the popover is already in the requested state, and
    // this effect re-runs on every change to the alert count.
    const isOpen = node.matches(":popover-open");
    if (alerts.length && !isOpen) node.showPopover();
    else if (!alerts.length && isOpen) node.hidePopover();
  }, [alerts.length]);

  return (
    <div
      className={stack}
      ref={ref}
      popover="manual"
      role="region"
      aria-label="Notifications"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${alertBase} ${tones[alert.tone]}`}
          role="alert"
        >
          <div>
            <strong className="block font-mona text-xs">{alert.title}</strong>
            {alert.body && (
              <p className="mt-[3px] mb-0 text-[11px] opacity-[0.82]">{alert.body}</p>
            )}
          </div>
          <button
            type="button"
            className="border-0 bg-transparent p-0 text-base leading-none text-inherit"
            onClick={() => onDismiss(alert.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
