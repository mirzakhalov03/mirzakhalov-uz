import type {
  Certificate,
  EducationEntry,
  ExperienceEntry,
  Language,
  Note,
  Social,
  StackItem,
} from './types.js';

export const profile = {
  name: 'Javohirbek Mirzakhalov',
  surname: 'Mirzakhalov',
  role: 'Software Engineer',
  location: 'Tashkent',
  coords: { lat: 41.2995, lng: 69.2401 },
  timezone: 'Asia/Tashkent',
  utcOffset: 'UTC+5',

  /* The hero lede. The old one — "Welcome to my world of pixel-perfect
     creations" — said nothing, and "Aspiring Software Engineer" undersold
     someone with a clinic system in production. */
  lede: 'I build interfaces for the web. Most recently a booking system for a medical clinic that real patients use every day. Before software I taught English — I still write, in two languages.',

  bio: {
    en: [
      'I’m a full-stack developer in Tashkent. I build web products end to end — React and TypeScript on the front, Node and Express behind — and ship them to real users.',
      'I study at INHA University and volunteer with IT Community of Uzbekistan.',
    ],
  },

  /* The line under the logo in the footer — a welcome, not a slogan. */
  motto: 'Glad you stopped by. Always happy to help if you need it.',
} as const;

export const socials: Social[] = [
  { label: 'Telegram', handle: '@mirzakhalov03', url: 'https://t.me/mirzakhalov03' },
  { label: 'GitHub', handle: 'mirzakhalov03', url: 'https://github.com/mirzakhalov03' },
  {
    label: 'LinkedIn',
    handle: 'Javohir Mirzakhalov',
    url: 'https://www.linkedin.com/in/mirzakhalov03',
  },
  {
    label: 'Email',
    handle: 'javohirmirzakhalov@gmail.com',
    url: 'mailto:javohirmirzakhalov@gmail.com',
  },
];

export const languages: Language[] = [
  { name: 'Uzbek', level: 'Native', score: 5 },
  { name: 'English', level: 'Fully proficient', score: 5, note: 'IELTS 8.0' },
  { name: 'Russian', level: 'Intermediate', score: 3 },
];

/**
 * Names are always visible. The old site revealed them only on hover, so on
 * any touch device it showed twelve unlabelled logos and nothing said what
 * they were — a defect, not a style choice (§3.6).
 */
export const stack: StackItem[] = [
  { name: 'React', group: 'core' },
  { name: 'TypeScript', group: 'core' },
  { name: 'JavaScript', group: 'core' },
  { name: 'Node.js', group: 'core' },
  { name: 'Express', group: 'core' },
  { name: 'Next.js', group: 'core' },
  { name: 'Tailwind', group: 'core' },
  { name: 'Scss', group: 'core' },
  { name: 'Claude', group: 'ai' },
  { name: 'GitHub Copilot', group: 'ai' },
  { name: 'Antigravity', group: 'ai' },
  { name: 'Cursor', group: 'ai' },
];

export const education: EducationEntry[] = [
  {
    org: 'INHA University in Tashkent',
    qualification: 'BSc, Computer Science',
    from: '2024',
    to: '2028',
    detail: 'Computer science on INHA’s Korean curriculum, taught in English.',
    image: { url: '/education/inha.svg', alt: 'INHA University in Tashkent logo' },
  },
  {
    org: "Najot Ta'lim",
    qualification: 'Frontend development',
    from: '2024-01',
    to: '2024-09',
    detail:
      'Nine months of frontend, full time — JavaScript through to React, and the first place I shipped something somebody else had to maintain.',
    image: { url: '/education/najotlogo.png', alt: "Najot Ta'lim logo" },
  },
  /* The other half of this is in `experience`: three years as a student here,
     then a year teaching in the same building. Rebranded to Dombit Education
     since. */
  {
    org: 'Dombit Education',
    qualification: 'English',
    from: '2019',
    to: '2022',
    detail: 'Three years of English here as a student, which is how I ended up teaching in it.',
    image: { url: '/education/dombit-mark.svg', alt: 'Dombit Education logo' },
  },
];

/**
 * A certificate carrying a `score` renders as a stat tile; one without renders
 * as a feature card. The first feature card takes the compact slot beside the
 * stat tiles, and any further ones stack in the tall column beside it.
 */
