// src/data/db.ts
// The phone database (expo-sqlite). It always has the alert first and works offline;
// Firestore is a copy (sync.ts).
import * as SQLite from 'expo-sqlite';

let opening: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  opening ??= (async () => {
    const db = await SQLite.openDatabaseAsync('safetether.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS alerts (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        type        TEXT    NOT NULL,
        at          INTEGER NOT NULL,
        distance_m  REAL,
        lat         REAL,
        lng         REAL,
        accuracy_m  REAL,
        synced      INTEGER NOT NULL DEFAULT 0,
        remote_id   TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_alerts_at ON alerts (at DESC);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_alerts_remote ON alerts (remote_id) WHERE remote_id IS NOT NULL;
    `);
    return db;
  })();
  return opening;
}
