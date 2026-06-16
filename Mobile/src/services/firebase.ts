import { getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Same Firebase project as the Planify web app — fill these in from your
 * Firebase console (Project settings → General → Your apps → Web app),
 * the exact same values used for NEXT_PUBLIC_FIREBASE_* in the web app's .env.
 *
 * Set them in app.json -> expo.extra.firebase, or via EXPO_PUBLIC_FIREBASE_*
 * environment variables.
 */
const extra = (Constants.expoConfig?.extra?.firebase ?? {}) as Record<string, string>;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || extra.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || extra.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || extra.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || extra.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || extra.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || extra.appId,
};

// Treat unfilled placeholder values (e.g. "REPLACE_WITH_FIREBASE_API_KEY")
// as "not configured" rather than letting Firebase try to init with garbage
// credentials, which can hang/crash the auth screens before any tap happens.
const isPlaceholder = (v?: string) => !v || v.startsWith('REPLACE_WITH_');

export const isFirebaseConfigured = !isPlaceholder(firebaseConfig.apiKey) && !isPlaceholder(firebaseConfig.projectId);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

/**
 * Lazily initializes Firebase only when actually needed (i.e. when the user
 * taps "Continue with Google"), and only if real config values are present.
 * Never runs automatically on screen mount/import.
 */
export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet. Add your project keys in app.json -> expo.extra.firebase.');
  }
  if (!_app) {
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  if (!_auth) {
    _auth = initializeAuth(_app, { persistence: getReactNativePersistence(AsyncStorage) });
  }
  return _auth;
}
