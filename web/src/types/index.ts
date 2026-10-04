export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner?: Pick<User, 'id' | 'name' | 'email'>;
  members?: Array<{ user: Pick<User, 'id' | 'name' | 'email'> }>;
  _count?: { tasks: number; members: number };
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  position: number;
  projectId: string;
  assigneeId?: string | null;
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface DashboardSummary {
  totalProjects: number;
  totalTasks: number;
  byStatus: Record<TaskStatus, number>;
  overdue: number;
}
