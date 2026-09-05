import { Link } from 'react-router';
import { Data } from '../../primitives/Data.js';
import type { Social } from '../../content/types.js';
import { profile, socials } from '../../content/profile.js';

/**
 * The title block at the foot of the sheet: who drew it, how to reach them,
 * where else they are. Drawn as one bordered block with hairline cell walls —
 * the same construction as a drawing's title block, and the same device the
 * plates on the page use, so the footer reads as part of the drawing rather
 * than as chrome bolted underneath it.
 *
 * Channels are drawn from `socials` by label, not by index, so reordering
 * profile.ts can never silently reshuffle the footer.
 */
const DIRECT = ['Email', 'Telegram'];
const ELSEWHERE = ['GitHub', 'LinkedIn', 'Instagram'];

const pick = (labels: string[]): Social[] =>
  labels.flatMap((label) => socials.filter((social) => social.label === label));

const SITE = [
  { to: '/work', label: 'Work' },
  { to: '/writing', label: 'Writing' },
  { to: '/laugh', label: 'Laugh challenge' },
];

/** A cell of outbound links. `handles` shows the address underneath the name —
 *  worth the second line for a channel someone is meant to write to, noise for
 *  a profile they are meant to click. */
function Channels({
  title,
  items,
  handles = false,
}: {
  title: string;
  items: Social[];
  handles?: boolean;
}) {
  return (
    <div className="bg-surface p-3">
      <Data tone="accent">{title}</Data>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((social) => (
          <li key={social.label}>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block transition-colors duration-[160ms] hover:text-accent-text"
            >
              <Data size="lg" tone="fg" className="block group-hover:text-[var(--accent-text)]">
                {social.label}
              </Data>
              {handles ? (
                <Data className="block break-all group-hover:text-[var(--accent-text)]">
                  {social.handle}
                </Data>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line py-6 lg:py-8">
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-[1.6fr_1.15fr_0.85fr]">
        <div className="bg-surface p-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2">
            {/* The one loud element down here. It carries its own ground rather
                than a colour of its own, so the mark is the system's inversion
                and not a sixth pigment (§3.2). */}
            <span
              data-surface="void"
              aria-hidden="true"
              className="marks grid size-8 shrink-0 place-items-center bg-surface font-display text-[1.5rem] leading-none text-fg"
            >
              JM
            </span>
            <div className="min-w-0">
              <span className="t-h4 block text-fg">{profile.name}</span>
              <Data className="mt-0.5 block">
                {profile.role}, {profile.location}
              </Data>
            </div>
          </div>

          <p className="mt-3 max-w-[34ch] text-body text-fg-muted">{profile.motto}</p>
        </div>

        <Channels title="Write to me" items={pick(DIRECT)} handles />
        <Channels title="Elsewhere" items={pick(ELSEWHERE)} />
      </div>

      {/* The revision line. Computed, never typed — a hardcoded year is wrong
          within twelve months. */}
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <Data>
          © {new Date().getFullYear()} {profile.name} · {profile.utcOffset}
        </Data>

        <nav aria-label="Rest of the site" className="flex flex-wrap gap-x-4 gap-y-1">
          {SITE.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition-colors duration-[160ms] hover:text-accent-text"
            >
              <Data tone="fg">{item.label}</Data>
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
