// All site copy and project data. Pages read from here, so editing content
// never means touching layout or animation code.
//
// Voice: plain English for people who don't build software. Say what it does
// for the customer; keep tool names out of the main text.
//
// Integrity rule (see docs/AUDIT.md): nothing here may claim a client, metric,
// testimonial or credential that isn't real. Unconfirmed values are listed in
// docs/HANDOVER.md.

import { WHATSAPP_URL } from './site';

export const studio = {
  name: 'Forgebyte',
  founder: 'Ajay Kumar',
  founderFirst: 'Ajay',
  est: 2026,
  city: 'Chennai',
  country: 'India',
  timeZone: 'Asia/Kolkata',
  tzLabel: 'India time (IST)',
  availability: 'Q4 2026',
  replyWithin: '24–48 hours',
  idealClients: 'small businesses, startups and founders',
  github: 'https://github.com/gitajay11',
  linkedin: 'https://www.linkedin.com/in/ajayak1501',
} as const;

/** The people behind the studio, in the order they're shown. */
export const team = [
  { name: 'Ajaykumar', short: 'Ajay', display: 'Ajaykumar (Ajay)', role: 'Founder', initials: 'AK' },
  { name: 'Parivalavan', short: 'Pari', display: 'Parivalavan (Pari)', role: 'Co-founder', initials: 'P' },
] as const;

/** Social profiles shown as icons in the footer and phone menu.
 *  '#' = placeholder until the account exists (see docs/HANDOVER.md). */
export const socials = [
  { name: 'Instagram', url: '#' },
  { name: 'LinkedIn', url: studio.linkedin },
  { name: 'X', url: '#' },
  { name: 'YouTube', url: '#' },
  { name: 'Facebook', url: '#' },
  { name: 'WhatsApp', url: WHATSAPP_URL },
] as const;

/* ------------------------------------------------------------------ */
/* Services                                                             */
/* ------------------------------------------------------------------ */

export type Service = {
  slug: string;
  index: string;
  name: string;
  short: string; // chip label in the contact form
  promise: string;
  problem: string;
  deliverables: string[];
  duration: string;
  fitIf: string;
  notFitIf: string;
  glyph: 'cube' | 'torus' | 'octa' | 'icosa' | 'ring';
};

export const services: Service[] = [
  {
    slug: 'websites-and-web-apps',
    index: '01',
    name: 'Websites & web apps',
    short: 'Website or app',
    promise: 'A website or online tool your customers find easy to use, built to keep working.',
    problem: 'You have an idea, or a way of working that has outgrown spreadsheets and WhatsApp, and you need something people can rely on.',
    deliverables: ['A written plan and a fixed price', 'Your site or app, live online', 'Simple admin screens to manage it', 'Logins and notes handed over to you'],
    duration: 'Usually 6–12 weeks',
    fitIf: 'you know who your customers are and what they need to get done.',
    notFitIf: 'you need a large team building a huge platform for years.',
    glyph: 'cube',
  },
  {
    slug: 'online-stores',
    index: '02',
    name: 'Online stores & payments',
    short: 'Online store',
    promise: 'Sell online with a store that takes payments safely and is easy for you to run.',
    problem: 'You want customers to browse, order and pay online — and you need to manage orders and stock without calling a developer.',
    deliverables: ['Product pages and a cart', 'Card, UPI or cash-on-delivery payments', 'Order emails for you and your customer', 'A simple screen to manage orders and stock'],
    duration: 'Usually 4–10 weeks',
    fitIf: 'you already sell, or are ready to, and know your products and prices.',
    notFitIf: 'you need a marketplace with thousands of sellers on day one.',
    glyph: 'torus',
  },
  {
    slug: 'quick-first-versions',
    index: '03',
    name: 'Quick first versions',
    short: 'First version',
    promise: 'A simple working version in a few weeks, so you can test your idea before spending more.',
    problem: 'You want to show something real to customers or investors without paying for the full thing yet.',
    deliverables: ['The one most important feature, working', 'Live online and easy to share', 'A list of what we left out, and why', 'A plan for what comes next'],
    duration: 'Usually 4–6 weeks',
    fitIf: 'you are happy to start small and learn quickly.',
    notFitIf: 'every feature on your list must be there at launch.',
    glyph: 'octa',
  },
  {
    slug: 'smart-assistants',
    index: '04',
    name: 'Smart assistants (AI)',
    short: 'AI assistant',
    promise: 'A chat assistant that answers your customers’ questions — without making things up.',
    problem: 'You get the same questions every day, or want help sorting enquiries, and you have heard AI can help.',
    deliverables: ['An assistant trained on your own information', 'Rules for what it must never say', 'Limits so costs stay predictable', 'A fallback to a real person'],
    duration: 'Usually 2–6 weeks',
    fitIf: 'you can say exactly what the assistant should help with.',
    notFitIf: 'the goal is just to "add AI" without a clear job for it.',
    glyph: 'icosa',
  },
  {
    slug: 'care-after-launch',
    index: '05',
    name: 'Care after launch',
    short: 'Ongoing care',
    promise: 'Fixes, updates and small improvements after launch, so your site keeps working.',
    problem: 'Your site is live and the person who built it is gone, busy — or was us.',
    deliverables: ['An agreed number of hours each month', 'Fixes and security updates', 'Small new features', 'A written note of every change'],
    duration: 'Monthly',
    fitIf: 'you want one person you can call who knows how it all works.',
    notFitIf: 'you need someone on call through the night.',
    glyph: 'ring',
  },
];

