// src/state/useLatestAlert.ts
import { useEffect, useState } from 'react';
import { getAlert, latestOfType, latestWithLocation } from '../data/alertRepo';
import type { AlertRow, AlertType } from '../domain/types';
import { useAlerts } from './useAlerts';

/** The newest stored alert of a type. It reloads when the list changes, for example when the position arrives. */
export function useLatestAlert(type: AlertType): AlertRow | null {
  const [row, setRow] = useState<AlertRow | null>(null);
  const version = useAlerts((s) => s.rows);
  useEffect(() => {
    let live = true;
    void latestOfType(type).then((r) => live && setRow(r));
    return () => {
      live = false;
    };
  }, [type, version]);
  return row;
}

/** A specific alert, or the newest one that has a position. */
export function useLocationAlert(alertId: number | undefined): AlertRow | null | undefined {
  const [row, setRow] = useState<AlertRow | null | undefined>(undefined);
  const version = useAlerts((s) => s.rows);
  useEffect(() => {
    let live = true;
    void (alertId === undefined ? latestWithLocation() : getAlert(alertId)).then((r) => live && setRow(r));
    return () => {
      live = false;
    };
  }, [alertId, version]);
  return row; // undefined = still loading
}
