export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  note?: string;
  deviceModel: string;
  deviceMac: string;
  batteryLevel: number;
  safeRangeMeters: number;
  connectionStatus: 'connected' | 'outOfRange' | 'searching';
  lastKnownLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
}

export interface SafetyAlert {
  id: string;
  type: 'panic' | 'outOfRange' | 'lowBattery' | 'connectionLost';
  title: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  resolved: boolean;
}

export const appState = {
  localOnly: false,
};

export function setLocalOnly(value: boolean) {
  appState.localOnly = value;
}

export const initialChildProfile: ChildProfile = {
  id: 'child-01',
  name: 'Leo',
  age: 7,
  note: 'Allergic to peanuts. Call mom at 555-0192 if lost.',
  deviceModel: 'SafeTether Band v2',
  deviceMac: '24:6F:28:AB:12:3D',
  batteryLevel: 82,
  safeRangeMeters: 10,
  connectionStatus: 'connected',
  lastKnownLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: '142 Playground Ave, Parkside',
    timestamp: '2 mins ago',
  },
};

export function updateChildProfile(updates: Partial<ChildProfile>) {
  Object.assign(initialChildProfile, updates);
}

export const initialAlerts: SafetyAlert[] = [
  {
    id: 'alt-1',
    type: 'panic',
    title: 'Panic Alert Triggered',
    message: 'Leo pressed the emergency SOS button on the wearable.',
    timestamp: '10:48 AM',
    severity: 'high',
    resolved: false,
  },
  {
    id: 'alt-2',
    type: 'outOfRange',
    title: 'Out of Safe Range',
    message: 'Leo moved beyond the 10-meter boundary (~14m away).',
    timestamp: '9:15 AM',
    severity: 'medium',
    resolved: true,
  },
  {
    id: 'alt-3',
    type: 'lowBattery',
    title: 'Wearable Battery Low',
    message: 'Battery level dropped to 18%.',
    timestamp: 'Yesterday',
    severity: 'low',
    resolved: true,
  },
];
