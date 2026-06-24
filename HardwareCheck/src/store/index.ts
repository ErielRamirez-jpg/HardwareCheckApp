import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import hardwareReducer from './hardwareSlice';

// 1. Definimos la interfaz y el slice de voz aquí mismo
interface VoiceLog {
  id: string;
  created_at: string;
  title: string;
  duration: string;
  audio_url: string;
}

const voiceSlice = createSlice({
  name: 'voice',
  initialState: { logs: [] as VoiceLog[] },
  reducers: {
    setGlobalLogs: (state, action: PayloadAction<VoiceLog[]>) => {
      state.logs = action.payload;
    },
    removeGlobalLog: (state, action: PayloadAction<string>) => {
      state.logs = state.logs.filter(log => log.id !== action.payload);
    }
  }
});

// 2. Exportamos las acciones del nuevo slice
export const { setGlobalLogs, removeGlobalLog } = voiceSlice.actions;

// 3. Configuramos el store combinando tu hardwareReducer original y el nuevo voiceReducer
export const store = configureStore({
  reducer: {
    hardware: hardwareReducer,
    voice: voiceSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;