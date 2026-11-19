# Proposed Design — Portfolio Redesign

**System name: “Girih.”** Version 2 — the chosen direction.

Companion to `PORTFOLIO-REFERENCE.md`, which documents the current site. This document is a **proposal for review**, not an implementation. Prototype: [Girih — Direction 02](https://claude.ai/code/artifact/420374ee-67d3-4570-af3d-c0a87fd8125e).

> **Status.** Two directions were prototyped. Direction 01 (“Margin” — warm paper, serif, editorial) was the first proposal; Direction 02 (“Girih”) is the one selected and is what this document now specifies. Direction 01 is preserved in §0 as the documented runner-up. Refinement is expected — treat the numbers here as a solid starting system, not as settled law.

---

## 0. Directions Explored

Five directions were developed far enough to judge, then two were built.

| Direction | The idea | Verdict |
|---|---|---|
| **A. Swiss editorial** | Grotesque, strict grid, hairlines, whitespace | Merged into 01 |
| **B. Terminal / dev-craft** | Mono, keyboard-first, precision, dark | **Merged into 02 ✓** |
| **C. Neo-brutalist** | Hard borders, flat blocks, loud violet | **Merged into 02 ✓** |
| **D. Notebook** | Annotation, marginalia, signature, paper | Merged into 01 |
| **E. Hex-system** | The honeycomb as total structural language | **Merged into 02 ✓** |

**Direction 01 — “Margin” (A + D).** Warm paper, Source Serif, a persistent margin rail carrying metadata. Quiet, editorial, timeless. Built and reviewed. Its weakness in practice: the register was too reserved for the person it represents — refined rather than ambitious.

**Direction 02 — “Girih” (B + C + E).** Selected. Each rejected direction's weakness is cancelled by the other two:

- **B alone** is the most saturated developer-portfolio genre there is. Fixed by **restricting mono to real data only** — coordinates, dates, stack, measurements — never headings, never body. It reads as instrument labelling rather than costume.
- **C alone** is dating fast and reads loud rather than considered. Fixed by taking neo-brutalism's *confidence* (flat plates, hard 1px borders, huge condensed display type) while refusing its tells: no offset drop shadows, no chunky radii, no toy colour.
- **E alone** reads as blockchain or science-lab. Fixed by making the geometry **constructed rather than decorative** — girih is compass-and-straightedge work, so the site shows the construction circles and generating squares, not a pasted hex wallpaper.

**The thesis that ties it together:** Islamic geometric design is not ornament, it is engineering — a figure derived from first principles with a compass and a straightedge. So the site is a **technical plate**. The drafting grid is the literal page substrate. Content sits on plates with registration marks. Data is labelled like an instrument. And the hero draws its own rosette out of its own construction lines.

That reframes the old site's honeycomb from "generic tech hexagon" into something both personal (his heritage, which he already foregrounds) and true (he is an engineer). No other developer portfolio is doing it.

---

## 1. Overall Design Vision

### What it should feel like

**A drawing plate from a workshop that builds real things.** Precise, dark, high-contrast, confident. Engineered rather than decorated. The atmosphere is a drafting table at night: a deep violet-black ground with a faint construction grid, bone-white type, electric violet where something is live or interactive, and brass where something has been measured.

It should read as *specified*, not styled — every plate aligned to the grid, every number labelled, every claim carrying its units.

### What makes it distinctive

1. **The grid is the substrate, not a layout aid.** A 32px construction grid with a 256px major rule is faintly visible on every page. Nothing else does this without looking like a wireframe, and it holds because everything sits exactly on it.
2. **Registration marks instead of elevation.** Plates are marked at their corners the way a print plate is registered. No shadows anywhere except the command palette.
3. **A constructed girih rosette** as the hero — the compass circles and the two overlapping squares that generate the eight-point khatam are visible behind the finished star.
4. **Mono reserved strictly for data.** Coordinates, dates, stacks, scores, measurements. Never a heading, never a paragraph.
5. **Type as structure** — Archivo at weight 800 and width 84, uppercase, very tight tracking. Big, condensed, industrial. The opposite of a neutral delivery vehicle.

### How the original identity survives

| Existing element | Fate | Why |
|---|---|---|
| `#684FFF` violet | **Kept exactly** — and it is far more electric on near-black than it ever was on white | It is the brand. On this ground it finally does what it was always trying to do. |
| Honeycomb / hex pattern | **Kept, promoted** — becomes the girih construction and the page grid | Best asset on the old site. Was 50%-opacity wallpaper; becomes the thesis. |
| Dark "cosmic" pages | **Kept and made the default** | The old projects page was the best-looking thing on the site. Now the whole product lives there instead of one page. |
| Gold achievement rows | **Kept as brass**, now drawn as dimension lines with real scales | The measured-value idea was good; it just needed units and a scale. |
| Signature PNG | **Kept, promoted** to the form's success state | Real, personal, already in the repo. Was decoration; becomes function. |
| Days One | **Kept for the wordmark and numerals only** | Its geometric slab suits numerals, and it suits this bolder direction better than it suited 01. |
| Nunito | Retired | Anonymous. Archivo carries far more personality. |
| Telegram-styled blog panel | **Concept kept, execution retired** | Best content on the site, worst presentation — a screenshot of another product. |
| Starfield `stary-bg.png` | Retired | A non-tiling 640×512 random dot field used with `repeat`; it visibly seams. The construction grid replaces its job properly. |
| Laugh Challenge | **Kept and elevated** | Most memorable thing on the site. Gets real design. |
| Contact card gradients | Retired | Six competing brand gradients — the loudest and least informative block on the old site. |

---

## 2. Design Principles

**1. Constructed, not decorated.**
Every ornament must be derivable. The rosette shows its construction; the grid is real; the dimension lines carry real scales. If a mark cannot explain where it came from, it does not ship.

**2. The grid is law.**
32px module, 256px major. Plates snap to it. Nothing floats between lines. This is what keeps a bold, dark, high-contrast design from reading as chaotic.

**3. One accent, earned.**
Violet marks what is live, current, or interactive. Brass marks what has been measured. Mint marks what is running in production. Nothing is coloured for mood.

**4. Animate transitions, not arrivals — with one deliberate exception.**
Nothing animates because it scrolled into view. The single exception is the **construction drawing itself once on first load**, which is a page-load sequence, not a scroll reveal. Everything else is a 130–180 ms state change the user caused.

**5. Mono means data.**
If it is a measurement, a coordinate, a date, a version, a stack, or a status — mono. Otherwise Archivo. This one rule is what keeps direction B's precision without its cliché.

**6. Sharp, flat, marked.**
Radius 0 everywhere. No shadows except the command palette overlay. Separation comes from a 1px border and a registration mark.

**7. Long-form gets its own surface.**
Reading several hundred words of body copy on near-black is worse, not braver. Case studies and notes sit on a **bone plate** — dark text on warm off-white — inside the dark page. See §3.2.

**8. Every claim links to evidence.**
"Fully functional" means nothing without a demo. A score means more with a date and a scale. This is the redesign's biggest *content* job.

### What we intentionally avoid

- Glassmorphism, frosted cards, glow, aurora blobs, mesh gradients
- Neo-brutalism's tells: offset hard shadows, chunky radii, primary-colour blocks
- The dev-portfolio tells: mono headings, mono body, a fake terminal, an ASCII banner, a typing-effect hero
- Fade-up on scroll, staggered entrances, parallax, count-up numbers
- Hexagons as wallpaper — the geometry must be constructed or it does not appear
- Emoji as UI (emoji stays in his own writing, where it's authentic)
- Neon-on-navy "AI product" chrome. This ground is violet-black and warm-boned, deliberately not `#0A0E27` with cyan.

---

## 3. Visual System

### 3.1 Typography

Two working families plus one heritage face.

| Role | Family | Why |
|---|---|---|
| **Display, headings, body, UI** | **Archivo** (variable: `wdth` 62–125, `wght` 400–800) | A sturdy American-gothic grotesque with a real width axis, so display type can be genuinely condensed without a second font. Full Latin + **Cyrillic** — non-negotiable, he writes in Russian and Uzbek. And it is not Inter. |
| **Data only** | **JetBrains Mono** | Authentic to a developer, has Cyrillic, and distinct enough to read as instrumentation. Restricted by principle 5. |
| **Wordmark + numerals** | **Days One** | Preserved from the current site, subset to the characters actually used. Two or three uses total. |

**Type scale** — bigger contrast between display and body than direction 01, because this design's personality lives in the display:

| Token | Size / line | Family & settings | Use |
|---|---|---|---|
| `hero` | clamp(52, 10.5vw, 116) / .90 | Archivo 800, `wdth 84`, `-0.045em`, UPPER | The name |
| `h2` | clamp(28, 4.5vw, 44) / 1.02 | Archivo 800, `wdth 88`, `-0.025em`, UPPER | Section titles |
| `h3` | 26 / 1.10 | Archivo 700, `wdth 92`, `-0.02em`, UPPER | Plate titles |
| `h4` | 18 / 26 | Archivo 600, `wdth 100` | Note titles |
| `lede` | 19 / 30 | Archivo 400 | Hero and section ledes |
| `body` | 17 / 28 | Archivo 400 | Default prose |
| `data` | 11 / 16 | JetBrains Mono 500, `+0.09em`, UPPER | All metadata |
| `data-lg` | 13 / 20 | JetBrains Mono 500, `+0.06em` | Buttons, nav |
| `numeral` | 34 / .90 | Days One, tabular | Measured values |

**Rules**
- Prose measure capped at **60–64 characters**. Slightly tighter than direction 01 because the ground is dark, where long lines are harder to track.
- Two weights per family in production. Variable, subset, self-hosted, preloaded.
- `font-variant-numeric: tabular-nums` on every number that sits in a column.
- Uppercase display always carries positive optical correction; never letter-space body copy.

**Uzbek typography — still the most important content detail.**
Uzbek Latin builds `oʻ` and `gʻ` from **U+02BB modifier letter turned comma**, not an apostrophe. The current content uses the correct character 5 times and a straight `'` 65 times, plus one erroneous `ğ` (in `to'ğri`, which should be `toʻgʻri`). To an Uzbek reader that is a typo in most sentences. Normalise the character across all content and verify both faces render U+02BB.

### 3.2 Colour

Three surfaces. Every ratio below is computed, not estimated.

**Ground — `void`, the default**

| Token | Value | Contrast on void | Use |
|---|---|---|---|
| `--void` | `#0C0A14` | — | Page ground. Violet-black, deliberately not navy. |
| `--plate` | `#141126` | — | Raised panels |
| `--plate-2` | `#1B1733` | — | Input wells, hover fills |
| `--bone` | `#EDE7DA` | **15.9:1** | Primary text. Warm, never pure white. |
| `--bone-60` | `#9A9488` | **6.5:1** | Secondary text, data labels |
| `--bone-30` | `rgba(237,231,218,.30)` | — | Disabled, placeholders |
| `--violet` | `#684FFF` | **3.9:1** | *Preserved exactly.* Fills, marks, registration, grid. **Large text and non-text only.** |
| `--violet-hot` | `#8A73FF` | **5.6:1** | Links and small text on dark |
| `--brass` | `#E0B252` | **10.0:1** | Measured values |
| `--mint` | `#5BD6A0` | **10.8:1** | Live / in production |
| `--rose` | `#FF7A7A` | **7.8:1** | Errors |
| `--line` | `rgba(237,231,218,.16)` | — | Plate borders, rules |
| `--grid` / `--grid-major` | violet @ 9% / 17% | — | The construction grid, 32px / 256px |

**Reading surface — `bone`**, for case studies, notes, and print:

| On bone | Value | Contrast | Use |
|---|---|---|---|
| `--void` | `#0C0A14` | **15.9:1** | Body text |
| `--violet-deep` | `#4A32D6` | **6.3:1** | Links and small text |
| `--violet` | `#684FFF` | 4.1:1 | Large text and fills only |
| brass | — | 4.35:1 ✗ | **Fails AA.** On bone, brass is a *rule or mark only*; numerals switch to void. |

> That last row is a real finding from building the prototype: the obvious "deep brass" (`#8A6414`) lands at 4.35:1, just under AA. Rather than invent a fourth brass, the system uses brass as a rule on bone and lets the numeral itself go to void. Fewer tokens, and it passes.

The three surfaces are a **token swap**, not three stylesheets — one `[data-surface]` block each. That is also exactly how a light-mode option would ship later, if ever wanted.

### 3.3 Spacing & grid

**8px base, 32px module, 256px major.**

`--u 8` · `--s2 16` · `--s3 24` · `--s4 32` · `--s5 48` · `--s6 64` · `--s7 96` · `--s8 128`

- Content max width **1280px**, gutters 24px → 48px.
- Section padding `--s6` desktop → `--s5` tablet → `--s4` mobile.
- Every plate edge lands on a 32px line. This is checkable, and worth checking.

### 3.4 Borders, radii, shadows, marks

| Property | Rule |
|---|---|
| **Radius** | `0`. Everywhere. No exceptions. |
| **Border** | `1px solid --line`. Weight never varies; colour does. |
| **Shadow** | **None**, except the command palette overlay (`0 24px 80px rgba(0,0,0,.6)`). |
| **Registration marks** | Every plate carries four violet corner crosses (13px arms) at 40% opacity, rising to 100% on hover or focus. This is the system's separation-and-focus device, replacing both shadow and lift. |

### 3.5 Iconography

- **Minimal.** This system labels with mono text far more than with icons. Where an icon is genuinely needed, one stroke set — **Lucide**, 24px grid, 1.5px, `currentColor`.
- **Tech logos are retired from the UI.** The old tools grid was twelve mismatched raster logos at four different inline sizes. Replaced by the **stack matrix** (§3.6): name plus frequency, with a violet edge marking daily use. Text carries the information better and costs nothing.
- **The rosette is generated, not drawn.** Outer radius `R`, inner radius `r = R·cos45°/cos22.5° = 0.7654R`, 16 alternating points. Computed in code so the geometry is actually correct rather than eyeballed.

### 3.6 Components

**Plate** — the base container. 1px border, `--plate` fill, four registration marks, zero radius, no shadow. Everything on the site is a plate or sits on one.

**Buttons** — mono, uppercase, 46px min height, radius 0.

| Variant | Rest | Hover | Active | Focus |
|---|---|---|---|---|
| **Solid** | Violet fill, bone text | **Inverts** to bone fill / void text | `translate(1px,1px)` | 2px `--violet-hot` ring, 3px offset |
| **Ghost** | Transparent, 1px `--line` | Border and text → `--violet-hot` | `translate(1px,1px)` | as above |

The solid button's full inversion on hover is deliberate — a plate flipping, not a tint shifting.

**Inputs** — visible mono label above, always. `--plate-2` fill, 1px `--line`, border → `--violet-hot` on focus. No glow, no scale. 16px font on mobile to prevent iOS zoom. Errors inline in `--rose`, stating the remedy.

**Work plate** — replaces the old 400×450 card. Screenshot on top (graded `grayscale(.55)`, returning to full colour on hover), title in condensed uppercase, mono stack line, description, then a status chip row with an `Open →` marker that appears on hover.

**Chips** — `Live` (mint), `Client work` (violet), `Case study`, `Source`, `Experiment`, `Archived`. These replace the old `Not for mobile view yet`, which currently appears on eight of ten projects and leads with a deficiency.

**Dimension row** — achievements drawn as measured dimensions rather than trophies: label, brass numeral, and a bar with end-ticks whose width is the value against a stated scale (SAT 1330 on 400–1600; IELTS 8.0 on 0–9.0; GPA 4.0 on 0–4.0). It shows the scale rather than asserting a number, which is both more honest and more interesting.

**Stack matrix** — a hairline grid of name + frequency, with a 2px violet left edge on daily-use items. *Critically, names are always visible* — the current site reveals them only on hover, so on any touch device twelve unlabelled icons appear and nothing identifies them. That is a defect, not a style choice.

**Command palette (⌘K)** — direction B's genuine contribution. Fixed overlay, violet-bordered plate, mono list, arrow keys and Enter, `Esc` closes, focus trapped and returned. Jumps to sections and external links. It is the one component permitted a shadow.

**Data label** — the mono metadata primitive. Used for coordinates, dates, stacks, versions, captions, and the legend.

**Legend / title block** — the palette, type scale and rules presented at the foot of the page as a drawing legend. On a technical plate this is where the title block goes; here it doubles as the living style guide and a piece of portfolio evidence in itself.

**Feedback states**
- **Success:** the signature draws itself (§4.7). No green toast.
- **Error:** inline at the field, `--rose`, with the fix stated.
- **Toast:** reserved for genuinely asynchronous events only. Plate, 4px violet left edge, bottom-left.

**Loading**
- Route change: a 2px violet rule advancing along the top of the viewport.
- Content: **static** skeletons — `--plate-2` blocks with a 1px rule where the baseline will fall. **No shimmer.** A shimmer animates an arrival and violates principle 4.
- Images: explicit dimensions, `--plate-2` placeholder, zero layout shift.

**Empty states** — always offer the next best thing:
- *Writing, before posts exist:* a line in his voice plus the Telegram channel link.
- *Filtered work index, no matches:* names the active filters, one click to clear.
- *Joke page:* the card is never empty — first joke seeded on mount, min-height reserved.

**Ink rule** — the one organic mark in a system that is otherwise flat and
square. A 1px stroke whose wobble is the sum of three sine terms at fixed
frequencies, generated per seed rather than drawn, so it satisfies principle 1:
the mark can say where it came from. Used for chapter headings and the
timeline spine. It is the only exception to §3.4, and it is an exception about
*line quality*, never about radius — every box on the page is still square.

**Chapter rail** — the About section's table of contents. A sticky rail from
`lg`, a sticky horizontal bar below, both plain `position: sticky` nested inside
the About panel so the nav leaves when the section does. Deliberately a `<nav>`
of anchors rather than an ARIA tablist: every chapter stays in the DOM, so
`role="tab"` would misreport two thirds of the section as unavailable.

---

## 4. Page-by-Page

### 4.1 Global chrome

**Sticky top bar**, 56px, `rgba(12,10,20,.88)` with a light blur and a 1px bottom rule. Wordmark left; mono uppercase nav right (`Work · About · Writing · Contact`), each with a violet underline that draws on hover and stays on the current section; `⌘K` button at the far right.

No hamburger at any width. Four short mono items fit as a horizontally scrollable row on mobile — one tap instead of two. The Laugh Challenge lives in the footer, keeping its odd-one-out character without competing with primary nav.

> **Amended 2026-09-14 — a hamburger below `sm`.** The rule above was written
> for a bar carrying four items and a `⌘K` button. It now carries five
> (`About · Projects · Media · Blog · Contact`) and a filled *Say Hi* CTA, and
> the row's `overflow-x-auto` hides its scrollbar — so on a phone `Contact` sits
> past the right edge with nothing on screen admitting it is there. A nav item
> you cannot see is worse than one behind a button, so below 640px the section
> links move into a panel.
>
> **What the original rule was protecting is kept.** The one-tap argument was
> really about the primary action, and *Say Hi* stays in the bar at every width
> — the panel holds sections only. Above 640px nothing changed: the mono row,
> the drawing underline and the current-section state are exactly as specified
> here.
>
> The panel is `<dialog>` + `showModal()`, as the command palette is, so the
> focus trap, the inert background and Esc are the platform's. It is attached to
> the bar rather than floating over the sheet, so it takes **no shadow** — §3.4's
> exemption still belongs to the palette alone. The trigger is three hairlines
> folding into a cross, which keeps §3.5's "no icon set" intact. Rows carry
> their section number from `chrome/nav-items.ts`; note the sheets run 01–06 but
> 05 is the Laugh interstitial and is not a nav target, so Contact is 06.

> **Note on direction 01's margin rail:** dropped. Its wayfinding job is done here by the sticky bar's current-section underline plus the section numbers, and the command palette does the jumping far better. Carrying both would be redundant.

### 4.2 Home

Two structural problems with the current site: **a wall of biography precedes any proof of work**, and **the "Projects" section contains no projects** — just a button to another page.

**① Hero.** Left: `00 — Frontend engineer` in mono, the name at `wdth 84` weight 800 with the surname in violet-hot, a lede that says something real, a mono coordinate strip (Tashkent `41.2995° N, 69.2401° E`, UTC+5, live local time), and two buttons. Right: the rosette.

The current copy is placeholder-grade and should be rewritten. `"Welcome to my world of pixel-perfect creations"` says nothing, and `Aspiring Software Engineer` under-sells someone with a clinic booking system in production:

> **Javohirbek Mirzakhalov**
> Frontend engineer, Tashkent.
> I build interfaces for the web. Most recently a clinic booking system that real patients use every day. Before software I taught English — I still write, in two languages.

> **Motion — the construction.** On first load the girih outline draws itself via `stroke-dashoffset` (~1s), then the star fills to 16% (~0.6s). The construction circles and generating squares are visible at rest, so the plate is never blank or mid-state.
> *Why it earns its place:* it states the thesis without a word of explanation — this is a thing that was **built**, from a figure with rules. It runs once, on one element, transform- and stroke-only, and then never again. That restraint is what makes it read as expensive rather than busy.

**② Selected work** — three plates. The lead one spans full width; two below sit side by side. Real screenshots, real outcomes, chips, and `Index — 10 projects →`.

Moving this above About is the single largest UX improvement in the proposal.

**③ About** — three chapters behind one anchored rail: **Story** (the bio on
its bone island, the current state, languages), **Education** (institution
cards, then certificates — anything carrying a number is drawn as a dimension
row against its scale, not asserted on a card), and **Experience** (an
alternating timeline about an inked spine, closing on the stack comb).

The panel is several viewports tall and every chapter is rendered at all times.
That is what makes it read as one continuous story rather than three pages, and
it is also what keeps the panel's height constant — a tab that showed and hid
content would resize the panel and send `useStack` re-measuring every panel
below it mid-interaction.

**④ Writing** — three most recent notes: mono date, title, one line, language chip.

**⑤ Laugh Challenge** — a one-line aside near the end, not a full band with a blurred emoji photograph. It's a joke; it shouldn't own a viewport.

**⑥ Contact** — form plus channels (§4.7).

**⑦ Legend / title block**, then footer.

### 4.3 Work index — `/work`

- All entries as work plates in a two-column grid, newest first, with mono index numbers.
- **Filters** as mono chips: `All · Client · Product · Experiment · Source available`. Worth building only because there are 10+ items of genuinely different weight — a client clinic system and a tasbeh counter should not compete as equals.
- Retire the internal `88vh` scroll box. The page scrolls; the browser's scrollbar is the scrollbar.
- **The 4 orphaned screenshots** (Calculator, Efood, Medium, Partnero) are a content decision: reinstate as archived entries, or delete the assets. Currently they are neither.

> **Motion — the marks, not the lift.** On hover, a plate's four registration marks go from 40% to full and its screenshot returns from graded to full colour. Nothing moves, scales, or lifts.
> *Why:* in a dense grid, card-lift jitters the layout under a moving cursor and pulls the eye off the content. Marks confirm the target while every plate stays exactly where it was — and the colour return makes the *work itself* the thing that lights up.

### 4.4 Case study — `/work/:slug` *(new)*

Currently every project gets one sentence. For someone whose main goal is being hired, this is the biggest missed opportunity on the site.

Five blocks, deliberately short:
1. **Void-ground hero** — title, year, role, stack in mono, one full-bleed image
2. **The problem** — two or three sentences
3. **What I built** — on a **bone plate**, per principle 7, with images
4. **A decision** — one specific technical or design choice and its reasoning. *This is the section that demonstrates engineering judgement, and almost no junior portfolio has it.*
5. **Outcome + links** — live URL, source, what he'd change now

Three or four deep case studies plus six catalogue entries beats ten shallow ones.

> **Motion — shared-element transition.** Index plate → case study morphs the screenshot into the hero image via the **View Transitions API** (~300ms).
> *Why:* it preserves spatial continuity, so the user understands they drilled *into* the thing they clicked. Six lines of CSS, off the main thread, degrades to an instant cut. Best cost/benefit ratio in the proposal.

### 4.5 About — `/about`

Full story on a bone plate, experience as a dated mono table, education, languages, and the dimension rows.

**It doubles as the résumé.** A `@media print` stylesheet turns `/about` into a clean one-page CV: grid off, surfaces flattened to bone, links footnoted with their URLs, marks removed.

*Why this matters:* it retires the two Google Drive download links, which are unversioned, unstyled and will rot. A URL that is always current beats a file that was current once — and a print stylesheet that genuinely works is itself a portfolio piece for a frontend engineer.

### 4.6 Writing — `/writing`, `/writing/:slug` *(new)*

Replaces the fake Telegram panel embedded in About.

- Index on void: mono date, title, one line, `EN`/`UZ` chip.
- Post on a **bone plate** at a 60-character measure. Long-form reading is the one place this system deliberately stops being dark.
- The Telegram channel stays as a real subscribe link at the end — not as a simulated screenshot of itself.

> **Motion — the language swap.** Toggling EN↔UZ does not crossfade: the container's height springs to the new measure (~220ms) while text swaps at the midpoint.
> *Why:* translations are genuinely different lengths. A crossfade produces a jarring jump; animating the reflow is honest about what is happening and makes the bilingualism feel deliberate rather than like a hidden setting.

### 4.7 Contact

The current section is six cards with six competing brand gradients and blurred halos — the loudest and least informative block on the site.

**Proposed:** two columns. Left, the form: labelled fields and a `Transmit` button. Right, channels as a plain mono list — one weight, one rule, no gradients, because a link to Telegram and a link to GitHub are not different *kinds* of thing.

> **Motion — the signature signs.** On success, his signature draws itself in violet over a faint ghost of itself (`clip-path` wipe, ~800ms) with a mono line: *"Signed & sent — reply incoming."*
> *Why:* it converts a generic system message into a personal one, reuses an asset already in the repo, and metaphor and mechanic agree — signed, then sent. About 2KB for the emotional high point of the site.

**Carried-over fixes:** visible labels (not placeholders), `aria-describedby` on errors, validation on blur. And the Telegram bot token moves server-side — see §8.6. That is why the form must be rebuilt rather than restyled.

### 4.8 Laugh Challenge — `/laugh`

The most distinctive thing on the site and currently the most neglected — Arial, lime-green fallback fills, no relationship to any other page.

**Proposed:** the system's own type and ground, top bar reduced to `Back` plus a three-way mono segmented control (`English · Oʻzbekcha · Meme`). The joke sits on a stack of plates — two thin offset edges visible beneath the top one, suggesting depth without a shadow.

> **Motion — the tear-off.** "One more" tears the top sheet away (rotate + translate with a `clip-path` edge, ~220ms), revealing the next joke already set beneath.
> *Why:* the interaction *is* the metaphor — a joke-a-day desk calendar. It makes the button's effect physically legible and gives the one page whose entire job is playfulness something no other page needs to carry. Two transforms, no library.

**Content fix:** the English mode depends on a third-party API with no error state — if `icanhazdadjoke` is down the card renders empty, which is exactly what happened when the current page was rendered for the audit. It needs a failure state and a local fallback set.

---

## 5. New Sections & Pages

Deliberately **not** proposed: testimonials, newsletter modal, stats band, chat widget, blog comments, a services page, a skills-percentage chart.

### 5.1 Case studies — `/work/:slug`
**What:** three or four deep write-ups, per §4.4. **Why:** the current site gives a reviewer one sentence per project; the "A decision" block is the only place a portfolio can show judgement rather than output. **Where:** linked from every work plate.

### 5.2 Writing — `/writing`
**What:** a real bilingual home for his notes. **Why:** he already writes — the content exists, it is just presented as a screenshot of Telegram inside a biography. Writing is his genuine differentiator against every other junior frontend portfolio, and the only section giving anyone a reason to return. **Where:** primary nav; three-item preview on home.

### 5.3 Now — `/now`
**What:** a short dated page — what he's building, studying, and available for. The [nownownow.com](https://nownownow.com) convention. **Why:** human — for a student, "what I'm doing right now" is the most useful thing a visitor can know. Structural — it **solves the hardcoded-age problem**: `"a 21-year-old"` was true in 2024 and is wrong now. Moving all time-sensitive claims into one dated page stops the rest of the site decaying. **Where:** a mono status line in the hero coordinate strip, linking through.

### 5.4 Colophon — `/colophon`
**What:** how the site is built — type choices, the palette with its measured ratios, the performance budget, the accessibility commitments, and the girih construction maths. **Why:** for a frontend engineer the site *is* the portfolio piece, and this direction has an unusually good story to tell. It is also the right home for the icon and photo credits currently buried in an HTML comment. **Where:** footer. Build it last, and only if the site it describes is genuinely good.

### 5.5 404
**What:** the rosette, mis-constructed — the star drawn with a wrong inner radius so it visibly doesn't close — plus one line in his voice and a link to the Laugh Challenge. **Why:** costs almost nothing, and it is the one page where the system's own logic can carry the joke. The site currently has no 404 at all.

---

## 6. Recommended Order & Navigation

### Home, top to bottom

| # | Section | Reasoning |
|---|---|---|
| 00 | **Hero + construction** | Identity, one real sentence, and the thesis. Answers "who, what, where" in three seconds. |
| 01 | **Selected work** (3) | **Proof before biography.** A reviewer's first question is "what have you built," and they may never scroll past the fold. Today they hit a 180-word life story first. |
| 02 | **About** + stack + measured | The story is *now* earned — they've seen the work and want to know who made it. |
| 03 | **Writing** (3 latest) | Depth and voice; the reason to come back. |
| 04 | **Laugh Challenge** (aside) | Personality, as a single line near the end. A wink, not a chapter. |
| 05 | **Contact** | The call to action, where someone convinced by 00–04 arrives ready. |
| — | **Legend + footer** | The title block, then wayfinding. |

The governing principle: **proof → person → depth → personality → action.** The current order is person → nothing → tools → joke → action, which asks for trust before offering any.

### Routes

```
/                    Home
/work                Index (all projects, filterable)
/work/:slug          Case study                        [new]
/about               Full story + experience + print CV
/writing             Notes index                       [new]
/writing/:slug       Note                              [new]
/now                 Current status                    [new]
/laugh               Laugh Challenge
/colophon            How this site is made             [new, low priority]
/*                   404                               [new]
```

**Primary nav:** `Work · About · Writing · Contact` — four items, plus `⌘K`.
**Footer:** Laugh Challenge · Colophon · social channels · source repo.
`/now` appears as a live line in the hero strip, not as a fifth nav item — it is a state, not a destination.

---

## 7. Responsive & Interaction Design

### 7.1 Breakpoints — three, replacing fourteen

| Name | Range | Layout |
|---|---|---|
| `base` | < 640px | Single column. Grid drops to 32px only (no major rule — it crowds). Rosette full width above the name. Section padding `--s4`. |
| `md` | 640–1023px | Two-column work grid. `⌘K` hidden (no keyboard). Padding `--s5`. |
| `lg` | ≥ 1024px | Full layout, hero side by side, palette available. Padding `--s6`. |
| `xl` | ≥ 1280px | No new layout — content caps and gutters widen. |

Everything between uses **fluid type and space** (`clamp()`), which is what the current site's fourteen breakpoints were manually approximating. Card-level reflow uses **container queries**, so one work-plate component serves home, index, and related-work slots without variants.

**Explicitly fixed:** the current nav vanishes entirely below 370px. The new bar works to 320px.

### 7.2 Interaction states

| State | Treatment |
|---|---|
| **Hover** | Registration marks to full; colour and border changes. No scale, no lift, no shadow. 130–180ms. Every hover affordance has a non-hover equivalent. |
| **Focus** | `:focus-visible` — 2px `--violet-hot`, 3px offset. Never removed. Designed to look intentional, because keyboard users see it constantly. |
| **Active** | `translate(1px,1px)` — the only movement in the system, and it reads as a key being pressed. |
| **Disabled** | `--bone-30` text, `--plate` fill, `aria-disabled`. Never opacity alone. |
| **Loading** | Top progress rule (routes) · static skeletons (content) · button label swaps with width locked so nothing reflows. |
| **Error** | Inline, at source, `--rose`, remedy stated. Never a toast. |
| **Success** | The signature (forms) · inline mono confirmation (everything else). |
| **Selection** | `::selection` in solid violet with bone text — free, and one of those details that reads as care. |

### 7.3 Scrolling

- Native only. **No scroll-hijacking, no smooth-scroll library, no parallax.**
- Section tracking via one `IntersectionObserver`, never a `scroll` listener.
- `scroll-margin-top` on all anchor targets so the sticky bar never covers a heading.
- Retire the `88vh` internal scroll container on the work page.

### 7.4 Motion budget & reduced motion

Animated properties in the entire system: **`transform`, `opacity`, `stroke-dashoffset`, `clip-path`, `background-color`, `border-color`, and `height` on one component.** No animated `box-shadow`, `filter` on large areas, `background-position`, `width`, or `top/left`. The current site animates `box-shadow` in an infinite 10s loop, repainting continuously for decoration.

**Durations:** micro 130–180ms · deliberate (construction, signature) 700–1000ms, and only those two.

**`prefers-reduced-motion: reduce`** handled per-animation, never as a blanket kill:

| Animation | Reduced-motion behaviour |
|---|---|
| Construction draw | Renders complete |
| Registration marks | Shown at full at rest |
| Screenshot grade | Full colour at rest |
| View transition | Instant cut |
| Language swap | Instant swap; height still animated (prevents a jarring jump) |
| Tear-off | Instant swap |
| Signature | Renders complete |

Every animation has a static end state that is already correct — nothing becomes unusable, nothing loses meaning.

**Low-powered devices:** every animation is transform/opacity on a small element, so there is no per-device downgrade path to build. Two guards only: the grid is a CSS gradient (never a repeated image or canvas), and the `grayscale` filter on screenshots is applied to elements under ~600px wide.

---

## 8. React + TypeScript Implementation Direction

### 8.1 Stack

| Concern | Recommendation | Reasoning |
|---|---|---|
| Build | **Vite + React 19 + TS (strict)** | Fast, minimal config, no framework tax at this size. |
| Routing | **React Router v7** | Familiar, data APIs available, no lock-in. |
| Styling | **CSS Modules + custom properties** | The three-surface token swap and the grid are pure CSS concerns; utilities would fight both. |
| Content | **Typed TS modules + MDX for long-form** | Content is authored, not fetched. No CMS. |
| Motion | **CSS first; `motion` (lazy) for the two spring cases** | §8.5 |
| Hosting | **Vercel** | Already used for every deployed project; provides the serverless function the form needs. |

> **On Tailwind:** defensible, and he knows it — but this design's identity lives in a variable-font width axis, a 32/256px construction grid, uppercase optical corrections, three surface swaps, and a print stylesheet. Utilities fight all of that, and the tokens end up in CSS variables regardless. **Recommendation: CSS Modules + custom properties.** If Tailwind is preferred, drive it entirely from `tokens.css` and keep prose, grid, and print in plain CSS.

### 8.2 Token layer

One file, `styles/tokens.css`, holding every value from §3, plus three surface blocks:

```
:root                      → void ground (default)
[data-surface="plate"]     → raised panel
[data-surface="bone"]      → reading surface, and print
```

That is what makes the bone reading plate a *token swap* rather than a second stylesheet — and it is the same mechanism a light theme would use later. **TypeScript never imports a colour.** Components reference `var(--violet)`; there is no `theme.ts`.

### 8.3 Primitives

| Primitive | Responsibility |
|---|---|
| `<Page>` | Grid substrate, max width, surface attribute |
| `<Section>` | Number, heading, rhythm, registers with the nav observer |
| `<Plate>` | Border, fill, registration marks, `as` polymorphic (`a`, `article`, `div`) |
| `<Prose>` | 60ch measure, baseline rhythm, forces `data-surface="bone"` |
| `<Data>` | The mono metadata primitive — one component, used everywhere |
| `<Stack>` / `<Row>` | Token-driven flex, `gap` only, no margin utilities |

`<Plate>` is the one to get right — it is the whole system's container, and its marks are a single `::before` with eight background gradients, so it costs no extra DOM.

### 8.4 Components

```
components/
  chrome/   TopBar, Nav, CommandPalette, Footer, Legend
  ui/       Button, Field, Chip, Toast, Skeleton, Signature, SegmentedControl
  content/  WorkPlate, CaseStudyHero, NoteRow, StackMatrix, DimensionRow,
            LanguageTable, Rosette
  motion/   DrawPath, TearOff, ViewTransitionLink
```

**`<Rosette>`** deserves a note: the geometry is *computed*, not hand-authored path data. Outer points at `k·45°` radius `R`, inner points at `22.5° + k·45°` radius `0.7654R`, plus the generating circles and squares. Roughly 30 lines, fully parameterised, and correct by construction — which is the entire point of the design.

**`<CommandPalette>`** needs real focus management: trap on open, restore on close, `Esc`, arrow navigation, and `aria-activedescendant`. It is the one place this proposal spends complexity, and it earns it as both a genuine utility and a statement about who built the site.

### 8.5 Animation architecture

Tiered, cheapest first:

1. **CSS transitions** — every hover, focus, active state. No JS.
2. **CSS keyframes** — the construction draw and the signature.
3. **View Transitions API** — route changes and the shared-element morph.
4. **`motion` (lazy)** — only the language-swap height spring and the tear-off. Loaded via `LazyMotion` + dynamic feature import so the main bundle never carries it.

One `useReducedMotion()` hook with a live listener feeds the two JS animations; CSS handles its own via the media query.

A deliberate guardrail: **`motion/` contains a `Reveal` component that renders its children and nothing else**, with a comment explaining principle 4. When someone reaches for a scroll-reveal, they find the rule instead. Guardrails beat documentation.

### 8.6 Content and the contact form

```ts
type Localized = { en: string; uz?: string };

type Project = {
  slug: string;
  title: string;
  year: number;
  summary: Localized;
  stack: string[];
  tags: ('live' | 'client' | 'experiment' | 'archived')[];
  links: { demo?: string; source?: string };
  caseStudy?: boolean;
};
```

i18n: for two languages over static content, a typed dictionary plus a `LanguageContext` is lighter and better-typed than a library. `i18next` (which he already knows from the E-COMMERCE project) is the escape hatch if a third language or plurals arrive.

**The contact form must be rebuilt, not restyled.** The Telegram bot token and chat ID are currently in client JavaScript and committed to the repository — anyone can read them and send messages through the bot.

- Move to a serverless route (`/api/contact`) with the token in an environment variable. An Express route is equally fine; the serverless function is simply less to operate.
- Add a honeypot field and basic rate limiting — a public Telegram relay will be found by bots.
- **The existing token must be revoked and regenerated regardless of the redesign.** It is public in git history; rotating it is required whether or not any of this is built.

### 8.7 Assets and performance

- **Fonts:** self-hosted, subset (Latin + Cyrillic + U+02BB), variable, `woff2`, preloaded. Archivo's width axis means one file covers display and body. Days One subset to the wordmark's characters only.
- **Images:** AVIF with WebP fallback, explicit dimensions, `loading="lazy"` below the fold, `fetchpriority="high"` on the hero. Current assets are unoptimised full-size PNG/JPEG (one is 5.3 MB).
- **Delete on migration:** the 9 unused assets, `copy_of_nav.min.css`, the unused GSAP dependency, the Bootstrap Icons CDN link, the duplicate favicon folder, and `my_photo2.JPG` — whose case-only collision with `my_photo2.jpeg` is a live deploy hazard.
- **Budget:** LCP < 1.5s on 4G, CLS < 0.02, JS < 90KB gzipped on home, zero third-party requests on first paint.
- **Accessibility as a build gate:** real `alt` on every image (currently every single one is empty), skip link, ordered headings, labelled fields, AA contrast, full keyboard operability. Wire `axe` into CI — the sort of thing a colophon can then honestly claim.

### 8.8 Maintainability

- Content in `content/`, never in components. Adding a project is a data edit.
- One tokens file. Hard rule: **no hex value anywhere but `tokens.css`.** Lint it.
- Copyright year computed, never typed. Age never stated — `/now` carries anything time-sensitive.
- Components ship with their loading, empty and error states, or they ship incomplete.

---

## 9. Inspiration — and what specifically to take

Drawn deliberately from outside the SaaS/AI reference pool.

| Source | What to learn | What to leave |
|---|---|---|
| **Islamic girih tiling & Uzbek suzani geometry** | The core motif. Compass-and-straightedge construction, mathematically exact, centuries-timeless, and personally his. | Don't lift a traditional pattern wholesale — construct an original figure on the same principles, and keep it to one or two appearances. |
| **Architectural & engineering drawings** | Registration marks, dimension lines with stated scales, title blocks, coordinate labelling, the drawing grid. Almost every structural device here comes from this. | Blueprint blue and literal skeuomorphism. |
| **Teenage Engineering (OP-1, TX-6)** | One accent against a dark neutral, numerals as identity, mono labelling as an aesthetic, confidence through restraint. The closest single reference to the intended feel. | The playful primary colours. |
| **Braun / Dieter Rams instrument panels** | Labelling discipline: every control named, nothing decorative, hierarchy from size and placement alone. | The beige. |
| **Wipeout / F-Zero HUD design (The Designers Republic)** | High-contrast condensed uppercase, mono data overlays, geometric marks used as system furniture. A reminder that "technical" can be exciting. | The chaos and the density. |
| **Are.na** | Hairlines and tone doing all the separation work — proof a UI can be shadowless and still read clearly. | Its deliberate plainness. |
| **Letterboxd / Discogs** | Dense catalogue listing: rank, year and metadata in a consistent gutter. Directly informs the work index. | Their density — 10 projects need more room each. |
| **Linear's command palette (as a pattern, not a look)** | Keyboard-first navigation done properly: focus management, arrow keys, instant filtering. Take the mechanics only. | The visual language entirely — that's the AI-SaaS look this design exists to avoid. |
| **Daring Fireball / kottke.org** | The timelessness argument, empirically: text-first sites that have looked correct for twenty years because they never chased a trend. | Their absence of a design system. |
| **Desk-calendar joke-a-day pads** | The tear-off for the Laugh Challenge. The reference is an object, not a website — which is why the interaction feels unfamiliar on screen. | — |

---

## Open questions for review

1. **Is the dark ground right for every page, or should `/about` and `/writing` be bone-first** rather than bone-plate-inside-void? Cheaper to decide now than later.
2. **How many case studies?** Three deep ones is my recommendation. RGM Clinic is obvious; Glow Store and one more?
3. **The four orphaned screenshots** (Calculator, Efood, Medium, Partnero) — reinstate as archived, or delete?
4. **Bilingual scope:** whole site, or writing only? Whole-site is more work and more translation debt. I lean writing-only with the UI in English.
5. **Positioning:** "Frontend engineer" over "Aspiring Software Engineer" — accurate, and reads considerably stronger given there's client work in production. Confirm.
6. **Does the rosette want the portrait inside it,** or should the construction stand alone with the photo elsewhere? The prototype clips the photo into the star; standing alone is more austere and arguably stronger.
7. **`/colophon`** — worth building, or scope creep? Fine to cut.

## Suggested build order

1. Token layer, grid, `<Plate>`, `<Data>`, type scale — the system, proven on one page
2. Home + Work index (the two pages carrying the most weight)
3. Case studies + `/about` with print styles
4. Writing + `/now`
5. Laugh Challenge + 404
6. Contact form + serverless route + **token rotation**
7. Command palette polish, then colophon if it's earned

Ship 1–2 before writing a single animation beyond hover states. If the grid, the type and the plates are right, the site is already good without motion — and that is the test of whether the motion was decoration.
