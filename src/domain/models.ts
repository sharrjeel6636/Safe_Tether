export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  note?: string;
  safeRangeMeters: number;
}

export type ConnectionStatus = 'connected' | 'outOfRange' | 'searching' | 'disconnected';

export interface SafetyAlert {
  id: string;
  type: 'panic' | 'outOfRange' | 'lowBattery' | 'connectionLost';
  title: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
}
