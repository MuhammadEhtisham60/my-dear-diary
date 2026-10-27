import { useState, useEffect } from 'react';
import { Camera, Edit2, Check, X, MapPin, Clock, Mail, User, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney', 'Asia/Karachi'];
const DATE_FORMATS = ['MMM dd, yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [stats, setStats]     = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    name: '', email: '', bio: '', timezone: 'America/New_York', dateFormat: 'MMM dd, yyyy',
  });
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    userApi.getProfile().then(p => {
      setForm({
        name: p.name || '',
        email: p.email || '',
        bio: p.bio || '',
        timezone: p.timezone || 'America/New_York',
        dateFormat: p.dateFormat || 'MMM dd, yyyy',
      });
    });
    userApi.getStats().then(setStats);
  }, []);

  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const updated = await userApi.updateProfile(form);
      updateUser(updated);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const joinDate = user?.joinDate
    ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Profile Card */}
      <div className="card">
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 88, height: 88,
              borderRadius: '50%',
              background: 'var(--terra-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, color: 'white',
              border: '4px solid var(--bg-surface)',
              boxShadow: 'var(--shadow-md)',
            }}>
              {initials}
            </div>
            <button
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28,
                borderRadius: '50%',
                background: 'var(--accent)',
                border: '2px solid var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
              }}
              title="Change photo"
              id="change-avatar-btn"
            >
              <Camera size={13} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{form.name || 'Your Name'}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{form.email}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                  Member since {joinDate}
                </p>
              </div>
              {!editing ? (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} id="edit-profile-btn">
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} id="cancel-edit-btn">
                    <X size={14} /> Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} id="save-profile-btn">
                    <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {form.bio && !editing && (
              <p style={{ marginTop: '0.875rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, fontStyle: 'italic' }}>
                "{form.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div style={{ padding: '0 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <hr className="divider" style={{ margin: '0 0 0.5rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-group">
                  <User size={15} className="input-icon" />
                  <input type="text" className="form-input" value={form.name} onChange={e => set('name')(e.target.value)}
                    id="profile-name-input" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <Mail size={15} className="input-icon" />
                  <input type="email" className="form-input" value={form.email} onChange={e => set('email')(e.target.value)}
                    id="profile-email-input" style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <div className="input-group">
                <FileText size={15} className="input-icon" style={{ top: 14 }} />
                <textarea className="form-textarea" rows={3} value={form.bio} onChange={e => set('bio')(e.target.value)}
                  id="profile-bio-input" placeholder="A little about yourself..." style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <div className="input-group">
                  <Clock size={15} className="input-icon" />
                  <select className="form-select" value={form.timezone} onChange={e => set('timezone')(e.target.value)}
                    id="profile-timezone" style={{ paddingLeft: '2.5rem' }}>
                    {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select className="form-select" value={form.dateFormat} onChange={e => set('dateFormat')(e.target.value)} id="profile-dateformat">
                  {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Entries',   value: stats?.totalEntries || 0,  icon: '📔' },
          { label: 'Total Words',     value: stats?.totalWords?.toLocaleString() || 0, icon: '✍️' },
          { label: 'Favorites',       value: stats?.favorites || 0, icon: '❤️' },
          { label: 'Current Streak',  value: `${stats?.currentStreak || 0} days`, icon: '🔥' },
          { label: 'Longest Streak',  value: `${stats?.longestStreak || 0} days`, icon: '🏆' },
          { label: 'Avg. Words',      value: stats?.avgWordsPerEntry || 0, icon: '📊' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top Tags */}
      {stats?.topTags && (
        <div className="card">
          <div className="card-header"><div className="section-title">Most Used Tags</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {stats.topTags.map((tag, i) => (
                <span key={tag} className="tag" style={{
                  fontSize: `${0.85 - i * 0.05}rem`,
                  padding: `${0.3 - i * 0.02}rem ${0.75 - i * 0.05}rem`,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
