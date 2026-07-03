import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { MapPreview } from '../components/MapPreview';
import { Screen } from '../components/Screen';
import { showToast } from '../components/Toast';
import { formatRemaining } from '../lib/format';
import { PMB_COORDS } from '../lib/location';
import { useQuery } from '../lib/query';
import { apiGet } from '../services/api';
import { colors, radius, spacing, typography } from '../theme/tokens';
import type { Circle, MapMarkerItem, ShareMode, ShareSession } from '../types';

const durations = [
  { label: '15 min', seconds: 15 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '60 min', seconds: 60 * 60 },
  { label: '120 min', seconds: 120 * 60 },
  { label: 'Until arrival', seconds: null },
];

const visibilityModes: Array<{ label: string; value: ShareMode }> = [
  { label: 'Exact', value: 'exact' },
  { label: 'Approx', value: 'approx' },
  { label: 'Ghost', value: 'hidden' },
];

export function FriendsScreen() {
  const fetchCircles = useCallback(() => apiGet('/api/circles'), []);
  const { data: circles = [], isLoading, error } = useQuery<Circle[]>('circles', fetchCircles);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [visibilityMode, setVisibilityMode] = useState<ShareMode>('approx');
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(durations[1]);
  const [sheetMode, setSheetMode] = useState<ShareMode>('approx');
  const [shareSession, setShareSession] = useState<ShareSession | null>(null);
  const [now, setNow] = useState(Date.now());

  const activeCircle = useMemo(() => {
    return circles.find((circle) => circle.id === (activeCircleId ?? circles[0]?.id));
  }, [activeCircleId, circles]);

  useEffect(() => {
    if (!activeCircleId && circles[0]) {
      setActiveCircleId(circles[0].id);
      setVisibilityMode(circles[0].shareMode);
    }
  }, [activeCircleId, circles]);

  useEffect(() => {
    if (!shareSession || shareSession.untilArrival) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [shareSession]);

  useEffect(() => {
    if (!shareSession?.expiresAt) {
      return;
    }

    if (shareSession.expiresAt <= now) {
      setShareSession(null);
      showToast('Live sharing ended.');
    }
  }, [now, shareSession]);

  const friendMarkers = useMemo<MapMarkerItem[]>(() => {
    if (!activeCircle) {
      return [];
    }

    const count = Math.min(activeCircle.members, 6);
    return Array.from({ length: count }).map((_, index) => ({
      id: `${activeCircle.id}-friend-${index}`,
      title: `${activeCircle.name} friend ${index + 1}`,
      subtitle: visibilityMode === 'hidden' ? 'Ghost mode' : visibilityMode,
      kind: 'friend',
      lat: PMB_COORDS.lat + 0.006 * Math.sin(index + 1),
      lng: PMB_COORDS.lng + 0.008 * Math.cos(index + 2),
    }));
  }, [activeCircle, visibilityMode]);

  const liveLabel = useMemo(() => {
    if (!shareSession) {
      return null;
    }

    if (shareSession.untilArrival || !shareSession.expiresAt) {
      return 'Live • until arrival';
    }

    const remaining = Math.max(0, Math.ceil((shareSession.expiresAt - now) / 1000));
    return `Live • ${formatRemaining(remaining)}`;
  }, [now, shareSession]);

  const startSharing = () => {
    if (!activeCircle) {
      return;
    }

    const startedAt = Date.now();
    setShareSession({
      circleId: activeCircle.id,
      mode: sheetMode,
      startedAt,
      expiresAt: selectedDuration.seconds === null ? null : startedAt + selectedDuration.seconds * 1000,
      untilArrival: selectedDuration.seconds === null,
    });
    setVisibilityMode(sheetMode);
    setNow(startedAt);
    setShareSheetOpen(false);
    showToast(`Live sharing started for ${activeCircle.name}.`);
  };

  const stopSharing = () => {
    setShareSession(null);
    showToast('Live sharing stopped.');
  };

  if (error) {
    return (
      <Screen title="Friends" subtitle="Your private location circles.">
        <Card>
          <Text style={styles.errorText}>{error.message}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Friends" subtitle="Share live location with the circles you choose.">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {circles.map((circle) => (
          <Chip
            key={circle.id}
            active={circle.id === activeCircle?.id}
            liveDot={shareSession?.circleId === circle.id}
            onPress={() => {
              setActiveCircleId(circle.id);
              setVisibilityMode(circle.shareMode);
            }}
          >
            {circle.name}
          </Chip>
        ))}
      </ScrollView>

      <Card>
        <View style={styles.cardHeader}>
          <View>
            <Text style={typography.section}>{activeCircle?.name ?? (isLoading ? 'Loading...' : 'No circles')}</Text>
            <Text style={styles.meta}>{activeCircle ? `${activeCircle.members} members` : 'Create a circle to begin'}</Text>
          </View>
          {liveLabel ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{liveLabel}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Visibility</Text>
        <View style={styles.wrapRow}>
          {visibilityModes.map((mode) => (
            <Chip
              key={mode.value}
              active={visibilityMode === mode.value}
              onPress={() => setVisibilityMode(mode.value)}
              label={mode.label}
            />
          ))}
        </View>
      </Card>

      <MapPreview markers={friendMarkers} showRadius radiusMeters={1800} />

      <View style={styles.actionRow}>
        <Button style={styles.actionButton} onPress={shareSession ? stopSharing : () => setShareSheetOpen(true)}>
          {shareSession ? 'Stop sharing' : 'Share live'}
        </Button>
        <Button style={styles.actionButton} variant="secondary" onPress={() => showToast('Drop place saved for your circle.')}>
          Drop place
        </Button>
        <Button style={styles.actionButton} variant="danger" onPress={() => showToast('SOS preview sent to trusted contacts.')}>
          SOS
        </Button>
      </View>

      <ShareSheet
        open={shareSheetOpen}
        selectedDuration={selectedDuration}
        sheetMode={sheetMode}
        onClose={() => setShareSheetOpen(false)}
        onDurationChange={setSelectedDuration}
        onModeChange={setSheetMode}
        onStart={startSharing}
      />
    </Screen>
  );
}

