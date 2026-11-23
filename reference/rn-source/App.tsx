// App.tsx
import notifee, { EventType } from '@notifee/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { bootstrap } from './src/bootstrap';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef, openRoute } from './src/navigation/types';

export default function App() {
  useEffect(() => {
    void bootstrap();
    // A tap on an alert notification opens the matching screen (foreground, background or cold start).
    const off = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) openRoute(detail.notification?.data?.route);
    });
    void notifee.getInitialNotification().then((n) => openRoute(n?.notification.data?.route));
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
