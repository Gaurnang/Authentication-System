import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailHint = location.state?.emailHint;
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/email-verification', { otp });
      if (data.success) {
        toast.success(data.message || 'Email verified.');
        navigate('/login');
      }
    } 
    catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.';
      toast.error(msg);
    } 
    finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Verify email</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter the 6-digit code sent to your inbox
        {emailHint ? (
          <>
            {' '}
            (<span className="font-mono text-slate-800">{emailHint}</span>)
          </>
        ) : null}
        .
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
            OTP
          </label>
          <input
            id="otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-lg tracking-widest text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {submitting ? 'Verifying…' : 'Verify'}
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
