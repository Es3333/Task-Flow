import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { logout } from '../store/authSlice';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();

  const onLogout = async () => {
    await dispatch(logout());
    nav('/login');
  };

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold">
            TaskFlow
          </Link>
          <nav className="flex items-center gap-4 text-sm" aria-label="Main">
            {user ? (
              <>
                <Link to="/" className="hover:underline">Dashboard</Link>
                <Link to="/projects" className="hover:underline">Projects</Link>
                <span className="text-slate-500">{user.name} ({user.role})</span>
                <button onClick={onLogout} className="btn-secondary !px-3 !py-1">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/register" className="hover:underline">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
