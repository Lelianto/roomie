"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

function useDismiss(open: boolean, close: () => void) {
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

function Caret() {
  return (
    <svg className="field-caret" viewBox="0 0 10 6" aria-hidden="true">
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)));
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  const listId = useId();
  const labelId = useId();

  function commit(index: number) {
    const next = options[index];
    if (next) onChange(next);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(Math.max(0, options.indexOf(value)));
        setOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + options.length) % options.length);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(active);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="field" ref={ref}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <button
        type="button"
        className="field-trigger"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        onClick={() => {
          setActive(Math.max(0, options.indexOf(value)));
          setOpen((current) => !current);
        }}
        onKeyDown={onKeyDown}
      >
        <span className="field-value">{value}</span>
        <Caret />
      </button>
      {open && (
        <ul className="field-pop select-pop" id={listId} role="listbox" aria-labelledby={labelId}>
          {options.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                className={`select-option${index === active ? " active" : ""}${
                  option === value ? " chosen" : ""
                }`}
                onMouseEnter={() => setActive(index)}
                onClick={() => commit(index)}
              >
                {option}
                {option === value && <i aria-hidden="true">✓</i>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const triggerFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function toKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function todayKey() {
  return toKey(new Date());
}

export function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismiss(open, close);
  const labelId = useId();
  const selected = fromKey(value);
  const minDate = min ? fromKey(min) : null;
  const [cursor, setCursor] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  function toggle() {
    if (!open) setCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
    setOpen((current) => !current);
  }

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lead = (first.getDay() + 6) % 7;
  const canGoBack = !minDate || first > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => new Date(cursor.getFullYear(), cursor.getMonth(), index + 1),
    ),
  ];

  function shiftMonth(step: number) {
    if (step < 0 && !canGoBack) return;
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));
  }

  return (
    <div className="field" ref={ref}>
      <span className="field-label" id={labelId}>
        {label}
      </span>
      <button
        type="button"
        className="field-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={toggle}
      >
        <span className="field-value">{triggerFormat.format(selected)}</span>
        <Caret />
      </button>
      {open && (
        <div className="field-pop date-pop" role="dialog" aria-labelledby={labelId}>
          <div className="date-head">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              disabled={!canGoBack}
              aria-label="Previous month"
            >
              ‹
            </button>
            <strong>{monthFormat.format(cursor)}</strong>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="date-weekdays" aria-hidden="true">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="date-grid">
            {cells.map((date, index) => {
              if (!date) return <span key={`lead-${index}`} />;
              const key = toKey(date);
              const disabled = Boolean(minDate && date < minDate);
              return (
                <button
                  type="button"
                  key={key}
                  disabled={disabled}
                  aria-pressed={key === value}
                  className={key === value ? "date-day chosen" : "date-day"}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type AppAlert = {
  id: number;
  tone: "info" | "error" | "success";
  title: string;
  body?: string;
};

export function useAlerts() {
  const [alerts, setAlerts] = useState<AppAlert[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const notify = useCallback(
    (tone: AppAlert["tone"], title: string, body?: string) => {
      const id = nextId.current++;
      setAlerts((current) => [...current, { id, tone, title, body }]);
      window.setTimeout(() => dismiss(id), 5200);
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
    if (alerts.length) node.showPopover();
    else if (node.matches(":popover-open")) node.hidePopover();
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
