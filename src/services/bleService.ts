import { BleManager, Device } from 'react-native-ble-plx';

class BleService {
  private manager: BleManager;
  private scanning: boolean = false;

  constructor() {
    this.manager = new BleManager();
  }

  public isScanning(): boolean {
    return this.scanning;
  }

  public startScan(onDeviceFound: (device: Device) => void, onError?: (error: any) => void): void {
    if (this.scanning) return;
    this.scanning = true;
    try {
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          if (onError) onError(error);
          this.stopScan();
          return;
        }
        if (device) {
          onDeviceFound(device);
        }
      });
    } catch (e) {
      this.scanning = false;
      if (onError) onError(e);
    }
  }

  public stopScan(): void {
    try {
      this.manager.stopDeviceScan();
    } catch {
      // ignore
    }
    this.scanning = false;
  }

  public async connectToDevice(mac: string): Promise<Device | null> {
    try {
      const device = await this.manager.connectToDevice(mac);
      await device.discoverAllServicesAndCharacteristics();
      return device;
    } catch (error) {
      console.error('BLE connection error:', error);
      return null;
    }
  }

  public destroy(): void {
    this.manager.destroy();
  }
}

export const bleService = new BleService();
