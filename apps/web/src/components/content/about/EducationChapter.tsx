import { Fragment } from 'react';
import { AboutChapter } from './AboutChapter.js';
import { Data } from '../../../primitives/Data.js';
import { InkRule } from '../../ui/InkRule.js';
import { Plate } from '../../../primitives/Plate.js';
import { formatPartialDate } from '../../../lib/date-label.js';
import { certificates, education } from '../../../content/profile.js';
import type { Certificate, EducationEntry } from '../../../content/types.js';

/** 'Sep 2024 — Jan 2028', or a single date when `from` and `to` match. Shares
 *  `formatPartialDate` with the timeline so both chapters render one date
 *  format instead of two. */
function span(entry: EducationEntry): string {
  const to = entry.to ?? 'present';
  if (entry.from === to) return formatPartialDate(entry.from);
  return `${formatPartialDate(entry.from)} — ${to === 'present' ? to : formatPartialDate(to)}`;
}

/** Undrawn corner marks so an empty slot still reads as a frame waiting for a
 *  photo, not a broken image. */
function PlaceholderGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="8.5" cy="8.5" r="1.4" />
      <path d="M21 15l-5-5-10 10" />
    </svg>
  );
}

function EducationImage({ image }: { image?: EducationEntry['image'] }) {
  if (image) {
    return (
      <img
        src={image.url}
        alt={image.alt}
        className="h-18 w-full rounded-frame border border-line object-contain"
      />
    );
  }

  return (
    <div className="flex h-14 w-full flex-col items-center justify-center gap-1.5 rounded-frame border border-dashed border-line-strong bg-raised text-fg-subtle">
      <PlaceholderGlyph />
      <Data>Image placeholder</Data>
    </div>
  );
}

function EducationCard({ entry }: { entry: EducationEntry }) {
  return (
    <Plate surface="bone" className="flex h-full flex-col gap-2 p-2">
      <EducationImage image={entry.image} />
      <div className="flex flex-col gap-0.5 px-1 pb-1">
        <h4 className="t-h4 text-fg">{entry.org}</h4>
        {entry.qualification ? <Data tone="accent">{entry.qualification}</Data> : null}
        <Data>{span(entry)}</Data>
      </div>
    </Plate>
  );
}

function ExternalArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="11"
      height="11"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

/** The inner box a `Frame` holds: a real photo once `certificate.image` is
 *  set, a drawn placeholder until then. Always fills its `Frame` exactly. */
