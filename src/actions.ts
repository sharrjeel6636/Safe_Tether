import { startRuntime } from './runtime';

export async function startMonitoringFlow(): Promise<void> {
  await startRuntime();
}
