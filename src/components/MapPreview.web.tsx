import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { distanceMeters, PMB_COORDS } from '../lib/location';
import { colors, radius, spacing } from '../theme/tokens';
import type { Coords, MapMarkerItem } from '../types';

type MapPreviewProps = {
  markers: MapMarkerItem[];
  userLocation?: Coords;
  showRadius?: boolean;
  radiusMeters?: number;
  height?: number;
  regionDelta?: number;
  interactive?: boolean;
};

type Cluster = {
  id: string;
  lat: number;
  lng: number;
  markers: MapMarkerItem[];
};

export function MapPreview({
  markers,
  userLocation = PMB_COORDS,
  showRadius = false,
  radiusMeters = 2500,
  height = 210,
  regionDelta = 0.07,
}: MapPreviewProps) {
  const clusters = useMemo(() => groupNearbyMarkers(markers), [markers]);

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.gridLayer}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={`h-${index}`} style={[styles.gridLine, styles.horizontalLine, { top: `${index * 16.67}%` }]} />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={`v-${index}`} style={[styles.gridLine, styles.verticalLine, { left: `${index * 16.67}%` }]} />
        ))}
      </View>

      {showRadius ? <View style={[styles.radiusRing, radiusRingStyle(radiusMeters, regionDelta)]} /> : null}

      <View style={styles.userDotOuter}>
        <View style={styles.userDot} />
      </View>

      {clusters.map((cluster) => {
        const isCluster = cluster.markers.length > 1;
        const first = cluster.markers[0];
        const point = positionFor(cluster, userLocation, regionDelta);

        return (
          <View key={cluster.id} style={[styles.markerWrap, { left: `${point.x}%`, top: `${point.y}%` }]}>
            {isCluster ? (
              <View style={styles.clusterPin}>
                <Text style={styles.clusterText}>{cluster.markers.length}</Text>
              </View>
            ) : (
              <View style={[styles.pin, markerStyles[first.kind]]} />
            )}
            <Text numberOfLines={1} style={styles.markerLabel}>
              {isCluster ? `${cluster.markers.length} nearby` : first.title}
            </Text>
          </View>
        );
      })}

      <View style={styles.mapBadge}>
        <Text style={styles.mapBadgeText}>{markers.length} nearby</Text>
      </View>
    </View>
  );
}

function groupNearbyMarkers(markers: MapMarkerItem[]): Cluster[] {
  const clusters: Cluster[] = [];

  markers.forEach((marker) => {
    const nearby = clusters.find((cluster) => distanceMeters(cluster, marker) < 130);

    if (nearby) {
      nearby.markers.push(marker);
      nearby.lat = average(nearby.markers.map((item) => item.lat));
      nearby.lng = average(nearby.markers.map((item) => item.lng));
      nearby.id = nearby.markers.map((item) => item.id).join('-');
      return;
    }

    clusters.push({
      id: marker.id,
      lat: marker.lat,
      lng: marker.lng,
      markers: [marker],
    });
  });

  return clusters;
}

function positionFor(point: Coords, center: Coords, regionDelta: number) {
  const halfDelta = regionDelta / 2;
  const x = 50 + ((point.lng - center.lng) / halfDelta) * 50;
  const y = 50 - ((point.lat - center.lat) / halfDelta) * 50;

  return {
    x: clamp(x, 8, 92),
    y: clamp(y, 10, 90),
  };
}

function radiusRingStyle(radiusMeters: number, regionDelta: number) {
  const metersPerDegree = 111_320;
  const visibleMeters = Math.max(regionDelta * metersPerDegree, 1);
  const size = clamp((radiusMeters / visibleMeters) * 100, 24, 92);
  const offset = (100 - size) / 2;

  return {
    left: `${offset}%` as const,
    top: `${offset}%` as const,
    width: `${size}%` as const,
    height: `${size}%` as const,
  };
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: '#DDE8E3',
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.36,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#B7C8C0',
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  radiusRing: {
    position: 'absolute',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
  },
  userDotOuter: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.blue,
    borderWidth: 2,
    borderColor: colors.card,
  },
  markerWrap: {
    position: 'absolute',
    maxWidth: 118,
    alignItems: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: colors.card,
  },
  clusterPin: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    paddingHorizontal: spacing(2),
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterText: {
    color: colors.card,
    fontWeight: '900',
    fontSize: 13,
  },
  markerLabel: {
    marginTop: spacing(1),
    maxWidth: 118,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  mapBadge: {
    position: 'absolute',
    top: spacing(3),
    right: spacing(3),
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  mapBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});

const markerStyles = StyleSheet.create({
  friend: {
    backgroundColor: colors.accent,
  },
  business: {
    backgroundColor: colors.primary,
  },
  event: {
    backgroundColor: colors.warning,
  },
});
