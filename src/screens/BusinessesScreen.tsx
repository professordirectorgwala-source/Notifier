import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

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
import type { MapMarkerItem, Restaurant } from '../types';

const radiusOptions = [2, 5, 10];

export function BusinessesScreen() {
  const fetchBusinesses = useCallback(() => apiGet('/api/businesses'), []);
  const { data: restaurants = [], isLoading, error } = useQuery<Restaurant[]>('businesses', fetchBusinesses);
  const [search, setSearch] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);
  const [openOnly, setOpenOnly] = useState(false);
  const [activeCuisine, setActiveCuisine] = useState('All');

  const cuisines = useMemo(() => {
    const unique = new Set(restaurants.flatMap((restaurant) => restaurant.cuisines));
    return ['All', ...Array.from(unique).sort()];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesSearch =
        query.length === 0 ||
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.address.toLowerCase().includes(query) ||
        restaurant.cuisines.some((cuisine) => cuisine.toLowerCase().includes(query));
      const matchesRadius = restaurant.distance <= radiusKm;
      const matchesOpen = !openOnly || restaurant.open;
      const matchesCuisine = activeCuisine === 'All' || restaurant.cuisines.includes(activeCuisine);

      return matchesSearch && matchesRadius && matchesOpen && matchesCuisine;
    });
  }, [activeCuisine, openOnly, radiusKm, restaurants, search]);

  const markers = useMemo<MapMarkerItem[]>(() => {
    return filteredRestaurants.map((restaurant) => ({
      id: restaurant.id,
      title: restaurant.name,
      subtitle: `${restaurant.distance.toFixed(1)} km - ${restaurant.cuisines[0]}`,
      kind: 'business',
      lat: restaurant.lat,
      lng: restaurant.lng,
    }));
  }, [filteredRestaurants]);

  if (error) {
    return (
      <Screen title="Businesses" subtitle="Discover places nearby.">
        <Card>
          <Text style={styles.errorText}>{error.message}</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title="Businesses" subtitle="Find food, coffee, and services around Pietermaritzburg.">
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search restaurants, cuisine, or address"
        placeholderTextColor={colors.subtext}
        style={styles.search}
      />

      <View style={styles.filterBlock}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {radiusOptions.map((option) => (
            <Chip key={option} active={radiusKm === option} onPress={() => setRadiusKm(option)}>
              {option} km
            </Chip>
          ))}
        </ScrollView>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Open now</Text>
          <Switch
            value={openOnly}
            onValueChange={setOpenOnly}
            trackColor={{ false: colors.border, true: '#A7F3D0' }}
            thumbColor={openOnly ? colors.accent : colors.card}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {cuisines.map((cuisine) => (
            <Chip key={cuisine} active={activeCuisine === cuisine} onPress={() => setActiveCuisine(cuisine)}>
              {cuisine}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <MapPreview markers={markers} userLocation={PMB_COORDS} showRadius radiusMeters={radiusKm * 1000} />

      <View style={styles.summaryRow}>
        <Text style={typography.section}>{isLoading ? 'Loading places' : `${filteredRestaurants.length} places`}</Text>
        <Text style={styles.summaryText}>Filters update map and list</Text>
      </View>

      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}

      {!isLoading && filteredRestaurants.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No places match these filters.</Text>
          <Text style={styles.emptyCopy}>Try a wider radius or turn off open-now filtering.</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Card style={styles.restaurantCard}>
      <View style={styles.heroStrip}>
        <Text style={styles.heroText}>{restaurant.hero}</Text>
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.meta}>
            {restaurant.distance.toFixed(1)} km - {restaurant.rating.toFixed(1)} rating - {restaurant.price}
          </Text>
        </View>
        <View style={[styles.statusPill, restaurant.open ? styles.openPill : styles.closedPill]}>
          <Text style={[styles.statusText, restaurant.open ? styles.openText : styles.closedText]}>
            {restaurant.open ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>

      <Text style={styles.cuisine}>{restaurant.cuisines.join(' / ')}</Text>
      <Text style={styles.address}>{restaurant.address}</Text>

      <View style={styles.menuBox}>
        <Text style={styles.menuTitle}>Today's menu</Text>
        <Text style={styles.menuItems}>{restaurant.menu.join(' - ')}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button style={styles.smallButton} onPress={() => showToast(`Opening navigation to ${restaurant.name}.`)}>
          Navigate
        </Button>
        <Button style={styles.smallButton} variant="secondary" onPress={() => showToast(`Calling ${restaurant.name}.`)}>
          Call
        </Button>
        <Button style={styles.smallButton} variant="subtle" onPress={() => showToast(`${restaurant.name} saved.`)}>
          Save
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 50,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing(4),
    color: colors.text,
    fontSize: 15,
  },
  filterBlock: {
    gap: spacing(3),
  },
  chipRow: {
    gap: spacing(2),
    paddingRight: spacing(4),
  },
  toggleRow: {
    minHeight: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(4),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '800',
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
  restaurantCard: {
    gap: spacing(3),
  },
  heroStrip: {
    minHeight: 74,
    borderRadius: radius.md,
    backgroundColor: '#111827',
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
  statusPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  openPill: {
    backgroundColor: '#ECFDF5',
  },
  closedPill: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  openText: {
    color: colors.success,
  },
  closedText: {
    color: colors.danger,
  },
  cuisine: {
    ...typography.body,
    fontWeight: '700',
  },
  address: {
    ...typography.small,
  },
  menuBox: {
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    padding: spacing(3),
    gap: spacing(1),
  },
  menuTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 13,
  },
  menuItems: {
    ...typography.small,
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
