import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

export function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    bio: row.bio ?? '',
    avatar: row.avatar ?? null,
    timezone: row.timezone ?? 'America/New_York',
    dateFormat: row.date_format ?? 'MMM dd, yyyy',
    weekStart: row.week_start ?? 'Monday',
    theme: row.theme ?? 'light',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toUserWithSecrets(row) {
  if (!row) return null;
  return {
    ...toUser(row),
    password: row.password,
    resetOtpHash: row.reset_otp_hash,
    resetOtpExpires: row.reset_otp_expires ? new Date(row.reset_otp_expires) : null,
    resetOtpAttempts: row.reset_otp_attempts ?? 0,
  };
}

const User = {
  async findById(id, { withSecrets = false } = {}) {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return withSecrets ? toUserWithSecrets(rows[0]) : toUser(rows[0]);
  },

  async findByEmail(email, { withSecrets = false } = {}) {
    const clean = String(email).toLowerCase().trim();
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [clean]);
    return withSecrets ? toUserWithSecrets(rows[0]) : toUser(rows[0]);
  },

  async create({
    name,
    email,
    password,
    bio = '',
    avatar = null,
    timezone = 'America/New_York',
    dateFormat = 'MMM dd, yyyy',
    weekStart = 'Monday',
    theme = 'light',
  }) {
    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (name, email, password, bio, avatar, timezone, date_format, week_start, theme)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), hashed, bio, avatar, timezone, dateFormat, weekStart, theme]
    );
    return toUser(rows[0]);
  },

  async updateProfile(id, fields) {
    const columnMap = {
      name: 'name',
      bio: 'bio',
      avatar: 'avatar',
      timezone: 'timezone',
      dateFormat: 'date_format',
      weekStart: 'week_start',
      theme: 'theme',
    };
    const sets = [];
    const values = [];
    let idx = 1;

    for (const [key, col] of Object.entries(columnMap)) {
      if (fields[key] !== undefined) {
        sets.push(`${col} = $${idx++}`);
        values.push(key === 'name' ? String(fields[key]).trim() : fields[key]);
      }
    }

    if (!sets.length) return this.findById(id);
    sets.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return toUser(rows[0]);
  },

  async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE users
       SET password = $1,
           reset_otp_hash = NULL,
           reset_otp_expires = NULL,
           reset_otp_attempts = 0,
           updated_at = NOW()
       WHERE id = $2`,
      [hashed, id]
    );
  },

  async setResetOtp(id, { hash, expires }) {
    await query(
      `UPDATE users
       SET reset_otp_hash = $1,
           reset_otp_expires = $2,
           reset_otp_attempts = 0,
           updated_at = NOW()
       WHERE id = $3`,
      [hash, expires, id]
    );
  },

  async incrementResetOtpAttempts(id, maxAttempts = 5) {
    await query(
      `UPDATE users
       SET reset_otp_attempts = reset_otp_attempts + 1,
           reset_otp_hash = CASE WHEN reset_otp_attempts + 1 >= $1 THEN NULL ELSE reset_otp_hash END,
           reset_otp_expires = CASE WHEN reset_otp_attempts + 1 >= $1 THEN NULL ELSE reset_otp_expires END,
           updated_at = NOW()
       WHERE id = $2`,
      [maxAttempts, id]
    );
  },

  async clearResetOtp(id) {
    await query(
      `UPDATE users
       SET reset_otp_hash = NULL,
           reset_otp_expires = NULL,
           reset_otp_attempts = 0,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  },

  comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  },
};

export default User;
