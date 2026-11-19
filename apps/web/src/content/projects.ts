import type { Project } from './types.js';

/**
 * Content lives here, never in a component (§8.8) — adding a project is a data
 * edit. Copy is deliberately specific: "fully functional" told a reviewer
 * nothing, so every summary says what the thing actually does.
 *
 * Uzbek text uses U+02BB (ʻ) for oʻ and gʻ, not a straight apostrophe (§3.1).
 */
export const projects: Project[] = [
  /* 2026. The four that moved the work past "React developer who builds
     sites": a platform with a queue and a model behind it, a clinic system with
     an admin panel behind a role gate, an agent that runs as a daemon, and an
     API someone else also committed to. Each summary says the one hard thing
     the project actually solved, because that is the part a reviewer cannot get
     from the screenshot — and each `tagline` says it again in one line, which is
     all a card has room for. */
  {
    slug: 'quizflow',
    title: 'QuizFlow',
    year: 2026,
    summary: {
      en: 'Upload a PDF, a Notion page or your own notes and it returns a quiz — multiple choice, multi-select, true/false, or open-ended answers graded by a model. Generation runs on Lambda behind a job record the client polls, so a fifty-page upload never holds a request open. Built with five other engineers.',
      uz: 'PDF, Notion sahifasi yoki oʻz konspektingizni yuklaysiz — u test tuzib beradi. Ochiq savollarga berilgan javoblarni model baholaydi. Test tuzish Lambdada, navbat orqali ishlaydi.',
    },
    tagline: {
      en: 'Upload a PDF or your own notes and get a quiz back, open answers graded by a model.',
      uz: 'PDF yoki konspektingizni yuklang — ochiq javoblarni model baholaydigan test qaytadi.',
    },
    highlights: [
      { label: 'Fullstack', kind: 'scope' },
      { label: 'React + Express', kind: 'stack' },
      { label: 'AWS Lambda', kind: 'feature' },
    ],
    stack: ['React 19', 'TypeScript', 'Express', 'Postgres', 'AWS Lambda'],
    tags: ['live'],
    links: {
      demo: 'https://quizflow.uz',
      source: 'https://github.com/mirzakhalov03/QuizFlow-frontend',
    },
    cover: {
      url: '/work/quizflow.jpg',
      alt: 'QuizFlow landing page — “Turn study materials into interactive quizzes instantly” beside a quiz preview panel',
    },
    featured: true,
    hasCaseStudy: false,
  },
  {
    slug: 'bookquest',
    title: 'BookQuest',
    year: 2026,
    summary: {
      en: 'An annual reading competition: everyone reads the same book by a deadline, then takes a quiz — fastest and most accurate win, and everyone who finishes gets a certificate. It runs first as a Telegram Mini App, signing people in by verifying Telegram’s own signed launch data, and second as a standalone web app. The quiz engine is the hard part: per-participant question variants, attempts timed on the server so a slow phone cannot buy extra seconds, a live monitor for organisers, and results ranked once at publication and then frozen.',
      uz: 'Har yili oʻtkaziladigan kitobxonlik musobaqasi: hamma bitta kitobni muddatgacha oʻqiydi, soʻng test topshiradi — eng tez va aniq javob berganlar gʻolib, oxirigacha yetganlarning barchasi sertifikat oladi. Avvalo Telegram Mini App, keyin alohida veb-ilova sifatida ishlaydi.',
    },
    tagline: {
      en: 'A yearly reading competition as a Telegram Mini App — read the book, beat the clock on the quiz.',
      uz: 'Telegram Mini App koʻrinishidagi yillik kitobxonlik musobaqasi — kitobni oʻqing, testda vaqtni yuting.',
    },
    highlights: [
      { label: 'Fullstack', kind: 'scope' },
      { label: 'React + Express', kind: 'stack' },
      { label: 'Telegram Mini App', kind: 'feature' },
    ],
    stack: ['React 19', 'TypeScript', 'Express', 'MongoDB', 'Tailwind'],
    tags: ['live'],
    links: { demo: 'https://bookquest.uz', source: 'https://github.com/mirzakhalov03/BookQuest' },
    cover: {
      url: '/work/bookquest.jpg',
      alt: 'BookQuest 2026 home — this year’s book on a lit stage, with a countdown to the reading period and a “Join BookQuest” button',
    },
    featured: true,
    hasCaseStudy: false,
  },
  {
    slug: 'printupp',
    title: 'PrintUpp',
    year: 2026,
    summary: {
      en: 'Event registration and badge printing for organizations — no more Excel, Word or endless clicks. An attendee list syncs in from Google Sheets, a template designer lays out the badge to the millimetre, and the browser drives the label printer directly. At the door, QR stations turn a phone scan into a printed badge on the laptop beside the printer. Each organization keeps its own events, members and printers, private to it.',
      uz: 'Tashkilotlar uchun tadbirga roʻyxatdan oʻtkazish va beyj chop etish — Excel, Word va behisob bosishlarsiz. Ishtirokchilar roʻyxati Google Sheets’dan sinxronlanadi, beyj shabloni millimetrgacha chiziladi, brauzer esa printerni toʻgʻridan-toʻgʻri boshqaradi. Kirishda telefon QR kodni skanerlaydi — noutbuk yonidagi printer beyjni chiqaradi.',
    },
    tagline: {
      en: 'Print event badges in five seconds — registration, templates and printing in one place.',
      uz: 'Tadbir beyjlarini besh soniyada chop eting — roʻyxat, shablon va chop etish bir joyda.',
    },
    highlights: [
      { label: 'Fullstack', kind: 'scope' },
      { label: 'React + Express', kind: 'stack' },
      { label: 'Browser → label printer', kind: 'feature' },
    ],
    stack: ['React', 'TypeScript', 'Express', 'PostgreSQL'],
    tags: ['live'],
    /* Private repository — the live product is the only link. */
    links: { demo: 'https://printupp.uz' },
    cover: {
      url: '/work/printupp.jpg',
      alt: 'PrintUpp landing page — “Print event badges in 5 seconds” beside a printer issuing a speaker badge',
    },
    featured: true,
    hasCaseStudy: false,
  },
  {
    slug: 'otolor-uz',
    title: 'Otolor.uz',
    year: 2026,
    summary: {
      en: 'The site and the booking system for Otolor, an ENT clinic in Tashkent. A patient picks a branch, a doctor and a slot against that doctor’s real weekly schedule; behind a role-gated login the clinic runs its own doctors, services and categories. The schedule editor is the piece both halves depend on — what staff set is exactly what the calendar offers. Uzbek, Russian and English throughout.',
      uz: 'Toshkentdagi Otolor LOR klinikasi uchun sayt va navbat tizimi. Bemor filial, shifokor va vaqtni shifokorning haqiqiy jadvaliga qarab tanlaydi; klinika esa shifokorlar, xizmatlar va toifalarni oʻz paneli orqali boshqaradi. Uch tilda.',
    },
    tagline: {
      en: 'Booking and a role-gated admin panel for a Tashkent ENT clinic, in three languages.',
      uz: 'Toshkentdagi LOR klinikasi uchun navbat tizimi va boshqaruv paneli, uch tilda.',
    },
    highlights: [
      { label: 'Client work', kind: 'scope' },
      { label: 'React + React Query', kind: 'stack' },
      { label: 'Admin & RBAC', kind: 'feature' },
    ],
    stack: ['React 19', 'TypeScript', 'TanStack Query', 'Ant Design', 'SCSS'],
    tags: ['live', 'client'],
    links: { demo: 'https://otolor.uz', source: 'https://github.com/mirzakhalov03/Otolor-uz' },
    cover: {
      url: '/work/otolor-uz.jpg',
      alt: 'Otolor.uz home page — “Otolor — Hayotdan bahra oling” beside the clinic’s doctors, with the booking button below',
    },
    featured: true,
    hasCaseStudy: false,
  },
  {
    slug: 'nemo-ai',
    title: 'NemoAI',
    year: 2026,
    summary: {
      en: 'A Telegram assistant that persists: file-backed memory it reads and writes itself, cron reminders, vision on photos and PDFs, and read-only SQL over its own history — twenty-nine tools in one long-running Node daemon on the Claude Agent SDK. A TypeScript rebuild of a Python bot by Rustam Zokirov.',
      uz: 'Telegramdagi doimiy yordamchi: oʻzi oʻqib-yozadigan xotira fayllari, eslatmalar, suratlar va PDF bilan ishlash. Claude Agent SDK ustida qurilgan Node daemoni.',
    },
    tagline: {
      en: 'A Telegram assistant that remembers — twenty-nine tools in one long-running daemon.',
      uz: 'Telegramdagi yordamchi: bitta uzluksiz daemon ichida yigirma toʻqqizta vosita.',
    },
    highlights: [
      { label: 'Solo build', kind: 'scope' },
      { label: 'Claude Agent SDK', kind: 'stack' },
      { label: 'Telegram assistant', kind: 'feature' },
    ],
    stack: ['TypeScript', 'Node.js', 'Claude Agent SDK', 'SQLite', 'Docker'],
    tags: ['live'],
    /* Private repository and no web surface to link — it lives in Telegram.
       The plate renders as a non-interactive article, which is correct: there
       is nothing honest to open. */
    links: {},
    /* The mascot, not a screenshot: there is no web surface to photograph, and
       a cropped chat transcript is unreadable at card size. Padded to 16:10
       against --surface-well so the letterbox merges with the slot it sits in
       rather than drawing a second rectangle. */
    cover: { url: '/work/nemo-ai.jpg', alt: 'The NemoAI mascot — a clownfish wearing a headset, among chat bubbles' },
    featured: true,
    hasCaseStudy: false,
  },
  {
    slug: 'shorten-uz',
    title: 'shorten.uz',
    year: 2026,
    summary: {
      en: 'A URL shortener written with one other engineer. Eight-character nanoid codes that retry on a unique-constraint collision rather than trusting the odds, JWT sessions with refresh tokens in their own table, and a Drizzle-migrated Postgres schema behind an Express API.',
      uz: 'Havolalarni qisqartirish xizmati, ikki kishilik jamoada yozilgan. Sakkiz belgili kod, JWT sessiyalar va Postgres asosidagi Express API.',
    },
    tagline: {
      en: 'A URL shortener with collision-retrying codes and refresh-token sessions.',
      uz: 'Havola qisqartirgich: toʻqnashuvda qayta urinadigan kodlar va yangilanuvchi sessiyalar.',
    },
    highlights: [
      { label: 'Fullstack', kind: 'scope' },
      { label: 'Express + Postgres', kind: 'stack' },
      { label: 'JWT sessions', kind: 'feature' },
    ],
    stack: ['React', 'TypeScript', 'Express', 'Drizzle', 'Postgres'],
    tags: ['live'],
    links: { demo: 'https://shorten.uz', source: 'https://github.com/mirzakhalov03/shorten-uz' },
    cover: {
      url: '/work/shorten-uz.jpg',
      alt: 'shorten.uz home page with the paste-a-URL field and the Shorten button',
    },
    featured: true,
    hasCaseStudy: false,
  },

  {
    slug: 'rgm-clinic',
    title: 'RGM Clinic',
    year: 2024,
    summary: {
      en: 'A booking system for a medical clinic in Tashkent. Patients choose a doctor, a date and a slot; the clinic receives the appointment without anyone picking up a phone.',
      uz: 'Toshkentdagi tibbiyot klinikasi uchun navbat tizimi. Bemor shifokorni, sanani va vaqtni tanlaydi — klinika buyurtmani qoʻngʻiroqsiz oladi.',
    },
    tagline: {
      en: 'A clinic booking flow — doctor, date, slot — that replaced the phone call.',
      uz: 'Klinika uchun navbat oqimi: shifokor, sana, vaqt — qoʻngʻiroqsiz.',
    },
    highlights: [
      { label: 'Client work', kind: 'scope' },
      { label: 'ReactJS', kind: 'stack' },
      { label: 'Booking system', kind: 'feature' },
    ],
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
    /* Unfeatured when Otolor landed. The home grid holds five, and a storefront
       against a public API is the weakest of six claims. */
    featured: false,
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
    featured: false,
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

