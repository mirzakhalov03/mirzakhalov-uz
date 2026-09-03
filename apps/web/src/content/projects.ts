import type { Project } from './types.js';

/**
 * Content lives here, never in a component (§8.8) — adding a project is a data
 * edit. Copy is deliberately specific: "fully functional" told a reviewer
 * nothing, so every summary says what the thing actually does.
 *
 * Uzbek text uses U+02BB (ʻ) for oʻ and gʻ, not a straight apostrophe (§3.1).
 */
export const projects: Project[] = [
  {
    slug: 'rgm-clinic',
    title: 'RGM Clinic',
    year: 2024,
    summary: {
      en: 'A booking system for a medical clinic in Tashkent. Patients choose a doctor, a date and a slot; the clinic receives the appointment without anyone picking up a phone.',
      uz: 'Toshkentdagi tibbiyot klinikasi uchun navbat tizimi. Bemor shifokorni, sanani va vaqtni tanlaydi — klinika buyurtmani qoʻngʻiroqsiz oladi.',
    },
    stack: ['React', 'JavaScript', 'REST API'],
    tags: ['live', 'client'],
    links: { demo: 'https://www.ranograndmed.uz/', source: 'https://github.com/mirzakhalov03/RGM' },
    cover: { url: '/work/rgm-clinic.jpg', alt: 'RGM Clinic home page showing the appointment booking panel' },
    featured: true,
    hasCaseStudy: true,
  },
  {
    slug: 'glow-store',
    title: 'Glow Store',
    year: 2024,
    summary: {
      en: 'A cosmetics storefront running against a live product API — cart, favourites and filtering, typed end to end with Redux Toolkit.',
      uz: 'Jonli mahsulot API’siga ulangan kosmetika doʻkoni — savat, saralangan mahsulotlar va filtr.',
    },
    stack: ['React', 'TypeScript', 'Redux Toolkit', 'RTK Query'],
    tags: ['live'],
    links: { demo: 'https://glowstore.vercel.app', source: 'https://github.com/mirzakhalov03/Glow-Store' },
    cover: { url: '/work/glow-store.jpg', alt: 'Glow Store product grid with filtering sidebar' },
    featured: true,
    hasCaseStudy: true,
  },
  {
    slug: 'e-commerce',
    title: 'E-Commerce',
    year: 2024,
    summary: {
      en: 'A storefront in three languages. Registration, login and cart, with English, Russian and Uzbek swapped at runtime through i18next.',
      uz: 'Uch tilli doʻkon. Roʻyxatdan oʻtish, kirish va savat; ingliz, rus va oʻzbek tillari i18next orqali almashadi.',
    },
    stack: ['React', 'Redux', 'i18next'],
    tags: ['live'],
    links: {
      demo: 'https://e-commerce-eight-ebon.vercel.app/',
      source: 'https://github.com/mirzakhalov03/E-COMMERCE',
    },
    cover: { url: '/work/e-commerce.jpg', alt: 'E-Commerce catalogue page with the language switcher open' },
    featured: true,
    hasCaseStudy: false,
  },
  {
    slug: 'cinema-platform',
    title: 'Cinema Platform',
    year: 2024,
    summary: {
      en: 'A television catalogue pulled live from an external API — search, paged results and a detail page per show.',
    },
    stack: ['React', 'REST API'],
    tags: ['live'],
    links: {
      demo: 'https://cinema-platform.vercel.app/',
      source: 'https://github.com/mirzakhalov03/Cinema-Platform',
    },
    cover: { url: '/work/cinema-platform.jpg', alt: 'Cinema Platform grid of television show posters' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'spotify-clone',
    title: 'Spotify Replica',
    year: 2024,
    summary: {
      en: 'Spotify’s front end rebuilt against the real Spotify API — playlist routing, the player bar, and the state problem underneath both.',
    },
    stack: ['React', 'Redux', 'Spotify API'],
    tags: ['experiment'],
    links: {
      demo: 'https://spotify-replicate.vercel.app/',
      source: 'https://github.com/mirzakhalov03/Spotify-replicate-',
    },
    cover: { url: '/work/spotify-clone.jpg', alt: 'Spotify replica showing an album view and the player bar' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'tasbeh',
    title: 'Tasbeh',
    year: 2024,
    summary: {
      en: 'A digital tasbeh for dhikr. It counts, it keeps its place between sessions, and it makes the sound a real one makes.',
      uz: 'Zikr uchun raqamli tasbeh. Sanaydi, oʻrnini eslab qoladi va haqiqiy tasbeh kabi ovoz chiqaradi.',
    },
    stack: ['React', 'Web Audio'],
    tags: ['live', 'experiment'],
    links: {
      demo: 'https://tasbeh-app.vercel.app/',
      source: 'https://github.com/mirzakhalov03/Tasbeh-app-ReactJSX-',
    },
    cover: { url: '/work/tasbeh.jpg', alt: 'Tasbeh counter app showing the current count' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'game-platform',
    title: 'Game Platform',
    year: 2024,
    summary: {
      en: 'Visual design and build for a gaming agency’s site — the layout, the type and the code were all part of the same job.',
    },
    stack: ['HTML', 'SCSS', 'JavaScript'],
    tags: ['live', 'client'],
    links: {
      demo: 'https://game-platform-nu.vercel.app/',
      source: 'https://github.com/mirzakhalov03/Game-Platform',
    },
    cover: { url: '/work/game-platform.jpg', alt: 'Game Platform landing page hero' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'truck-logistics',
    title: 'Truck Logistics',
    year: 2024,
    summary: {
      en: 'A haulage company’s site, hand-written in SCSS with no framework — the project where the responsive rules stopped being guesswork.',
    },
    stack: ['HTML', 'SCSS'],
    tags: ['live'],
    links: { demo: 'https://truck-iota.vercel.app/', source: 'https://github.com/mirzakhalov03/TRUCK' },
    cover: { url: '/work/truck-logistics.jpg', alt: 'Truck Logistics home page with the services section' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'hello-fresh',
    title: 'HelloFresh',
    year: 2024,
    summary: {
      en: 'A meal-kit front end — browsing the week’s menu, picking a plan, and getting through checkout without a dead end.',
    },
    stack: ['React'],
    tags: ['live'],
    links: { demo: 'https://hello-fresh-one.vercel.app/', source: 'https://github.com/mirzakhalov03/2-dars' },
    cover: { url: '/work/hello-fresh.jpg', alt: 'HelloFresh menu page showing weekly recipe cards' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'portfolio-jsx',
    title: 'Portfolio in JSX',
    year: 2024,
    summary: {
      en: 'The first portfolio, kept on purpose. It marks where the work started, which is the only reason it is still here.',
    },
    stack: ['React'],
    tags: ['experiment'],
    links: {
      demo: 'https://portfolio-done-jsx.vercel.app/',
      source: 'https://github.com/mirzakhalov03/Portfolio-done-jsx-',
    },
    cover: { url: '/work/portfolio-jsx.jpg', alt: 'An earlier portfolio site with a dark hero section' },
    featured: false,
    hasCaseStudy: false,
  },

  /* The four screenshots that sat in the old repo without an entry pointing at
     them. Reinstated as archived rather than deleted — early work is evidence
     of a trajectory, as long as it is labelled as early work. */
  {
    slug: 'medium-clone',
    title: 'Medium, Rebuilt',
    year: 2023,
    summary: {
      en: 'Medium’s reading layout rebuilt from scratch to study how it sets measure, leading and vertical rhythm.',
    },
    stack: ['HTML', 'CSS'],
    tags: ['archived'],
    links: {},
    cover: { url: '/work/medium-clone.jpg', alt: 'A rebuild of the Medium article reading layout' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'efood',
    title: 'Efood',
    year: 2023,
    summary: { en: 'A food-delivery layout — an early exercise in CSS grid and type hierarchy.' },
    stack: ['HTML', 'CSS'],
    tags: ['archived'],
    links: {},
    cover: { url: '/work/efood.jpg', alt: 'Efood delivery site layout with a restaurant listing' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'partnero',
    title: 'Partnero',
    year: 2023,
    summary: { en: 'A marketing site rebuilt from a screenshot, to practise spacing against a reference.' },
    stack: ['HTML', 'CSS'],
    tags: ['archived'],
    links: {},
    cover: { url: '/work/partnero.jpg', alt: 'Partnero marketing page rebuild' },
    featured: false,
    hasCaseStudy: false,
  },
  {
    slug: 'calculator',
    title: 'Calculator',
    year: 2023,
    summary: { en: 'A calculator, from the week the DOM started making sense.' },
    stack: ['JavaScript'],
    tags: ['archived'],
    links: {},
    cover: { url: '/work/calculator.jpg', alt: 'A calculator interface with a dark keypad' },
    featured: false,
    hasCaseStudy: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
