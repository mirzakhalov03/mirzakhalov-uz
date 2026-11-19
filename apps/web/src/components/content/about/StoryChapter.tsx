import { AboutChapter } from './AboutChapter.js';
import { Data } from '../../../primitives/Data.js';
import { Plate } from '../../../primitives/Plate.js';
import { LanguageList } from '../LanguageList.js';
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
      {/* Both boxes are direct grid children with the default stretch, so on
          desktop they always share a height whichever one has more in it. */}
      <div className="grid gap-3 lg:grid-cols-[3fr_2fr]">
        <Prose className="border border-line p-3 lg:p-4">
          {profile.bio.en.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </Prose>

        {/* Boxed for the same reason the prose is: on the void band an
            unframed block is the least readable thing in the section, and a
            bone plate is the one attribute that fixes it. */}
        <Plate surface="bone" className="p-3">
          <Data tone="accent">Languages</Data>
          <div className="mt-2.5">
            <LanguageList languages={languages} />
          </div>
        </Plate>
      </div>
    </AboutChapter>
  );
}
