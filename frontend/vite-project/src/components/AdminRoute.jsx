import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      toast.error('Admin access required.');
    }
  }, [loading, isAuthenticated, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
