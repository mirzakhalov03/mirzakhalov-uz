import { Suspense, lazy } from 'react';
import { Link } from 'react-router';
import { Data, Page, Section } from '../primitives/index.js';
import { Button } from '../components/ui/Button.js';
import { Footer } from '../components/chrome/Footer.js';
import { AboutSection } from '../components/content/about/AboutSection.js';
import { NoteRow } from '../components/content/NoteRow.js';
import { Portrait } from '../components/content/Portrait.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { ProjectCard } from '../components/content/ProjectCard.js';
import { MoreOnGitHub } from '../components/content/MoreOnGitHub.js';
import { MediaMentionCard } from '../components/content/MediaMentionCard.js';
import { PortraitGrid } from '../components/content/PortraitGrid.js';
import { featuredProjects, projects } from '../content/projects.js';
import { notes, profile } from '../content/profile.js';
import { mediaMentions, portraits } from '../content/media.js';

/**
 * The contact form is the only thing on the page that imports Zod, and it sits
 * at the very bottom. Splitting it keeps the validation library out of the
 * initial bundle and holds the home page inside its performance budget (§8.7).
 */
const ContactSection = lazy(() =>
  import('../components/content/ContactSection.js').then((m) => ({ default: m.ContactSection })),
);

export function HomePage() {
  return (
    <>
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
          out from the work that follows.

          Three chapters stacked down one column, with a rail beside them that
          follows the reader rather than driving the page. Nothing here
          intercepts the scroll: the panel is simply tall, so useStack pins it
          at `viewport - height` and it scrolls until its last line rests on the
          floor, exactly like every other long panel in the stack. The rail is a
          scroll-spy and the chapters are ordinary blocks — see AboutSection. */}
        <Section id="about" index="01" title="About" surface="void" stickyHead>
          <AboutSection />
        </Section>

        {/* ── 02 · Projects ───────────────────────────────────────────────────
          The proof. The reader has just met the person; this is the turn to
          what they have built, and the page's one real change of subject.

          Five equal cards and a sixth cell out to GitHub, three per row on
          desktop so the six cells resolve into two even rows with nothing
          left ragged. There is no lead plate any more: a lead says "this one
          first", and these five are not ranked — they are one argument, and
          an unequal grid invited the reader to read four of them as
          also-rans.

          The cards carry their own void ground on the bone sheet (ProjectCard),
          so the showcase is the section's contribution rather than the sheet's.
          That is also why the GitHub cell stays bone: same frame, same cell,
          opposite ground, so it cannot be misread as a sixth project.

          Two asides would be one too many, so the index link stays where it is
          and the exit to GitHub lives in the grid. They answer different
          questions — everything built, versus everything pushed. */}
        <Section
          id="projects"
          index="02"
          title="Projects"
          lede="Five running in production — an AI quiz platform, two clinics that take their own bookings, a Telegram agent, and a URL shortener."
          aside={
            <Link to="/work" className="group">
              <Data tone="accent">Index — {projects.length} projects →</Data>
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
            <MoreOnGitHub />
          </div>
        </Section>

        {/* ── 03 · Media ──────────────────────────────────────────────────────
          Talks, interviews and anything written about the work rather than by
          it, beside a running set of photos. Its own panel: it is a change of
          voice — other people's — and a change of voice is what earns a sheet.

          Two halves that answer different questions: the left column links
          out to coverage (MediaMentionCard), the right is a Google-Photos-
          style grid that expands on click (PortraitGrid, ImageLightbox).
          Mock content throughout (content/media.ts) — thumbnails and photos
          render the shared placeholder until real ones exist to publish. */}
        <Section
          id="media"
          index="03"
          title="Media"
          lede="Highlights of media, and photos along the way."
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
            <div className="flex flex-col gap-2">
              {mediaMentions.map((mention) => (
                <MediaMentionCard key={mention.slug} mention={mention} />
              ))}
            </div>

            <PortraitGrid photos={portraits} />
          </div>
        </Section>
      </Page>

      {/* ── Below Media: out of the stack ─────────────────────────────────────
        00–03 are the pitch and pile up like sheets on a desk (§4.2) so the
        reader feels each one land before the next arrives. Everything past
        Media is material the reader dips into rather than the argument
        itself, so it drops out of the stack here — an ordinary page under
        its own scroll, nothing pinned and nothing piling on top of Media. */}
      <Page>
        {/* ── 04 · Blog ────────────────────────────────────────────────────
            Depth and voice — the reason to come back. */}
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

        {/* ── 06 · Contact, and the tail ──────────────────────────────────────
          Where someone convinced by 00–05 arrives ready. The footer sits
          directly beneath it in the same flow — nothing pinned, nothing
          arriving on top of it, just what's left once the argument is
          finished. */}
        <Section
          id="contact"
          index="06"
          title="Get in touch"
          lede="Open to software work. Tell me what you are building."
        >
          <Suspense fallback={<Skeleton lines={5} />}>
            <ContactSection />
          </Suspense>
        </Section>

        <Footer />
      </Page>
    </>
  );
}
