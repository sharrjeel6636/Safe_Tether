import { getAlerts, saveAlert, getProfileStorage, saveProfileStorage } from './database';
import { getAlertsRemote, saveAlertRemote, getProfileRemote, saveProfileRemote } from './remote';

export async function syncData(userId: string): Promise<void> {
  try {
    const localProfile = await getProfileStorage();
    const remoteProfile = await getProfileRemote(userId);

    if (localProfile && !remoteProfile) {
      await saveProfileRemote(userId, localProfile);
    } else if (remoteProfile && !localProfile) {
      await saveProfileStorage(remoteProfile);
    }

    const localAlerts = await getAlerts();
    const remoteAlerts = await getAlertsRemote(userId);

    const remoteIds = new Set(remoteAlerts.map((a) => a.id));
    for (const localAlert of localAlerts) {
      if (!remoteIds.has(localAlert.id)) {
        await saveAlertRemote(userId, localAlert);
      }
    }

    for (const remoteAlert of remoteAlerts) {
      await saveAlert(remoteAlert);
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}
