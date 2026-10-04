export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="py-10 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-10 text-center">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="py-10 text-center">
      <p className="font-medium text-red-700">Error</p>
      <p className="mt-1 text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button className="btn-secondary mt-4" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === 'DONE' ? 'bg-green-100 text-green-800' : status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800';
  return <span className={`badge ${color}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const color = priority === 'HIGH' ? 'bg-red-100 text-red-800' : priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700';
  return <span className={`badge ${color}`}>{priority}</span>;
}
