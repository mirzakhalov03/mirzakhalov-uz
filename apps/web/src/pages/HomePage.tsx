import { Suspense, lazy } from 'react';
import { Link } from 'react-router';
import { Data, Page, Prose, Section } from '../primitives/index.js';
import { Button } from '../components/ui/Button.js';
import { Footer } from '../components/chrome/Footer.js';
import { DimensionRow } from '../components/content/DimensionRow.js';
import { LanguageTable } from '../components/content/LanguageTable.js';
import { NoteRow } from '../components/content/NoteRow.js';
import { Portrait } from '../components/content/Portrait.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { StackComb, StackCombHeader } from '../components/content/StackComb.js';
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

export function HomePage() {
  const [lead, ...rest] = featuredProjects;

  return (
    <Page stacked>
      {/* ── 00 · Hero ───────────────────────────────────────────────────────
          Identity, one real sentence, and the thesis — who, what, where, in
          about three seconds. */}
      {/* The padding is deliberately lopsided. The panel centres its content, and
          dead centre reads low on a hero — the eye takes the top of the figure
          as the start of the page — so the block is lifted above the middle by
          half the difference between the two paddings. */}
      <section className="grid items-center gap-6 pt-3 pb-10 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pt-8 lg:pb-12">
        {/* On phones the figure sits above the name; on desktop it sits beside it. */}
        {/* The figure is capped against the height left over, not just the width.
            A panel only holds still under the next one if it fits the screen —
            taller than the viewport and useStack has to let it scroll to reach
            its own last line, which reads as the hero sliding away rather than
            being landed on. Everything else in the hero is fixed at ~27rem
            (bar, paddings, gap, the name block), so that is what the portrait
            has to share the screen with. Binds only on short viewports: a phone
            at 844 allows 412px and the two-thirds width asks for 228. */}
        <div className="order-1 mx-auto w-2/3 max-w-[clamp(7rem,calc(100svh-27rem),20rem)] lg:order-2 lg:w-full lg:max-w-none">
          <Portrait />
        </div>

        <div className="signature-column order-2 lg:order-1">
          <Data tone="accent">00 — {profile.role}</Data>

          {/* Two faces, one heading. The given name is drawn by hand; the
              surname keeps the condensed grotesque the rest of the page is set
              in. Both spans are blocks, so each line box is governed by its own
              treatment rather than by whichever of the two is taller. */}
          <h1 className="mt-1 text-fg">
            <span className="t-signature">Javohirbek</span>
            <span className="t-hero block text-accent-text">Mirzakhalov</span>
          </h1>

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

      {/* ── 01 · About ──────────────────────────────────────────────────────
          The face and the name, then the person behind them. It lands directly
          on the hero, and it is the one section that turns the ground over: the
          sheet is bone the whole way down, so the band is what marks the person
          out from the work that follows. The bio keeps its bone plate inside it
          — several hundred words on near-black is worse, not braver (§2
          principle 7) — which lands the reading island the composition is built
          around. */}
      <Section id="about" index="01" title="About" surface="void">
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

        {/* The stack is a different kind of claim from the bio — a list of
            tools, not a story — so it takes its own division inside the band
            rather than trailing off the end of the paragraph: a rule at the
            strong weight, a title line of its own, and the comb on its own air
            below it. */}
        <div className="mt-8 border-t border-line-strong pt-5 lg:mt-10 lg:pt-6">
          <StackCombHeader items={stack} />
          <div className="mt-6 lg:mt-8">
            <StackComb items={stack} />
          </div>
        </div>
      </Section>

      {/* ── 02 · Projects ───────────────────────────────────────────────────
          The proof. The reader has just met the person; this is the turn to
          what they have built, and the page's one real change of subject. */}
      <Section
        id="projects"
        index="02"
        title="Projects"
        lede="Five that are running in production — an AI quiz platform, a Telegram agent, a URL shortener, a clinic booking system, and a storefront."
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

      {/* ── 03 · Media ──────────────────────────────────────────────────────
          Talks, interviews and anything written about the work rather than by
          it. Its own panel: it is a change of voice — other people's — and a
          change of voice is what earns a sheet.

          Empty for now, and it says so. An empty state that admits what it is
          costs one line; a section quietly missing from the nav costs the
          reader the belief that the nav is complete. */}
      <Section
        id="media"
        index="03"
        title="Media"
        lede="Talks, interviews, and work that other people have written about."
      >
        <div className="border border-line p-5 lg:p-6">
          <Data tone="accent">Being assembled</Data>
          <p className="prose-measure mt-2 text-lede text-fg-muted">
            Nothing here yet. It goes up as it happens.
          </p>
        </div>
      </Section>

      {/* ── 04 · Blog + 05 · Laugh challenge ────────────────────────────────
          Depth and voice — the reason to come back — and then the wink.

          One panel holding two sheets. A panel is a screen, and 05 is a joke:
          it shouldn't own a viewport, which in a stack is the whole of what
          being a panel means. They share a screen instead, each keeping its own
          index in the rail, and the hairline between them does the separating. */}
      <div>
        <Section
          id="blog"
          index="04"
          title="Blog"
          lede="Notes on building things, teaching, and writing Uzbek properly. In two languages."
          aside={<Data>{notes.length} notes</Data>}
        >
          <div className="border-y border-line">
            {notes.map((note) => (
              <NoteRow key={note.slug} note={note} />
            ))}
          </div>
        </Section>

        <section className="border-t border-line py-6">
          <div className="lg:grid lg:grid-cols-[88px_1fr] lg:gap-6">
            <Data tone="accent" aria-hidden="true">
              05
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
      </div>

      {/* ── 06 · Contact, and the tail ──────────────────────────────────────
          Where someone convinced by 00–05 arrives ready.

          The footer rides inside this panel rather than following it as one of
          its own. Nothing should land on top of the title block — an overlay is
          an arrival, and the footer is not arriving, it is what is left when the
          argument has finished. Held here it is simply below Contact on the same
          sheet: the panel outgrows the screen, so useStack lets it scroll up
          until its last line rests on the viewport floor, and the reader reaches
          the footer the ordinary way. */}
      <div>
        <Section
          id="contact"
          index="06"
          title="Get in touch"
          lede="Open to frontend work. Tell me what you are building."
        >
          <Suspense fallback={<Skeleton lines={5} />}>
            <ContactSection />
          </Suspense>
        </Section>

        <Footer />
      </div>
    </Page>
  );
}
