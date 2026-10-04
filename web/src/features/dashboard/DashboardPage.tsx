import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchDashboard } from '../../store/dashboardSlice';
import { Loading, Empty, ErrorState } from '../../components/ui';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status, error } = useSelector((s: RootState) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (status === 'loading' && !data) return <Loading label="Loading dashboard…" />;
  if (status === 'failed') return <ErrorState message={error ?? 'Failed'} onRetry={() => dispatch(fetchDashboard())} />;
  if (!data) return <Empty title="No data yet" hint="Create a project to get started." />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card"><p className="text-sm text-slate-500">Projects</p><p className="text-2xl font-bold">{data.totalProjects}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Total tasks</p><p className="text-2xl font-bold">{data.totalTasks}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Overdue</p><p className="text-2xl font-bold text-red-600">{data.overdue}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Done</p><p className="text-2xl font-bold text-green-700">{data.byStatus.DONE ?? 0}</p></div>
      </div>
      <div className="card">
        <h2 className="font-semibold">Tasks by status</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>TODO: <strong>{data.byStatus.TODO ?? 0}</strong></li>
          <li>IN_PROGRESS: <strong>{data.byStatus.IN_PROGRESS ?? 0}</strong></li>
          <li>DONE: <strong>{data.byStatus.DONE ?? 0}</strong></li>
        </ul>
      </div>
    </div>
  );
}
