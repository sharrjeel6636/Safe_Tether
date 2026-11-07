import { describe, it, expect } from '@jest/globals';
import { SafetyEngine } from '../src/core/engine';

describe('SafetyEngine', () => {
  it('should initialize with correct default profile and status', () => {
    const engine = new SafetyEngine();
    expect(engine.getStatus()).toBe('connected');
    const profile = engine.getProfile();
    expect(profile.name).toBe('Leo');
    expect(profile.safeRangeMeters).toBe(10);
  });

  it('should update profile correctly', () => {
    const engine = new SafetyEngine();
    engine.updateProfile({ name: 'Max', safeRangeMeters: 15 });
    const profile = engine.getProfile();
    expect(profile.name).toBe('Max');
    expect(profile.safeRangeMeters).toBe(15);
  });
});
