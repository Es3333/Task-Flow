import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { api, apiErrorMessage } from '../../api/client';
import type { AppDispatch, RootState } from '../../store';
import { fetchTasks, createTask, updateTask, deleteTask } from '../../store/tasksSlice';
import type { Project, TaskStatus } from '../../types';
import { Loading, Empty, ErrorState, StatusBadge, PriorityBadge } from '../../components/ui';

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function ProjectDetailPage() {
  const { id = '' } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((s: RootState) => s.tasks);
  const [project, setProject] = useState<Project | null>(null);
  const [pStatus, setPStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [title, setTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sort, setSort] = useState('position');
  const [memberEmail, setMemberEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPStatus('loading');
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      setPStatus('ok');
    } catch {
      setPStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
    dispatch(fetchTasks({ projectId: id }));
  }, [dispatch, id, load]);

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await dispatch(createTask({ projectId: id, title: title.trim() }));
    setTitle('');
  };

  const onDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/task-id');
    if (!taskId) return;
    await dispatch(updateTask({ id: taskId, patch: { status } as never }));
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setMsg('Member added');
      load();
    } catch (err) {
      setMsg(apiErrorMessage(err));
    }
  };

  if (pStatus === 'loading') return <Loading label="Loading project…" />;
  if (pStatus === 'error' || !project) return <ErrorState message="Project not found or access denied" onRetry={load} />;

  const visible = tasks.items.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });
  const sorted = [...visible].sort((a, b) => {
    if (sort === 'dueDate') return String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? ''));
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'priority') return a.priority.localeCompare(b.priority);
    return a.position - b.position;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      {project.description && <p className="text-sm text-slate-600">{project.description}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button className={view === 'kanban' ? 'btn-primary' : 'btn-secondary'} onClick={() => setView('kanban')}>Kanban</button>
        <button className={view === 'list' ? 'btn-primary' : 'btn-secondary'} onClick={() => setView('list')}>List</button>
        <select aria-label="Filter by status" className="input max-w-[180px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
        <select aria-label="Sort tasks" className="input max-w-[180px]" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="position">Sort: position</option>
          <option value="dueDate">Sort: due date</option>
          <option value="title">Sort: title</option>
          <option value="priority">Sort: priority</option>
        </select>
      </div>

      <form onSubmit={submitTask} className="card flex gap-2" aria-label="Create task">
        <input aria-label="Task title" className="input" placeholder="New task title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn-primary whitespace-nowrap" type="submit">Add task</button>
      </form>

      {tasks.status === 'loading' ? (
        <Loading label="Loading tasks…" />
      ) : tasks.status === 'failed' ? (
        <ErrorState message={tasks.error ?? 'Failed'} onRetry={() => dispatch(fetchTasks({ projectId: id }))} />
      ) : sorted.length === 0 ? (
        <div className="card"><Empty title="No tasks" hint="Add tasks to fill your board." /></div>
      ) : view === 'kanban' ? (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div
              key={col}
              className="card min-h-[200px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col)}
              aria-label={`${col} column`}
            >
              <h2 className="font-semibold">{col}</h2>
              <ul className="mt-2 space-y-2">
                {sorted.filter((t) => t.status === col).map((t) => (
                  <li
                    key={t.id}
                    className="rounded-lg border p-2 bg-slate-50"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/task-id', t.id)}
                  >
                    <p className="text-sm font-medium">{t.title}</p>
                    <div className="mt-1 flex gap-1"><StatusBadge status={t.status} /><PriorityBadge priority={t.priority} /></div>
                    <div className="mt-2 flex gap-2 text-xs">
                      {COLUMNS.filter((c) => c !== t.status).map((c) => (
                        <button key={c} className="underline" onClick={() => dispatch(updateTask({ id: t.id, patch: { status: c } as never }))}>
                          → {c}
                        </button>
                      ))}
                      <button className="text-red-600 underline" onClick={() => dispatch(deleteTask(t.id))}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="card divide-y">
          {sorted.map((t) => (
            <li key={t.id} className="flex items-center justify-between py-2 text-sm">
              <span>{t.title} <StatusBadge status={t.status} /> <PriorityBadge priority={t.priority} /></span>
              <span className="flex gap-2">
                <select aria-label={`Change status for ${t.title}`} value={t.status} onChange={(e) => dispatch(updateTask({ id: t.id, patch: { status: e.target.value as TaskStatus } as never }))} className="input !w-auto !py-1">
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
                <button className="text-red-600 underline" onClick={() => dispatch(deleteTask(t.id))}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="card">
        <h2 className="font-semibold">Members ({project.members?.length ?? 0})</h2>
        <ul className="mt-1 text-sm">
          {(project.members ?? []).map((m) => (
            <li key={m.user.id}>{m.user.name} — {m.user.email}</li>
          ))}
        </ul>
        <form onSubmit={addMember} className="mt-3 flex gap-2" aria-label="Add member">
          <input aria-label="Member email" className="input" type="email" placeholder="member email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
          <button className="btn-secondary whitespace-nowrap" type="submit">Add</button>
        </form>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
