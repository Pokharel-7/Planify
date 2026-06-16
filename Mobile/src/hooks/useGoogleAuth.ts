import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';
import { useAuthStore } from '../store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth client IDs come from Google Cloud Console
 * (APIs & Services -> Credentials) for the SAME Firebase/Google project
 * the web app uses. You need at minimum a Web client ID; iOS/Android client
 * IDs are required for standalone (non-Expo-Go) builds.
 *
 * Set these in app.json -> expo.extra.google, or via EXPO_PUBLIC_GOOGLE_* env vars.
 */
const extra = (Constants.expoConfig?.extra?.google ?? {}) as Record<string, string>;

const isPlaceholder = (v?: string) => !v || v.startsWith('REPLACE_WITH_');

const clientIds = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || extra.webClientId,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || extra.iosClientId,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || extra.androidClientId,
};

const isGoogleConfigured = !isPlaceholder(clientIds.webClientId);

// expo-auth-session's Google provider invariant-checks for a platform-specific
// client ID (iosClientId on iOS, androidClientId on Android) at MOUNT time,
// even before the user taps anything — passing `undefined` there crashes the
// screen outright. So we always pass a non-empty string; when unconfigured
// it's a harmless placeholder that can never actually complete a sign-in,
// since signIn() below refuses to call promptAsync() unless isConfigured.
const DUMMY_ID = 'not-configured.apps.googleusercontent.com';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const isConfigured = isFirebaseConfigured && isGoogleConfigured;

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: isPlaceholder(clientIds.webClientId) ? DUMMY_ID : clientIds.webClientId,
    iosClientId: isPlaceholder(clientIds.iosClientId) ? DUMMY_ID : clientIds.iosClientId,
    androidClientId: isPlaceholder(clientIds.androidClientId) ? DUMMY_ID : clientIds.androidClientId,
  });

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      handleFirebaseSignIn(response.authentication.idToken);
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const handleFirebaseSignIn = async (googleIdToken: string) => {
    setLoading(true);
    setError('');
    try {
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
      const firebaseIdToken = await userCredential.user.getIdToken();

      const { data } = await authService.googleAuth(firebaseIdToken);
      setSession(data.user, data.token);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = () => {
    if (!isConfigured) {
      setError('Google sign-in is not configured yet. Add your Firebase and Google client IDs in app.json.');
      return;
    }
    setError('');
    promptAsync();
  };

  return { signIn, loading, error, isConfigured, isRequestReady: !!request };
}
