import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { Paginated, Project } from '../types';

interface State {
  items: Project[];
  total: number;
  page: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: State = { items: [], total: 0, page: 1, status: 'idle', error: null };

export const fetchProjects = createAsyncThunk('projects/list', async (params: { page?: number; search?: string } = {}) => {
  const res = await api.get<Paginated<Project>>('/projects', { params: { page: params.page ?? 1, limit: 20, search: params.search } });
  return res.data;
});

export const createProject = createAsyncThunk('projects/create', async (payload: { name: string; description?: string }) => {
  const res = await api.post('/projects', payload);
  return res.data as Project;
});

const slice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProjects.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(fetchProjects.fulfilled, (s, a) => {
      s.status = 'idle';
      s.items = a.payload.data;
      s.total = a.payload.pagination.total;
      s.page = a.payload.pagination.page;
    });
    b.addCase(fetchProjects.rejected, (s, a) => {
      s.status = 'failed';
      s.error = a.error.message ?? 'Failed to load projects';
    });
    b.addCase(createProject.fulfilled, (s, a) => {
      s.items.unshift(a.payload);
      s.total += 1;
    });
  },
});

export default slice.reducer;
