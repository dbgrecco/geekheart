import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from './src/config/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(token: string | null) {
  let pushToken: string | undefined;
  if (Constants.isDevice) {
    const perm: any = await Notifications.getPermissionsAsync();
    let isGranted = perm.granted || perm.status === 'granted';
    if (!isGranted) {
      const reqPerm: any = await Notifications.requestPermissionsAsync();
      isGranted = reqPerm.granted || reqPerm.status === 'granted';
    }
    if (!isGranted) {
      console.log('Failed to get push token for push notification!');
      return;
    }
    pushToken = (await Notifications.getExpoPushTokenAsync()).data;

    if (pushToken && token) {
      try {
        await apiFetch('/api/me', {
          method: 'PUT',
          body: JSON.stringify({ pushToken }),
        }, token);
      } catch (error) {
        console.error('Failed to send push token to backend', error);
      }
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return pushToken;
}

function MainApp() {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      registerForPushNotificationsAsync(token);
    }

    const sub1: any = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
    });

    const sub2: any = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification response received:', response);
    });

    return () => {
      if (sub1 && typeof sub1.remove === 'function') sub1.remove();
      if (sub2 && typeof sub2.remove === 'function') sub2.remove();
    };
  }, [token]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
