import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useEnsureWorkspaceContext } from '../hooks/useEnsureWorkspaceContext';
import {
  AdminDashboardScreen,
  BillingHistoryScreen,
  ChangePasswordScreen,
  ChatScreen,
  ConversationListScreen,
  CreateTaskScreen,
  EditProfileScreen,
  InvitationsScreen,
  PaymentWebViewScreen,
  ManageUsersScreen,
  MemberProfileScreen,
  ProjectDetailScreen,
  ProjectsListScreen,
  ReportsScreen,
  SettingsScreen,
  SubscriptionScreen,
  TaskDetailScreen,
  TeamMembersScreen,
  TimeTrackingScreen,
} from '../screens/main';
import {
  AccessDeniedScreen,
  MaintenanceScreen,
  NetworkErrorScreen,
  NotFoundScreen,
  ServerErrorScreen,
} from '../screens/system/StatusScreens';
import { colors } from '../theme';
import { MainTabNavigator } from './MainTabNavigator';
import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStackNavigator() {
  // Establishes currentWorkspaceId/role in the auth store once, on login,
  // so every screen below can query the real backend against a workspace.
  useEnsureWorkspaceContext();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ConversationList" component={ConversationListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="TimeTracking" component={TimeTrackingScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="BillingHistory" component={BillingHistoryScreen} />
      <Stack.Screen name="TeamMembers" component={TeamMembersScreen} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="Invitations" component={InvitationsScreen} />
      <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
      <Stack.Screen name="ServerError" component={ServerErrorScreen} />
      <Stack.Screen name="NetworkError" component={NetworkErrorScreen} />
      <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
      <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
    </Stack.Navigator>
  );
}
