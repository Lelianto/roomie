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
import {
  Caret,
  fieldLabel,
  fieldPop,
  fieldTrigger,
  fieldValue,
  fieldWrap,
  useDismiss,
  type FieldVariant,
} from "./field";

const navButton =
  "h-6 w-6 border border-line bg-transparent text-sm leading-none disabled:cursor-default disabled:opacity-30";
const dayBase =
  "aspect-square border-0 font-mona text-[11px] font-semibold disabled:cursor-default disabled:opacity-[0.28] enabled:hover:bg-sand";

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
  variant = "boxed",
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  variant?: FieldVariant;
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
    <div className={fieldWrap[variant]} ref={ref}>
      <span className={fieldLabel} id={labelId}>
        {label}
      </span>
      <button
        type="button"
        className={fieldTrigger[variant]}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={toggle}
      >
        <span className={fieldValue}>{dayFormat.format(selected)}</span>
        <Caret />
      </button>
      {open && (
        <div
          className={`${fieldPop} w-[258px] p-3`}
          role="dialog"
          aria-labelledby={labelId}
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              className={navButton}
              onClick={() => shiftMonth(-1)}
              disabled={!canGoBack}
              aria-label="Previous month"
            >
              ‹
            </button>
            <strong className="font-mona text-xs tracking-[0.02em]">
              {monthFormat.format(cursor)}
            </strong>
            <button
              type="button"
              className={navButton}
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5" aria-hidden="true">
            {weekdays.map((day) => (
              <span
                key={day}
                className="py-1 text-center font-mona text-[9px] font-bold opacity-45"
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((date, index) => {
              if (!date) return <span key={`lead-${index}`} />;
              const key = toKey(date);
              return (
                <button
                  type="button"
                  key={key}
                  disabled={Boolean(minDate && date < minDate)}
                  aria-pressed={key === value}
                  className={`${dayBase} ${key === value ? "bg-ink text-shell" : "bg-transparent"}`}
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
