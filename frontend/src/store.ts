import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null as string | null,
    user: null as any,
    isLoggedIn: false,
  },
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

// Alerts slice
const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [] as any[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setAlerts: (state, action: PayloadAction<any[]>) => {
      state.alerts = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addAlert: (state, action: PayloadAction<any>) => {
      state.alerts.push(action.payload);
    },
    removeAlert: (state, action: PayloadAction<number>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
  },
});

// Configure store
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    alerts: alertsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { setAuth, logout } = authSlice.actions;
export const { setAlerts, setLoading, setError, addAlert, removeAlert } = alertsSlice.actions;

export default store;
