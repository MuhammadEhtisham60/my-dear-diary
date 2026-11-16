import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Mail, ArrowLeft, CheckCircle, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      toast.success(res.message || 'OTP sent to your email.');
      setOtp('');
      setStep('otp');
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      toast.success(res.message || 'A new OTP has been sent.');
      setOtp('');
      setResendCooldown(30);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyOtp(email.trim(), cleanOtp);
      toast.success('OTP verified. Set your new password.');
      setStep('reset');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email.trim(), otp.trim(), newPassword);
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subtitles = {
    email: "Enter your registered email and we'll send you a 6-digit OTP.",
    otp: `Enter the 6-digit OTP sent to ${email}.`,
    reset: 'Choose a strong new password for your account.',
    done: 'Your password has been updated.',
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
            {subtitles[step]}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="forgot-submit-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-otp">6-digit OTP</label>
              <div className="input-group">
                <KeyRound size={15} className="input-icon" />
                <input
                  id="forgot-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.3em', fontWeight: 600 }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="verify-otp-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStep('email')}
                disabled={loading}
              >
                Change email
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                style={{ color: 'var(--accent)' }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">New password</label>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  className="form-input has-right-icon"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="input-icon input-icon-right"
                  onClick={() => setShowNew((s) => !s)}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
              <div className="input-group">
                <Lock size={15} className="input-icon" />
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  className="form-input has-right-icon"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="input-icon input-icon-right"
                  onClick={() => setShowConfirm((s) => !s)}
                  style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id="reset-password-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Updating password...' : 'Set new password'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--sage-100)' }}>
            <CheckCircle size={40} color="var(--sage-500)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Password reset complete</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              You can now sign in to Chronicle with your new password.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              Go to sign in
            </button>
          </div>
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
