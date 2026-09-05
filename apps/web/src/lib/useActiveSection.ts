import { useEffect, useState } from 'react';

/**
 * One IntersectionObserver for the whole page, never a scroll listener (§7.3).
 * The negative bottom margin means a section only counts as current once it has
 * actually reached the reading area, rather than the instant it peeks in.
 *
 * The *last* match wins, not the first. Sections stack, and an observer has no
 * notion of occlusion — a panel pinned under three others still reports itself
 * as intersecting, so taking the first match would leave the bar stuck on
 * Selected work for the whole page. Later in document order is later in the
 * stack, which is the sheet actually on top.
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join(',');

  useEffect(() => {
    const list = key.split(',');
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        let current: string | null = null;
        for (const id of list) if (visible.has(id)) current = id;
        setActive(current);
      },
      { rootMargin: '-88px 0px -55% 0px' },
    );

    for (const id of list) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}
