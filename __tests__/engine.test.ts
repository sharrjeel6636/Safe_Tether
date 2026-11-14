import { describe, it, expect, beforeEach } from '@jest/globals';
import { SafetyEngine } from '../src/core/engine';

describe('SafetyEngine', () => {
  let engine: SafetyEngine;

  beforeEach(() => {
    engine = new SafetyEngine();
  });

  it('should initialize with connected status', () => {
    expect(engine.getStatus()).toBe('connected');
  });

  it('should allow setting status', () => {
    engine.setStatus('outOfRange');
    expect(engine.getStatus()).toBe('outOfRange');
    engine.setStatus('searching');
    expect(engine.getStatus()).toBe('searching');
    engine.setStatus('disconnected');
    expect(engine.getStatus()).toBe('disconnected');
  });

  it('should initialize with empty default profile', () => {
    const profile = engine.getProfile();
    expect(profile.name).toBe('');
    expect(profile.safeRangeMeters).toBe(10);
    expect(profile.id).toBe('child-01');
    expect(profile.age).toBe(0);
  });

  it('should update profile correctly', () => {
    engine.updateProfile({ name: 'Alex', age: 8, safeRangeMeters: 20 });
    const profile = engine.getProfile();
    expect(profile.name).toBe('Alex');
    expect(profile.age).toBe(8);
    expect(profile.safeRangeMeters).toBe(20);
  });

  it('should trigger alert and save/notify', async () => {
    const alert = await engine.triggerAlert('panic', 'Panic!', 'Emergency');
    expect(alert.type).toBe('panic');
    expect(alert.title).toBe('Panic!');
    expect(alert.message).toBe('Emergency');
    expect(alert.severity).toBe('high');
    expect(alert.resolved).toBe(false);
  });

  it('should trigger medium severity alert for non-panic types', async () => {
    const alert = await engine.triggerAlert('lowBattery', 'Low Battery', 'Battery at 10%');
    expect(alert.severity).toBe('medium');
  });

  it('should fetch alerts', async () => {
    await engine.triggerAlert('outOfRange', 'Out', 'Far away');
    const alerts = await engine.fetchAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should support multiple status updates sequentially', () => {
    engine.setStatus('connected');
    expect(engine.getStatus()).toBe('connected');
    engine.setStatus('outOfRange');
    expect(engine.getStatus()).toBe('outOfRange');
  });

  it('should partial update profile without losing other fields', () => {
    engine.updateProfile({ name: 'Sam' });
    expect(engine.getProfile().name).toBe('Sam');
    expect(engine.getProfile().safeRangeMeters).toBe(10);
  });

  it('should generate unique-ish alert IDs based on timestamp', async () => {
    const a1 = await engine.triggerAlert('panic', 'Test 1', 'Msg 1');
    const a2 = await engine.triggerAlert('panic', 'Test 2', 'Msg 2');
    expect(a1.id).not.toBe(a2.id);
  });

  it('should mark alerts as unresolved initially', async () => {
    const a = await engine.triggerAlert('connectionLost', 'Lost', 'No BT');
    expect(a.resolved).toBe(false);
  });

  it('should contain timestamp on triggered alerts', async () => {
    const a = await engine.triggerAlert('lowBattery', 'Battery', 'Low');
    expect(a.timestamp).toBeTruthy();
  });
});
