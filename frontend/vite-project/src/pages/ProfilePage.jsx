import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const created = user.createdAt ? new Date(user.createdAt).toLocaleString() : '—';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Your profile</h1>
      <p className="mt-1 text-sm text-slate-600">Loaded from <code className="text-slate-800">GET /api/auth/profile</code>.</p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Username</dt>
          <dd className="font-medium text-slate-900">{user.username}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium text-slate-900">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Role</dt>
          <dd className="font-medium text-slate-900 capitalize">{user.role ?? 'user'}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
          <dt className="text-slate-500">Verified</dt>
          <dd className="font-medium text-slate-900">{user.isVerified ? 'Yes' : 'No'}</dd>
        </div>
        <div className="flex justify-between gap-4 pb-2">
          <dt className="text-slate-500">Member since</dt>
          <dd className="text-slate-800">{created}</dd>
        </div>
      </dl>
    </div>
  );
}
