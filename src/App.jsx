import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Public Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Auth Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import MyDiaryPage from './pages/diary/MyDiaryPage';
import DiaryDetailPage from './pages/diary/DiaryDetailPage';
import CreateEntryPage from './pages/diary/CreateEntryPage';
import EditEntryPage from './pages/diary/EditEntryPage';
import CalendarPage from './pages/calendar/CalendarPage';
import FutureNotesPage from './pages/notes/FutureNotesPage';
import FavoritesPage from './pages/favorites/FavoritesPage';
import SearchPage from './pages/search/SearchPage';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid var(--border-default)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading Chronicle...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Protected — App Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/diary"           element={<MyDiaryPage />} />
        <Route path="/diary/new"       element={<CreateEntryPage />} />
        <Route path="/diary/:id"       element={<DiaryDetailPage />} />
        <Route path="/diary/:id/edit"  element={<EditEntryPage />} />
        <Route path="/calendar"        element={<CalendarPage />} />
        <Route path="/notes"           element={<FutureNotesPage />} />
        <Route path="/favorites"       element={<FavoritesPage />} />
        <Route path="/search"          element={<SearchPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/settings"        element={<SettingsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