export const certificates: Certificate[] = [
  {
    name: 'IELTS',
    issuer: 'IDP',
    score: { value: 8, scaleMin: 0, scaleMax: 9, display: '8.0' },
  },
  {
    name: 'SAT',
    issuer: 'College Board',
    score: { value: 1330, scaleMin: 400, scaleMax: 1600, display: '1330' },
  },
  {
    name: 'Claude Certified Architect — Foundations',
    issuer: 'Anthropic',
    url: 'https://www.credly.com/badges/baf0577e-d96a-4196-ac7d-7b4d0fe676ad/linked_in_profile',
    image: { url: '/certs/cca-f.png', alt: 'Claude Certified Architect badge' },
  },
  {
    name: 'Claude with Anthropic API',
    image: {
      url: '/certs/claude-anthropic-api.jpeg',
      alt: 'Claude with the Anthropic API certificate',
    },
  },
  {
    name: 'NodeJS Mastery',
    url: 'https://ude.my/UC-e8e03d73-adba',
    image: { url: '/certs/nodejs-mastery.jpg', alt: 'NodeJS — The Complete Guide certificate' },
  },
];

/** Reverse chronological — the timeline reads newest at the top. */
export const experience: ExperienceEntry[] = [
  {
    org: 'Vention',
    role: 'Software Engineer',
    from: '2026-03',
    to: null,
    note: 'full-time',
    detail: 'Building product interfaces in React and TypeScript.',
    image: { url: '/experience/vention.jpg', alt: 'Vention logo' },
  },
  {
    org: 'SATashkent',
    role: 'Frontend Engineer',
    from: '2025-11',
    to: '2026-03',
    detail: 'Frontend for the platform students use to prepare for the SAT.',
    image: { url: '/experience/satashkent.jpg', alt: 'SATashkent logo' },
  },
  {
    org: 'Speaklish',
    role: 'Frontend Engineer',
    from: '2025-03',
    to: '2025-08',
    note: 'startup',
    image: { url: '/experience/speaklish.png', alt: 'Speaklish logo' },
  },
  {
    org: 'Monic.AI',
    role: 'Frontend Engineer',
    from: '2025-03',
    to: '2025-08',
    note: 'US startup',
    image: { url: '/experience/monic-ai.jpg', alt: 'Monic.AI logo' },
  },
  {
    org: 'Ziyokor Education',
    role: 'IELTS mentor & ESL teacher',
    from: '2023',
    to: '2024',
    detail:
      'IELTS preparation and general English, mostly with teenagers sitting the exam that year.',
    image: { url: '/experience/ziyokor.jpg', alt: 'Ziyokor Education logo' },
  },
  /* Same building as `education`'s Dombit Education entry — rebranded from
     LangApex Edu-Center since. Reuses that entry's logo. */
  {
    org: 'Dombit Education',
    role: 'ESL teacher',
    from: '2022',
    to: '2023',
    detail: 'General English, in the classes I had been sitting in three years earlier.',
    image: { url: '/education/dombit-mark.svg', alt: 'Dombit Education logo' },
  },
];

/** Preview rows for the writing section. Uzbek uses U+02BB throughout. */
export const notes: Note[] = [
  {
    slug: 'millatni-uygotish',
    title: 'Millatni uygʻotish',
    lang: 'uz',
    excerpt:
      'Maqsadimiz — oʻzimiz ilhomlanganimiz kabi boshqalarni ham ilhomlantirish. “Millatni uygʻotish — uygʻonganlarning vazifasi.”',
    publishedAt: '2026-08-14',
    readingMinutes: 4,
  },
  {
    slug: 'teaching-taught-me-to-debug',
    title: 'Teaching taught me to debug',
    lang: 'en',
    excerpt:
      'Two years of explaining the present perfect to teenagers turns out to be the same skill as reading a stack trace: find where the model broke, not where the error printed.',
    publishedAt: '2026-07-02',
    readingMinutes: 6,
  },
  {
    slug: 'ozbek-tilida-yozish',
    title: 'Oʻzbek tilida yozish, toʻgʻri harflar bilan',
    lang: 'uz',
    excerpt:
      'Oʻ va gʻ harflari apostrof emas. Bitta belgi — U+02BB — va matn nihoyat oʻzbekcha koʻrinadi.',
    publishedAt: '2026-06-19',
    readingMinutes: 3,
  },
];
