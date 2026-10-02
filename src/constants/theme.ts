// configuracoes de cores, fontes e espacamentos do aplicativo de academia

import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    primary: '#16A34A',
    accentLime: '#65A30D',
    accentCyan: '#0284C7',
    danger: '#DC2626',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#09090B',
    card: '#141416',
    border: '#27272A',
    primary: '#CCFF00',
    accentLime: '#CCFF00',
    accentCyan: '#38BDF8',
    danger: '#EF4444',
    backgroundElement: '#18181B',
    backgroundSelected: '#27272A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 70 }) ?? 60;
export const MaxContentWidth = 800;
