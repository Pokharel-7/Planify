import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { AuthNavigator } from './AuthNavigator';
import { MainStackNavigator } from './MainStackNavigator';
import { pushNotificationService } from '../services/pushNotificationService';
import { useAuthStore } from '../store/useAuthStore';
export function RootNavigator() {
  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (token) {
      pushNotificationService.registerForPushNotifications();
    }
  }, [token]);
  return (
    <NavigationContainer>
      {token ? <MainStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
