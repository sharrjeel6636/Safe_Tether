import * as firestoreModule from '@react-native-firebase/firestore';
import { ChildProfile, SafetyAlert } from '../domain/models';

const firestore = (firestoreModule as any).default || firestoreModule;

export async function saveProfileRemote(userId: string, profile: ChildProfile): Promise<void> {
  try {
    await firestore().collection('users').doc(userId).set({ profile }, { merge: true });
  } catch (error) {
    console.error('Save profile remote error:', error);
  }
}

export async function getProfileRemote(userId: string): Promise<ChildProfile | null> {
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    if (doc.exists) {
      const data = doc.data();
      return (data?.profile as ChildProfile) || null;
    }
    return null;
  } catch (error) {
    console.error('Get profile remote error:', error);
    return null;
  }
}

export async function saveAlertRemote(userId: string, alert: SafetyAlert): Promise<void> {
  try {
    await firestore().collection('users').doc(userId).collection('alerts').doc(alert.id).set(alert);
  } catch (error) {
    console.error('Save alert remote error:', error);
  }
}

export async function getAlertsRemote(userId: string): Promise<SafetyAlert[]> {
  try {
    const snapshot = await firestore().collection('users').doc(userId).collection('alerts').orderBy('timestamp', 'desc').get();
    return snapshot.docs.map((doc: any) => doc.data() as SafetyAlert);
  } catch (error) {
    console.error('Get alerts remote error:', error);
    return [];
  }
}

export async function clearCloudData(userId: string): Promise<void> {
  try {
    const alertsSnap = await firestore().collection('users').doc(userId).collection('alerts').get();
    const batch = firestore().batch();
    alertsSnap.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    batch.delete(firestore().collection('users').doc(userId));
    await batch.commit();
  } catch (error) {
    console.error('Clear cloud data error:', error);
    throw error;
  }
}
