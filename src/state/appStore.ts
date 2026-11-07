import { safetyEngine } from '../core/engine';
import { ConnectionStatus, ChildProfile, SafetyAlert } from '../domain/models';

class AppStore {
  public getStatus(): ConnectionStatus {
    return safetyEngine.getStatus();
  }

  public getProfile(): ChildProfile {
    return safetyEngine.getProfile();
  }

  public async getAlerts(): Promise<SafetyAlert[]> {
    return await safetyEngine.fetchAlerts();
  }
}

export const appStore = new AppStore();
