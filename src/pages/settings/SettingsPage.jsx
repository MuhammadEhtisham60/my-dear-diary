import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Lock, LogOut, Shield, Bell, Palette, BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color="var(--accent)" />
          </div>
          <span className="section-title">{title}</span>
        </div>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, description, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [weekStart,   setWeekStart]   = useState('Monday');
  const [dateFormat,  setDateFormat]  = useState('MMM dd, yyyy');
  const [autoSave,    setAutoSave]    = useState(true);
  const [spellCheck,  setSpellCheck]  = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showLogout,  setShowLogout]  = useState(false);
  const [pwForm, setPwForm]           = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading]     = useState(false);
  const [pwSection, setPwSection]     = useState(false);

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.new) { toast.error('Please fill all password fields.'); return; }
    if (pwForm.new !== pwForm.confirm)   { toast.error('New passwords do not match.'); return; }
    if (pwForm.new.length < 6)           { toast.error('Password must be at least 6 characters.'); return; }
    setPwLoading(true);
    try {
      await userApi.changePassword(pwForm.current, pwForm.new);
      toast.success('Password changed successfully!');
      setPwForm({ current: '', new: '', confirm: '' });
      setPwSection(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out.');
    navigate('/login');
  };

  const THEME_OPTIONS = [
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your Chronicle experience</p>
      </div>

      {/* Appearance */}
      <SettingsSection title="Appearance" icon={Palette}>
        <SettingsRow label="Theme" description="Choose your preferred color scheme">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {THEME_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setTheme(o.value)}
                id={`theme-${o.value}-btn`}
                className={`btn btn-sm ${theme === o.value ? 'btn-primary' : 'btn-secondary'}`}
              >
                <o.icon size={14} /> {o.label}
              </button>
            ))}
          </div>
        </SettingsRow>
      </SettingsSection>

      {/* Diary Preferences */}
      <SettingsSection title="Diary Preferences" icon={BookOpen}>
        <SettingsRow label="Date Format" description="How dates are displayed throughout the app">
          <select className="form-select" value={dateFormat} onChange={e => setDateFormat(e.target.value)}
            id="settings-dateformat" style={{ width: 160 }}>
            {['MMM dd, yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </SettingsRow>

        <hr className="divider" style={{ margin: 0 }} />

        <SettingsRow label="Week Starting Day" description="First day shown in the calendar view">
          <select className="form-select" value={weekStart} onChange={e => setWeekStart(e.target.value)}
            id="settings-weekstart" style={{ width: 140 }}>
            {['Monday', 'Sunday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </SettingsRow>

        <hr className="divider" style={{ margin: 0 }} />

        <SettingsRow label="Auto-save Drafts" description="Automatically save entries as you write">
          <div
            className={`toggle ${autoSave ? 'on' : ''}`}
            onClick={() => setAutoSave(s => !s)}
            id="settings-autosave-toggle"
            style={{ cursor: 'pointer' }}
          />
        </SettingsRow>

        <hr className="divider" style={{ margin: 0 }} />

        <SettingsRow label="Spell Check" description="Highlight spelling errors in the editor">
          <div
            className={`toggle ${spellCheck ? 'on' : ''}`}
            onClick={() => setSpellCheck(s => !s)}
            id="settings-spellcheck-toggle"
            style={{ cursor: 'pointer' }}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" icon={Bell}>
        <SettingsRow label="Future Note Reminders" description="Get notified about upcoming notes and reminders">
          <div
            className={`toggle ${notifications ? 'on' : ''}`}
            onClick={() => setNotifications(s => !s)}
            id="settings-notifications-toggle"
            style={{ cursor: 'pointer' }}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account & Security" icon={Shield}>
        <SettingsRow label="Change Password" description="Update your account password">
          <button className="btn btn-secondary btn-sm" onClick={() => setPwSection(s => !s)} id="change-pw-btn">
            <Lock size={14} /> Change Password
          </button>
        </SettingsRow>

        {pwSection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            {[
              { label: 'Current Password', key: 'current', id: 'pw-current' },
              { label: 'New Password',     key: 'new',     id: 'pw-new' },
              { label: 'Confirm New Password', key: 'confirm', id: 'pw-confirm' },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                <input type="password" className="form-input" id={f.id}
                  value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPwSection(false)} id="pw-cancel-btn">Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleChangePassword} disabled={pwLoading} id="pw-save-btn">
                {pwLoading ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}

        <hr className="divider" style={{ margin: 0 }} />

        <SettingsRow label="Sign Out" description="Log out from all devices">
          <button className="btn btn-danger btn-sm" onClick={() => setShowLogout(true)} id="settings-logout-btn">
            <LogOut size={14} /> Sign Out
          </button>
        </SettingsRow>
      </SettingsSection>

      <ConfirmDialog
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        title="Sign out?"
        message="You will be logged out of your Chronicle account."
        confirmLabel="Sign Out"
        danger={false}
      />
    </div>
  );
}
