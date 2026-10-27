import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Feather, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login }  = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--terra-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Feather size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--cream-100)', fontWeight: 600 }}>Chronicle</span>
          </div>

          <p className="auth-quote">"The act of writing is the act of discovering what you believe."</p>
          <p style={{ color: 'var(--cream-400)', fontSize: '0.85rem', marginBottom: '2rem' }}>— David Hare</p>

          <div className="auth-features">
            {[
              { emoji: '🔒', text: 'End-to-end encrypted — only you can read your entries' },
              { emoji: '📅', text: 'Calendar view to revisit any day in your life' },
              { emoji: '🎯', text: 'Mood tracking and tag organization built in' },
              { emoji: '📝', text: 'Distraction-free writing experience' },
            ].map(f => (
              <div key={f.text} className="auth-feature">
                <div className="auth-feature-icon">{f.emoji}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Feather size={20} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700 }}>Chronicle</div>
            </div>
          </div>

          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Welcome back</h1>
          <p className="auth-tagline">Sign in to continue your journaling journey.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email address</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email')(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>Forgot password?</Link>
              </div>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  className="form-input has-right-icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password')(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="input-icon input-icon-right"
                  onClick={() => setShow(!show)}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  id="toggle-password"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="login-submit-btn"
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {loading ? 'Signing in...' : 'Sign in to Chronicle'}
            </button>
          </form>

          {/* Demo shortcut */}
          <div style={{
            marginTop: '1rem',
            padding: '0.875rem',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--terra-200)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <strong style={{ color: 'var(--accent)' }}>Demo:</strong> Use any email + any password to explore the app.
          </div>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
