import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Entry, { MOOD_IDS } from './models/Entry.js';
import Note from './models/Note.js';

export const DEMO_USER = {
  name: 'Eleanor Mitchell',
  email: 'eleanor@chronicle.app',
  password: 'Chronicle@123',
  bio: 'Designer by day, dreamer by night. I write to understand my world.',
  timezone: 'America/New_York',
  dateFormat: 'MMM dd, yyyy',
  weekStart: 'Monday',
  theme: 'light',
};

const TITLES = [
  'A Day of Unexpected Beauty', 'Morning Light and Coffee Rituals', 'Finding Peace in the Small Hours',
  'The Weight of Ordinary Moments', 'Autumn Walks and Warm Thoughts', 'On Starting Over',
  'Letters to My Future Self', 'The Garden in October', 'A Quiet Sunday', 'Things I Noticed Today',
  'Storm Season', 'The Art of Beginning', 'What the Rain Taught Me', 'Gratitude List — Week 42',
  'Conversations Worth Keeping', 'Late Night Musings', 'First Day of Something New',
  'How I Spent My Saturday', 'December Reflections', 'The Courage to Create',
];

const CONTENT = [
  `Today was one of those rare days where everything seemed to fall into place. The morning light streamed through my window in golden ribbons, and I found myself pausing to breathe it all in before the usual rush of responsibilities pulled me forward.\n\nThe meeting I'd been dreading turned out to be unexpectedly productive. Sometimes our fears about things are so much larger than the things themselves.`,
  `Woke up at 5 AM without an alarm — my body seems to know when something important is coming. Spent the first hour just journaling by candlelight, trying to untangle the thread of thoughts that have been accumulating all week.\n\nFinished the design presentation today. Months of work distilled into forty-five minutes of speaking. It went well.`,
  `Spent the afternoon in the old botanical garden with my sketchbook. I haven't drawn seriously in years and the rustiness showed — but there was joy in the imperfection. A little girl sat beside me for a while and watched, then told me my tree looked like a broccoli.`,
  `Rain all day. The kind of persistent, gentle rain that invites you to stay inside and think. I made soup from scratch — something I haven't done since my grandmother taught me as a child.\n\nCalled my mother in the evening. We talked for two hours about nothing in particular.`,
  `Big day today. Launched the new project that I've been working on for the past three months. The response has been better than I hoped. Someone called it "elegant" and I've been thinking about that word ever since.`,
];

const TAG_POOL = ['Family', 'Work', 'Travel', 'Health', 'Fitness', 'Food', 'Books', 'Music', 'Friends', 'Nature', 'Dreams', 'Goals', 'Memories', 'Learning', 'Gratitude', 'Reflection', 'Ideas', 'Creativity', 'Mindfulness'];

const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (base, n) => { const d = new Date(base); d.setUTCDate(d.getUTCDate() + n); return d; };

export async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({ email: DEMO_USER.email })]);
  const user = await User.create(DEMO_USER);
  const today = new Date();

  // 28 entries: last 12 days consecutive (active streak), then every other day
  const offsets = [];
  for (let i = 0; i < 12; i++) offsets.push(i);
  for (let i = 13; i < 13 + 16 * 2; i += 2) offsets.push(i);

  const entries = offsets.map((off, i) => ({
    userId: user._id,
    title: TITLES[i % TITLES.length],
    content: CONTENT[i % CONTENT.length],
    date: fmt(addDays(today, -off)),
    mood: MOOD_IDS[i % MOOD_IDS.length],
    tags: [TAG_POOL[i % TAG_POOL.length], TAG_POOL[(i * 3 + 1) % TAG_POOL.length]].filter((t, idx, a) => a.indexOf(t) === idx),
    isFavorite: i % 4 === 0,
    isDraft: i === 5,
  }));
  // Use save() path via create so wordCount hook runs
  for (const e of entries) await Entry.create(e);

  const notes = [
    { title: 'Plan quarterly review presentation', description: 'Prepare slides, gather metrics, and outline key achievements for Q4.', date: fmt(addDays(today, 1)), reminderTime: '09:00', completed: false, tags: ['Work'], priority: 'high' },
    { title: 'Call dentist for appointment', description: 'Overdue — schedule cleaning and checkup.', date: fmt(today), reminderTime: '11:00', completed: true, tags: ['Health'], priority: 'medium' },
    { title: 'Order birthday gift for Mom', description: 'Her birthday is the 15th. Check the wishlist she sent.', date: fmt(addDays(today, 2)), reminderTime: '10:00', completed: false, tags: ['Family'], priority: 'high' },
    { title: 'Start reading "A Gentleman in Moscow"', description: 'Pick up where I left off — Chapter 6.', date: fmt(addDays(today, 2)), reminderTime: '20:00', completed: false, tags: ['Books'], priority: 'low' },
    { title: 'Weekend hiking trip preparation', description: 'Pack gear, download offline maps, check weather forecast.', date: fmt(addDays(today, 4)), reminderTime: '07:00', completed: false, tags: ['Fitness', 'Nature'], priority: 'medium' },
    { title: 'Renew gym membership', description: 'Expires soon.', date: fmt(addDays(today, 7)), reminderTime: '09:00', completed: false, tags: ['Fitness', 'Health'], priority: 'medium' },
  ].map((n) => ({ ...n, userId: user._id }));
  await Note.insertMany(notes);

  console.log(`🌱 Seeded user ${DEMO_USER.email} (password: ${DEMO_USER.password}), ${entries.length} entries, ${notes.length} notes`);
}

// Run directly: `npm run seed`
if (process.argv[1]?.endsWith('seed.js')) {
  seed()
    .catch((e) => { console.error('Seed failed:', e.message); process.exitCode = 1; })
    .finally(() => mongoose.disconnect());
}
