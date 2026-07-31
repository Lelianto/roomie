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
      className="alert-stack"
      ref={ref}
      popover="manual"
      role="region"
      aria-label="Notifications"
    >
      {alerts.map((alert) => (
        <div key={alert.id} className={`app-alert ${alert.tone}`} role="alert">
          <div>
            <strong>{alert.title}</strong>
            {alert.body && <p>{alert.body}</p>}
          </div>
          <button type="button" onClick={() => onDismiss(alert.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
