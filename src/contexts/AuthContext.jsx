import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('chronicle_token');
    const saved  = localStorage.getItem('chronicle_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: u, token } = await authApi.login(email, password);
    setUser(u);
    localStorage.setItem('chronicle_token', token);
    localStorage.setItem('chronicle_user', JSON.stringify(u));
    return u;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const { user: u, token } = await authApi.signup(name, email, password);
    setUser(u);
    localStorage.setItem('chronicle_token', token);
    localStorage.setItem('chronicle_user', JSON.stringify(u));
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem('chronicle_token');
    localStorage.removeItem('chronicle_user');
  }, []);

  const updateUser = useCallback((data) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      localStorage.setItem('chronicle_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
