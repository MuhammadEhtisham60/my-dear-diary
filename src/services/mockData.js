// ─── Mock Data ───────────────────────────────────────────────────────────────
export const MOODS = [
  { id: 'happy',     label: 'Happy',     emoji: '😊', color: '#6B8F71', bg: '#D4E8D7' },
  { id: 'excited',   label: 'Excited',   emoji: '🎉', color: '#D4A017', bg: '#F5E4A8' },
  { id: 'calm',      label: 'Calm',      emoji: '😌', color: '#4A9E8E', bg: '#C8EDE8' },
  { id: 'thoughtful',label: 'Thoughtful',emoji: '🤔', color: '#7A6FA0', bg: '#E0DBF0' },
  { id: 'sad',       label: 'Sad',       emoji: '😢', color: '#5B8DD9', bg: '#C8DCF5' },
  { id: 'anxious',   label: 'Anxious',   emoji: '😰', color: '#C07020', bg: '#F5DDB8' },
  { id: 'grateful',  label: 'Grateful',  emoji: '🙏', color: '#A05090', bg: '#EDD4E8' },
  { id: 'tired',     label: 'Tired',     emoji: '😴', color: '#6B7280', bg: '#E5E7EB' },
  { id: 'angry',     label: 'Angry',     emoji: '😤', color: '#A8412E', bg: '#F2D5CC' },
  { id: 'neutral',   label: 'Neutral',   emoji: '😐', color: '#9E7A65', bg: '#EDE0D8' },
];

export const ALL_TAGS = [
  'Family', 'Work', 'Travel', 'Health', 'Fitness', 'Food', 'Books',
  'Music', 'Movies', 'Friends', 'Nature', 'Dreams', 'Goals', 'Memories',
  'Learning', 'Gratitude', 'Reflection', 'Ideas', 'Creativity', 'Mindfulness',
];

export const MOCK_USER = {
  id: '1',
  name: 'Eleanor Mitchell',
  email: 'eleanor@chronicle.app',
  bio: 'Designer by day, dreamer by night. I write to understand my world.',
  avatar: null,
  timezone: 'America/New_York',
  dateFormat: 'MMM dd, yyyy',
  weekStart: 'Monday',
  theme: 'light',
  joinDate: '2024-01-15',
  totalEntries: 147,
  currentStreak: 12,
  longestStreak: 34,
};

const CONTENT_POOL = [
  `Today was one of those rare days where everything seemed to fall into place. The morning light streamed through my window in golden ribbons, and I found myself pausing to breathe it all in before the usual rush of responsibilities pulled me forward. I made coffee slowly, deliberately — savoring the ritual rather than racing through it.

The meeting I'd been dreading turned out to be unexpectedly productive. Sometimes our fears about things are so much larger than the things themselves. I left feeling energized rather than drained, which surprised me most of all.

In the evening, I walked along the waterfront as the sun was setting. The water was still and copper-colored, reflecting the sky's last performance. A man was fishing from the pier, perfectly content in his solitude. I envied that stillness for a moment, then realized I was standing in it too.`,

  `Woke up at 5 AM without an alarm — my body seems to know when something important is coming. Spent the first hour just journaling by candlelight, trying to untangle the thread of thoughts that have been accumulating all week.

There's something to be said for the quiet hours. The world hasn't started yet and you get this small window where you feel like the only person alive. It's both lonely and sacred.

Finished the design presentation today. Months of work distilled into forty-five minutes of speaking. It went well. My hands stopped shaking after the first five slides and then it became something closer to a conversation.`,

  `Spent the afternoon in the old botanical garden with my sketchbook. I haven't drawn seriously in years and the rustiness showed — but there was joy in the imperfection. A little girl sat beside me for a while and watched, then told me my tree looked like a broccoli. She wasn't wrong.

Thinking a lot about what it means to be a beginner again. Adults are so afraid of being bad at things. We've forgotten the pleasure of just doing something without needing to be good at it yet.`,

  `Rain all day. The kind of persistent, gentle rain that invites you to stay inside and think. I made soup from scratch — something I haven't done since my grandmother taught me as a child. The smell of onions and thyme cooking slowly filled the apartment and for a while I felt thoroughly rooted.

Called my mother in the evening. We talked for two hours about nothing in particular — old stories, neighborhood gossip, what we'd each been reading. After we hung up I sat with the warm feeling of it for a long time.`,

  `Big day today. Launched the new project that I've been working on for the past three months. The response has been better than I hoped. Someone called it "elegant" and I've been thinking about that word ever since — what makes something elegant, and is that what I was going for?

Celebrated quietly with a glass of wine on the balcony. The city below doing its usual thing, indifferent and brilliant. Felt the rare satisfaction of having made something real.`,
];

