import { useEffect, useRef, useState } from 'react';
import { socials } from '../../content/profile.js';
import { Button } from '../ui/Button.js';
import { SocialIcon } from '../ui/SocialIcon.js';

/**
 * The way out of the Projects section, sitting still under the moving row —
 * and the section's floor: its wrapper's bottom padding is how far the next
 * sheet lands below the button.
 *
 * When the reader reaches that floor (the last scroll before the next section
 * arrives), the button calls out: it fills with the accent, grows a little,
 * gives a small wiggle and sends out a ring — "here I am", the last thing on
 * offer before the page moves on. Like `Reveal`, this is an exception to §2
 * principle 4 (nothing animates because it scrolled into view), made on
 * purpose for one element. Unlike `Reveal` it re-arms: scroll back up and it
 * settles, come back down and it calls again.
 *
 * The trigger is a sentinel at the very bottom of the floor, so it fires when
 * the section's end is near — `CALL_LEAD_PX` before its last pixel reaches
 * the screen, a few wheel steps early — rather than on the very last scroll.
 * The motion lives in `.github-exit` (substrate.css), which is also where
 * reduced motion keeps the colour change and drops the movement.
 *
 * Pill-shaped like the folders' own buttons, so it reads as part of that
 * family. The address comes from `socials`, so the profile's GitHub link is
 * written down in exactly one place.
 */
/**
 * How far ahead of the section's floor the call starts — about three wheel
 * steps. At this lead the button is still ~80px below the fold when the call
 * starts and rises into view within one more step, while its rings (~2.6s)
 * are still going. Much larger and the wiggle would play out unseen.
 */
const CALL_LEAD_PX = 240;

export function MoreOnGitHub() {
  const github = socials.find((s) => s.label === 'GitHub');
  const sentinel = useRef<HTMLSpanElement>(null);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setCalling(entry.isIntersecting);
      },
      /* Grow the viewport downward, so the call starts a few scrolls before
         the floor arrives rather than on the very last one. */
      { rootMargin: `0px 0px ${CALL_LEAD_PX}px 0px` },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!github) return null;

  return (
    <div className="github-exit relative flex justify-center px-3 pt-2 pb-20" data-call={calling || undefined}>
      <Button
        as="a"
        href={github.url}
        target="_blank"
        rel="noopener noreferrer"
        variant="ghost"
        className="github-exit__btn relative rounded-pill"
      >
        <SocialIcon label="GitHub" className="size-2" />
        More on GitHub ↗
      </Button>

      <span ref={sentinel} className="absolute inset-x-0 bottom-0 h-px" aria-hidden="true" />
    </div>
  );
}
