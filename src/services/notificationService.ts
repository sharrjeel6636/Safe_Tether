import * as notifeeModule from '@notifee/react-native';

const notifee = notifeeModule.default;
const AndroidImportance = notifeeModule.AndroidImportance;

export async function displayNotification(title: string, body: string): Promise<void> {
  try {
    const channelId = await notifee.createChannel({
      id: 'safetether_alerts',
      name: 'SafeTether Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });

    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Notification display error:', error);
  }
}
