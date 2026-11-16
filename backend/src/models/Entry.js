import { query } from '../config/db.js';

export const MOOD_IDS = [
  'happy', 'excited', 'calm', 'thoughtful',
  'sad', 'anxious', 'grateful', 'tired', 'angry', 'neutral',
];

const countWords = (content) => (content ? String(content).trim().split(/\s+/).filter(Boolean).length : 0);

export function toEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content ?? '',
    date: row.date,
    mood: row.mood ?? 'neutral',
    tags: Array.isArray(row.tags) ? row.tags : [],
    isFavorite: Boolean(row.is_favorite),
    isDraft: Boolean(row.is_draft),
    wordCount: row.word_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Entry = {
  async findOwned(id, userId) {
    const { rows } = await query('SELECT * FROM entries WHERE id = $1 AND user_id = $2', [id, userId]);
    return toEntry(rows[0]);
  },

  async findPaginated({ userId, search, mood, tags, favorites, sort = 'newest', page = 1, limit = 12 }) {
    const where = ['user_id = $1'];
    const params = [userId];
    let idx = 2;

    if (search) {
      const pattern = `%${String(search)}%`;
      where.push(`(title ILIKE $${idx} OR content ILIKE $${idx} OR EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $${idx}))`);
      params.push(pattern);
      idx++;
    }
    if (mood) {
      where.push(`mood = $${idx++}`);
      params.push(mood);
    }
    if (tags) {
      const list = (Array.isArray(tags) ? tags : String(tags).split(',')).map((t) => t.trim()).filter(Boolean);
      if (list.length) {
        where.push(`tags @> $${idx++}::text[]`);
        params.push(list);
      }
    }
    if (favorites === 'true' || favorites === true) {
      where.push('is_favorite = TRUE');
    }

    const whereSql = where.join(' AND ');
    const orderMap = {
      newest: 'date DESC, created_at DESC',
      oldest: 'date ASC, created_at ASC',
      alpha: 'LOWER(title) ASC, title ASC',
    };
    const orderBy = orderMap[sort] || orderMap.newest;

    const countRes = await query(`SELECT COUNT(*)::int AS total FROM entries WHERE ${whereSql}`, params);
    const total = countRes.rows[0]?.total ?? 0;

    const offset = (page - 1) * limit;
    const { rows } = await query(
      `SELECT * FROM entries WHERE ${whereSql} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return {
      entries: rows.map(toEntry),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async create({ userId, title, content = '', date, mood = 'neutral', tags = [], isFavorite = false, isDraft = false }) {
    const cleanTags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const wordCount = countWords(content);
    const { rows } = await query(
      `INSERT INTO entries (user_id, title, content, date, mood, tags, is_favorite, is_draft, word_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, title.trim(), content, date, mood, cleanTags, Boolean(isFavorite), Boolean(isDraft), wordCount]
    );
    return toEntry(rows[0]);
  },

  async update(id, userId, fields) {
    const existing = await this.findOwned(id, userId);
    if (!existing) return null;

    const nextTitle = fields.title !== undefined ? String(fields.title).trim() : existing.title;
    const nextContent = fields.content !== undefined ? fields.content : existing.content;
    const nextDate = fields.date !== undefined ? fields.date : existing.date;
    const nextMood = fields.mood !== undefined ? fields.mood : existing.mood;
    const nextTags = fields.tags !== undefined
      ? fields.tags.map((t) => String(t).trim()).filter(Boolean)
      : existing.tags;
    const nextFav = fields.isFavorite !== undefined ? Boolean(fields.isFavorite) : existing.isFavorite;
    const nextDraft = fields.isDraft !== undefined ? Boolean(fields.isDraft) : existing.isDraft;
    const nextWords = fields.content !== undefined ? countWords(nextContent) : existing.wordCount;

    const { rows } = await query(
      `UPDATE entries
       SET title = $1, content = $2, date = $3, mood = $4, tags = $5,
           is_favorite = $6, is_draft = $7, word_count = $8, updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [nextTitle, nextContent, nextDate, nextMood, nextTags, nextFav, nextDraft, nextWords, id, userId]
    );
    return toEntry(rows[0]);
  },

  async remove(id, userId) {
    const { rowCount } = await query('DELETE FROM entries WHERE id = $1 AND user_id = $2', [id, userId]);
    return rowCount > 0;
  },

  async toggleFavorite(id, userId) {
    const { rows } = await query(
      `UPDATE entries
       SET is_favorite = NOT is_favorite, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, is_favorite`,
      [id, userId]
    );
    if (!rows[0]) return null;
    return { id: rows[0].id, isFavorite: Boolean(rows[0].is_favorite) };
  },

  async findByDate(userId, date) {
    const { rows } = await query(
      'SELECT * FROM entries WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC',
      [userId, date]
    );
    return rows.map(toEntry);
  },

  async getCalendarDates(userId, prefix) {
    const { rows } = await query(
      'SELECT DISTINCT date FROM entries WHERE user_id = $1 AND date LIKE $2 ORDER BY date ASC',
      [userId, `${prefix}%`]
    );
    return rows.map((r) => r.date);
  },

  async getUserStats(userId) {
    const [summaryRes, datesRes, moodsRes] = await Promise.all([
      query(
        `SELECT
           COUNT(*)::int AS total_entries,
           COUNT(*) FILTER (WHERE is_favorite)::int AS favorites,
           COALESCE(SUM(word_count), 0)::int AS total_words
         FROM entries
         WHERE user_id = $1`,
        [userId]
      ),
      query('SELECT DISTINCT date FROM entries WHERE user_id = $1', [userId]),
      query('SELECT mood, COUNT(*)::int AS count FROM entries WHERE user_id = $1 GROUP BY mood', [userId]),
    ]);

    const summary = summaryRes.rows[0] || { total_entries: 0, favorites: 0, total_words: 0 };
    const moodBreakdown = Object.fromEntries(moodsRes.rows.map((m) => [m.mood, m.count]));

    return {
      totalEntries: summary.total_entries,
      favorites: summary.favorites,
      totalWords: summary.total_words,
      dates: datesRes.rows.map((r) => r.date),
      moodBreakdown,
    };
  },
};

export default Entry;
