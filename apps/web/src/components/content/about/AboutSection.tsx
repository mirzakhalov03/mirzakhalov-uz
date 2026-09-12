import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { AboutNav } from './AboutNav.js';
import { AboutTurn } from './AboutTurn.js';
import { EducationChapter } from './EducationChapter.js';
import { ExperienceChapter } from './ExperienceChapter.js';
import { StoryChapter } from './StoryChapter.js';
import { flowTopOf } from '../../../lib/scroll-to-flow.js';

/* Document order, and the panel each tab controls. A tuple rather than a
   `readonly Link[]`, so `CHAPTERS[0]` is a known element under
   noUncheckedIndexedAccess and the id union below is literal. */
const CHAPTERS = [
  { id: 'about-story', label: 'Story', Panel: StoryChapter },
  { id: 'about-education', label: 'Education', Panel: EducationChapter },
  { id: 'about-experience', label: 'Experience', Panel: ExperienceChapter },
] as const;

type ChapterId = (typeof CHAPTERS)[number]['id'];

const LAST = CHAPTERS.length - 1;

/** Where the new chapter is parked: `top` under the bar for a forward turn,
 *  `bottom` on the viewport floor for a backward one — so a turn always leaves
 *  the reader at the edge they were travelling towards. */
type Landing = 'top' | 'bottom';

/** A turn that has been decided but not yet committed. */
type Turn = { to: number; land: Landing };

/** The turn parks the page itself, and the observer sees that as a scroll. A
 *  real turn needs a beat and a push of the reader's own on top of it. */
const SETTLE_MS = 350;
const SETTLE_PX = 80;

/**
 * How long the outgoing chapter takes to leave.
 *
 * The page has to be repositioned for a chapter of a different height, and a
 * reposition the reader can see is a snap however it is eased — smooth-scrolling
 * two viewports would just be a slow snap that also fights whatever they are
 * doing with the wheel. So it happens inside this window, while the column is
 * at opacity 0. Nothing visible moves during the jump, so there is nothing to
 * see jump.
 *
 * Handed to the stylesheet as `--about-leave` so the fade and the commit below
 * are one number rather than two that drift apart.
 */
const LEAVE_MS = 200;

/** A pasted `#about-education` used to land on a section that was always in
 *  the DOM. Only one is mounted now, so the hash has to pick the tab instead
 *  or the link would silently open on Story. */
function initialIndex(): number {
  const hash = window.location.hash.slice(1);
  const found = CHAPTERS.findIndex((chapter) => chapter.id === hash);
  return found < 0 ? 0 : found;
}

/**
 * Everything a chapter parked at the top has to clear: the top bar, the
 * section's sticky title, and the tab bar where it is stuck under both.
 *
 * Measured rather than read off `--section-head-h`. The stylesheet's figure is
 * a computed stand-in for anything that has to stick clear of the head without
 * a layout read; this runs once per turn, so it can afford the real number and
 * stays right even if the head ever wraps.
 */
function stuckHeight(root: HTMLElement | null): number {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--bar-h'),
  );
  const bar = Number.isFinite(value) ? value : 57;

  const head =
    root?.closest<HTMLElement>('[data-sticky-head]')?.querySelector<HTMLElement>('.section-head') ??
    null;

  /* `.about-nav` is position: sticky in both media blocks, so computed position
     cannot tell the mobile bar from the desktop rail — only the breakpoint can.
     Use the media query itself rather than window.innerWidth: innerWidth
     includes a classic scrollbar's width while the CSS breakpoint does not, so
     near 1024px the two could disagree about which layout is live. */
  const nav = root?.querySelector<HTMLElement>('.about-nav') ?? null;
  const navStuck = nav && window.matchMedia('(max-width: 1023.98px)').matches;

  return bar + (head?.offsetHeight ?? 0) + (navStuck && nav ? nav.offsetHeight : 0) + 8;
}

/**
 * §01, as three chapters behind one tab rail, turned by scrolling.
 *
 * One chapter is mounted at a time, which is what guarantees you can never be
 * looking at the tail of one and the head of the next. Scrolling still drives
 * it: each chapter keeps its natural height and scrolls normally, and past its
 * end sits an `AboutTurn` runway — scroll that fully into view and the next
 * chapter opens, parked at its top. Scroll back into the runway above and the
 * previous one opens, parked at its bottom.
 *
 * This is a page turn rather than a slide deck, and deliberately: Experience is
 * about one and a half viewports on a desktop and nearer three on a phone, so
 * pinning a chapter to a single screen would mean either cutting it down or
 * giving it a scrollbar of its own inside the page's.
 *
 * The turn is a cross-fade with the reposition hidden inside it — see LEAVE_MS.
 * The trigger is an IntersectionObserver, never a scroll listener (§7.3), the
 * same call `useActiveSection` makes and for the same reason.
 */
