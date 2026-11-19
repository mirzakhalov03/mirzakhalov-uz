import { AboutChapter } from './AboutChapter.js';
import { Chip } from '../../ui/Chip.js';
import { Data } from '../../../primitives/Data.js';
import { Plate } from '../../../primitives/Plate.js';
import { LanguageTable } from '../LanguageTable.js';
import { Prose } from '../../../primitives/Prose.js';
import { languages, profile } from '../../../content/profile.js';

/**
 * The one chapter that is mostly words, so it keeps the bone reading island
 * inside the void band (§2 principle 7): several hundred words on near-black is
 * worse, not braver.
 *
 * Human languages live here rather than under Education — they are part of who
 * someone is, not a qualification they were awarded.
 */
export function StoryChapter() {
  return (
    <AboutChapter id="about-story" title="Story">
      <div className="grid gap-5 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-8">
        <Prose className="border border-line p-3 lg:p-4">
          {profile.bio.en.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </Prose>

        {/* Both blocks are boxed for the same reason the prose is: on the void
            band an unframed block of body copy is the least readable thing in
            the section, and a bone plate is the one attribute that fixes it. */}
        <div className="flex flex-col gap-3">
          <Plate surface="bone" className="p-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <Data tone="accent">Now</Data>
              <Chip tone="live">Since {profile.now.updatedAt}</Chip>
            </div>
            <p className="prose-measure mt-2 text-body text-fg-muted">{profile.now.text}</p>
          </Plate>

          <Plate surface="bone" className="p-3">
            <Data tone="accent">Languages</Data>
            <div className="mt-2">
              <LanguageTable languages={languages} />
            </div>
          </Plate>
        </div>
      </div>
    </AboutChapter>
  );
}
