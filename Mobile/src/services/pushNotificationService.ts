import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationService = {
  /**
   * Requests permission and registers this device's push token with the
   * backend. Safe to call on every app start / login — it's a no-op if
   * permission is denied, and the backend upserts by token so re-registering
   * the same device doesn't create duplicates.
   */
  async registerForPushNotifications(): Promise<void> {
    if (!Device.isDevice) {
      // Push notifications don't work on simulators/emulators without
      // extra setup — skip silently rather than erroring out.
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    try {
      // The backend expects a raw FCM token (not an Expo push token), since
      // it sends notifications directly via firebase-admin.
      const devicePushToken = await Notifications.getDevicePushTokenAsync();
      await api.post('/notifications/devices/fcm-token', { fcmToken: devicePushToken.data });
    } catch (err) {
      // Non-fatal — the app should still work without push notifications.
      console.log('Push registration failed:', err);
    }
  },
};
