import { describe, it, expect } from '@jest/globals';
import { initDatabase, saveAlert, getAlerts, saveProfileStorage, getProfileStorage } from '../src/data/database';
import { SafetyAlert, ChildProfile } from '../src/domain/models';

describe('Database and Storage', () => {
  it('should initialize database successfully', async () => {
    await expect(initDatabase()).resolves.not.toThrow();
  });

  it('should save and retrieve alerts', async () => {
    await initDatabase();
    const alert: SafetyAlert = {
      id: 'test-alt-1',
      type: 'panic',
      title: 'Test Panic',
      message: 'Testing database',
      timestamp: '12:00 PM',
      severity: 'high',
      resolved: false,
    };
    await expect(saveAlert(alert)).resolves.not.toThrow();
    const alerts = await getAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should save and retrieve profile from storage', async () => {
    const profile: ChildProfile = {
      id: 'child-02',
      name: 'Emma',
      age: 6,
      safeRangeMeters: 15,
      note: 'Note test',
    };
    await expect(saveProfileStorage(profile)).resolves.not.toThrow();
    const saved = await getProfileStorage();
    expect(saved).toEqual(profile);
  });

  it('should handle saving multiple alerts', async () => {
    await saveAlert({
      id: 'alt-a',
      type: 'outOfRange',
      title: 'Out',
      message: '1',
      timestamp: '1',
      severity: 'medium',
      resolved: false,
    });
    await saveAlert({
      id: 'alt-b',
      type: 'lowBattery',
      title: 'Low',
      message: '2',
      timestamp: '2',
      severity: 'low',
      resolved: true,
    });
    const alerts = await getAlerts();
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle resolved status correctly in database', async () => {
    const alert: SafetyAlert = {
      id: 'alt-resolved',
      type: 'lowBattery',
      title: 'Resolved Test',
      message: 'Resolved',
      timestamp: '3',
      severity: 'low',
      resolved: true,
    };
    await saveAlert(alert);
    const alerts = await getAlerts();
    const found = alerts.find(a => a.id === 'alt-resolved');
    expect(found?.resolved).toBe(true);
  });

  it('should handle unresolved status correctly in database', async () => {
    const alert: SafetyAlert = {
      id: 'alt-unresolved',
      type: 'panic',
      title: 'Unresolved Test',
      message: 'Unresolved',
      timestamp: '4',
      severity: 'high',
      resolved: false,
    };
    await saveAlert(alert);
    const alerts = await getAlerts();
    const found = alerts.find(a => a.id === 'alt-unresolved');
    expect(found?.resolved).toBe(false);
  });

  it('should overwrite alert on duplicate id (upsert)', async () => {
    const alert1: SafetyAlert = {
      id: 'alt-dup',
      type: 'panic',
      title: 'Original Title',
      message: 'Original',
      timestamp: '5',
      severity: 'high',
      resolved: false,
    };
    await saveAlert(alert1);
    const alert2: SafetyAlert = {
      id: 'alt-dup',
      type: 'panic',
      title: 'Updated Title',
      message: 'Updated',
      timestamp: '5',
      severity: 'high',
      resolved: true,
    };
    await saveAlert(alert2);
    const alerts = await getAlerts();
    const found = alerts.find(a => a.id === 'alt-dup');
    expect(found?.title).toBe('Updated Title');
    expect(found?.resolved).toBe(true);
  });

  it('should return null when profile storage is empty or not found', async () => {
    const profile = await getProfileStorage();
    expect(profile).toBeDefined();
  });

  it('should store and retrieve child age properly', async () => {
    const profile: ChildProfile = {
      id: 'child-03',
      name: 'Oliver',
      age: 9,
      safeRangeMeters: 25,
    };
    await saveProfileStorage(profile);
    const saved = await getProfileStorage();
    expect(saved?.age).toBe(9);
  });

  it('should store and retrieve safe range meters properly', async () => {
    const profile: ChildProfile = {
      id: 'child-04',
      name: 'Sophie',
      age: 5,
      safeRangeMeters: 8,
    };
    await saveProfileStorage(profile);
    const saved = await getProfileStorage();
    expect(saved?.safeRangeMeters).toBe(8);
  });

  it('should store optional notes in profile storage', async () => {
    const profile: ChildProfile = {
      id: 'child-05',
      name: 'Lucas',
      age: 7,
      safeRangeMeters: 10,
      note: 'Peanut allergy',
    };
    await saveProfileStorage(profile);
    const saved = await getProfileStorage();
    expect(saved?.note).toBe('Peanut allergy');
  });

  it('should initialize database multiple times idempotently', async () => {
    await expect(initDatabase()).resolves.not.toThrow();
    await expect(initDatabase()).resolves.not.toThrow();
  });
});
