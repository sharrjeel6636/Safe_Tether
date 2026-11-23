// src/bootstrap.ts
// Runs once when the app opens: load settings, watch the login, start monitoring if a wearable is saved.
import { runtime } from './runtime';
import { useAlerts } from './state/useAlerts';
import { useSession } from './state/useSession';
import { useSettings } from './state/useSettings';

let done = false;

export async function bootstrap(): Promise<void> {
  if (done) return;
  done = true;
  await useSettings.getState().load();
  useSession.getState().init();
  // Settings changes (safe range, calibration, another wearable) reach a running monitor at once.
  useSettings.subscribe((state, prev) => {
    if (state.settings !== prev.settings) runtime.applySettings(state.settings);
  });
  void useAlerts.getState().refresh();
  const s = useSettings.getState().settings;
  if (s.deviceId !== null) {
    // 'no-permission' is not an error here: the Home screen shows a banner with a "Fix" button.
    await runtime.start(s);
  }
}
