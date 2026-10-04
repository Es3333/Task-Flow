import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import { fetchProjects, createProject } from '../../store/projectsSlice';
import { Loading, Empty, ErrorState } from '../../components/ui';

export default function ProjectsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, status, error } = useSelector((s: RootState) => s.projects);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProjects({}));
  }, [dispatch]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await dispatch(createProject({ name: name.trim() }));
    setName('');
  };

  if (status === 'loading' && items.length === 0) return <Loading label="Loading projects…" />;
  if (status === 'failed') return <ErrorState message={error ?? 'Failed'} onRetry={() => dispatch(fetchProjects({}))} />;

  const filtered = search ? items.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Projects</h1>
      <form onSubmit={submit} className="card flex gap-2" aria-label="Create project">
        <input aria-label="Project name" className="input" placeholder="New project name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary whitespace-nowrap" type="submit">Create</button>
      </form>
      <input aria-label="Search projects" className="input max-w-sm" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.length === 0 ? (
        <div className="card"><Empty title="No projects" hint="Create your first project above." /></div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id} className="card">
              <Link to={`/projects/${p.id}`} className="text-lg font-semibold hover:underline">{p.name}</Link>
              {p.description && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}
              <p className="mt-2 text-xs text-slate-500">{p._count?.tasks ?? 0} tasks · {p._count?.members ?? 0} members</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
