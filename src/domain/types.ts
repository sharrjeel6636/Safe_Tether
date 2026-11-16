import { SafetyAlert } from './models';

export const ALERT_TITLE: Record<SafetyAlert['type'], string> = {
  panic: 'Panic Alert',
  outOfRange: 'Out of Range',
  lowBattery: 'Low Battery',
  connectionLost: 'Connection Lost',
};

export const LINK_LABELS: Record<string, string> = {
  connected: 'Connected',
  outOfRange: 'Out of Range',
  searching: 'Searching',
  disconnected: 'Disconnected',
};

export function isLinked(link: string): boolean {
  return link === 'connected';
}

export function isLowBattery(batteryPct: number): boolean {
  return batteryPct <= 20;
}
