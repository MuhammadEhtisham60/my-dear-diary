import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Feather, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email.'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 440, padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'var(--terra-500)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Feather size={26} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Reset your password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sage-100)' }}>
            <CheckCircle size={40} color="var(--sage-500)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Check your email</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              We sent a password reset link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email address</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
              id="forgot-submit-btn" style={{ width: '100%' }}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
