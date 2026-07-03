import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger';

type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const variantStyle = buttonStyles[variant];
  const textStyle = textStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textStyle.color} /> : <Text style={[styles.text, textStyle]}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    paddingHorizontal: spacing(4),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});

const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  subtle: {
    backgroundColor: '#EEF0F2',
    borderColor: '#EEF0F2',
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: colors.card,
  },
  secondary: {
    color: colors.text,
  },
  subtle: {
    color: colors.text,
  },
  danger: {
    color: colors.card,
  },
});
