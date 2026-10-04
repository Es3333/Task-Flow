import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import projects from './projectsSlice';
import tasks from './tasksSlice';
import dashboard from './dashboardSlice';

export const store = configureStore({
  reducer: { auth, projects, tasks, dashboard },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
