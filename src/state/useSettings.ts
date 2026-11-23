// src/state/useSettings.ts
import { create } from 'zustand';
import { DEFAULT_SETTINGS, clearSettings, loadSettings, saveSettings } from '../data/settingsStore';
import type { AppSettings } from '../data/settingsStore';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load(): Promise<void>;
  update(patch: Partial<AppSettings>): Promise<void>;
  reset(): Promise<void>;
}

export const useSettings = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => set({ settings: await loadSettings(), loaded: true }),
  update: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next }); // the screens and the monitor see it at once
    await saveSettings(next);
  },
  reset: async () => {
    await clearSettings();
    set({ settings: DEFAULT_SETTINGS });
  },
}));
