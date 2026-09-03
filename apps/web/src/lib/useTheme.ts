import { useCallback, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'system' | 'dark';

const STORAGE_KEY = 'theme';
const media = () => window.matchMedia('(prefers-color-scheme: light)');

const resolve = (choice: ThemeChoice): 'light' | 'dark' =>
  choice === 'system' ? (media().matches ? 'light' : 'dark') : choice;

/**
 * Three states, not two. `system` is the default and is the only one that
 * follows the OS — an explicit light or dark choice stays put even when the OS
 * flips at sunset.
 *
 * The initial value is read from the <html> element rather than from storage,
 * because the inline boot script in index.html has already resolved it there
 * before first paint. That keeps this hook from being the thing that decides
 * the ground, which is what would cause a flash.
 */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(
    () => (document.documentElement.dataset.themeChoice as ThemeChoice) ?? 'system',
  );

  const apply = useCallback((next: ThemeChoice) => {
    setChoice(next);
    document.documentElement.dataset.theme = resolve(next);
    document.documentElement.dataset.themeChoice = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice just won't survive the session */
    }
  }, []);

  useEffect(() => {
    if (choice !== 'system') return;
    const mq = media();
    const onChange = () => {
      document.documentElement.dataset.theme = mq.matches ? 'light' : 'dark';
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [choice]);

  return { choice, setTheme: apply };
}
