// src/actions.ts
// Things a screen does that touch more than one module.
import { runtime } from './runtime';
import { requestAll } from './services/permissions';
import type { StartResult } from './services/monitorRuntime';
import { useSettings } from './state/useSettings';

/** Starts monitoring; if a permission is missing, asks for it once and tries again. */
export async function startMonitoringFlow(): Promise<StartResult> {
  let result = await runtime.start(useSettings.getState().settings);
  if (result === 'no-permission') {
    await requestAll();
    result = await runtime.start(useSettings.getState().settings);
  }
  return result;
}
