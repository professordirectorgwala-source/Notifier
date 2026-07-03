import { Platform } from 'react-native';

export const colors = {
  bg: '#F6F7F8',
  card: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  border: '#E5E7EB',
  primary: '#0B0B0C',
  accent: '#10B981',
  warning: '#F59E0B',
  danger: '#DC2626',
  success: '#059669',
  blue: '#2563EB',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = (n: number) => n * 4;

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#111827',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: '#111827',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
    },
  }),
};

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800' as const,
    color: colors.text,
  },
  section: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.subtext,
  },
};
