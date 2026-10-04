import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { DashboardSummary } from '../types';

interface State {
  data: DashboardSummary | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}
const initialState: State = { data: null, status: 'idle', error: null };

export const fetchDashboard = createAsyncThunk('dashboard/summary', async () => {
  const res = await api.get('/dashboard/summary');
  return res.data as DashboardSummary;
});

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (s) => {
      s.status = 'loading';
    });
    b.addCase(fetchDashboard.fulfilled, (s, a) => {
      s.status = 'idle';
      s.data = a.payload;
    });
    b.addCase(fetchDashboard.rejected, (s, a) => {
      s.status = 'failed';
      s.error = a.error.message ?? 'Failed to load dashboard';
    });
  },
});

export default slice.reducer;
