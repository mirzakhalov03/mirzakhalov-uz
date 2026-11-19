import { useState } from 'react';
import { AboutChapter } from './AboutChapter.js';
import { Button } from '../../ui/Button.js';
import { InkRule } from '../../ui/InkRule.js';
import { StackComb, StackCombHeader } from '../StackComb.js';
import { TimelineEntry } from './TimelineEntry.js';
import { experience, stack } from '../../../content/profile.js';

/** How many jobs show before the reader has to ask for more — enough to fill
 *  a typical viewport without scrolling, so the section doesn't open on a
 *  wall of history. */
const VISIBLE_COUNT = 4;

/**
 * The timeline, then the tools.
 *
 * The stack comb used to trail the whole About section. It closes Experience
 * instead: a list of tools is what the work is made of, so it belongs to the
 * work chapter rather than to the person.
 */
export function ExperienceChapter() {
  const [expanded, setExpanded] = useState(false);
  const visible = experience.slice(0, VISIBLE_COUNT);
  const hidden = experience.slice(VISIBLE_COUNT);

  return (
    <AboutChapter id="about-experience" title="Experience">
      {/* One grid, one spine: the collapsed jobs are a spanning row inside
          this same `.timeline`, not a second timeline glued on after it — so
          the dashed line drawn by `.timeline__spine` (sized to this
          container's real height) keeps running through the toggle row and
          grows and shrinks with the panel underneath it, instead of stopping
          dead at the fourth card. */}
      <div className="timeline">
        <InkRule seed={7} orientation="vertical" className="timeline__spine" />

        {visible.map((entry, index) => (
          <TimelineEntry
            key={`${entry.org}-${entry.from}`}
            entry={entry}
            side={index % 2 === 0 ? 'left' : 'right'}
            index={index}
          />
        ))}

        {hidden.length ? (
          <>
            <div className="timeline__more" style={{ gridRow: VISIBLE_COUNT + 1 }}>
              <Button variant="ghost" onClick={() => setExpanded((value) => !value)}>
                {expanded ? 'Show less' : 'Load more'}
              </Button>
            </div>

            <div
              className="timeline__collapse"
              data-expanded={expanded || undefined}
              style={{ gridRow: VISIBLE_COUNT + 2 }}
            >
              <div className="timeline__collapse-inner">
                <div className="timeline">
                  {hidden.map((entry, index) => (
                    <TimelineEntry
                      key={`${entry.org}-${entry.from}`}
                      entry={entry}
                      side={(VISIBLE_COUNT + index) % 2 === 0 ? 'left' : 'right'}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-8 border-t border-line pt-5 lg:mt-10 lg:pt-6">
        <StackCombHeader items={stack} />
        {/* A container so the comb can size its cells off this width (substrate.css).
            pb-20 (160px) is runway after the last row, so the comb holds the
            screen a beat before the next section slides over it. */}
        <div className="@container mt-6 pb-20 lg:mt-8">
          <StackComb items={stack} />
        </div>
      </div>
    </AboutChapter>
  );
}
