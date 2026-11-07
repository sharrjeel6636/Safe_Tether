import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafetyAlert, ChildProfile } from '../domain/models';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync('safetether.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        severity TEXT NOT NULL,
        resolved INTEGER NOT NULL
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function saveAlert(alert: SafetyAlert): Promise<void> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('safetether.db');
  }
  await db.runAsync(
    'INSERT OR REPLACE INTO alerts (id, type, title, message, timestamp, severity, resolved) VALUES (?, ?, ?, ?, ?, ?, ?);',
    [alert.id, alert.type, alert.title, alert.message, alert.timestamp, alert.severity, alert.resolved ? 1 : 0]
  );
}

export async function getAlerts(): Promise<SafetyAlert[]> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('safetether.db');
  }
  const rows = await db.getAllAsync<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    severity: string;
    resolved: number;
  }>('SELECT * FROM alerts ORDER BY timestamp DESC;');

  return rows.map((r) => ({
    id: r.id,
    type: r.type as SafetyAlert['type'],
    title: r.title,
    message: r.message,
    timestamp: r.timestamp,
    severity: r.severity as SafetyAlert['severity'],
    resolved: r.resolved === 1,
  }));
}

export async function saveProfileStorage(profile: ChildProfile): Promise<void> {
  await AsyncStorage.setItem('@safetether_profile', JSON.stringify(profile));
}

export async function getProfileStorage(): Promise<ChildProfile | null> {
  const data = await AsyncStorage.getItem('@safetether_profile');
  return data ? JSON.parse(data) : null;
}