function CertificateImage({ image }: { image?: Certificate['image'] }) {
  if (image) {
    return (
      <img
        src={image.url}
        alt={image.alt}
        className="h-full w-full rounded-frame border border-line bg-raised object-contain"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-frame border border-dashed border-line-strong bg-raised text-fg-subtle">
      <PlaceholderGlyph />
      <Data>Image placeholder</Data>
    </div>
  );
}

function CertificateIssuer({ certificate }: { certificate: Certificate }) {
  if (!certificate.issuer) return null;

  const label = (
    <>
      Issued by {certificate.issuer}
      {certificate.url ? <ExternalArrow /> : null}
    </>
  );

  if (!certificate.url) {
    return <Data tone="accent">{label}</Data>;
  }

  return (
    <Data
      as="a"
      href={certificate.url}
      target="_blank"
      rel="noreferrer"
      tone="accent"
      className="inline-flex w-fit items-center gap-1 hover:underline"
    >
      {label}
    </Data>
  );
}

/**
 * A certificate without a score: an image, a name, who issued it. `compact`
 * lays the image beside the text — at every width, because the card owns a
 * half row above `sm:` and the whole row below it, so the flex row gets
 * roughly the same inner width either way. It must not stack: the card's
 * height is fixed by its container, and a column in a fixed box overflows.
 * Without `compact` the image fills the card's own column and the text sits
 * under it.
 */
function CertificateFeature({
  certificate,
  compact = true,
}: {
  certificate: Certificate;
  compact?: boolean;
}) {
  return (
    <Plate
      surface="bone"
      className={
        compact
          ? 'flex h-full flex-row items-stretch gap-3 p-1'
          : 'flex h-full flex-col gap-3 p-1'
      }
    >
      <CertificateImage image={certificate.image} />
      <div className={compact ? 'flex flex-col justify-center gap-1' : 'flex flex-col gap-1'}>
        <h5 className="t-h4 text-fg">{certificate.name}</h5>
        <CertificateIssuer certificate={certificate} />
      </div>
    </Plate>
  );
}

/**
 * A certificate without a score or an issuer worth naming: an image and a
 * name, nothing else — the badge slot beside the stat tiles' own column.
 */
function CertificateBadge({ certificate }: { certificate: Certificate }) {
  return (
    <Plate surface="bone" className="flex h-full flex-col items-center gap-1 p-1 text-center">
        <CertificateImage image={certificate.image} />
      <h5 className="t-h4 text-fg">{certificate.name}</h5>
      {certificate.detail ? <Data tone="muted">{certificate.detail}</Data> : null}
    </Plate>
  );
}

function CertificateStat({ certificate }: { certificate: Certificate }) {
  return (
    <Plate surface="bone" className="flex h-full flex-col justify-between p-2">
      <div className="flex flex-col gap-1">
        <span className="text-5xl font-medium tracking-tight text-fg">
          {certificate.score?.display}
        </span>
      </div>

      <div>
        <h5 className="t-h5 text-fg">{certificate.name}</h5>
        <CertificateIssuer certificate={certificate} />
      </div>
    </Plate>
  );
}

export function EducationChapter() {
  const measured = certificates.filter((certificate) => certificate.score);

  const [leadFeature, ...restFeatures] = certificates.filter((certificate) => !certificate.score);
  /* Worth naming who issued it earns the wider card; a bare name is a badge. */
  const badges = restFeatures.filter((certificate) => !certificate.issuer);

  return (
    <AboutChapter id="about-education" title="Education">
      <div className="flex flex-col gap-3 sm:hidden">
        {education.map((entry) => (
          <EducationCard key={entry.org} entry={entry} />
        ))}
      </div>

      <div className="hidden items-start sm:flex">
        {education.map((entry, index) => (
          <Fragment key={entry.org}>
            {index > 0 ? (
              <span
                className="mx-0 mt-[73px] flex-none w-4 border-t-2 border-dashed border-line-strong lg:mx-0 lg:w-8"
                aria-hidden="true"
              />
            ) : null}
            <div className="flex-1 h-37.5">
              <EducationCard entry={entry} />
            </div>
          </Fragment>
        ))}
      </div>

      <div className="mt-6 lg:mt-8">
        <div className="flex items-center gap-2">
          <Data as="h4" tone="accent" className="shrink-0">
            Certificates
          </Data>
          <InkRule seed={5} className="text-line" />
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {/* One row of two halves once there is room; below `sm:` the feature
              takes the full width and the badges drop under it, still sharing
              their row. Stacking the badges too would push the stat tiles a
              screen down for no gain — two badges fit a phone side by side. */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-31.25 w-full sm:w-1/2">
              {leadFeature ? <CertificateFeature certificate={leadFeature} compact /> : null}
            </div>

            <div className="h-31.25 w-full sm:w-1/2">
              {badges.length ? (
                <div className="grid h-full grid-cols-2 gap-3">
                  {badges.map((certificate) => (
                    <CertificateBadge key={certificate.name} certificate={certificate} />
                  ))}
                </div>
              ) : (
                <div />
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {measured.length ? (
              <div className="grid h-20 grid-cols-2 gap-2">
                {measured.map((certificate) => (
                  <CertificateStat key={certificate.name} certificate={certificate} />
                ))}
              </div>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </AboutChapter>
  );
}
