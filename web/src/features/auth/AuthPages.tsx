import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { login, register } from '../../store/authSlice';

export function LoginPage() {
  const [email, setEmail] = useState('admin@taskflow.local');
  const [password, setPassword] = useState('Admin123!');
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();
  const { status, error } = useSelector((s: RootState) => s.auth);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await dispatch(login({ email, password }));
    if (login.fulfilled.match(r)) nav('/');
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="text-xl font-semibold">Login</h1>
      <form onSubmit={submit} className="mt-4 space-y-3" aria-label="Login form">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-3 text-sm">No account? <Link to="/register" className="underline">Register</Link></p>
    </div>
  );
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const nav = useNavigate();
  const { status, error } = useSelector((s: RootState) => s.auth);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await dispatch(register({ name, email, password }));
    if (register.fulfilled.match(r)) nav('/');
  };

  return (
    <div className="mx-auto max-w-md card">
      <h1 className="text-xl font-semibold">Register</h1>
      <form onSubmit={submit} className="mt-4 space-y-3" aria-label="Register form">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password (min 8 chars)</label>
          <input id="password" className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-3 text-sm">Have an account? <Link to="/login" className="underline">Login</Link></p>
    </div>
  );
}
