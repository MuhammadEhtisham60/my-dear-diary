// ─── API Service Layer ─────────────────────────────────────────────────────
// Real HTTP calls to the Chronicle backend (see BACKEND_PLAN.md).
// Exported function names and return shapes match the previous mock layer.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, { method = 'GET', body, params } = {}) {
  const token = localStorage.getItem('chronicle_token');
  const qs = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null && v !== false)
      ).toString()
    : '';

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}${qs}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Please try again.');
  }

  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new Error(data?.message || 'Request failed.');
  return data;
}

// The backend user has no joinDate field; derive it from createdAt for the UI.
const normalizeUser = (u) => (u ? { ...u, joinDate: u.joinDate || (u.createdAt || '').split('T')[0] || null } : u);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  async login(email, password) {
    const { user, token } = await request('/auth/login', { method: 'POST', body: { email, password } });
    return { user: normalizeUser(user), token };
  },
  async signup(name, email, password) {
    const { user, token } = await request('/auth/signup', { method: 'POST', body: { name, email, password } });
    return { user: normalizeUser(user), token };
  },
  async forgotPassword(email) {
    return request('/auth/forgot-password', { method: 'POST', body: { email } });
  },
  async logout() {
    try { await request('/auth/logout', { method: 'POST' }); } catch { /* token is discarded client-side anyway */ }
    return true;
  },
};

// ── Entries ───────────────────────────────────────────────────────────────
export const entriesApi = {
  async getAll({ search = '', mood = '', tags = [], favorites = false, sort = 'newest', page = 1, limit = 12 } = {}) {
    return request('/entries', {
      params: { search, mood, tags: tags.join(','), favorites: favorites ? 'true' : '', sort, page, limit },
    });
  },

  async getById(id) {
    return (await request(`/entries/${id}`)).entry;
  },

  async create(data) {
    return (await request('/entries', { method: 'POST', body: data })).entry;
  },

  async update(id, data) {
    return (await request(`/entries/${id}`, { method: 'PUT', body: data })).entry;
  },

  async delete(id) {
    await request(`/entries/${id}`, { method: 'DELETE' });
    return true;
  },

  async toggleFavorite(id) {
    await request(`/entries/${id}/favorite`, { method: 'PATCH' });
    return entriesApi.getById(id); // callers expect the updated entry
  },

  async getByDate(date) {
    return request(`/entries/by-date/${date}`);
  },

  async getCalendarData(year, month) {
    return request('/entries/calendar', { params: { year, month } });
  },
};

// ── Notes ─────────────────────────────────────────────────────────────────
export const notesApi = {
  async getAll() {
    return request('/notes');
  },

  async create(data) {
    return (await request('/notes', { method: 'POST', body: data })).note;
  },

  async update(id, data) {
    return (await request(`/notes/${id}`, { method: 'PUT', body: data })).note;
  },

  async delete(id) {
    await request(`/notes/${id}`, { method: 'DELETE' });
    return true;
  },

  async toggleComplete(id) {
    return (await request(`/notes/${id}/toggle`, { method: 'PATCH' })).note;
  },
};

// ── User ─────────────────────────────────────────────────────────────────
export const userApi = {
  async getProfile() {
    return normalizeUser((await request('/users/profile')).user);
  },

  async updateProfile(data) {
    return normalizeUser((await request('/users/profile', { method: 'PUT', body: data })).user);
  },

  async changePassword(currentPassword, newPassword) {
    return request('/users/change-password', { method: 'PUT', body: { currentPassword, newPassword } });
  },

  async getStats() {
    return request('/users/stats');
  },
};