type ShareSheetProps = {
  open: boolean;
  selectedDuration: (typeof durations)[number];
  sheetMode: ShareMode;
  onClose: () => void;
  onDurationChange: (duration: (typeof durations)[number]) => void;
  onModeChange: (mode: ShareMode) => void;
  onStart: () => void;
};

function ShareSheet({
  open,
  selectedDuration,
  sheetMode,
  onClose,
  onDurationChange,
  onModeChange,
  onStart,
}: ShareSheetProps) {
  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Start live sharing</Text>
        <Text style={styles.sheetCopy}>Choose who sees you and for how long.</Text>

        <Text style={styles.sectionLabel}>Duration</Text>
        <View style={styles.wrapRow}>
          {durations.map((duration) => (
            <Chip
              key={duration.label}
              active={duration.label === selectedDuration.label}
              label={duration.label}
              onPress={() => onDurationChange(duration)}
            />
          ))}
        </View>

        <Text style={styles.sectionLabel}>Visibility</Text>
        <View style={styles.wrapRow}>
          <Chip active={sheetMode === 'exact'} label="Exact" onPress={() => onModeChange('exact')} />
          <Chip active={sheetMode === 'approx'} label="Approx" onPress={() => onModeChange('approx')} />
        </View>

        <Button onPress={onStart}>Start sharing</Button>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: spacing(2),
    paddingRight: spacing(4),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  meta: {
    ...typography.small,
    marginTop: spacing(0.5),
  },
  sectionLabel: {
    ...typography.small,
    fontWeight: '800',
    marginTop: spacing(4),
    marginBottom: spacing(2),
    textTransform: 'uppercase',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  liveText: {
    color: colors.success,
    fontWeight: '900',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    color: colors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    gap: spacing(2),
    padding: spacing(5),
    paddingBottom: spacing(8),
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.card,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing(1),
  },
  sheetTitle: {
    ...typography.section,
  },
  sheetCopy: {
    ...typography.body,
    color: colors.subtext,
  },
});
