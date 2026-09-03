import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Data } from '../../primitives/Data.js';
import { socials } from '../../content/profile.js';

type Command = { id: string; label: string; group: string; to?: string; href?: string };

const COMMANDS: Command[] = [
  { id: 'home', label: 'Home', group: 'Go', to: '/' },
  { id: 'work-index', label: 'All work', group: 'Go', to: '/work' },
  { id: 'sec-work', label: 'Selected work', group: 'Section', to: '/#work' },
  { id: 'sec-about', label: 'About', group: 'Section', to: '/#about' },
  { id: 'sec-writing', label: 'Writing', group: 'Section', to: '/#writing' },
  { id: 'sec-contact', label: 'Contact', group: 'Section', to: '/#contact' },
  ...socials.map((s) => ({ id: `social-${s.label}`, label: s.label, group: 'Elsewhere', href: s.url })),
];

/**
 * Keyboard-first navigation, done properly: focus trapped on open and restored
 * on close, Esc closes, arrows move a virtual cursor via aria-activedescendant,
 * Enter activates. Built on <dialog>, so the trap, the inert background and the
 * Esc handling are the platform's job rather than ours.
 *
 * It is the one component in the system permitted a shadow (§3.4) — it is the
 * only thing that genuinely floats above the sheet.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => `${c.group} ${c.label}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setQuery('');
      setCursor(0);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const run = (command: Command) => {
    onClose();
    if (command.href) window.open(command.href, '_blank', 'noopener,noreferrer');
    else if (command.to) navigate(command.to);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => (c + 1) % Math.max(results.length, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = results[cursor];
      if (command) run(command);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-0 max-w-none bg-transparent p-0 backdrop:bg-[var(--shade)] backdrop:backdrop-blur-[2px] open:fixed open:inset-0 open:grid open:place-items-start open:justify-center open:pt-16"
    >
      <div
        className="w-[min(560px,calc(100vw-32px))] border border-accent bg-surface"
        style={{ boxShadow: '0 24px 80px rgb(0 0 0 / 0.6)' }}
      >
        <div className="border-b border-line px-3 py-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to…"
            aria-label="Search commands"
            aria-activedescendant={results[cursor] ? `cmd-${results[cursor].id}` : undefined}
            aria-controls="command-results"
            className="t-data-lg w-full bg-transparent text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>

        <ul id="command-results" role="listbox" aria-label="Commands" className="max-h-80 overflow-y-auto py-1">
          {results.map((command, i) => (
            <li
              key={command.id}
              id={`cmd-${command.id}`}
              role="option"
              aria-selected={i === cursor}
              onMouseEnter={() => setCursor(i)}
              onClick={() => run(command)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 ${
                i === cursor ? 'bg-well' : ''
              }`}
            >
              <span className="t-data-lg text-fg">{command.label}</span>
              <Data tone={i === cursor ? 'accent' : 'muted'}>{command.group}</Data>
            </li>
          ))}
          {results.length === 0 ? (
            <li className="px-3 py-3">
              <Data>Nothing matches “{query}”. Try work, writing, or GitHub.</Data>
            </li>
          ) : null}
        </ul>
      </div>
    </dialog>
  );
}
