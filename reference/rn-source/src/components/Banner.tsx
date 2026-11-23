// src/components/Banner.tsx
// One-line notices that name exactly what is missing instead of silently not working (Appendix C.4).
import { Linking, StyleSheet, Text, View } from 'react-native';
import { runtime, ble } from '../runtime';
import { usePermissions } from '../state/usePermissions';
import { useMonitor } from '../state/useMonitor';
import { useSettings } from '../state/useSettings';
import { Button } from '../ui/Button';
import { colors, space } from '../ui/theme';

interface Props {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}

export function NoticeBanner({ text, actionLabel, onAction, color = colors.warn }: Props) {
  return (
    <View style={[styles.box, { borderColor: color, backgroundColor: `${color}24` }]} accessibilityRole="alert">
      <Text style={styles.text}>{text}</Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button label={actionLabel} onPress={onAction} kind="text" compact />
      ) : null}
    </View>
  );
}

/** Missing permissions, by name. "Fix" asks for the next one. */
export function PermissionBanner() {
  const p = usePermissions();
  const { settings } = useSettings.getState();
  if (p.report === null || p.missing.length === 0) return null;
  return (
    <NoticeBanner
      color={p.ready ? colors.warn : colors.coral}
      text={`Allow: ${p.missing.join(', ')}. ${p.ready ? '' : 'Alerts cannot work without this.'}`}
      actionLabel="Fix"
      onAction={() => {
        void p.fixNext().then(() => {
          // Permission just granted: start watching if a wearable is saved.
          if (settings.deviceId !== null) void runtime.start(useSettings.getState().settings);
        });
      }}
    />
  );
}

export function BluetoothOffBanner() {
  return (
    <NoticeBanner
      color={colors.coral}
      text="Bluetooth is off. The wearable cannot be reached."
      actionLabel="Turn on"
      onAction={() => void ble.enableBluetooth()}
    />
  );
}

/** FR12: shown on Home while the wearable battery is low and not charging. */
export function LowBatteryBanner({ percent, onPress }: { percent: number; onPress: () => void }) {
  return <NoticeBanner text={`Wearable battery is low (${percent} %).`} actionLabel="Details" onAction={onPress} />;
}

/** The foreground service is what keeps alerts coming with the screen off. */
export function ServiceBanner() {
  const ok = useMonitor((s) => s.foregroundOk);
  const monitoring = useMonitor((s) => s.snapshot.monitoring);
  if (!monitoring || ok) return null;
  return (
    <NoticeBanner
      color={colors.coral}
      text="Background protection is off. Alerts may stop when you close the app."
      actionLabel="App settings"
      onAction={() => void Linking.openSettings()}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: space.m,
    paddingVertical: space.s,
    marginBottom: space.m,
  },
  text: { flex: 1, fontSize: 14, color: colors.ink, paddingRight: space.s },
});
