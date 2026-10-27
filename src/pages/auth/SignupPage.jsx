import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Feather, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function SignupPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signup } = useAuth();
  const toast      = useToast();
  const navigate   = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name    = 'Name is required';
    if (!form.email)         e.email   = 'Email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Chronicle.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ width: 40, height: 40, background: 'var(--terra-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Feather size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--cream-100)', fontWeight: 600 }}>Chronicle</span>
          </div>
          <p className="auth-quote">"I write entirely to find out what I'm thinking."</p>
          <p style={{ color: 'var(--cream-400)', fontSize: '0.85rem', marginBottom: '2.5rem' }}>— Joan Didion</p>
          <div className="auth-features">
            {[
              { emoji: '✨', text: 'Start your journaling journey today, completely free' },
              { emoji: '🌙', text: 'Write daily and build a meaningful habit' },
              { emoji: '📊', text: 'Track your moods and discover emotional patterns' },
              { emoji: '🗓️', text: 'Future notes to plan your life with intention' },
            ].map(f => (
              <div key={f.text} className="auth-feature">
                <div className="auth-feature-icon">{f.emoji}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Feather size={20} color="white" /></div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700 }}>Chronicle</div>
          </div>

          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Create your journal</h1>
          <p className="auth-tagline">Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full name</label>
              <div className="input-group">
                <User size={15} className="input-icon" />
                <input id="signup-name" type="text" className="form-input" placeholder="Your name"
                  value={form.name} onChange={e => set('name')(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email address</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input id="signup-email" type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email')(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input id="signup-password" type={show ? 'text' : 'password'} className="form-input has-right-icon"
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={e => set('password')(e.target.value)} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                <button type="button" className="input-icon input-icon-right"
                  onClick={() => setShow(!show)} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input id="signup-confirm" type={show ? 'text' : 'password'} className="form-input"
                  placeholder="Repeat your password" value={form.confirm}
                  onChange={e => set('confirm')(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              id="signup-submit-btn" style={{ width: '100%', marginTop: '0.25rem' }}>
              {loading ? 'Creating account...' : 'Create my free journal'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
