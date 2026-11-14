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
  name: '',
  age: 0,
  note: '',
  safeRangeMeters: 10,
  deviceModel: '',
  deviceMac: '',
  batteryLevel: 0,
  connectionStatus: 'disconnected',
  lastKnownLocation: {
    latitude: 0,
    longitude: 0,
    address: '',
    timestamp: '',
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
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);

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
  const [bluetoothGranted, setBluetoothGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
