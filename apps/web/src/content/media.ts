import type { MediaMention, Photo } from './types.js';

/**
 * Press mentions, interviews and talks. Typed to the shape the API will
 * eventually return, same as `projects.ts`.
 */
export const mediaMentions: MediaMention[] = [
  {
    slug: 'najot-talim-storytelling',
    title: "Storytelling at Najot Ta'lim",
    by: "Najot Ta'lim",
    excerpt:
      "Returned to Najot Ta'lim as a guest speaker for a storytelling event, sharing insights and experiences as a graduate of the academy.",
    links: [{ label: 'Telegram', url: 'https://t.me/najottalim/10204' }],
    thumbnail: {
      url: '/media/najot-talim-storytelling.png',
      alt: "Javohir speaking on stage at a Najot Ta'lim storytelling event",
    },
  },
  {
    slug: 'itcu-meet-javohir',
    title: 'Meet Javohir — Active Volunteer',
    by: 'IT Community of Uzbekistan',
    excerpt:
      'Meet Javohir Mirzakhalov, one of the active volunteers of IT Community of Uzbekistan. From supporting events and leading registration teams to speaking on stage, his journey reflects a commitment to community, growth, and making a meaningful impact.',
    links: [
      { label: 'Telegram', url: 'https://t.me/itcommunityuzb/3022' },
      { label: 'LinkedIn', url: 'https://lnkd.in/p/gWc56aGS' },
    ],
    thumbnail: {
      url: '/media/itcu-meet-javohir.jpg',
      alt: 'IT Community of Uzbekistan feature card introducing Javohir Mirzakhalov as an active volunteer',
    },
  },
  {
    slug: 'itcu-roadshow-namangan',
    title: 'Unite and Inspire',
    by: 'IT Community of Uzbekistan',
    excerpt:
      'Spoke at the IT Community Roadshow in Namangan about the community, its mission, and the opportunities it creates for young people in Uzbekistan. A meaningful experience of sharing knowledge, connecting with others, and inspiring growth through community.',
    links: [
      { label: 'Telegram', url: 'https://t.me/itcommunityuzb/2864' },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/posts/itcommunityuzb_meet-javohir-mirzakhalov-speaker-of-the-activity-7468602523528876032-fUW6',
      },
    ],
    thumbnail: {
      url: '/media/itcu-roadshow-namangan.jpg',
      alt: 'IT Community Roadshow poster featuring Javohir Mirzakhalov',
    },
  },
];

/** One `featured` entry takes the large cell in PortraitGrid. */
export const portraits: Photo[] = [
  {
    featured: true,
    image: {
      url: '/media/portraits/roadshow-speaking.jpg',
      alt: 'Javohir speaking into a microphone on stage at the IT Community Roadshow',
    },
  },
  {
    image: {
      url: '/media/portraits/roadshow-duo.jpg',
      alt: 'Javohir standing back to back with a fellow IT Community volunteer at the Roadshow',
    },
  },
  {
    image: {
      url: '/media/portraits/samarkand.jpeg',
      alt: 'Javohir standing in front of the Shah-i-Zinda complex in Samarkand',
    },
  },
  {
    image: {
      url: '/media/portraits/windmills.jpeg',
      alt: 'Javohir on a hillside overlooking wind turbines and a lake',
    },
  },
  {
    image: {
      url: '/media/portraits/engineering-expo.jpeg',
      alt: 'Javohir wearing an Engineering Expo polo shirt in front of mountains at sunset',
    },
  },
  {
    image: {
      url: '/media/portraits/venchur-zehniyati-handoff.jpeg',
      alt: "Javohir receiving the book 'Venchur Zehniyati' from a speaker",
    },
  },
];
