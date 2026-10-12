'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Select-only combobox (WAI-ARIA APG pattern): focus stays on the trigger,
// the list is a listbox, and a hidden input carries the value into the form
// so it submits exactly like the native <select> it replaces.
//
// Keys — closed: ↓ ↑ Enter Space Alt+↓ open; Home/End open at the ends;
// typing jumps to a match. Open: ↓ ↑ Home End move, Enter/Space/Alt+↑ pick,
// Tab picks and moves on, Esc closes without changing anything.

type Props = {
  id: string;
  name: string;
  labelId: string;
  placeholder: string;
  options: readonly string[];
};

export default function Dropdown({ id, name, labelId, placeholder, options }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', timer: 0 as ReturnType<typeof setTimeout> | 0 });

  const optionId = (i: number) => `${listId}-opt-${i}`;
  const selectedIndex = options.indexOf(value);

  const openAt = (i: number) => {
    setActive(Math.max(0, Math.min(options.length - 1, i)));
    setOpen(true);
  };
  const choose = (i: number) => {
    setValue(options[i]);
    setOpen(false);
  };

  // close on a click/tap anywhere else
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // keep the highlighted option in view
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: 'nearest' });
    // optionId is derived from a stable id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  const typeAhead = (char: string) => {
    const t = typed.current;
    if (t.timer) clearTimeout(t.timer);
    t.text += char.toLowerCase();
    t.timer = setTimeout(() => { t.text = ''; }, 500);
    const start = open ? active : Math.max(0, selectedIndex);
    const order = [...options.keys()].map((k) => (start + 1 + k) % options.length);
    // a repeated single letter cycles through matches; a word matches from the start
    const hit = t.text.length > 1 ? options.findIndex((o) => o.toLowerCase().startsWith(t.text)) : order.find((i) => options[i].toLowerCase().startsWith(t.text));
    if (hit !== undefined && hit >= 0) openAt(hit);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const { key, altKey } = e;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        e.preventDefault();
        openAt(selectedIndex >= 0 ? selectedIndex : 0);
      } else if (key === 'Home' || key === 'End') {
        e.preventDefault();
        openAt(key === 'Home' ? 0 : options.length - 1);
      } else if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
        typeAhead(key);
      }
      return;
    }
    switch (key) {
      case 'ArrowDown': e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); break;
      case 'ArrowUp':
        e.preventDefault();
        if (altKey) choose(active);
        else setActive((a) => Math.max(0, a - 1));
        break;
      case 'Home': e.preventDefault(); setActive(0); break;
      case 'End': e.preventDefault(); setActive(options.length - 1); break;
      case 'Enter': case ' ': e.preventDefault(); choose(active); break;
      case 'Escape': e.preventDefault(); setOpen(false); break;
      case 'Tab': choose(active); break;
      default:
        if (key.length === 1 && !e.ctrlKey && !e.metaKey) typeAhead(key);
    }
  };

  return (
    <div className="dd" data-open={open} ref={rootRef}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        className="input dd-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={labelId}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : openAt(selectedIndex >= 0 ? selectedIndex : 0))}
        onKeyDown={onKeyDown}
        onBlur={(e) => { if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
      >
        {/* key: the value text slides in fresh on every change */}
        <span className="dd-value" data-empty={!value} key={value || 'empty'}>{value || placeholder}</span>
        <svg className="dd-chevron" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4.25 6 8.25l4-4" />
        </svg>
      </button>
      <ul className="dd-list" id={listId} role="listbox" aria-labelledby={labelId} ref={listRef} tabIndex={-1}>
        {options.map((o, i) => (
          <li
            key={o}
            id={optionId(i)}
            role="option"
            aria-selected={o === value}
            data-active={open && i === active}
            style={{ '--i': i } as React.CSSProperties}
            // keep focus on the trigger so the keyboard keeps working
            onPointerDown={(e) => e.preventDefault()}
            onPointerEnter={() => setActive(i)}
            onClick={() => choose(i)}
          >
            <span>{o}</span>
            <svg className="dd-check" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2.5 6.2 5 8.5l4.5-5" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
}
