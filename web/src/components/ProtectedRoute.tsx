import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { tokenStore } from '../api/client';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const user = useSelector((s: RootState) => s.auth.user);
  const status = useSelector((s: RootState) => s.auth.status);
  const hasToken = !!tokenStore.getAccess();
  if (!user && !hasToken) return <Navigate to="/login" replace />;
  if (!user && status === 'loading') return <p className="py-10 text-center text-sm">Checking session…</p>;
  if (!user && !hasToken) return <Navigate to="/login" replace />;
  return children;
}
