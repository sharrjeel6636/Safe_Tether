// src/data/alertRepo.ts
import type { AlertEvent, AlertFilter, AlertRow, AlertType } from '../domain/types';
import type { Fix } from '../services/location';
import { listQuery, rowToAlert } from './alertRows';
import type { AlertSqlRow } from './alertRows';
import { getDb } from './db';

const compact = (rows: AlertSqlRow[]): AlertRow[] => rows.map(rowToAlert).filter((r): r is AlertRow => r !== null);

export async function insertAlert(e: AlertEvent, fix: Fix | null): Promise<number> {
  const db = await getDb();
  const r = await db.runAsync(
    'INSERT INTO alerts (type, at, distance_m, lat, lng, accuracy_m, synced) VALUES (?, ?, ?, ?, ?, ?, 0)',
    e.type,
    e.at,
    e.distanceM ?? null,
    fix?.lat ?? null,
    fix?.lng ?? null,
    fix?.accuracyM ?? null,
  );
  return r.lastInsertRowId;
}

export async function setAlertLocation(id: number, fix: Fix): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE alerts SET lat = ?, lng = ?, accuracy_m = ? WHERE id = ?', fix.lat, fix.lng, fix.accuracyM, id);
}

export async function listAlerts(filter: AlertFilter, limit = 200): Promise<AlertRow[]> {
  const db = await getDb();
  const q = listQuery(filter, limit);
  return compact(await db.getAllAsync<AlertSqlRow>(q.sql, q.params));
}

export async function getAlert(id: number): Promise<AlertRow | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<AlertSqlRow>('SELECT * FROM alerts WHERE id = ?', id);
  return r === null ? null : rowToAlert(r);
}

/** The most recent alert that has a position (Last Location screen). */
export async function latestWithLocation(): Promise<AlertRow | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<AlertSqlRow>(
    'SELECT * FROM alerts WHERE lat IS NOT NULL AND lng IS NOT NULL ORDER BY at DESC LIMIT 1',
  );
  return r === null ? null : rowToAlert(r);
}

export async function latestOfType(type: AlertType): Promise<AlertRow | null> {
  const db = await getDb();
  const r = await db.getFirstAsync<AlertSqlRow>('SELECT * FROM alerts WHERE type = ? ORDER BY at DESC LIMIT 1', type);
  return r === null ? null : rowToAlert(r);
}

export async function unsynced(limit = 100): Promise<AlertRow[]> {
  const db = await getDb();
  return compact(await db.getAllAsync<AlertSqlRow>('SELECT * FROM alerts WHERE synced = 0 ORDER BY at ASC LIMIT ?', limit));
}

export async function markSynced(id: number, remoteId: string): Promise<void> {
  const db = await getDb();
  // The same alert may already be here, downloaded from Firestore before this row was marked.
  const dup = await db.getFirstAsync<{ id: number }>('SELECT id FROM alerts WHERE remote_id = ?', remoteId);
  if (dup !== null && dup.id !== id) {
    await db.runAsync('DELETE FROM alerts WHERE id = ?', id);
    return;
  }
  await db.runAsync('UPDATE alerts SET synced = 1, remote_id = ? WHERE id = ?', remoteId, id);
}

/** An alert downloaded from Firestore; ignored when it is already here. */
export async function addRemoteAlert(a: {
  remoteId: string;
  type: string;
  at: number;
  distanceM: number | null;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR IGNORE INTO alerts (type, at, distance_m, lat, lng, accuracy_m, synced, remote_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
    a.type,
    a.at,
    a.distanceM,
    a.lat,
    a.lng,
    a.accuracyM,
    a.remoteId,
  );
}

export async function clearAlerts(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM alerts');
}

export async function unsyncedCount(): Promise<number> {
  const db = await getDb();
  const r = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM alerts WHERE synced = 0');
  return r?.n ?? 0;
}
