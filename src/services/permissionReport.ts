// src/services/permissionReport.ts
// Kept free of native imports so the monitor runtime can be unit-tested.

export interface PermissionReport {
  /** Android 12+: BLUETOOTH_SCAN and BLUETOOTH_CONNECT. Android 11 and below: location (needed for scanning). */
  bluetooth: boolean;
  /** Fine location while the app (or its foreground service) is running: gives the alert a map position. */
  location: boolean;
  /** Android 13+: POST_NOTIFICATIONS. Without it no alert can be shown. */
  notifications: boolean;
}

/** The monitor can run when Bluetooth and notifications are allowed; location is a bonus. */
export const canMonitor = (r: PermissionReport): boolean => r.bluetooth && r.notifications;
