import { useState, useEffect } from 'react';
import { SafetyAlert, ConnectionStatus } from '../domain/models';
import { safetyEngine } from '../core/engine';
import { saveAlert, getAlerts, clearAlerts as dbClearAlerts } from '../data/database';
import { clearCloudData } from '../data/remote';
import { isLinked, isLowBattery } from '../domain/types';

export interface ChildProfileState {
  name: string;
  age: number;
  note?: string;
  safeRangeMeters: number;
}

// Global state stores (in memory / Zustand-like or React state bindings)
let globalSettings = {
  childName: '',
  childAge: 0,
  childNote: '',
  safeRangeM: 10,
  safeRangeMeters: 10,
  deviceId: null as string | null,
  deviceMac: null as string | null,
  soundOn: true,
  soundEnabled: true,
  vibrationOn: true,
  vibrationEnabled: true,
  notificationsAllowed: true,
  batteryOptimisationOff: true,
};

let globalMonitorSnapshot = {
  link: 'connected' as ConnectionStatus,
  distanceM: 3.5,
  zone: 'Safe Zone',
  batteryPct: 85,
  charging: false,
  lastSeen: Date.now() - 3000,
  bluetoothOn: true,
  buzzSecondsLeft: 0,
  rssiDbm: -55,
  rssiAt1m: -60,
};

let globalAlerts: SafetyAlert[] = [];
let globalFilter = 'all';

export function useSettings() {
  const [settings, setSettings] = useState(globalSettings);

  const update = (partial: Partial<typeof globalSettings>) => {
    if (partial.safeRangeM !== undefined && partial.safeRangeMeters === undefined) {
      partial.safeRangeMeters = partial.safeRangeM;
    }
    if (partial.safeRangeMeters !== undefined && partial.safeRangeM === undefined) {
      partial.safeRangeM = partial.safeRangeMeters;
    }
    globalSettings = { ...globalSettings, ...partial };
    if (partial.deviceId !== undefined && partial.deviceMac === undefined) {
      globalSettings.deviceMac = partial.deviceId;
    }
    if (partial.deviceMac !== undefined && partial.deviceId === undefined) {
      globalSettings.deviceId = partial.deviceMac;
    }
    setSettings(globalSettings);
    if (partial.safeRangeM !== undefined) {
      safetyEngine.updateProfile({ safeRangeMeters: partial.safeRangeM });
    }
  };

  const childName = settings.childName.trim() || 'Your child';

  return {
    ...settings,
    childName,
    safeRangeMeters: settings.safeRangeM,
    deviceMac: settings.deviceId,
    soundEnabled: settings.soundOn,
    vibrationEnabled: settings.vibrationOn,
    update,
    setChildName: (name: string) => update({ childName: name }),
    setChildAge: (age: number) => update({ childAge: age }),
    setChildNote: (note: string) => update({ childNote: note }),
    setSafeRangeM: (safeRangeM: number) => update({ safeRangeM, safeRangeMeters: safeRangeM }),
    setSafeRangeMeters: (safeRangeM: number) => update({ safeRangeM, safeRangeMeters: safeRangeM }),
    setDeviceId: (deviceId: string | null) => update({ deviceId, deviceMac: deviceId }),
    setDeviceMac: (deviceId: string | null) => update({ deviceId, deviceMac: deviceId }),
    setSoundOn: (soundOn: boolean) => update({ soundOn, soundEnabled: soundOn }),
    setSoundEnabled: (soundOn: boolean) => update({ soundOn, soundEnabled: soundOn }),
    setVibrationOn: (vibrationOn: boolean) => update({ vibrationOn, vibrationEnabled: vibrationOn }),
    setVibrationEnabled: (vibrationOn: boolean) => update({ vibrationOn, vibrationEnabled: vibrationOn }),
    setNotificationsAllowed: (notificationsAllowed: boolean) => update({ notificationsAllowed }),
    setBatteryOptimisationOff: (batteryOptimisationOff: boolean) => update({ batteryOptimisationOff }),
  };
}

