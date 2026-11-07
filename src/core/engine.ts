import { ConnectionStatus, SafetyAlert, ChildProfile } from '../domain/models';
import { saveAlert, getAlerts } from '../data/database';
import { displayNotification } from '../services/notificationService';

export class SafetyEngine {
  private status: ConnectionStatus = 'connected';
  private profile: ChildProfile = {
    id: 'child-01',
    name: 'Leo',
    age: 7,
    safeRangeMeters: 10,
  };

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public setStatus(newStatus: ConnectionStatus): void {
    this.status = newStatus;
  }

  public getProfile(): ChildProfile {
    return this.profile;
  }

  public updateProfile(profile: Partial<ChildProfile>): void {
    this.profile = { ...this.profile, ...profile };
  }

  public async triggerAlert(type: SafetyAlert['type'], title: string, message: string): Promise<SafetyAlert> {
    const alert: SafetyAlert = {
      id: `alert-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
      severity: type === 'panic' ? 'high' : 'medium',
      resolved: false,
    };
    await saveAlert(alert);
    await displayNotification(title, message);
    return alert;
  }

  public async fetchAlerts(): Promise<SafetyAlert[]> {
    return await getAlerts();
  }
}

export const safetyEngine = new SafetyEngine();
