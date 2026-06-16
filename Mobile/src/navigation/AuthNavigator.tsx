import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  ForgotPasswordScreen,
  LoginScreen,
  OnboardingScreen,
  OtpVerificationScreen,
  PasswordChangedScreen,
  RegisterScreen,
  ResetPasswordScreen,
  SplashScreen,
  WelcomeScreen,
} from '../screens/auth';
import { colors } from '../theme';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
    </Stack.Navigator>
  );
}
