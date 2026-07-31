"use client";

import { useCallback, useId, useState, type KeyboardEvent } from "react";
import { Caret, useDismiss } from "./field";

/**
 * A combobox built on a button plus a listbox, rather than a native <select>.
 * Focus stays on the trigger and the highlighted row is announced through
 * aria-activedescendant, which is the pattern assistive tech expects.
 */
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
  const optionId = (index: number) => `${listId}-${index}`;

  function commit(index: number) {
    const next = options[index];
    if (next) onChange(next);
    setOpen(false);
  }

  function openAt(index: number) {
    setActive(Math.max(0, index));
    setOpen(true);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAt(options.indexOf(value));
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
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => {
          if (open) setOpen(false);
          else openAt(options.indexOf(value));
        }}
        onKeyDown={onKeyDown}
      >
        <span className="field-value">{value}</span>
        <Caret />
      </button>
      {open && (
        <ul
          className="field-pop select-pop"
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option, index) => (
            // The option role has to sit on the listbox's own child, otherwise
            // assistive tech loses the listbox-to-option relationship.
            <li
              key={option}
              id={optionId(index)}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
