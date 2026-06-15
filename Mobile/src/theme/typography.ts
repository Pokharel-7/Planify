import { Platform } from 'react-native';

/**
 * Planify Design System — Typography
 * Uses the system font stack for a clean, native feel while keeping
 * consistent sizing/weight scale across the whole app.
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  fontFamily,

  // Display / headings
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.2 },
  h4: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },

  // Body
  bodyLarge: { fontSize: 17, lineHeight: 25, fontWeight: '400' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodySemibold: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },

  // Small
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  captionMedium: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  small: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const },

  // Buttons / labels
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
} as const;
