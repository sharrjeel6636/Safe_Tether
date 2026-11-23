// src/state/useAlerts.ts
import { create } from 'zustand';
import { listAlerts } from '../data/alertRepo';
import type { AlertFilter, AlertRow } from '../domain/types';

interface AlertsState {
  rows: AlertRow[];
  filter: AlertFilter;
  loading: boolean;
  error: string | null;
  setFilter(f: AlertFilter): Promise<void>;
  refresh(): Promise<void>;
}

export const useAlerts = create<AlertsState>((set, get) => ({
  rows: [],
  filter: 'all',
  loading: false,
  error: null,
  setFilter: async (filter) => {
    set({ filter });
    await get().refresh();
  },
  refresh: async () => {
    set({ loading: true });
    try {
      set({ rows: await listAlerts(get().filter), error: null, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not load alerts', loading: false });
    }
  },
}));
