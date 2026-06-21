import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HardwareItem {
  id: string;
  name: string;
  type: string;
  lastMaintenance?: string;
  status: 'ok' | 'critico' | 'warning';
}

interface HardwareState {
  items: HardwareItem[];
}

const initialState: HardwareState = {
  items: [
    {
      id: '1',
      name: 'Acer Predator Nitro',
      type: 'Laptop de Desarrollo',
      lastMaintenance: 'Abril 2026',
      status: 'ok',
    },
    {
      id: '2',
      name: 'Servidor de Respaldos',
      type: 'Infraestructura',
      lastMaintenance: 'Noviembre 2025',
      status: 'critico',
    },
    {
      id: '3',
      name: 'Nintendo Switch Lite',
      type: 'Consola de Prueba',
      lastMaintenance: 'Mayo 2026',
      status: 'warning',
    },
  ],
};

const hardwareSlice = createSlice({
  name: 'hardware',
  initialState,
  reducers: {
    addMaintenanceLog: (state, action: PayloadAction<{ id: string; status: 'ok' | 'critico' | 'warning'; date: string }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
        item.lastMaintenance = action.payload.date;
      }
    },
  },
});

export const { addMaintenanceLog } = hardwareSlice.actions;
export default hardwareSlice.reducer;