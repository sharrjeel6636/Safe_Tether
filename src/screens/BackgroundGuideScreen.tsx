// src/screens/BackgroundGuideScreen.tsx
// Many Android makers stop background apps to save battery, which would stop the monitoring.
// The system dialog helps on every phone; the maker-specific switches below are needed on the brands
// used in Pakistan. Menu names change between phone models and software versions: test on your own phones.
import notifee from '@notifee/react-native';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { PermissionBanner } from '../components/Banner';
import { Button } from '../ui/Button';
import { Card, Gap, Screen } from '../ui/Screen';
import { space, type } from '../ui/theme';

const GUIDES: { brand: string; steps: string[] }[] = [
  {
    brand: 'Xiaomi, Redmi, POCO',
    steps: [
      'Settings > Apps > Manage apps > SafeTether > Autostart: ON.',
      'Same page > Battery saver: "No restrictions".',
      'Open Recent apps, long-press the SafeTether card, tap the lock icon.',
    ],
  },
  {
    brand: 'Oppo, Realme, OnePlus',
    steps: [
      'Settings > Apps > SafeTether > Battery usage: "Allow background activity".',
      'Settings > Apps > Auto launch: allow SafeTether.',
      'Lock the app in Recent apps if your phone offers it.',
    ],
  },
  {
    brand: 'Vivo, iQOO',
    steps: [
      'Settings > Battery > Background power consumption > SafeTether: "Allow".',
      'Settings > Apps > Autostart: allow SafeTether.',
    ],
  },
  {
    brand: 'Infinix, Tecno, itel',
    steps: [
      'Phone Master or Settings > App management > SafeTether > Autostart: ON.',
      'Battery: set to "No restrictions" or add SafeTether to the protected / locked apps list.',
    ],
  },
  {
    brand: 'Samsung',
    steps: [
      'Settings > Battery > Background usage limits > Never sleeping apps: add SafeTether.',
      'Settings > Apps > SafeTether > Battery: "Unrestricted".',
    ],
  },
];

export function BackgroundGuideScreen() {
  const [restricted, setRestricted] = useState<boolean | null>(null);
  const [vendorScreen, setVendorScreen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRestricted(await notifee.isBatteryOptimizationEnabled().catch(() => null));
    const info = await notifee.getPowerManagerInfo().catch(() => null);
    setVendorScreen(info !== null && info.activity !== null && info.activity !== undefined);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    const t = setInterval(() => void refresh(), 3000); // the parent returns from system settings
    return () => {
      clearTimeout(timer);
      clearInterval(t);
    };
  }, [refresh]);

  return (
    <Screen>
      <Text style={type.body}>
        If the phone stops SafeTether in the background, alerts will not arrive. Do step 1 on every phone, then the steps for your phone brand.
      </Text>
      <Gap />
      <Card>
        <Text style={type.heading}>1. Allow unrestricted battery use</Text>
        <Gap h={space.xs} />
        <Text style={type.body}>
          {restricted === null ? 'Checking…' : restricted ? 'Not done yet.' : 'Done: SafeTether is exempt from battery optimisation.'}
        </Text>
        <Gap />
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Button label="Allow" compact onPress={() => void notifee.openBatteryOptimizationSettings()} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="App settings" kind="outline" compact onPress={() => void Linking.openSettings()} />
          </View>
        </View>
        {vendorScreen ? (
          <>
            <Gap h={space.s} />
            <Button label="Open the phone's battery manager" kind="text" compact onPress={() => void notifee.openPowerManagerSettings()} />
          </>
        ) : null}
      </Card>
      <PermissionBanner />
      <Text style={type.heading}>2. Steps for your phone brand</Text>
      <Gap h={space.s} />
      {GUIDES.map((g) => (
        <Card key={g.brand} style={{ padding: 0 }}>
          <Pressable
            onPress={() => setOpen(open === g.brand ? null : g.brand)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open === g.brand }}
            style={styles.head}
          >
            <Text style={type.heading}>{g.brand}</Text>
            <Text style={type.heading}>{open === g.brand ? '−' : '+'}</Text>
          </Pressable>
          {open === g.brand ? (
            <View style={{ paddingHorizontal: space.l, paddingBottom: space.l, gap: 6 }}>
              {g.steps.map((st) => (
                <Text key={st} style={type.body}>
                  • {st}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>
      ))}
      <Gap />
      <Text style={type.body}>Test it: switch the screen off for an hour, then press the panic button on the wearable. The alert must arrive.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.m },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.l },
});
