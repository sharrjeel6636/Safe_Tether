import { bootstrap as initBootstrap } from './bootstrap';
import { clearCloudData } from './data/remote';

let isRunning = false;
let buzzTimer: any = null;

export const runtime = {
  async start(): Promise<void> {
    if (isRunning) return;
    isRunning = true;
    await initBootstrap();
    console.log('SafeTether runtime started.');
  },
  async stop(): Promise<void> {
    isRunning = false;
    if (buzzTimer) {
      clearInterval(buzzTimer);
      buzzTimer = null;
    }
    console.log('SafeTether runtime stopped.');
  },
  buzz(seconds: number): void {
    if (buzzTimer) clearInterval(buzzTimer);
    let left = seconds;
    console.log(`Buzzing wearable for ${seconds}s`);
    buzzTimer = setInterval(() => {
      left--;
      if (left <= 0) {
        clearInterval(buzzTimer);
        buzzTimer = null;
      }
    }, 1000);
  },
  stopBuzz(): void {
    if (buzzTimer) {
      clearInterval(buzzTimer);
      buzzTimer = null;
    }
    console.log('Stopped buzzing wearable.');
  },
};

export const ble = {
  async scan(): Promise<Array<{ id: string; name: string; rssi?: number; uuid?: string }>> {
    return [];
  },
  async pair(deviceId: string): Promise<void> {
    console.log(`Paired with device ${deviceId}`);
  },
  async forget(): Promise<void> {
    console.log('Forgot Bluetooth wearable device.');
  },
};

export async function startRuntime(): Promise<void> {
  await runtime.start();
}
