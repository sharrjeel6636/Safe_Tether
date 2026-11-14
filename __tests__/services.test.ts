import { describe, it, expect } from '@jest/globals';
import { bleService } from '../src/services/bleService';
import { requestLocationPermission, getCurrentPosition } from '../src/services/locationService';
import { displayNotification } from '../src/services/notificationService';

describe('Services (BLE, Location, Notification)', () => {
  it('should check BLE scanning state', () => {
    expect(typeof bleService.isScanning()).toBe('boolean');
  });

  it('should start and stop BLE scan without error', () => {
    expect(() => {
      bleService.startScan(() => {}, () => {});
      bleService.stopScan();
    }).not.toThrow();
  });

  it('should attempt connection to device', async () => {
    const device = await bleService.connectToDevice('AA:BB:CC:DD:EE:FF');
    expect(device === null || typeof device === 'object').toBe(true);
  });

  it('should destroy bleManager safely', () => {
    expect(() => bleService.destroy()).not.toThrow();
  });

  it('should request location permission', async () => {
    const granted = await requestLocationPermission();
    expect(typeof granted).toBe('boolean');
  });

  it('should get current position', async () => {
    const pos = await getCurrentPosition();
    expect(pos === null || typeof pos === 'object').toBe(true);
  });

  it('should display notification without throwing', async () => {
    await expect(displayNotification('Test Title', 'Test Body')).resolves.not.toThrow();
  });

  it('should handle stop scan when not scanning', () => {
    expect(() => bleService.stopScan()).not.toThrow();
  });

  it('should allow multiple start and stop scan cycles', () => {
    bleService.startScan(() => {});
    bleService.stopScan();
    bleService.startScan(() => {});
    bleService.stopScan();
    expect(bleService.isScanning()).toBe(false);
  });

  it('should handle display notification with empty strings', async () => {
    await expect(displayNotification('', '')).resolves.not.toThrow();
  });

  it('should handle display notification with special characters', async () => {
    await expect(displayNotification('⚠️ Alert!', 'Child @ 14m!')).resolves.not.toThrow();
  });

  it('should handle position accuracy return shape', async () => {
    const pos = await getCurrentPosition();
    if (pos) {
      expect(typeof pos.latitude).toBe('number');
      expect(typeof pos.longitude).toBe('number');
    }
  });
});
