"use client";

import { useCallback, useId, useState } from "react";
import {
  dayFormat,
  fromKey,
  monthCells,
  monthFormat,
  startOfMonth,
  toKey,
  weekdays,
} from "@/lib/date";
import { Caret, useDismiss } from "./field";

/**
 * Calendar popover replacing <input type="date">, whose look and language are
 * dictated by the browser. `min` is enforced three ways — disabled days, a
 * disabled previous-month button, and a guard in shiftMonth — so a past date
 * cannot be reached by clicking, by paging back, or by keyboard.
 */
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
  const [cursor, setCursor] = useState(() => startOfMonth(selected));

  const canGoBack = !minDate || cursor > startOfMonth(minDate);
  const cells = monthCells(cursor);

  function toggle() {
    // Reopening always lands on the month of the current selection, not on
    // wherever the visitor happened to page to last time.
    if (!open) setCursor(startOfMonth(selected));
    setOpen((current) => !current);
  }

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
        <span className="field-value">{dayFormat.format(selected)}</span>
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
              return (
                <button
                  type="button"
                  key={key}
                  disabled={Boolean(minDate && date < minDate)}
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
