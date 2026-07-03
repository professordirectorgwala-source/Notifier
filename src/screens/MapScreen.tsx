import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { MapPreview } from '../components/MapPreview';
import { Screen } from '../components/Screen';
import { PMB_COORDS } from '../lib/location';
import { useQuery } from '../lib/query';
import { apiGet } from '../services/api';
import { colors, radius, spacing, typography } from '../theme/tokens';
import type { EventItem, MapMarkerItem, Restaurant } from '../types';

export function MapScreen() {
  const fetchBusinesses = useCallback(() => apiGet('/api/businesses'), []);
  const fetchEvents = useCallback(() => apiGet('/api/events'), []);
  const { data: restaurants = [] } = useQuery<Restaurant[]>('businesses', fetchBusinesses);
  const { data: events = [] } = useQuery<EventItem[]>('events', fetchEvents);
  const [regionDelta, setRegionDelta] = useState(0.08);

  const markers = useMemo<MapMarkerItem[]>(() => {
    const businessMarkers: MapMarkerItem[] = restaurants.map((restaurant) => ({
      id: `business-${restaurant.id}`,
      title: restaurant.name,
      subtitle: restaurant.cuisines.join(', '),
      kind: 'business',
      lat: restaurant.lat,
      lng: restaurant.lng,
    }));

    const eventMarkers: MapMarkerItem[] = events.map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      subtitle: event.category,
      kind: 'event',
      lat: event.lat,
      lng: event.lng,
    }));

    return [...businessMarkers, ...eventMarkers];
  }, [events, restaurants]);

  const zoomIn = () => setRegionDelta((value) => Math.max(0.02, value / 1.4));
  const zoomOut = () => setRegionDelta((value) => Math.min(0.18, value * 1.4));

  return (
    <Screen title="Map" subtitle="Nearby places and events in one view.">
      <View style={styles.mapWrap}>
        <MapPreview
          markers={markers}
          userLocation={PMB_COORDS}
          showRadius
          radiusMeters={3500}
          height={430}
          regionDelta={regionDelta}
          interactive
        />
        <View style={styles.zoomControls}>
          <ZoomButton label="+" onPress={zoomIn} />
          <ZoomButton label="-" onPress={zoomOut} />
        </View>
      </View>

      <Card style={styles.infoCard}>
        <Text style={typography.section}>Discover nearby</Text>
        <Text style={styles.infoCopy}>Use the map to discover nearby restaurants, events, and places around you.</Text>
        <View style={styles.legendRow}>
          <LegendDot color={colors.blue} label="you" />
          <LegendDot color={colors.primary} label="nearby items" />
          <LegendDot color={colors.primary} label="places" />
          <LegendDot color={colors.warning} label="events" />
        </View>
      </Card>
    </Screen>
  );
}

function ZoomButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.zoomButton}>
      <Text style={styles.zoomText}>{label}</Text>
    </Pressable>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    position: 'relative',
  },
  zoomControls: {
    position: 'absolute',
    top: spacing(4),
    left: spacing(4),
    gap: spacing(2),
  },
  zoomButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '900',
  },
  infoCard: {
    gap: spacing(3),
  },
  infoCopy: {
    ...typography.body,
    color: colors.subtext,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.small,
    fontWeight: '700',
  },
});
