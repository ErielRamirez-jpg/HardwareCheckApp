import { configureStore } from '@reduxjs/toolkit';
import hardwareReducer from './hardwareSlice';

export const store = configureStore({
  reducer: {
    hardware: hardwareReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;