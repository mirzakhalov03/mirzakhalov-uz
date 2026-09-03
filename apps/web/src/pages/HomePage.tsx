import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Data, Page, Prose, Section } from '../primitives/index.js';
import { Button } from '../components/ui/Button.js';
import { Legend } from '../components/chrome/Legend.js';
import { Footer } from '../components/chrome/Footer.js';
import { DimensionRow } from '../components/content/DimensionRow.js';
import { LanguageTable } from '../components/content/LanguageTable.js';
import { NoteRow } from '../components/content/NoteRow.js';
import { Rosette } from '../components/content/Rosette.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { StackMatrix } from '../components/content/StackMatrix.js';
import { WorkPlate } from '../components/content/WorkPlate.js';
import { featuredProjects, projects } from '../content/projects.js';
import { languages, notes, profile, scores, stack } from '../content/profile.js';

/**
 * The contact form is the only thing on the page that imports Zod, and it sits
 * at the very bottom. Splitting it keeps the validation library out of the
 * initial bundle and holds the home page inside its performance budget (§8.7).
 */
const ContactSection = lazy(() =>
  import('../components/content/ContactSection.js').then((m) => ({ default: m.ContactSection })),
);

/** Tashkent time, to the minute. A second hand would be motion for its own sake. */
function useLocalTime() {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', {
      timeZone: profile.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());

  const [time, setTime] = useState(format);

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export function HomePage() {
  const time = useLocalTime();
  const [lead, ...rest] = featuredProjects;

  return (
    <Page>
      {/* ── 00 · Hero ───────────────────────────────────────────────────────
          Identity, one real sentence, and the thesis — who, what, where, in
          about three seconds. */}
      <section className="grid items-center gap-6 py-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:py-12">
        {/* On phones the figure sits above the name; on desktop it sits beside it. */}
        <div className="order-1 mx-auto w-2/3 max-w-xs lg:order-2 lg:w-full lg:max-w-none">
          <Rosette />
        </div>

        <div className="order-2 lg:order-1">
          <Data tone="accent">00 — {profile.role}</Data>

          <h1 className="t-hero mt-2 text-fg">
            Javohirbek
            <br />
            <span className="text-accent-text">Mirzakhalov</span>
          </h1>

          <p className="prose-measure mt-4 text-lede text-fg-muted">{profile.lede}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-line py-2">
            <Data>{profile.location}</Data>
            <Data>
              {profile.coords.lat}° N, {profile.coords.lng}° E
            </Data>
            <Data>{profile.utcOffset}</Data>
            <Data tone="live">{time} local</Data>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button as={Link} to="/work">
              See the work
            </Button>
            <Button as="a" href="#contact" variant="ghost">
              Get in touch
            </Button>
          </div>
        </div>
      </section>

      {/* ── 01 · Selected work ──────────────────────────────────────────────
          Proof before biography. A reviewer's first question is "what have you
          built", and they may never scroll past the fold. */}
      <Section
        id="work"
        index="01"
        title="Selected work"
        lede="Three that are running in production, with the live site and the source behind each."
        aside={
          <Link to="/work" className="group">
            <Data tone="accent">Index — {projects.length} projects →</Data>
          </Link>
        }
      >
        <div className="flex flex-col gap-3">
          {lead ? <WorkPlate project={lead} /> : null}
          <div className="grid gap-3 md:grid-cols-2">
            {rest.map((project) => (
              <WorkPlate key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── 02 · About ──────────────────────────────────────────────────────
          Earned now: they have seen the work and want to know who made it. */}
      <Section id="about" index="02" title="About">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-8">
          <Prose className="border border-line p-3 lg:p-4">
            {profile.bio.en.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </Prose>

          <div className="flex flex-col gap-5">
            <div>
              <Data tone="accent">Measured</Data>
              <div className="mt-1 divide-y divide-line">
                {scores.map((score) => (
                  <DimensionRow key={score.label} score={score} />
                ))}
              </div>
            </div>

            <div>
              <Data tone="accent">Languages</Data>
              <div className="mt-2">
                <LanguageTable languages={languages} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Data tone="accent">Stack</Data>
          <div className="mt-2">
            <StackMatrix items={stack} />
          </div>
        </div>
      </Section>

      {/* ── 03 · Writing ────────────────────────────────────────────────────
          Depth and voice — the reason to come back. */}
      <Section
        id="writing"
        index="03"
        title="Writing"
        lede="Notes on building things, teaching, and writing Uzbek properly. In two languages."
        aside={<Data>{notes.length} notes</Data>}
      >
        <div className="border-y border-line">
          {notes.map((note) => (
            <NoteRow key={note.slug} note={note} />
          ))}
        </div>
      </Section>

      {/* ── 04 · Laugh challenge ────────────────────────────────────────────
          A wink, not a chapter. It's a joke; it shouldn't own a viewport. */}
      <section className="border-t border-line py-6">
        <div className="lg:grid lg:grid-cols-[88px_1fr] lg:gap-6">
          <Data tone="accent" aria-hidden="true">
            04
          </Data>
          <p className="text-lede text-fg-muted">
            There is also a{' '}
            <Link to="/laugh" className="text-accent-text underline underline-offset-4">
              joke generator
            </Link>{' '}
            on this site, in three flavours, for no defensible reason.
          </p>
        </div>
      </section>

      {/* ── 05 · Contact ────────────────────────────────────────────────────
          Where someone convinced by 00–04 arrives ready. */}
      <Section
        id="contact"
        index="05"
        title="Get in touch"
        lede="Open to frontend work. Tell me what you are building."
      >
        <Suspense fallback={<Skeleton lines={5} />}>
          <ContactSection />
        </Suspense>
      </Section>

      <Legend />
      <Footer />
    </Page>
  );
}
