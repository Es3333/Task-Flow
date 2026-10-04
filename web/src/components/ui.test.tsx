import { render, screen } from '@testing-library/react';
import { Loading, Empty, ErrorState, StatusBadge } from './ui';

describe('ui states', () => {
  it('renders loading with status role', () => {
    render(<Loading label="Loading projects…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading projects');
  });
  it('renders empty state', () => {
    render(<Empty title="No projects" hint="Create one" />);
    expect(screen.getByText('No projects')).toBeInTheDocument();
  });
  it('renders error with retry', () => {
    render(<ErrorState message="Failed" onRetry={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
  it('renders status badge', () => {
    render(<StatusBadge status="DONE" />);
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });
});
