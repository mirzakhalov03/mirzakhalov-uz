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
 * The lead certificate: an image, a name, who issued it. It spans two grid
 * columns at every width. On a phone those two columns are the whole screen,
 * so the image sits on top at a capped size and the text runs under it at
 * full width; from `sm:` it has a half row, and the image moves beside the
 * text. No fixed height either way — the grid row stretches it to match its
 * neighbours, so nothing has to be tuned to stop text spilling out.
 */
function CertificateFeature({ certificate }: { certificate: Certificate }) {
  return (
    <Plate surface="bone" className="flex flex-col gap-2 p-1 sm:flex-row sm:items-center sm:gap-3">
      <div className="mx-auto aspect-square w-full max-w-[12rem] shrink-0 sm:mx-0 sm:w-[45%] sm:max-w-none">
        <CertificateImage image={certificate.image} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-1 pb-1 sm:p-0 sm:pr-2">
        <h5 className="t-h4 text-fg">{certificate.name}</h5>
        <CertificateIssuer certificate={certificate} />
      </div>
    </Plate>
  );
}

/**
 * One grid cell: the certificate's image at a fixed 4:3 frame (contained, so a
 * landscape certificate and a square badge both show whole), the name under
 * it. The frame is what keeps a row of these even when the names wrap to
 * different lengths.
 */
function CertificateBadge({ certificate }: { certificate: Certificate }) {
  return (
    <Plate surface="bone" className="flex flex-col gap-1.5 p-1">
      <div className="aspect-[4/3] w-full">
        <CertificateImage image={certificate.image} />
      </div>
      <div className="flex flex-col items-center gap-0.5 px-1 pb-1 text-center">
        <h5 className="t-h4 text-fg">{certificate.name}</h5>
        <CertificateIssuer certificate={certificate} />
        {certificate.detail ? <Data tone="muted">{certificate.detail}</Data> : null}
      </div>
    </Plate>
  );
}

function CertificateStat({ certificate }: { certificate: Certificate }) {
  return (
    <Plate surface="bone" className="flex flex-col justify-between gap-3 p-2">
      <span className="text-5xl font-medium tracking-tight text-fg">
        {certificate.score?.display}
      </span>

      <div>
        <h5 className="t-h5 text-fg">{certificate.name}</h5>
        <CertificateIssuer certificate={certificate} />
      </div>
    </Plate>
  );
}

/**
 * Every certificate on one grid — two columns on a phone, four from `sm:` —
 * instead of hand-sized flex rows. The lead spans two columns; the rest take
 * one each and flow after it, so with the current five the desktop reads
 * lead + two badges on the first row and the two scores under the lead, and a
 * phone reads lead, then badges in a pair, then scores in a pair. One gap
 * throughout, and rows stretch their cells, so the cards in a row always
 * share a height.
 */
function CertificateGrid() {
  const [lead, ...rest] = certificates.filter((certificate) => !certificate.score);
  const measured = certificates.filter((certificate) => certificate.score);

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {lead ? (
        <div className="col-span-2 grid">
          <CertificateFeature certificate={lead} />
        </div>
      ) : null}
      {rest.map((certificate) => (
        <CertificateBadge key={certificate.name} certificate={certificate} />
      ))}
      {measured.map((certificate) => (
        <CertificateStat key={certificate.name} certificate={certificate} />
      ))}
    </div>
  );
}

export function EducationChapter() {
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

        <CertificateGrid />
      </div>
    </AboutChapter>
  );
}
