// src/data/sync.ts
// Offline-first sync: the phone database always has the alert first; this copies it to Firestore
// when possible. Errors are swallowed on purpose: a failed sync must never disturb the parent,
// it simply runs again later.
import { markSynced, unsynced } from './alertRepo';
import { currentUser } from './auth';
import { pullAlerts, pushAlert } from './remote';

let busy = false;

export async function syncNow(deviceId: string | null, localOnly: boolean): Promise<void> {
  if (busy || localOnly || currentUser() === null) return;
  busy = true;
  try {
    if (deviceId !== null) {
      for (const row of await unsynced()) {
        const remoteId = await pushAlert(deviceId, row);
        await markSynced(row.id, remoteId);
      }
    }
    await pullAlerts();
  } catch (e) {
    console.warn('[sync] will retry later', e);
  } finally {
    busy = false;
  }
}