const TITLES = [
  'A Day of Unexpected Beauty',
  'Morning Light and Coffee Rituals',
  'Finding Peace in the Small Hours',
  'The Weight of Ordinary Moments',
  'Autumn Walks and Warm Thoughts',
  'On Starting Over',
  'Letters to My Future Self',
  'The Garden in October',
  'A Quiet Sunday',
  'Things I Noticed Today',
  'Storm Season',
  'The Art of Beginning',
  'What the Rain Taught Me',
  'Gratitude List — Week 42',
  'Conversations Worth Keeping',
  'Late Night Musings',
  'First Day of Something New',
  'How I Spent My Saturday',
  'December Reflections',
  'The Courage to Create',
];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomTags(n = 3) {
  const shuffled = [...ALL_TAGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateEntries(count = 40) {
  const entries = [];
  const now = new Date(2026, 9, 2); // Oct 2, 2026

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() - i - Math.floor(Math.random() * 2));
    const mood = randomFrom(MOODS);
    entries.push({
      id: `entry-${i + 1}`,
      title: TITLES[i % TITLES.length],
      content: CONTENT_POOL[i % CONTENT_POOL.length],
      date: date.toISOString().split('T')[0],
      mood: mood.id,
      tags: randomTags(Math.floor(Math.random() * 3) + 1),
      isFavorite: Math.random() > 0.72,
      isDraft: Math.random() > 0.9,
      wordCount: Math.floor(Math.random() * 400) + 80,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export const MOCK_ENTRIES = generateEntries(40);

export const MOCK_NOTES = [
  {
    id: 'note-1',
    title: 'Plan quarterly review presentation',
    description: 'Prepare slides, gather metrics, and outline key achievements for Q4.',
    date: '2026-10-02',
    reminderTime: '09:00',
    completed: false,
    tags: ['Work'],
    priority: 'high',
  },
  {
    id: 'note-2',
    title: 'Call dentist for appointment',
    description: 'Overdue — schedule cleaning and checkup.',
    date: '2026-10-02',
    reminderTime: '11:00',
    completed: true,
    tags: ['Health'],
    priority: 'medium',
  },
  {
    id: 'note-3',
    title: 'Order birthday gift for Mom',
    description: 'Her birthday is the 15th. Check the wishlist she sent.',
    date: '2026-10-03',
    reminderTime: '10:00',
    completed: false,
    tags: ['Family'],
    priority: 'high',
  },
  {
    id: 'note-4',
    title: 'Start reading "A Gentleman in Moscow"',
    description: 'Pick up where I left off — Chapter 6.',
    date: '2026-10-03',
    reminderTime: '20:00',
    completed: false,
    tags: ['Books'],
    priority: 'low',
  },
  {
    id: 'note-5',
    title: 'Weekend hiking trip preparation',
    description: 'Pack gear, download offline maps, check weather forecast.',
    date: '2026-10-05',
    reminderTime: '07:00',
    completed: false,
    tags: ['Fitness', 'Nature'],
    priority: 'medium',
  },
  {
    id: 'note-6',
    title: 'Renew gym membership',
    description: 'Expires October 10th.',
    date: '2026-10-08',
    reminderTime: '09:00',
    completed: false,
    tags: ['Fitness', 'Health'],
    priority: 'medium',
  },
  {
    id: 'note-7',
    title: 'Submit project proposal',
    description: 'Deadline: October 12th, send to department head.',
    date: '2026-10-12',
    reminderTime: '08:00',
    completed: false,
    tags: ['Work', 'Goals'],
    priority: 'high',
  },
  {
    id: 'note-8',
    title: 'Thanksgiving dinner menu planning',
    description: 'Coordinate with family on dishes, dietary restrictions.',
    date: '2026-10-18',
    reminderTime: '12:00',
    completed: false,
    tags: ['Family', 'Food'],
    priority: 'low',
  },
];

export const MOCK_STATS = {
  totalEntries: 147,
  thisMonth: 18,
  favorites: MOCK_ENTRIES.filter(e => e.isFavorite).length,
  currentStreak: 12,
  longestStreak: 34,
  totalWords: 48320,
  avgWordsPerEntry: 329,
  mostUsedMood: 'calm',
  topTags: ['Work', 'Reflection', 'Gratitude', 'Nature'],
  weeklyActivity: [3, 5, 2, 7, 4, 6, 5], // Mon-Sun
  monthlyActivity: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 8, i + 1).toISOString().split('T')[0],
    count: Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0,
  })),
};