/* ------------------------------------------------------------------ */
/* Work                                                                 */
/* ------------------------------------------------------------------ */

export type CaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  year: string;
  role: string;
  stack: string[]; // shown only as a small "Built with" line
  status: 'Live' | 'Under testing' | 'In progress';
  url: string;
  image: string;
  imageAlt: string;
  oneLiner: string;
  problem: string;
  questions: string[];
  approach: { title: string; body: string }[];
  build: string[];
  outcome: string;
  services: string[]; // service slugs, for /work filters
  confirm: true; // year and role still to be confirmed by the owner
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'loopa',
    title: 'Loopa',
    client: 'Loopa (Nutriyah)',
    industry: 'Food & drink',
    year: '2026',
    role: 'Design & build',
    stack: ['HTML', 'CSS', 'JavaScript', 'Formspree'],
    status: 'Live',
    url: 'https://loopa.nutriyah.com/',
    image: '/work/loopa.png',
    imageAlt: 'Loopa homepage: a green sparkling drink bottle beside the headline "Be in the Moment"',
    oneLiner: 'A website for a sparkling drinks brand that turns shop and distributor interest into orders.',
    problem: 'A new natural sparkling drink needed to look trustworthy to shoppers — and to the distributors who decide whether it ever reaches a shelf.',
    questions: [
      'Who places the first big order: a shopper or a distributor?',
      'What does a distributor need to see before asking for a price?',
      'How can we show what is in the bottle, not just say it?',
    ],
    approach: [
      { title: 'Two kinds of visitor, one site', body: 'Flavours and mood up front for shoppers, and an easy bulk-order route for trade buyers on every page.' },
      { title: 'Show the ingredients', body: 'A clear section showing what is in the drink, instead of vague claims.' },
      { title: 'Nothing to maintain', body: 'Bulk-order requests arrive straight in the inbox, with no system to keep running.' },
    ],
    build: ['Flavour pages', 'An ingredients section', 'A bulk-order form that sends quote requests by email'],
    outcome: 'Live at loopa.nutriyah.com, receiving bulk-order requests from distributors.',
    services: ['websites-and-web-apps'],
    confirm: true,
  },
  {
    slug: 'nutriyah',
    title: 'Nutriyah',
    client: 'Nutriyah',
    industry: 'Food & drink',
    year: '2026',
    role: 'Design & build',
    stack: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    status: 'Live',
    url: 'https://www.nutriyah.com/',
    image: '/work/nutriyah.png',
    imageAlt: 'Nutriyah homepage with the headline "Developing the next generation of food products"',
    oneLiner: 'A company website built to start conversations with distributors and trade partners.',
    problem: 'The parent food and drink company needed one place that explained what it does and made trade partners want to get in touch.',
    questions: [
      'What does a trade partner need to trust a young company?',
      'How much should the company say, and how much should its products say?',
      'How should a conversation start: a form, an email or a call?',
    ],
    approach: [
      { title: 'Show, don’t boast', body: 'What the company does and makes, laid out plainly so a buyer can judge it in one read.' },
      { title: 'Room to grow', body: 'A product section that new brands, like Loopa, can slot into as they launch.' },
      { title: 'Fast everywhere', body: 'Pages that load quickly even on a slow phone connection.' },
    ],
    build: ['About, capabilities and product pages', 'Clear ways for trade buyers to get in touch'],
    outcome: 'Live at nutriyah.com as the company’s main website for trade partners.',
    services: ['websites-and-web-apps'],
    confirm: true,
  },
  {
    slug: 'sri-cauvery-electronics',
    title: 'Sri Cauvery Electronics',
    client: 'Sri Cauvery Electronics, Madurai',
    industry: 'Retail',
    year: '2026',
    role: 'Design & build',
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    status: 'Under testing',
    url: 'https://www.sricauveryelectronics.shop/',
    image: '/work/sri-cauvery-electronics.png',
    imageAlt: 'Sri Cauvery Electronics homepage with the headline "Everyday electronics. Unforgettable gifts."',
    oneLiner: 'An online shop in Tamil and English, with cash on delivery and an easy app for the owner.',
    problem: 'A Madurai electronics and gift shop wanted to sell online to customers who read Tamil first and often prefer to pay on delivery.',
    questions: [
      'Which language does a customer think in when they shop?',
      'Which way of paying makes a first order feel safest?',
      'Who updates stock and orders, and on which device?',
    ],
    approach: [
      { title: 'Tamil and English, side by side', body: 'One tap switches the whole shop between Tamil and English, not just the menu.' },
      { title: 'Cash on delivery first', body: 'Checkout built around how this shop’s customers already like to pay.' },
      { title: 'An app the owner will use', body: 'A separate app on the owner’s phone to manage orders and stock.' },
    ],
    build: ['Product catalogue, cart and checkout', 'Tamil / English switch', 'Cash on delivery', 'A phone-friendly admin app for orders and stock', 'Can be installed on a phone like an app'],
    outcome: 'Built and being tested before launch. No sales figures yet.',
    services: ['online-stores', 'websites-and-web-apps'],
    confirm: true,
  },
  {
    slug: 'elare-beauty',
    title: 'Élaré Beauty',
    client: 'Élaré Beauty',
    industry: 'Beauty',
    year: '2026',
    role: 'Design & build',
    stack: ['React', 'TypeScript', 'PostgreSQL', 'Razorpay'],
    status: 'In progress',
    url: 'https://www.elarebeauty.store/',
    image: '/work/elare-beauty.jpg',
    imageAlt: 'Élaré Beauty homepage: a model beside the headline "Beauty, defined by you."',
    oneLiner: 'A premium makeup store with safe online payments and a back office to run it.',
    problem: 'A makeup brand needed a store that feels premium, takes payments safely, and can be run day to day without a developer.',
    questions: [
      'How does someone choose a shade they cannot try on?',
      'If a payment fails, how do we keep the order instead of losing it?',
      'Which shop rules must never be broken, even by mistake?',
    ],
    approach: [
      { title: 'Rules that can’t be skipped', body: 'Prices, stock and discounts are checked in one safe place, so mistakes can’t slip through.' },
      { title: 'Payments that can be finished later', body: 'If an online payment fails, the customer can pay later from their order page.' },
      { title: 'A store and a back office', body: 'A shop for customers and a separate back office for the team, working together.' },
    ],
    build: ['A shop for customers', 'Card and UPI payments, plus cash on delivery', 'Order confirmation emails', 'A back office for orders and products', 'Can be installed on a phone like an app'],
    outcome: 'Being built now. Not launched yet.',
    services: ['online-stores', 'websites-and-web-apps'],
    confirm: true,
  },
];

