'use client';

import { useEffect, useRef, useState } from 'react';

type SelectProps = {
  id: string;
  name: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

/**
 * Native <select> popups can't be themed, so this is a button + listbox pair
 * backed by a hidden input so the value still travels with FormData.
 */
export default function Select({
  id,
  name,
  label,
  options,
  value,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const labelId = `${id}Label`;
  const triggerId = `${id}Trigger`;
  const selectedIndex = Math.max(0, options.indexOf(value));

  // close when a click lands outside the component
  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [open]);

  // keep the highlighted option in view while arrowing through a long list
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const openList = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const choose = (index: number) => {
    onChange(options[index]);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { key } = event;

    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const step = key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((i) => (i + step + options.length) % options.length);
    } else if (open && (key === 'Home' || key === 'End')) {
      event.preventDefault();
      setActiveIndex(key === 'Home' ? 0 : options.length - 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else openList();
    } else if (key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    } else if (key.length === 1 && key.trim()) {
      // type-ahead: jump to the next option starting with this letter
      const query = key.toLowerCase();
      const from = open ? activeIndex + 1 : 0;
      for (let n = 0; n < options.length; n++) {
        const i = (from + n) % options.length;
        if (options[i].toLowerCase().startsWith(query)) {
          setOpen(true);
          setActiveIndex(i);
          break;
        }
      }
    }
  };

  return (
    <div className="field">
      <label id={labelId} htmlFor={triggerId}>
        {label}
      </label>
      <div
        className={`select${open ? ' open' : ''}`}
        id={id}
        ref={rootRef}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="select-trigger"
          id={triggerId}
          ref={triggerRef}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}List`}
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
          onClick={() => (open ? setOpen(false) : openList())}
        >
          <span className="select-value">{value}</span>
          <svg
            className="select-arrow"
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <ul
          className="select-list"
          id={`${id}List`}
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option, i) => (
            <li
              key={option}
              id={`${id}-opt-${i}`}
              className={`select-option${open && i === activeIndex ? ' active' : ''}`}
              role="option"
              aria-selected={option === value}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              onClick={() => choose(i)}
              onMouseMove={() => setActiveIndex(i)}
            >
              {option}
            </li>
          ))}
        </ul>

        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  );
}
