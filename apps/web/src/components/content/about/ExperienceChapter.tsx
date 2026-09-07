import { AboutChapter } from './AboutChapter.js';
import { InkRule } from '../../ui/InkRule.js';
import { StackComb, StackCombHeader } from '../StackComb.js';
import { TimelineEntry } from './TimelineEntry.js';
import { experience, stack } from '../../../content/profile.js';

/**
 * The timeline, then the tools.
 *
 * The stack comb used to trail the whole About section. It closes Experience
 * instead: a list of tools is what the work is made of, so it belongs to the
 * work chapter rather than to the person.
 */
export function ExperienceChapter() {
  return (
    <AboutChapter id="about-experience" title="Experience" seed={3}>
      <div className="timeline">
        <InkRule seed={7} orientation="vertical" className="timeline__spine" />

        {experience.map((entry, index) => (
          <TimelineEntry
            key={`${entry.org}-${entry.from}`}
            entry={entry}
            side={index % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-5 lg:mt-10 lg:pt-6">
        <StackCombHeader items={stack} />
        <div className="mt-6 lg:mt-8">
          <StackComb items={stack} />
        </div>
      </div>
    </AboutChapter>
  );
}
