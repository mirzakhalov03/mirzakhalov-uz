import { useEffect, useState } from 'react';

/**
 * One IntersectionObserver for the whole page, never a scroll listener (§7.3).
 * The negative bottom margin means a section only counts as current once it has
 * actually reached the reading area, rather than the instant it peeks in.
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
        setActive(list.find((id) => visible.has(id)) ?? null);
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
