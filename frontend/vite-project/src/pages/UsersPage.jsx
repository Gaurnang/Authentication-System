import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/users');
        if (data.success && Array.isArray(data.users) && !cancelled) {
          setUsers(data.users);
        }
      } catch {
        if (!cancelled) toast.error('Could not load users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        Loading users…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Registered users</h1>
      {users.length === 0 ? (
        <p className="mt-6 text-slate-600">No users yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u._id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-slate-900">{u.username}</span>
              <span className="text-sm text-slate-600">{u.email}</span>
              <span className="text-xs text-slate-500">{u.isVerified ? 'Verified' : 'Unverified'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