/* ------------------------------------------------------------------ */
/* Lab — demos and experiments, labelled as such                        */
/* ------------------------------------------------------------------ */

export type LabItem = {
  slug: string;
  title: string;
  kind: string;
  body: string;
  stack: string[];
  url: string;
  image: string;
  imageAlt: string;
};

export const lab: LabItem[] = [
  {
    slug: 'ember-and-oak',
    title: 'Ember & Oak',
    kind: 'Demo website',
    body: 'A café website with a moving video, a menu and table booking. Built to show what a restaurant or café site can feel like.',
    stack: ['React', 'Vite', 'Tailwind', 'Framer Motion'],
    url: 'https://cafecaffeine.vercel.app/',
    image: '/work/ember-and-oak.jpg',
    imageAlt: 'Ember & Oak homepage: espresso pouring behind the headline "Coffee, crafted slowly."',
  },
  {
    slug: 'care-dental',
    title: 'Care Dental',
    kind: 'Demo website',
    body: 'A dental clinic website with doctors, treatments and an appointment form that emails the clinic straight away.',
    stack: ['React', 'Vite', 'Express', 'Nodemailer'],
    url: 'https://cleardental.vercel.app/',
    image: '/work/care-dental.jpg',
    imageAlt: 'Care Dental homepage: a smiling patient beside the headline "Dental Care"',
  },
  {
    slug: 'site-assistant',
    title: 'This site’s assistant',
    kind: 'Try it here',
    body: 'The chat button in the corner of this page. It answers common questions, never quotes prices, and passes your details on only if you share them.',
    stack: ['Next.js', 'Groq', 'Nodemailer'],
    url: '#chat',
    image: '/work/site-assistant.jpg',
    imageAlt: 'The Forgebyte chat assistant open, showing suggested questions',
  },
];

/* ------------------------------------------------------------------ */
/* Process                                                              */
/* ------------------------------------------------------------------ */

