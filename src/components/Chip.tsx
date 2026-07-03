import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

type ChipProps = {
  label?: string;
  children?: ReactNode;
  active?: boolean;
  liveDot?: boolean;
  onPress?: () => void;
};

export function Chip({ label, children, active = false, liveDot = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.active : null,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      {liveDot ? <View style={styles.liveDot} /> : null}
      <Text style={[styles.label, active ? styles.activeLabel : null]}>{children ?? label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: spacing(3),
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  activeLabel: {
    color: colors.card,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.74,
  },
});
