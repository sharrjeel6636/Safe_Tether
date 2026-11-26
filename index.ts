// index.ts
// Order matters: the foreground-service task and the background event handler must be registered
// before the app component, because Android can start the service without opening any screen.
import notifee from '@notifee/react-native';
import { registerRootComponent } from 'expo';
import App from './App';
import { registerForegroundServiceRunner } from './src/services/foregroundService';

registerForegroundServiceRunner();
notifee.onBackgroundEvent(async () => {
  // Taps are handled when the app opens (App.tsx); nothing to do while it is closed.
});

registerRootComponent(App);
