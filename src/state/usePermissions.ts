// src/state/usePermissions.ts
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { canMonitor, checkPermissions, requestBluetooth, requestLocation, requestNotifications } from '../services/permissions';
import type { PermissionReport } from '../services/permissions';

export interface PermissionView {
  report: PermissionReport | null;
  /** Names of what is missing, in plain words. */
  missing: string[];
  ready: boolean;
  /** Asks for the next missing permission, then re-checks. */
  fixNext(): Promise<void>;
  refresh(): Promise<void>;
}

export function usePermissions(): PermissionView {
  const [report, setReport] = useState<PermissionReport | null>(null);

  const refresh = useCallback(async () => {
    setReport(await checkPermissions());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    // The parent may change a permission in system settings and come back.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void refresh();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [refresh]);

  const missing: string[] = [];
  if (report !== null) {
    if (!report.bluetooth) missing.push('Nearby devices (Bluetooth)');
    if (!report.notifications) missing.push('Notifications');
    if (!report.location) missing.push('Location');
  }

  const fixNext = useCallback(async () => {
    if (report === null) return;
    if (!report.bluetooth) await requestBluetooth();
    else if (!report.notifications) await requestNotifications();
    else if (!report.location) await requestLocation();
    await refresh();
  }, [report, refresh]);

  return { report, missing, ready: report !== null && canMonitor(report), fixNext, refresh };
}
