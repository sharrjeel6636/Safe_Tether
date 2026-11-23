// src/runtime.ts
// The one real monitor: real Bluetooth, real notifications, real database.
import { insertAlert, setAlertLocation } from './data/alertRepo';
import { syncNow } from './data/sync';
import { BlePlxLink } from './services/bleService';
import { showForeground, stopForeground } from './services/foregroundService';
import { currentFix } from './services/location';
import { MonitorRuntime } from './services/monitorRuntime';
import { showAlert } from './services/notifier';
import { checkPermissions } from './services/permissions';
import { useAlerts } from './state/useAlerts';
import { useMonitor } from './state/useMonitor';

/** Also used by the Connections screen (scan) and the Bluetooth-off banner. */
export const ble = new BlePlxLink();

export const runtime = new MonitorRuntime({
  link: ble,
  checkPermissions,
  showForeground,
  stopForeground,
  showAlert,
  currentFix,
  insertAlert,
  setAlertLocation,
  sync: syncNow,
  onSnapshot: (s) => useMonitor.getState().setSnapshot(s),
  onAlertsChanged: () => void useAlerts.getState().refresh(),
  onForegroundState: (ok) => useMonitor.getState().setForeground(ok),
});
