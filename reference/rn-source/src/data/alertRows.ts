// src/data/alertRows.ts
// Pure helpers around the alerts table, so they can be unit-tested without a database.
import { FILTER_TYPES, isAlertType } from '../domain/types';
import type { AlertFilter, AlertRow } from '../domain/types';

/** A row exactly as SQLite returns it. */
export interface AlertSqlRow {
  id: number;
  type: string;
  at: number;
  distance_m: number | null;
  lat: number | null;
  lng: number | null;
  accuracy_m: number | null;
  synced: number;
  remote_id: string | null;
}

export function rowToAlert(r: AlertSqlRow): AlertRow | null {
  if (!isAlertType(r.type)) return null; // an unknown type from a newer app version is skipped, not shown wrongly
  return {
    id: r.id,
    type: r.type,
    at: r.at,
    distanceM: r.distance_m,
    lat: r.lat,
    lng: r.lng,
    accuracyM: r.accuracy_m,
    synced: r.synced === 1,
    remoteId: r.remote_id,
  };
}

/** SQL for the History screen. Types come from a fixed list, never from user input. */
export function listQuery(filter: AlertFilter, limit = 200): { sql: string; params: (string | number)[] } {
  const types = FILTER_TYPES[filter];
  if (types.length === 0) {
    return { sql: 'SELECT * FROM alerts ORDER BY at DESC LIMIT ?', params: [limit] };
  }
  const marks = types.map(() => '?').join(', ');
  return {
    sql: `SELECT * FROM alerts WHERE type IN (${marks}) ORDER BY at DESC LIMIT ?`,
    params: [...types, limit],
  };
}

/** Groups newest-first rows by calendar day (local time) for the section headers. */
export function groupByDay(rows: readonly AlertRow[]): { dayStart: number; rows: AlertRow[] }[] {
  const groups: { dayStart: number; rows: AlertRow[] }[] = [];
  for (const r of rows) {
    const d = new Date(r.at);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const last = groups[groups.length - 1];
    if (last !== undefined && last.dayStart === dayStart) last.rows.push(r);
    else groups.push({ dayStart, rows: [r] });
  }
  return groups;
}

/** The Firestore id is built from wearable, time and type, so uploading an alert twice is harmless. */
export const remoteAlertId = (deviceId: string, at: number, type: string): string => `${deviceId}_${at}_${type}`;
