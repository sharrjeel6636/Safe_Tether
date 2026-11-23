import { groupByDay, listQuery, remoteAlertId, rowToAlert } from '../src/data/alertRows';
import type { AlertSqlRow } from '../src/data/alertRows';
import { friendlyAuthError } from '../src/data/authMessages';
import { DEFAULT_SETTINGS, mergeSettings, toMonitorConfig } from '../src/data/settingsStore';
import type { AlertRow } from '../src/domain/types';

const sql = (over: Partial<AlertSqlRow> = {}): AlertSqlRow => ({
  id: 1,
  type: 'panic',
  at: 1_700_000_000_000,
  distance_m: null,
  lat: 31.5,
  lng: 74.3,
  accuracy_m: 9,
  synced: 1,
  remote_id: 'X_1_panic',
  ...over,
});

describe('alert rows', () => {
  it('maps a SQLite row to an AlertRow', () => {
    expect(rowToAlert(sql())).toEqual({
      id: 1, type: 'panic', at: 1_700_000_000_000, distanceM: null, lat: 31.5, lng: 74.3, accuracyM: 9, synced: true, remoteId: 'X_1_panic',
    });
    expect(rowToAlert(sql({ synced: 0 }))?.synced).toBe(false);
  });

  it('skips a row with a type this app version does not know', () => {
    expect(rowToAlert(sql({ type: 'geofence' }))).toBeNull();
  });

  it('builds the History query for each filter', () => {
    expect(listQuery('all')).toEqual({ sql: 'SELECT * FROM alerts ORDER BY at DESC LIMIT ?', params: [200] });
    expect(listQuery('range', 50)).toEqual({
      sql: 'SELECT * FROM alerts WHERE type IN (?) ORDER BY at DESC LIMIT ?',
      params: ['out_of_range', 50],
    });
  });

  it('groups newest-first rows by local day', () => {
    const row = (id: number, y: number, m: number, d: number, h: number): AlertRow => ({
      id, type: 'panic', at: new Date(y, m, d, h).getTime(), distanceM: null, lat: null, lng: null, accuracyM: null, synced: false, remoteId: null,
    });
    const g = groupByDay([row(3, 2026, 9, 26, 15), row(2, 2026, 9, 26, 9), row(1, 2026, 9, 25, 23)]);
    expect(g.map((x) => x.rows.map((r) => r.id))).toEqual([[3, 2], [1]]);
  });

  it('builds the Firestore document id', () => {
    expect(remoteAlertId('AA:BB', 1700000000000, 'panic')).toBe('AA:BB_1700000000000_panic');
  });
});

describe('settings', () => {
  it('returns the defaults for nothing, junk or the wrong type', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings('hello')).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings({ safeRangeM: 'far', soundOn: 'yes', deviceId: 5 })).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid values and clamps out-of-range numbers', () => {
    const s = mergeSettings({ deviceId: 'AA:BB', childName: 'Sara', safeRangeM: 200, rssiAt1m: -10, pathLossN: 2.2, vibrationOn: false });
    expect(s.deviceId).toBe('AA:BB');
    expect(s.childName).toBe('Sara');
    expect(s.safeRangeM).toBe(50);
    expect(s.rssiAt1m).toBe(-30);
    expect(s.pathLossN).toBe(2.2);
    expect(s.vibrationOn).toBe(false);
  });

  it('extracts the monitor part', () => {
    const c = toMonitorConfig(mergeSettings({ deviceId: 'AA', childName: 'Z', childNote: 'allergy' }));
    expect(c).toMatchObject({ deviceId: 'AA', childName: 'Z' });
    expect('childNote' in c).toBe(false);
  });
});

describe('auth messages', () => {
  it('translates Firebase codes, with or without the auth/ prefix', () => {
    expect(friendlyAuthError({ code: 'auth/wrong-password' })).toBe('Email or password is incorrect.');
    expect(friendlyAuthError({ code: 'email-already-in-use' })).toContain('already exists');
    expect(friendlyAuthError({ code: 'auth/network-request-failed' })).toContain('internet');
  });

  it('explains a missing Firebase setup and falls back for anything else', () => {
    expect(friendlyAuthError(new Error("No Firebase App '[DEFAULT]' has been created"))).toContain('google-services.json');
    expect(friendlyAuthError(42)).toBe('Something went wrong. Please try again.');
  });
});