export function useMonitor() {
  const [snapshot, setSnapshot] = useState(globalMonitorSnapshot);

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot({ ...globalMonitorSnapshot });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const linked = isLinked(snapshot.link);
  const lowBattery = isLowBattery(snapshot.batteryPct);

  const profile = {
    name: globalSettings.childName || 'Your child',
    age: globalSettings.childAge,
    note: globalSettings.childNote,
    safeRangeMeters: globalSettings.safeRangeM,
    deviceMac: globalSettings.deviceId,
    connectionStatus: snapshot.link,
    batteryLevel: snapshot.batteryPct,
    lastKnownLocation: { latitude: 37.7749, longitude: -122.4194 },
  };

  return {
    snapshot,
    isLinked: linked,
    isLowBattery: lowBattery,
    profile,
    updateSnapshot: (partial: Partial<typeof globalMonitorSnapshot>) => {
      globalMonitorSnapshot = { ...globalMonitorSnapshot, ...partial };
      setSnapshot({ ...globalMonitorSnapshot });
    },
    updateProfile: (partial: Partial<typeof profile>) => {
      const settingsPartial: any = {};
      const monitorPartial: any = {};
      if (partial.name !== undefined) settingsPartial.childName = partial.name;
      if (partial.age !== undefined) settingsPartial.childAge = partial.age;
      if (partial.note !== undefined) settingsPartial.childNote = partial.note;
      if (partial.safeRangeMeters !== undefined) {
        settingsPartial.safeRangeM = partial.safeRangeMeters;
        settingsPartial.safeRangeMeters = partial.safeRangeMeters;
      }
      if (partial.deviceMac !== undefined) settingsPartial.deviceId = partial.deviceMac;
      if (partial.connectionStatus !== undefined) monitorPartial.link = partial.connectionStatus;
      if (partial.batteryLevel !== undefined) monitorPartial.batteryPct = partial.batteryLevel;

      if (Object.keys(settingsPartial).length > 0) {
        globalSettings = { ...globalSettings, ...settingsPartial };
      }
      if (Object.keys(monitorPartial).length > 0) {
        globalMonitorSnapshot = { ...globalMonitorSnapshot, ...monitorPartial };
      }
      setSnapshot({ ...globalMonitorSnapshot });
    },
  };
}

export function useAlerts() {
  const [rows, setRows] = useState<SafetyAlert[]>(globalAlerts);
  const [filter, setFilter] = useState(globalFilter);

  const refresh = async () => {
    const fetched = await getAlerts();
    globalAlerts = fetched;
    setRows(fetched);
  };

  useEffect(() => {
    refresh();
  }, []);

  const clearHistory = async () => {
    await dbClearAlerts();
    try {
      await clearCloudData('current-user');
    } catch (e) {}
    globalAlerts = [];
    setRows([]);
  };

  const filteredRows = rows.filter((r) => {
    if (filter === 'all' || filter === 'All') return true;
    if (filter === 'Panic' && r.type === 'panic') return true;
    if (filter === 'Range' && r.type === 'outOfRange') return true;
    if (filter === 'Battery' && r.type === 'lowBattery') return true;
    if (filter === 'Connection' && (r.type === 'connectionLost' || r.type === 'panic')) return true;
    return r.type === filter;
  });

  return {
    rows: filteredRows,
    allRows: rows,
    alerts: rows,
    filter,
    setFilter: (f: string) => {
      globalFilter = f;
      setFilter(f);
    },
    refresh,
    clearHistory,
    clearAlerts: clearHistory,
    addAlert: async (alert: SafetyAlert) => {
      globalAlerts = [alert, ...globalAlerts];
      setRows([...globalAlerts]);
      await saveAlert(alert);
    },
  };
}

export function usePermissions() {
  const [missing, setMissing] = useState<string[]>([]);

  const fixNext = () => {
    if (missing.length > 0) {
      setMissing(missing.slice(1));
    }
  };

  const requestPermissions = async () => {
    setMissing([]);
  };

  return {
    missing,
    fixNext,
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
    setLocalOnlyMode(false);
  };

  const loginWithoutAccount = () => {
    setLocalOnlyMode(true);
    setIsAuthenticated(true);
  };

  return {
    isAuthenticated,
    localOnly: localOnlyMode,
    localOnlyMode,
    setLocalOnly: setLocalOnlyMode,
    login,
    logout,
    loginWithoutAccount,
  };
}

export function useNow(): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diffSec = Math.floor((now - globalMonitorSnapshot.lastSeen) / 1000);
  if (diffSec < 5) return 'just now';
  return `${diffSec} s ago`;
}

export function useLatestAlert(type?: string): SafetyAlert | null {
  const { allRows } = useAlerts();
  const matched = type ? allRows.filter((r) => r.type === type) : allRows;
  return matched.length > 0 ? matched[0] : null;
}

export function useLocationAlert(alertId?: string): { latitude: number; longitude: number; address: string } {
  return {
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 SafeTether Way, San Francisco, CA',
  };
}
