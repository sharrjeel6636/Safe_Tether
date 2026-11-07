import { useState } from 'react';
import { SafetyAlert, ConnectionStatus } from '../domain/models';
import { safetyEngine } from '../core/engine';
import { saveAlert } from '../data/database';

export interface ChildProfileState {
  name: string;
  age: number;
  note?: string;
  safeRangeMeters: number;
  deviceModel: string;
  deviceMac: string;
  batteryLevel: number;
  connectionStatus: ConnectionStatus;
  lastKnownLocation: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
}

const defaultProfile: ChildProfileState = {
  name: 'Leo',
  age: 7,
  note: 'Allergic to peanuts. Call mom at 555-0192 if lost.',
  safeRangeMeters: 10,
  deviceModel: 'SafeTether Band v2',
  deviceMac: '24:6F:28:AB:12:3D',
  batteryLevel: 82,
  connectionStatus: 'connected',
  lastKnownLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    address: '142 Playground Ave, Parkside',
    timestamp: '2 mins ago',
  },
};

export function useMonitor() {
  const [profile, setProfile] = useState<ChildProfileState>(defaultProfile);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const updateProfile = (updates: Partial<ChildProfileState>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    safetyEngine.updateProfile(updates);
  };

  const toggleMonitoring = () => {
    setIsMonitoring((prev) => !prev);
  };

  return {
    profile,
    updateProfile,
    isMonitoring,
    toggleMonitoring,
  };
}

export function useAlerts() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([
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
  ]);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const addAlert = async (alert: SafetyAlert) => {
    setAlerts((prev) => [alert, ...prev]);
    await saveAlert(alert);
  };

  return {
    alerts,
    clearAlerts,
    addAlert,
  };
}

export function useSettings() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);
  const [batteryOptimisationOff, setBatteryOptimisationOff] = useState(true);
  const [localOnly, setLocalOnly] = useState(false);

  return {
    soundEnabled,
    setSoundEnabled,
    vibrationEnabled,
    setVibrationEnabled,
    notificationsAllowed,
    setNotificationsAllowed,
    batteryOptimisationOff,
    setBatteryOptimisationOff,
    localOnly,
    setLocalOnly,
  };
}

export function usePermissions() {
  const [bluetoothGranted, setBluetoothGranted] = useState(true);
  const [locationGranted, setLocationGranted] = useState(true);
  const [notificationsGranted, setNotificationsGranted] = useState(true);

  const requestPermissions = async () => {
    setBluetoothGranted(true);
    setLocationGranted(true);
    setNotificationsGranted(true);
  };

  return {
    bluetoothGranted,
    locationGranted,
    notificationsGranted,
    requestPermissions,
  };
}

export function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [localOnlyMode, setLocalOnlyMode] = useState(false);

  const login = (email: string) => {
    setIsAuthenticated(true);
    setLocalOnlyMode(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const loginWithoutAccount = () => {
    setLocalOnlyMode(true);
    setIsAuthenticated(true);
  };

  return {
    isAuthenticated,
    localOnlyMode,
    login,
    logout,
    loginWithoutAccount,
  };
}

export function useLatestAlert() {
  const { alerts } = useAlerts();
  const latest = alerts.length > 0 ? alerts[0] : null;
  return { latest };
}
