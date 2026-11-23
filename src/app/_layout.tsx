import notifee, { EventType } from '@notifee/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { bootstrap } from '../bootstrap';
import { RootNavigator } from '../navigation/RootNavigator';
import { navigationRef, openRoute } from '../navigation/types';

export default function RootLayout() {
  useEffect(() => {
    void bootstrap();
    const off = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) openRoute(detail.notification?.data?.route);
    });
    void notifee.getInitialNotification().then((n) => openRoute(n?.notification?.data?.route));
    return off;
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
