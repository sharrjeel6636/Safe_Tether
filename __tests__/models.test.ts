import { describe, it, expect } from '@jest/globals';
import { ChildProfile, SafetyAlert, ConnectionStatus } from '../src/domain/models';

describe('Domain Models & Types', () => {
  it('should support creating valid ChildProfile objects', () => {
    const profile: ChildProfile = {
      id: 'test-id',
      name: 'Test Child',
      age: 7,
      safeRangeMeters: 12,
      note: 'Allergies',
    };
    expect(profile.id).toBe('test-id');
    expect(profile.name).toBe('Test Child');
    expect(profile.age).toBe(7);
    expect(profile.safeRangeMeters).toBe(12);
    expect(profile.note).toBe('Allergies');
  });

  it('should support creating valid SafetyAlert objects', () => {
    const alert: SafetyAlert = {
      id: 'alert-id',
      type: 'panic',
      title: 'Panic',
      message: 'SOS',
      timestamp: '10:00 AM',
      severity: 'high',
      resolved: false,
    };
    expect(alert.id).toBe('alert-id');
    expect(alert.type).toBe('panic');
    expect(alert.severity).toBe('high');
    expect(alert.resolved).toBe(false);
  });

  it('should support all connection status types', () => {
    const statuses: ConnectionStatus[] = ['connected', 'outOfRange', 'searching', 'disconnected'];
    expect(statuses.length).toBe(4);
    expect(statuses).toContain('connected');
    expect(statuses).toContain('outOfRange');
    expect(statuses).toContain('searching');
    expect(statuses).toContain('disconnected');
  });

  it('should support all safety alert types', () => {
    const types: SafetyAlert['type'][] = ['panic', 'outOfRange', 'lowBattery', 'connectionLost'];
    expect(types.length).toBe(4);
    expect(types).toContain('panic');
    expect(types).toContain('outOfRange');
    expect(types).toContain('lowBattery');
    expect(types).toContain('connectionLost');
  });

  it('should support all safety alert severities', () => {
    const severities: SafetyAlert['severity'][] = ['high', 'medium', 'low'];
    expect(severities.length).toBe(3);
    expect(severities).toContain('high');
    expect(severities).toContain('medium');
    expect(severities).toContain('low');
  });

  it('should support optional properties on ChildProfile', () => {
    const profile: ChildProfile = {
      id: 'id-opt',
      name: 'Opt',
      age: 4,
      safeRangeMeters: 10,
    };
    expect(profile.note).toBeUndefined();
  });

  it('should validate alert resolved boolean flag', () => {
    const alert1: SafetyAlert = {
      id: '1',
      type: 'lowBattery',
      title: 'Low',
      message: 'Msg',
      timestamp: '1',
      severity: 'low',
      resolved: true,
    };
    expect(alert1.resolved).toBe(true);
  });

  it('should validate alert timestamp format', () => {
    const alert: SafetyAlert = {
      id: '2',
      type: 'connectionLost',
      title: 'Lost',
      message: 'Msg',
      timestamp: '2026-11-13 12:00:00',
      severity: 'medium',
      resolved: false,
    };
    expect(alert.timestamp).toBe('2026-11-13 12:00:00');
  });
});
