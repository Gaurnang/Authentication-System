import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/users');
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function changeRole(userId, newRole) {
    setUpdatingId(userId);
    try {
      const { data } = await api.patch(`/auth/users/${userId}/role`, { role: newRole });
      if (data.success) {
        toast.success('Role updated.');
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
        const selfId = currentUser?._id ?? currentUser?.id;
        if (selfId && String(selfId) === String(userId)) {
          await refreshUser();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update role.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUserHandler(userId, username) {
    const selfId = currentUser?._id ?? currentUser?.id;
    if (selfId && String(selfId) === String(userId)) {
      toast.error('Cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${username}? This action cannot be undone.`)) {
      return;
    }

    setUpdatingId(userId);
    try {
      const { data } = await api.delete(`/auth/users/${userId}`);
      if (data.success) {
        toast.success('User deleted successfully');
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
        Loading users…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">User management</h1>
      <p className="mt-1 text-sm text-slate-600">
        Admins only. Change a user&apos;s role or delete user accounts.
      </p>
      {users.length === 0 ? (
        <p className="mt-6 text-slate-600">No users yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {users.map((u) => (
            <li
              key={u._id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-900">{u.username}</div>
                <div className="truncate text-sm text-slate-600">{u.email}</div>
                <div className="mt-1 text-xs text-slate-500">{u.isVerified ? 'Verified' : 'Unverified'}</div>
              </div>
              <div className="flex items-center gap-2">
                {/* <label htmlFor={`role-${u._id}`} className="sr-only">
                  Role for {u.username}
                </label> */}
                <select
                  id={`role-${u._id}`}
                  value={u.role ?? 'user'}
                  disabled={updatingId === u._id}
                  onChange={(e) => changeRole(u._id, e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:opacity-50"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => deleteUserHandler(u._id, u.username)}
                  disabled={updatingId === u._id}
                  className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
