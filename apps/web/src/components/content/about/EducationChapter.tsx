import { AboutChapter } from './AboutChapter.js';
import { Data } from '../../../primitives/Data.js';
import { DimensionRow } from '../DimensionRow.js';
import { InkRule } from '../../ui/InkRule.js';
import { Plate } from '../../../primitives/Plate.js';
import { formatPartialDate } from '../../../lib/date-label.js';
import { certificates, education } from '../../../content/profile.js';
import type { EducationEntry } from '../../../content/types.js';

/** 'Sep 2024 — Jan 2028', or a single date when `from` and `to` match. Shares
 *  `formatPartialDate` with the timeline so both chapters render one date
 *  format instead of two. */
function span(entry: EducationEntry): string {
  const to = entry.to ?? 'present';
  if (entry.from === to) return formatPartialDate(entry.from);
  return `${formatPartialDate(entry.from)} — ${to === 'present' ? to : formatPartialDate(to)}`;
}

function EducationCard({ entry }: { entry: EducationEntry }) {
  return (
    <Plate className="flex h-full flex-col gap-1 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="t-h4 text-fg">{entry.org}</h4>
        <Data>{span(entry)}</Data>
      </div>

      {entry.qualification ? <Data tone="accent">{entry.qualification}</Data> : null}
      {entry.detail ? <p className="mt-1 text-body text-fg-muted">{entry.detail}</p> : null}
    </Plate>
  );
}

/**
 * Cards for the institutions, dimension rows for anything with a number.
 *
 * A score card asserts a figure; a dimension row shows it against its scale
 * (§2 principle 8 — a score means more with a date and a scale), so a
 * certificate carrying one is drawn as a measurement and one without is drawn
 * as a card.
 */
export function EducationChapter() {
  const lead = education.find((entry) => entry.lead);
  const rest = education.filter((entry) => !entry.lead);

  const measured = certificates.filter((certificate) => certificate.score);
  const awarded = certificates.filter((certificate) => !certificate.score);

  return (
    <AboutChapter id="about-education" title="Education" seed={2}>
      <div className="flex flex-col gap-3">
        {lead ? <EducationCard entry={lead} /> : null}

        {rest.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {rest.map((entry) => (
              <EducationCard key={entry.org} entry={entry} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 lg:mt-8">
        <div className="flex items-center gap-2">
          <Data as="h4" tone="accent" className="shrink-0">
            Certificates
          </Data>
          <InkRule seed={5} className="text-line" />
        </div>

        <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {measured.map((certificate) =>
            certificate.score ? (
              <DimensionRow
                key={certificate.name}
                label={
                  certificate.issuer
                    ? `${certificate.name} — ${certificate.issuer}`
                    : certificate.name
                }
                score={certificate.score}
              />
            ) : null,
          )}
        </div>

        {awarded.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {awarded.map((certificate) => (
              <Plate key={certificate.name} className="flex flex-col gap-1 p-3">
                <h5 className="t-h4 text-fg">{certificate.name}</h5>
                {certificate.issuer ? <Data>by {certificate.issuer}</Data> : null}
              </Plate>
            ))}
          </div>
        ) : null}
      </div>
    </AboutChapter>
  );
}
