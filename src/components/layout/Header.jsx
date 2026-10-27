import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, Plus, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const PAGE_TITLES = {
  '/dashboard':  { title: 'Dashboard',    subtitle: 'Welcome back' },
  '/diary':      { title: 'My Diary',     subtitle: 'Your journal entries' },
  '/calendar':   { title: 'Calendar',     subtitle: 'Browse by date' },
  '/notes':      { title: 'Future Notes', subtitle: 'Plan ahead' },
  '/favorites':  { title: 'Favorites',    subtitle: 'Cherished entries' },
  '/search':     { title: 'Search',       subtitle: 'Find anything' },
  '/profile':    { title: 'Profile',      subtitle: 'Your account' },
  '/settings':   { title: 'Settings',     subtitle: 'Preferences' },
};

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Chronicle', subtitle: '' };

  // Today's date formatted
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <header className="app-header">
      {/* Mobile menu */}
      <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={onMenuClick} id="mobile-menu-btn">
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {pageInfo.title}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {pageInfo.subtitle} · {today}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search shortcut */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => navigate('/search')}
          title="Search"
          id="header-search-btn"
        >
          <Search size={18} />
        </button>

        {/* Write Entry */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/diary/new')}
          id="header-new-entry-btn"
          style={{ gap: '0.4rem' }}
        >
          <Plus size={15} />
          <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Write</span>
        </button>

        {/* Theme */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="theme-toggle-btn"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon relative" title="Notifications" id="notifications-btn">
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, background: 'var(--accent)',
            borderRadius: '50%', border: '2px solid var(--bg-surface)',
          }} />
        </button>

        {/* Avatar */}
        <div
          className="sidebar-avatar"
          style={{ width: 32, height: 32, fontSize: '0.72rem', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
          title="Profile"
        >
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
