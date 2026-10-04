import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, tokenStore } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = { user: null, status: 'idle', error: null };

export const fetchMe = createAsyncThunk('auth/me', async () => {
  const res = await api.get('/auth/me');
  return res.data.user as User;
});

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', payload);
      tokenStore.set(res.data.accessToken, res.data.refreshToken);
      return res.data.user as User;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', payload);
      tokenStore.set(res.data.accessToken, res.data.refreshToken);
      return res.data.user as User;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Registration failed';
      return rejectWithValue(msg);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout', { refreshToken: tokenStore.getRefresh() });
  } catch {
    /* ignore */
  }
  tokenStore.clear();
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMe.pending, (s) => {
      s.status = 'loading';
    });
    b.addCase(fetchMe.fulfilled, (s, a) => {
      s.status = 'idle';
      s.user = a.payload;
    });
    b.addCase(fetchMe.rejected, (s) => {
      s.status = 'idle';
      s.user = null;
    });
    b.addCase(login.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.status = 'idle';
      s.user = a.payload;
    });
    b.addCase(login.rejected, (s, a) => {
      s.status = 'failed';
      s.error = (a.payload as string) ?? 'Login failed';
    });
    b.addCase(register.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    });
    b.addCase(register.fulfilled, (s, a) => {
      s.status = 'idle';
      s.user = a.payload;
    });
    b.addCase(register.rejected, (s, a) => {
      s.status = 'failed';
      s.error = (a.payload as string) ?? 'Registration failed';
    });
    b.addCase(logout.fulfilled, (s) => {
      s.user = null;
    });
  },
});

export default slice.reducer;
