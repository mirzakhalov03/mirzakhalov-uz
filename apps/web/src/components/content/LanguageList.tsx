import { Data } from '../../primitives/Data.js';
import type { Language } from '../../content/types.js';

const SCALE = 5;

/**
 * One block per language rather than a three-column table: in a narrow plate
 * the table squeezed name, level and note into one cramped row. Here the name
 * and level share a line, and the bar underneath carries the comparison — the
 * eye reads three bars faster than three phrases. Segmented, not a smooth
 * fill, so it reads as a stated level on a scale and not as a percentage.
 */
export function LanguageList({ languages }: { languages: Language[] }) {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="Languages and proficiency">
      {languages.map((language) => (
        <li key={language.name} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
            <span className="t-h4 text-fg">{language.name}</span>
            <span className="flex items-baseline gap-1.5">
              {language.note ? <Data tone="measured">{language.note}</Data> : null}
              <Data tone="fg">{language.level}</Data>
            </span>
          </div>

          <div
            role="img"
            aria-label={`${language.level}, ${language.score} of ${SCALE}`}
            className="flex gap-0.5"
          >
            {Array.from({ length: SCALE }, (_, i) => (
              <span
                key={i}
                className={`h-0.5 flex-1 ${i < language.score ? 'bg-accent-text' : 'bg-line'}`}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
