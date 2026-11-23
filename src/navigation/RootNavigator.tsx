// src/navigation/RootNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';
import { BackgroundGuideScreen } from '../screens/BackgroundGuideScreen';
import { BuzzerScreen } from '../screens/BuzzerScreen';
import { ConnectionsScreen } from '../screens/ConnectionsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LastLocationScreen } from '../screens/LastLocationScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LowBatteryScreen } from '../screens/LowBatteryScreen';
import { OutOfRangeScreen } from '../screens/OutOfRangeScreen';
import { PanicScreen } from '../screens/PanicScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RadarScreen } from '../screens/RadarScreen';
import { SafeRangeScreen } from '../screens/SafeRangeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useSession } from '../state/useSession';
import { useSettings } from '../state/useSettings';
import { colors } from '../ui/theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.sand },
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        tabBarActiveTintColor: colors.teal,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
        tabBarItemStyle: { justifyContent: 'center' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'SafeTether', tabBarLabel: 'Home' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Alerts', tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const loaded = useSettings((s) => s.loaded);
  const localOnly = useSettings((s) => s.settings.localOnly);
  const ready = useSession((s) => s.ready);
  const user = useSession((s) => s.user);

  if (!loaded || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand }}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={{ marginTop: 12, color: colors.muted }}>Starting SafeTether…</Text>
      </View>
    );
  }

  const signedIn = user !== null || localOnly;
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.sand },
        headerTitleStyle: { color: colors.ink, fontWeight: '700' },
        headerTintColor: colors.teal,
        contentStyle: { backgroundColor: colors.sand },
      }}
    >
      {!signedIn ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Radar" component={RadarScreen} options={{ title: 'Where is my child?' }} />
          <Stack.Screen name="OutOfRange" component={OutOfRangeScreen} options={{ title: 'Out of range' }} />
          <Stack.Screen name="Panic" component={PanicScreen} options={{ title: 'Panic alert', headerStyle: { backgroundColor: colors.coral } }} />
          <Stack.Screen name="LowBattery" component={LowBatteryScreen} options={{ title: 'Wearable battery' }} />
          <Stack.Screen name="Buzzer" component={BuzzerScreen} options={{ title: 'Find child' }} />
          <Stack.Screen name="LastLocation" component={LastLocationScreen} options={{ title: 'Last known location' }} />
          <Stack.Screen name="Connections" component={ConnectionsScreen} options={{ title: 'Wearable connection' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Child profile' }} />
          <Stack.Screen name="SafeRange" component={SafeRangeScreen} options={{ title: 'Safe range' }} />
          <Stack.Screen name="BackgroundGuide" component={BackgroundGuideScreen} options={{ title: 'Keep monitoring running' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
