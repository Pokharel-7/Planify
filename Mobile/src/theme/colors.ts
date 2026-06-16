/**
 * Planify Design System — Colors
 * Light-only palette. Do not add dark mode values here.
 */
export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',

  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  primary: '#4F9DFF',
  primaryDark: '#2F7FE0',
  primaryLight: '#DCEEFF',

  border: '#E5E7EB',
  borderLight: '#F1F5F9',
  divider: '#EEF2F6',

  success: '#22C55E',
  successBg: '#EAFBF1',
  warning: '#F59E0B',
  warningBg: '#FEF6E7',
  danger: '#EF4444',
  dangerBg: '#FDEDED',
  info: '#4F9DFF',
  infoBg: '#DCEEFF',

  // Priority colors (Task priority tags)
  priorityLow: '#22C55E',
  priorityMedium: '#F59E0B',
  priorityHigh: '#FB923C',
  priorityUrgent: '#EF4444',

  // Status colors (Task status)
  statusTodo: '#9CA3AF',
  statusInProgress: '#4F9DFF',
  statusReview: '#A855F7',
  statusDone: '#22C55E',
  statusCancelled: '#EF4444',

  overlay: 'rgba(17, 17, 17, 0.45)',
  shadow: 'rgba(17, 17, 17, 0.08)',

  white: '#FFFFFF',
  black: '#111111',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