export function AboutSection() {
  const [index, setIndex] = useState(initialIndex);
  /** The turn under way, or null. Also the re-entry guard. */
  const [turn, setTurn] = useState<Turn | null>(null);
  /** Which way the reader is travelling. Outlives the turn, because the
   *  arriving chapter's entrance is still reading it after the commit. */
  const [dir, setDir] = useState<1 | -1>(1);

  const root = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLDivElement>(null);
  const nextTurn = useRef<HTMLDivElement>(null);
  const backTurn = useRef<HTMLDivElement>(null);

  /** Set by whatever caused the turn, consumed by the layout effect that parks
   *  the page. Null on a plain visit, which is what keeps one from scrolling
   *  itself — but set when a `#about-experience` picked the chapter, because
   *  the browser's own hash jump ran before this component existed to answer
   *  it. */
  const landing = useRef<Landing | null>(index > 0 ? 'top' : null);
  /** Where the last turn left the page, and when. */
  const parked = useRef<{ y: number; at: number } | null>(null);

  const chapter = CHAPTERS[index] ?? CHAPTERS[0];
  /* The tabs answer the moment they are pressed. Selection has changed as soon
     as the turn is decided; it is only the panel that takes a beat to catch up,
     and a tab that waits 200ms to fill reads as a dropped click. */
  const selected = CHAPTERS[turn?.to ?? index] ?? chapter;

  const turnTo = useCallback(
    (to: number, land: Landing) => {
      /* Re-selecting the open chapter is a no-op, and has to leave `landing`
         alone: a render it did not cause would otherwise consume it and park
         the page for no reason. */
      if (to === index || to < 0 || to > LAST) return;
      if (turn) return;

      setDir(to > index ? 1 : -1);

      /* Reduced motion asks for no animation, not for a slower one — so there
         is no fade to hide the reposition behind, and the honest thing is to
         make it at once rather than after a beat of nothing happening. */
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        landing.current = land;
        setIndex(to);
        return;
      }

      setTurn({ to, land });
    },
    [index, turn],
  );

  /* The other half of the turn: commit once the column has actually gone.
     setIndex and setTurn land in one render, so the layout effect below parks
     the page in the same frame the new chapter first lays out — and it is still
     invisible when it does, because the fade back in has not painted yet. */
  useEffect(() => {
    if (!turn) return;

    const commit = () => {
      landing.current = turn.land;
      setIndex(turn.to);
      setTurn(null);
    };

    /* transitionend rather than a bare timer. This effect runs after paint, so
       a timer started here can beat the transition it is timing by a frame or
       two — and parking one frame early is precisely the jump being hidden. The
       timer stays as the fallback for a transition that never fires at all. */
    const node = column.current;
    const handle = (event: TransitionEvent) => {
      if (event.target === node && event.propertyName === 'opacity') commit();
    };

    node?.addEventListener('transitionend', handle);
    const timer = window.setTimeout(commit, LEAVE_MS + 120);

    return () => {
      node?.removeEventListener('transitionend', handle);
      window.clearTimeout(timer);
    };
  }, [turn]);

  /* Park before paint. Layout values only: the chapter has just been laid out,
     and the panel's own flow top does not move when About's height changes —
     only the panels below it do. */
  useLayoutEffect(() => {
    const land = landing.current;
    landing.current = null;
    if (!land) return;

    const node = document.getElementById(chapter.id);
    if (!node) return;

    const top = flowTopOf(node);
    const y =
      land === 'top'
        ? top - stuckHeight(root.current)
        : top + node.offsetHeight - window.innerHeight + 8;

    window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
    parked.current = { y: window.scrollY, at: performance.now() };
  }, [chapter.id]);

  useEffect(() => {
    const turns = [
      { node: backTurn.current, to: index - 1, land: 'bottom' as const },
      { node: nextTurn.current, to: index + 1, land: 'top' as const },
    ];

    /* Treat arriving as a park. A runway that is already fully on screen when a
       chapter opens fires the observer's first callback immediately, and
       without this a tall enough viewport — one where a short chapter plus its
       runway fit at once — would turn the page on load, before the reader had
       touched anything. Where that geometry holds, scrolling simply does not
       turn the section and the tabs are the way through it, which is the honest
       answer: nothing inside a panel shorter than the screen moves anyway. */
    parked.current ??= { y: window.scrollY, at: performance.now() };

    const observer = new IntersectionObserver(
      (entries) => {
        const park = parked.current;
        if (
          park &&
          (performance.now() - park.at < SETTLE_MS ||
            Math.abs(window.scrollY - park.y) < SETTLE_PX)
        ) {
          return;
        }

        for (const entry of entries) {
          /* Ratio, not isIntersecting: isIntersecting is true on any overlap
             whatever threshold was asked for, and the runway has to be
             *entirely* on screen — otherwise a chapter shorter than the
             viewport turns itself the moment it opens. */
          if (entry.intersectionRatio < 0.99) continue;

          const hit = turns.find((candidate) => candidate.node === entry.target);
          if (hit) {
            turnTo(hit.to, hit.land);
            return;
          }
        }
      },
      { threshold: 1 },
    );

    for (const item of turns) if (item.node) observer.observe(item.node);
    return () => observer.disconnect();
  }, [index, turnTo]);

  const handleSelect = useCallback(
    (id: ChapterId) => {
      const to = CHAPTERS.findIndex((entry) => entry.id === id);
      if (to >= 0) turnTo(to, 'top');
    },
    [turnTo],
  );

  return (
    <div ref={root} className="lg:grid lg:grid-cols-[minmax(12rem,1fr)_3fr] lg:gap-8">
      <AboutNav chapters={CHAPTERS} active={selected.id} onSelect={handleSelect} />

      <div
        ref={column}
        className="about-column mt-5 lg:mt-0"
        data-leaving={turn ? '' : undefined}
        style={{ '--turn-dir': dir, '--about-leave': `${LEAVE_MS}ms` } as CSSProperties}
      >
        {index > 0 ? (
          <AboutTurn ref={backTurn} dir="back" label={CHAPTERS[index - 1]?.label ?? ''} />
        ) : null}

        {/* Keyed so the panel remounts and replays its entrance, arriving from
            the side the reader is travelling from. This is not "animate because
            it scrolled into view" (§2 principle 4) — it animates because the
            reader turned the page. */}
        <chapter.Panel key={chapter.id} />

        {index < LAST ? (
          <AboutTurn ref={nextTurn} dir="next" label={CHAPTERS[index + 1]?.label ?? ''} />
        ) : null}
      </div>
    </div>
  );
}
