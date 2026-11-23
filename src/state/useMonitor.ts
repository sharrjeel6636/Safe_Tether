// src/state/useMonitor.ts
import { create } from 'zustand';
import { INITIAL_SNAPSHOT } from '../domain/types';
import type { MonitorSnapshot } from '../domain/types';

interface MonitorState {
  snapshot: MonitorSnapshot;
  /** false when the foreground service could not start: alerts stop when the app is closed. */
  foregroundOk: boolean;
  setSnapshot(s: MonitorSnapshot): void;
  setForeground(ok: boolean): void;
}

export const useMonitor = create<MonitorState>((set) => ({
  snapshot: INITIAL_SNAPSHOT,
  foregroundOk: false,
  setSnapshot: (snapshot) => set({ snapshot }),
  setForeground: (foregroundOk) => set({ foregroundOk }),
}));
