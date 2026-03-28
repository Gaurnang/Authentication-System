import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          Authentication System
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Home
          </Link>
          <Link to="/users" className="text-slate-600 hover:text-slate-900">
            Users
          </Link>
          {isAuthenticated ? (
            <>
              <span className="hidden text-slate-500 sm:inline">
                {user?.username ?? user?.email}
              </span>
              <Link to="/profile" className="text-slate-600 hover:text-slate-900">
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-slate-800 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
