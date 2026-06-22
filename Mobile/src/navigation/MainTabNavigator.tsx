import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bell, CalendarDays, House, ListChecks, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet } from 'react-native';
import {
  CalendarScreen,
  HomeScreen,
  NotificationsScreen,
  ProfileScreen,
  TasksScreen,
} from '../screens/main';
import { colors, typography } from '../theme';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'House', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksScreen}
        options={{ title: 'Tasks', tabBarIcon: ({ color, size }) => <ListChecks color={color} size={size} /> }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{ title: 'Calendar', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ title: 'Alerts', tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  tabLabel: { ...typography.small, marginTop: 2 },
});
