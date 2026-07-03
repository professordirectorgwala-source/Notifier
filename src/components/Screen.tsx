import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../theme/tokens';

type ScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ title, subtitle, children, scroll = true }: ScreenProps) {
  const content = (
    <View style={styles.content}>
      <View style={styles.header}>
        <Text style={typography.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: spacing(8),
  },
  content: {
    gap: spacing(4),
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3),
  },
  header: {
    gap: spacing(1),
  },
  subtitle: {
    ...typography.body,
    color: colors.subtext,
  },
});
