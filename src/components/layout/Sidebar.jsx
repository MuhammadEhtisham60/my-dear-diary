import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, Calendar, StickyNote, Heart,
  Search, User, Settings, LogOut, Feather, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
      { to: '/diary',       label: 'My Diary',     icon: BookOpen,  badge: null },
      { to: '/calendar',    label: 'Calendar',     icon: Calendar },
      { to: '/notes',       label: 'Future Notes', icon: StickyNote },
      { to: '/favorites',   label: 'Favorites',    icon: Heart },
      { to: '/search',      label: 'Search',       icon: Search },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',  label: 'Profile',  icon: User },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />
      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Feather size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">Chronicle</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(({ to, label, icon: Icon, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={17} className="nav-icon" />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge != null && <span className="nav-badge">{badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / User */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => { navigate('/profile'); onClose?.(); }}>
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">Personal Journal</div>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--sidebar-muted)', flexShrink: 0 }} />
          </div>
          <button
            className="nav-item"
            onClick={handleLogout}
            style={{ marginTop: '0.25rem', color: 'var(--terra-300)', width: '100%' }}
          >
            <LogOut size={17} className="nav-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
