import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Screen } from '../components/Screen';
import { showToast } from '../components/Toast';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function ProfileScreen() {
  const [approxDefault, setApproxDefault] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('06:30');

  return (
    <Screen title="Profile" subtitle="Privacy and notification controls.">
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MG</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>Mqondisi Director Gwala</Text>
          <Text style={styles.meta}>director@example.com</Text>
          <Text style={styles.meta}>+27 65 942 0841</Text>
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={typography.section}>Privacy controls</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Default to approximate location</Text>
            <Text style={styles.settingHelp}>Circles see your area unless you choose exact sharing.</Text>
          </View>
          <Switch
            value={approxDefault}
            onValueChange={setApproxDefault}
            trackColor={{ false: colors.border, true: '#A7F3D0' }}
            thumbColor={approxDefault ? colors.accent : colors.card}
          />
        </View>
        <View style={styles.modePreview}>
          <Chip active={approxDefault} label="Approx default" />
          <Chip active={!approxDefault} label="Exact default" />
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={typography.section}>Notification controls</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingTitle}>Quiet hours</Text>
            <Text style={styles.settingHelp}>
              {quietHours ? `${quietStart} to ${quietEnd}` : 'Notifications are always allowed'}
            </Text>
          </View>
          <Switch
            value={quietHours}
            onValueChange={setQuietHours}
            trackColor={{ false: colors.border, true: '#A7F3D0' }}
            thumbColor={quietHours ? colors.accent : colors.card}
          />
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.inputLabel}>Start</Text>
            <TextInput
              value={quietStart}
              onChangeText={setQuietStart}
              editable={quietHours}
              style={[styles.timeInput, !quietHours ? styles.disabledInput : null]}
            />
          </View>
          <View style={styles.timeField}>
            <Text style={styles.inputLabel}>End</Text>
            <TextInput
              value={quietEnd}
              onChangeText={setQuietEnd}
              editable={quietHours}
              style={[styles.timeInput, !quietHours ? styles.disabledInput : null]}
            />
          </View>
        </View>
      </Card>

      <View style={styles.buttonRow}>
        <Button style={styles.button} onPress={() => showToast('Profile settings saved.')}>
          Save
        </Button>
        <Button style={styles.button} variant="secondary" onPress={() => showToast('Signed out locally.')}>
          Sign out
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.card,
    fontSize: 22,
    fontWeight: '900',
  },
  profileText: {
    flex: 1,
    gap: spacing(1),
  },
  name: {
    ...typography.section,
  },
  meta: {
    ...typography.small,
  },
  settingsCard: {
    gap: spacing(4),
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(4),
  },
  settingCopy: {
    flex: 1,
    gap: spacing(1),
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '800',
  },
  settingHelp: {
    ...typography.small,
  },
  modePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  timeField: {
    flex: 1,
    gap: spacing(1),
  },
  inputLabel: {
    ...typography.small,
    fontWeight: '800',
  },
  timeInput: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing(3),
    color: colors.text,
    fontWeight: '800',
  },
  disabledInput: {
    opacity: 0.45,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  button: {
    flex: 1,
  },
});
