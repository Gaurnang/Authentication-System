import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isAdmin, user } = useAuth();

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Authentication system</h1>
      {isAuthenticated ? (
        <p className="mt-4 text-slate-700">
          Signed in as <span className="font-medium">{user?.username ?? user?.email}</span>
          {isAdmin ? (
            <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              Admin
            </span>
          ) : null}
          . Open{' '}
          <Link to="/profile" className="text-slate-900 underline">
            Profile
          </Link>
          {isAdmin ? (
            <>
              {' '}
              or{' '}
              <Link to="/users" className="text-slate-900 underline">
                Users
              </Link>
            </>
          ) : null}
          .
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create account
          </Link>
        </div>
      )}
    </div>
  );
}
