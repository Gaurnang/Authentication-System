import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();

  const resetToken = searchParams.get('token');
  const isResetMode = useMemo(() => Boolean(resetToken), [resetToken]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data?.success) {
        setUser(data.user ?? null);
        toast.success(data.message || 'Login successful.');
        navigate('/profile');
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Login failed.';

      if (status === 403) {
        toast.error(msg);
        navigate('/verify-email', { state: { emailHint: email } });
        return;
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post(`/auth/reset-password/${encodeURIComponent(resetToken)}`, {
        password: newPassword,
        confirmPassword,
      });

      if (data?.success) {
        toast.success(data.message || 'Password reset successful. Please log in.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (isResetMode) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Set new password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your reset token is attached to this URL. Enter and confirm a new password.
        </p>

        <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {submitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link to="/login" className="font-medium text-slate-900 underline">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Log in</h1>
      <p className="mt-1 text-sm text-slate-600">Sign in with your email and password.</p>

      <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-slate-900 underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Do not have an account?{' '}
        <Link to="/signup" className="font-medium text-slate-900 underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
