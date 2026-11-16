import { query } from '../config/db.js';

export function toNote(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description ?? '',
    date: row.date,
    reminderTime: row.reminder_time ?? '09:00',
    completed: Boolean(row.completed),
    tags: Array.isArray(row.tags) ? row.tags : [],
    priority: row.priority ?? 'medium',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Note = {
  async findOwned(id, userId) {
    const { rows } = await query('SELECT * FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    return toNote(rows[0]);
  },

  async findAll(userId) {
    const { rows } = await query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY date ASC, reminder_time ASC',
      [userId]
    );
    return rows.map(toNote);
  },

  async create({ userId, title, description = '', date, reminderTime = '09:00', completed = false, tags = [], priority = 'medium' }) {
    const cleanTags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];
    const { rows } = await query(
      `INSERT INTO notes (user_id, title, description, date, reminder_time, completed, tags, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, title.trim(), description, date, reminderTime, Boolean(completed), cleanTags, priority]
    );
    return toNote(rows[0]);
  },

  async update(id, userId, fields) {
    const existing = await this.findOwned(id, userId);
    if (!existing) return null;

    const nextTitle = fields.title !== undefined ? String(fields.title).trim() : existing.title;
    const nextDesc = fields.description !== undefined ? fields.description : existing.description;
    const nextDate = fields.date !== undefined ? fields.date : existing.date;
    const nextTime = fields.reminderTime !== undefined ? fields.reminderTime : existing.reminderTime;
    const nextTags = fields.tags !== undefined
      ? fields.tags.map((t) => String(t).trim()).filter(Boolean)
      : existing.tags;
    const nextPriority = fields.priority !== undefined ? fields.priority : existing.priority;

    const { rows } = await query(
      `UPDATE notes
       SET title = $1, description = $2, date = $3, reminder_time = $4,
           tags = $5, priority = $6, updated_at = NOW()
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [nextTitle, nextDesc, nextDate, nextTime, nextTags, nextPriority, id, userId]
    );
    return toNote(rows[0]);
  },

  async remove(id, userId) {
    const { rowCount } = await query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [id, userId]);
    return rowCount > 0;
  },

  async toggle(id, userId) {
    const { rows } = await query(
      `UPDATE notes
       SET completed = NOT completed, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return toNote(rows[0]);
  },
};

export default Note;
