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
      'I build interfaces for the web, mostly in React and TypeScript. The work I am proudest of is a booking system for a medical clinic in Tashkent — real patients use it to hold a slot with a doctor, and it has to keep working on an old Android phone over a bad connection.',
      'Before software I taught English: two years of ESL and IELTS classes. That is where I learned that explaining something clearly is most of the job, whether the room is a classroom or a codebase. I still write, in English and Uzbek.',
      'I am studying at INHA University in Tashkent, with a 1330 SAT, a band 8.0 IELTS, and scholarship offers from seven American universities behind me.',
    ],
  },

  /* The line at the foot of every page. Two years of teaching and a clinic
     booking system say the same thing, so the footer says it once. */
  motto: 'Clarity is most of the job — in a classroom or in a codebase.',

  now: {
    text: 'Rebuilding this site in the open — React 19, a design system drawn from scratch, and an Express API so that publishing a project stops being a commit.',
    updatedAt: '2026-09-01',
  },
} as const;

export const socials: Social[] = [
  { label: 'Telegram', handle: '@mirzakhalov03', url: 'https://t.me/mirzakhalov03' },
  { label: 'GitHub', handle: 'mirzakhalov03', url: 'https://github.com/mirzakhalov03' },
  {
    label: 'LinkedIn',
    handle: 'Javohir Mirzakhalov',
    url: 'https://www.linkedin.com/in/javohir-mirzakhalov',
  },
  { label: 'Instagram', handle: '@mirzakhalov03', url: 'https://instagram.com/mirzakhalov03' },
  { label: 'Email', handle: 'javohirmirzakhalov@gmail.com', url: 'mailto:javohirmirzakhalov@gmail.com' },
];

export const languages: Language[] = [
  { name: 'Uzbek', level: 'Native' },
  { name: 'English', level: 'Fully proficient', note: 'IELTS 8.0' },
  { name: 'Russian', level: 'Intermediate' },
];

/**
 * Names are always visible. The old site revealed them only on hover, so on
 * any touch device it showed twelve unlabelled logos and nothing said what
 * they were — a defect, not a style choice (§3.6).
 */
export const stack: StackItem[] = [
  { name: 'React', frequency: 'daily' },
  { name: 'TypeScript', frequency: 'daily' },
  { name: 'JavaScript', frequency: 'daily' },
  { name: 'CSS', frequency: 'daily' },
  { name: 'HTML', frequency: 'daily' },
  { name: 'Git', frequency: 'daily' },
  { name: 'Figma', frequency: 'often' },
  { name: 'Redux', frequency: 'often' },
  { name: 'SCSS', frequency: 'often' },
  { name: 'Tailwind', frequency: 'often' },
  { name: 'Next.js', frequency: 'often' },
  { name: 'Ant Design', frequency: 'often' },
];

export const education: EducationEntry[] = [
  {
    org: 'INHA University in Tashkent',
    qualification: 'BSc, Computer Science',
    from: '2024',
    to: '2028',
    detail: 'Computer science on INHA’s Korean curriculum, taught in English.',
    lead: true,
  },
  {
    org: "Najot Ta'lim",
    qualification: 'Frontend development',
    from: '2024-01',
    to: '2024-09',
    detail:
      'Nine months of frontend, full time — JavaScript through to React, and the first place I shipped something somebody else had to maintain.',
  },
  /* The other half of this is in `experience`: three years as a student here,
     then a year teaching in the same building. */
  {
    org: 'LangApex Edu-Center',
    qualification: 'English',
    from: '2019',
    to: '2022',
    detail: 'Three years of English here as a student, which is how I ended up teaching in it.',
  },
];

/**
 * A certificate carrying a `score` is drawn as a dimension row against its
 * scale; one without is drawn as a card.
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
    name: 'GPA',
    score: { value: 4, scaleMin: 0, scaleMax: 4, display: '4.00' },
  },
  { name: 'Node.js Mastery', issuer: 'Udemy' },
  { name: 'Certified Claude Architect', issuer: 'Anthropic' },
];

/** Reverse chronological — the timeline reads newest at the top. */
export const experience: ExperienceEntry[] = [
  {
    org: 'Vention',
    role: 'Software Engineer',
    from: '2026-03',
    to: null,
    detail: 'Building product interfaces in React and TypeScript.',
  },
  {
    org: 'SATashkent',
    role: 'Frontend Engineer',
    from: '2025-11',
    to: '2026-03',
    detail: 'Frontend for the platform students use to prepare for the SAT.',
  },
  {
    org: 'Ziyokor Education',
    role: 'IELTS mentor & ESL teacher',
    from: '2023',
    to: '2024',
    detail:
      'IELTS preparation and general English, mostly with teenagers sitting the exam that year.',
  },
  {
    org: 'LangApex Edu-Center',
    role: 'ESL teacher',
    from: '2022',
    to: '2023',
    detail: 'General English, in the classes I had been sitting in three years earlier.',
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