export const process = [
  { name: 'Talk', what: 'A short call about your business, your customers and what success looks like. We ask the awkward questions here.', receive: 'A short summary of what we heard', time: '1–3 days' },
  { name: 'Plan', what: 'We write down what will be built, what won’t, and what it costs.', receive: 'A written plan with a fixed price', time: '2–5 days' },
  { name: 'Design & build', what: 'We build in small steps and show you progress every week, so there are no surprises at the end.', receive: 'A link to the work in progress, updated weekly', time: 'Depends on the plan' },
  { name: 'Test & launch', what: 'We check everything works on phones and computers, then put it live.', receive: 'Your live site and all its logins', time: 'About a week' },
  { name: 'Look after it', what: 'We stay on after launch to fix anything that comes up, then hand everything over.', receive: 'Notes, logins and a list of changes', time: 'Agreed per project' },
] as const;

/* ------------------------------------------------------------------ */
/* Engagement                                                           */
/* ------------------------------------------------------------------ */

export const engagements = [
  { name: 'First chat', includes: 'A short conversation about what you need, then a written next step.', duration: 'One call', price: 'No obligation' },
  { name: 'Fixed-price project', includes: 'A written plan, a fixed price, weekly updates and a launch.', duration: '3–12 weeks', price: 'Quoted per project' },
  { name: 'Quick first version', includes: 'Your most important feature, working and live.', duration: '4–6 weeks', price: 'Quoted per project' },
  { name: 'Monthly care', includes: 'Agreed hours each month for fixes, updates and small changes.', duration: 'Monthly', price: 'Monthly fee' },
] as const;

/* ------------------------------------------------------------------ */
/* FAQ                                                                  */
/* ------------------------------------------------------------------ */

export const faq = [
  { q: 'How long will it take?', a: 'Most projects take between 3 and 12 weeks. You get a firm timeline in writing before any work starts.' },
  { q: 'How much does it cost?', a: 'Every project is priced on its own. You get a fixed price in writing, and it only changes if you change what you want built.' },
  { q: 'Who owns the website when it’s done?', a: 'You do. The site, the accounts and everything we make for you are handed over to you once the final payment is made.' },
  { q: 'Do I need to understand technology?', a: 'No. We explain everything in plain language and make the technical decisions with you, not at you.' },
  { q: 'Will you sign an NDA?', a: 'Yes. Send it over before our first call if you need one.' },
  { q: 'How will we keep in touch?', a: 'A weekly update with a link to see progress, plus email or WhatsApp in between.' },
  { q: 'You’re in India. What about time zones?', a: 'We work on India time (IST). That overlaps with UK and European mornings and US evenings, and we plan calls around your day.' },
  { q: 'What happens after launch?', a: 'Every project includes a period of support after launch. After that, you can choose monthly care or run it yourselves with our handover notes.' },
  { q: 'What do you need from me?', a: 'One person who can make decisions, a little time each week to look at progress, and quick answers when we have questions.' },
] as const;

/* ------------------------------------------------------------------ */
/* Privacy (rendered by app/privacy/page.tsx; also read by the bot)     */
/* ------------------------------------------------------------------ */

export const privacy = {
  updated: 'October 2026',
  collect: [
    { label: 'The contact form', text: 'whatever you type into it — name, email, phone, company, what you need, budget, timeline and your message. It is emailed to us, a copy is emailed back to you, and it is added to our enquiries spreadsheet. It is also stored in our database for 90 days and posted to our private Telegram work group, so we can reply quickly.' },
    { label: 'The Telegram bot', text: 'if you choose "Get updates on Telegram", your Telegram chat is linked to your enquiry so the bot can confirm it. The bot also answers questions about this website: your questions are sent to Groq, the AI provider that writes the replies, and your last few messages are kept for up to 90 days so follow-up questions make sense.' },
    { label: 'The chat assistant', text: 'your messages are sent to Groq, the AI provider that writes the replies. If you type an email address or phone number into the chat, that part of the conversation is emailed to us so we can reply.' },
    { label: 'Analytics', text: 'Vercel Web Analytics counts page views and a few clicks (such as “Start a project”). It uses no cookies and does not identify you.' },
    { label: 'Preferences', text: 'your theme, motion and cursor choices are saved in your own browser (localStorage). They never leave your device.' },
  ],
  notDo: 'No advertising trackers, no selling or sharing of your details, no newsletter you did not ask for.',
  where: 'Emails are sent through our email provider over SMTP. The site is hosted on Vercel and the database on Neon. Chat and bot replies are generated by Groq. Telegram messages go through Telegram.',
  removal: 'and we will delete your enquiry, any reply thread and any Telegram link.',
} as const;
