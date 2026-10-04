import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { Paginated, Task, TaskStatus } from '../types';

interface State {
  items: Task[];
  total: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  filter: { status?: TaskStatus; search?: string; sort?: string; order?: 'asc' | 'desc' };
}

const initialState: State = { items: [], total: 0, status: 'idle', error: null, filter: {} };

export const fetchTasks = createAsyncThunk(
  'tasks/list',
  async (params: { projectId: string; status?: TaskStatus; search?: string; sort?: string; order?: 'asc' | 'desc' }) => {
    const res = await api.get<Paginated<Task>>(`/projects/${params.projectId}/tasks`, {
      params: { limit: 100, status: params.status, search: params.search, sort: params.sort ?? 'position', order: params.order ?? 'asc' },
    });
    return res.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (params: { projectId: string; title: string; description?: string; priority?: string; dueDate?: string; assigneeId?: string }) => {
    const res = await api.post(`/projects/${params.projectId}/tasks`, {
      title: params.title,
      description: params.description,
      priority: params.priority,
      dueDate: params.dueDate || null,
      assigneeId: params.assigneeId || null,
    });
    return res.data as Task;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async (params: { id: string; patch: Partial<Task> & { position?: number } }) => {
    const res = await api.put(`/tasks/${params.id}`, params.patch);
    return res.data as Task;
  }
);

export const deleteTask = createAsyncThunk('tasks/delete', async (id: string) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

const slice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (s, a) => {
      s.filter = { ...s.filter, ...a.payload };
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(fetchTasks.fulfilled, (s, a) => {
      s.status = 'idle';
      s.items = a.payload.data;
      s.total = a.payload.pagination.total;
    });
    b.addCase(fetchTasks.rejected, (s, a) => {
      s.status = 'failed';
      s.error = a.error.message ?? 'Failed to load tasks';
    });
    b.addCase(createTask.fulfilled, (s, a) => {
      s.items.push(a.payload);
      s.total += 1;
    });
    b.addCase(updateTask.fulfilled, (s, a) => {
      s.items = s.items.map((t) => (t.id === a.payload.id ? a.payload : t));
    });
    b.addCase(deleteTask.fulfilled, (s, a) => {
      s.items = s.items.filter((t) => t.id !== a.payload);
      s.total -= 1;
    });
  },
});

export const { setFilter } = slice.actions;
export default slice.reducer;
