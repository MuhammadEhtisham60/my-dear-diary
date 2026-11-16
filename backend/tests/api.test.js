// End-to-end API test. Run after setting the real password in .env:  npm test
import 'dotenv/config';
import mongoose from 'mongoose';
import http from 'node:http';
import crypto from 'node:crypto';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Entry from '../src/models/Entry.js';
import Note from '../src/models/Note.js';

let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
};

const email = `test_${Date.now()}@chronicle.test`;
let base, token;

async function api(method, path, body, tok = token) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0];

async function run() {
  await connectDB();
  const server = http.createServer(app).listen(0);
  base = `http://localhost:${server.address().port}/api`;

  try {
    console.log('\nAUTH');
    let r = await api('POST', '/auth/signup', { name: 'Test', email });
    ok(r.status === 400, 'signup missing fields → 400');
    r = await api('POST', '/auth/signup', { name: 'Test', email: 'bad', password: 'secret1' });
    ok(r.status === 400, 'signup invalid email → 400');
    r = await api('POST', '/auth/signup', { name: 'Test', email, password: 'secret1' });
    ok(r.status === 201 && r.data.token && r.data.user.email === email, 'signup success → 201 {user, token}');
    ok(!('password' in r.data.user), 'password not returned');
    token = r.data.token;
    const stored = await User.findOne({ email }).select('+password');
    ok(stored.password !== 'secret1' && stored.password.startsWith('$2'), 'password stored hashed');
    r = await api('POST', '/auth/signup', { name: 'Test', email, password: 'secret1' });
    ok(r.status === 409, 'duplicate signup → 409');
    r = await api('POST', '/auth/login', { email, password: 'wrong' });
    ok(r.status === 401, 'login wrong password → 401');
    r = await api('POST', '/auth/login', { email: 'nobody@x.com', password: 'secret1' });
    ok(r.status === 401, 'login unknown user → 401');
    r = await api('POST', '/auth/login', { email });
    ok(r.status === 400, 'login missing password → 400');
    r = await api('POST', '/auth/login', { email, password: 'secret1' });
    ok(r.status === 200 && r.data.token, 'login success');
    token = r.data.token;
    r = await api('GET', '/auth/me');
    ok(r.status === 200 && r.data.user.email === email, 'GET /auth/me');
    r = await api('GET', '/auth/me', null, 'garbage');
    ok(r.status === 401, 'invalid token → 401');
    r = await api('GET', '/entries', null, '');
    ok(r.status === 401, 'no token → 401');
    r = await api('POST', '/auth/forgot-password', { email });
    ok(r.status === 200 && r.data.message, 'forgot-password');
    const otpUser = await User.findOne({ email }).select('+resetOtpHash +resetOtpExpires');
    ok(Boolean(otpUser.resetOtpHash && otpUser.resetOtpExpires), 'forgot-password stores hashed OTP');
    const knownOtp = '123456';
    otpUser.resetOtpHash = crypto.createHash('sha256').update(knownOtp).digest('hex');
    await otpUser.save();
    r = await api('POST', '/auth/verify-otp', { email, otp: '000000' });
    ok(r.status === 400, 'verify-otp wrong code → 400');
    r = await api('POST', '/auth/verify-otp', { email, otp: knownOtp });
    ok(r.status === 200 && r.data.valid === true, 'verify-otp valid code → 200');
    r = await api('POST', '/auth/reset-password', { email, otp: knownOtp, newPassword: 'resetpass1' });
    ok(r.status === 200 && r.data.message, 'reset-password → 200');
    r = await api('POST', '/auth/login', { email, password: 'resetpass1' });
    ok(r.status === 200 && r.data.token, 'login with reset password');
    token = r.data.token;
    r = await api('PUT', '/users/change-password', { currentPassword: 'resetpass1', newPassword: 'secret1' });
    ok(r.status === 200, 'restore test password');
    r = await api('POST', '/auth/logout');
    ok(r.status === 200 && r.data.success === true, 'logout');

    console.log('\nENTRIES');
    r = await api('POST', '/entries', { content: 'x', date: today });
    ok(r.status === 400, 'create without title → 400');
    r = await api('POST', '/entries', { title: 'T', date: '2026/01/01' });
    ok(r.status === 400, 'create bad date → 400');
    r = await api('POST', '/entries', { title: 'T', date: today, mood: 'bogus' });
    ok(r.status === 400, 'create bad mood → 400');
    r = await api('POST', '/entries', { title: 'First', content: 'one two three four', date: today, mood: 'happy', tags: ['Work', 'Ideas'] });
    const e1 = r.data.entry;
    ok(r.status === 201 && e1.id && e1.wordCount === 4 && e1.isFavorite === false && e1.isDraft === false, 'create entry (wordCount=4, defaults)');
    r = await api('POST', '/entries', { title: 'Second', content: 'alpha beta', date: yesterday, mood: 'calm', tags: ['Work'], isFavorite: true });
    const e2 = r.data.entry;
    ok(r.status === 201 && e2.isFavorite === true, 'create 2nd entry (favorite)');
    r = await api('GET', `/entries/${e1.id}`);
    ok(r.status === 200 && r.data.entry.title === 'First', 'get by id');
    r = await api('GET', '/entries/64b000000000000000000000');
    ok(r.status === 404, 'get missing → 404');
    r = await api('GET', '/entries/not-an-id');
    ok(r.status === 400, 'get malformed id → 400');
    r = await api('PUT', `/entries/${e1.id}`, { content: 'one two three four five six', title: 'First edited' });
    ok(r.status === 200 && r.data.entry.wordCount === 6 && r.data.entry.title === 'First edited', 'update recomputes wordCount');
    r = await api('GET', '/entries?sort=oldest');
    ok(r.data.total === 2 && r.data.page === 1 && r.data.totalPages === 1 && r.data.entries[0].id === e2.id, 'list oldest + pagination shape');
    r = await api('GET', '/entries?sort=newest');
    ok(r.data.entries[0].id === e1.id, 'list newest');
    r = await api('GET', '/entries?sort=alpha');
    ok(r.data.entries[0].title === 'First edited', 'list alpha');
    r = await api('GET', '/entries?search=beta');
    ok(r.data.total === 1 && r.data.entries[0].id === e2.id, 'search content');
    r = await api('GET', '/entries?search=ideas');
    ok(r.data.total === 1, 'search tags');
    r = await api('GET', '/entries?mood=calm');
    ok(r.data.total === 1, 'filter mood');
    r = await api('GET', '/entries?tags=Work,Ideas');
    ok(r.data.total === 1 && r.data.entries[0].id === e1.id, 'filter tags ($all)');
    r = await api('GET', '/entries?favorites=true');
    ok(r.data.total === 1 && r.data.entries[0].id === e2.id, 'filter favorites');
    r = await api('GET', '/entries?limit=1&page=2&sort=newest');
    ok(r.data.entries.length === 1 && r.data.totalPages === 2, 'pagination page 2');
    r = await api('PATCH', `/entries/${e1.id}/favorite`);
    ok(r.status === 200 && r.data.isFavorite === true && r.data.id === e1.id, 'toggle favorite');
    r = await api('GET', `/entries/by-date/${today}`);
    ok(Array.isArray(r.data) && r.data.length === 1, 'by-date');
    const [y, m] = today.split('-');
    r = await api('GET', `/entries/calendar?year=${y}&month=${Number(m)}`);
    ok(Array.isArray(r.data) && r.data.includes(today), 'calendar dates');
    r = await api('GET', '/entries/calendar?year=2026&month=13');
    ok(r.status === 400, 'calendar invalid month → 400');

    console.log('\nAUTHORIZATION (second user)');
    const email2 = `test2_${Date.now()}@chronicle.test`;
    r = await api('POST', '/auth/signup', { name: 'Other', email: email2, password: 'secret2' }, '');
    const token2 = r.data.token;
    r = await api('GET', `/entries/${e1.id}`, null, token2);
    ok(r.status === 404, "other user can't read my entry");
    r = await api('DELETE', `/entries/${e1.id}`, null, token2);
    ok(r.status === 404, "other user can't delete my entry");
    r = await api('GET', '/entries', null, token2);
    ok(r.data.total === 0, 'other user sees none');

    console.log('\nNOTES');
    r = await api('POST', '/notes', { description: 'x', date: today });
    ok(r.status === 400, 'note without title → 400');
    r = await api('POST', '/notes', { title: 'N', date: today, reminderTime: '25:00' });
    ok(r.status === 400, 'note bad reminderTime → 400');
    r = await api('POST', '/notes', { title: 'Late', date: '2030-01-02', reminderTime: '10:00', tags: ['Work'], priority: 'high' });
    const n1 = r.data.note;
    ok(r.status === 201 && n1.completed === false && n1.priority === 'high', 'create note');
    r = await api('POST', '/notes', { title: 'Early', date: '2030-01-01' });
    const n2 = r.data.note;
    ok(n2.reminderTime === '09:00' && n2.priority === 'medium', 'note defaults');
    r = await api('GET', '/notes');
    ok(r.data.length === 2 && r.data[0].id === n2.id, 'list notes sorted by date');
    r = await api('PUT', `/notes/${n1.id}`, { title: 'Late edited' });
    ok(r.status === 200 && r.data.note.title === 'Late edited', 'update note');
    r = await api('PATCH', `/notes/${n1.id}/toggle`);
    ok(r.data.note.completed === true, 'toggle note');
    r = await api('DELETE', `/notes/${n2.id}`);
    ok(r.data.success === true, 'delete note');
    r = await api('PUT', `/notes/${n1.id}`, { title: 'hack' }, token2);
    ok(r.status === 404, "other user can't edit my note");

    console.log('\nUSERS');
    r = await api('GET', '/users/profile');
    ok(r.status === 200 && r.data.user.timezone && r.data.user.theme === 'light', 'get profile');
    r = await api('PUT', '/users/profile', { theme: 'neon' });
    ok(r.status === 400, 'invalid theme → 400');
    r = await api('PUT', '/users/profile', { bio: 'hello', theme: 'dark', weekStart: 'Sunday' });
    ok(r.status === 200 && r.data.user.bio === 'hello' && r.data.user.theme === 'dark', 'update profile');
    r = await api('GET', '/users/stats');
    const s = r.data;
    ok(s.totalEntries === 2 && s.favorites === 2 && s.currentStreak === 2 && s.longestStreak === 2 && s.totalWords === 8 && s.moodBreakdown.happy === 1 && s.moodBreakdown.calm === 1,
      'stats', JSON.stringify(s));
    r = await api('PUT', '/users/change-password', { currentPassword: 'wrong', newPassword: 'newsecret' });
    ok(r.status === 401, 'change password wrong current → 401');
    r = await api('PUT', '/users/change-password', { currentPassword: 'secret1', newPassword: 'newsecret' });
    ok(r.status === 200, 'change password');
    r = await api('POST', '/auth/login', { email, password: 'newsecret' }, '');
    ok(r.status === 200, 'login with new password');

    console.log('\nDELETE');
    r = await api('DELETE', `/entries/${e1.id}`);
    ok(r.data.success === true, 'delete entry');
    r = await api('GET', `/entries/${e1.id}`);
    ok(r.status === 404, 'deleted entry gone');
    r = await api('GET', '/nope');
    ok(r.status === 404, 'unknown route → 404');
  } finally {
    const users = await User.find({ email: /@chronicle\.test$/ });
    const ids = users.map((u) => u._id);
    await Entry.deleteMany({ userId: { $in: ids } });
    await Note.deleteMany({ userId: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    server.close();
    await mongoose.disconnect();
  }
  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

run().catch((e) => { console.error('Test run crashed:', e); process.exit(1); });
