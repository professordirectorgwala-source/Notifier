import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { MapPreview } from '../components/MapPreview';
import { Screen } from '../components/Screen';
import { showToast } from '../components/Toast';
import { PMB_COORDS } from '../lib/location';
import { useQuery } from '../lib/query';
import { apiGet } from '../services/api';
import { colors, radius, spacing, typography } from '../theme/tokens';
import type { EventItem, MapMarkerItem } from '../types';

const radiusOptions = [2, 5, 10];
const categories = ['All', 'Comedy', 'Nightlife', 'Arts'];
const categoryPasses = ['Comedy', 'Nightlife', 'Arts'];

export function EventsScreen() {
  const fetchEvents = useCallback(() => apiGet('/api/events'), []);
  const { data: events = [], isLoading, error } = useQuery<EventItem[]>('events', fetchEvents);
  const [radiusKm, setRadiusKm] = useState(5);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesRadius = event.distance <= radiusKm;
      const matchesCategory = activeCategory === 'All' || event.category === activeCategory;

      return matchesRadius && matchesCategory;
    });
  }, [activeCategory, events, radiusKm]);

  const markers = useMemo<MapMarkerItem[]>(() => {
    return filteredEvents.map((event) => ({
      id: event.id,
      title: event.title,
      subtitle: `${event.category} - ${event.distance.toFixed(1)} km`,
      kind: 'event',
      lat: event.lat,
      lng: event.lng,
    }));
  }, [filteredEvents]);

  if (error) {
    return (
      <Screen title="Events" subtitle="Find what is happening nearby.">
        <Card>
          <Text style={styles.errorText}>{error.message}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Events" subtitle="Comedy, music, arts, and local moments around you.">
      <View style={styles.filterBlock}>
        <Text style={styles.filterTitle}>Radius</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {radiusOptions.map((option) => (
            <Chip key={option} active={radiusKm === option} onPress={() => setRadiusKm(option)}>
              {option} km
            </Chip>
          ))}
        </ScrollView>

        <Text style={styles.filterTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((category) => (
            <Chip key={category} active={activeCategory === category} onPress={() => setActiveCategory(category)}>
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <MapPreview markers={markers} userLocation={PMB_COORDS} showRadius radiusMeters={radiusKm * 1000} />

      <Card style={styles.passCard}>
        <Text style={typography.section}>Category pass</Text>
        <Text style={styles.passCopy}>Enable alerts for event categories you care about.</Text>
        <View style={styles.passRow}>
          {categoryPasses.map((category) => (
            <Chip
              key={category}
              label={category}
              liveDot
              onPress={() => showToast(`${category} alerts enabled.`)}
            />
          ))}
        </View>
      </Card>

      <View style={styles.summaryRow}>
        <Text style={typography.section}>{isLoading ? 'Loading events' : `${filteredEvents.length} events`}</Text>
        <Text style={styles.summaryText}>Filters update map and list</Text>
      </View>

      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {!isLoading && filteredEvents.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No events match these filters.</Text>
          <Text style={styles.emptyCopy}>Try another category or a wider radius.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <Card style={styles.eventCard}>
      <View style={styles.heroStrip}>
        <Text style={styles.heroText}>{event.hero}</Text>
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.name}>{event.title}</Text>
          <Text style={styles.meta}>{event.date}</Text>
        </View>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      </View>

      <Text style={styles.venue}>{event.venue}</Text>
      <Text style={styles.meta}>{event.distance.toFixed(1)} km away</Text>

      <View style={styles.buttonRow}>
        <Button style={styles.smallButton} onPress={() => showToast(`Reminder set for ${event.title}.`)}>
          Remind me
        </Button>
        <Button style={styles.smallButton} variant="secondary" onPress={() => showToast(`Opening route to ${event.venue}.`)}>
          Navigate
        </Button>
        <Button style={styles.smallButton} variant="subtle" onPress={() => showToast(`${event.title} saved.`)}>
          Save
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  filterBlock: {
    gap: spacing(2),
  },
  filterTitle: {
    ...typography.small,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chipRow: {
    gap: spacing(2),
    paddingRight: spacing(4),
  },
  passCard: {
    gap: spacing(3),
  },
  passCopy: {
    ...typography.body,
    color: colors.subtext,
  },
  passRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  summaryText: {
    ...typography.small,
  },
  eventCard: {
    gap: spacing(3),
  },
  heroStrip: {
    minHeight: 74,
    borderRadius: radius.md,
    backgroundColor: '#0B0B0C',
    padding: spacing(4),
    justifyContent: 'flex-end',
  },
  heroText: {
    color: colors.card,
    fontSize: 18,
    fontWeight: '900',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  cardTitleBlock: {
    flex: 1,
    gap: spacing(1),
  },
  name: {
    ...typography.section,
  },
  meta: {
    ...typography.small,
  },
  venue: {
    ...typography.body,
    fontWeight: '700',
  },
  categoryPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    backgroundColor: '#FFFBEB',
  },
  categoryText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '900',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  smallButton: {
    flex: 1,
  },
  emptyTitle: {
    ...typography.section,
  },
  emptyCopy: {
    ...typography.body,
    color: colors.subtext,
    marginTop: spacing(1),
  },
  errorText: {
    color: colors.danger,
  },
});
