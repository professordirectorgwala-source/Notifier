import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle as MapCircle, Marker, Region } from 'react-native-maps';

import { colors, radius, spacing } from '../theme/tokens';
import type { Coords, MapMarkerItem } from '../types';
import { distanceMeters, PMB_COORDS } from '../lib/location';

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
  interactive = false,
}: MapPreviewProps) {
  const clusters = useMemo(() => groupNearbyMarkers(markers), [markers]);
  const region: Region = {
    latitude: userLocation.lat,
    longitude: userLocation.lng,
    latitudeDelta: regionDelta,
    longitudeDelta: regionDelta,
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        region={region}
        scrollEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
        zoomEnabled={interactive}
        toolbarEnabled={false}
      >
        {showRadius ? (
          <MapCircle
            center={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            radius={radiusMeters}
            strokeColor="rgba(16, 185, 129, 0.35)"
            fillColor="rgba(16, 185, 129, 0.10)"
          />
        ) : null}

        <Marker coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }} title="You">
          <View style={styles.userDotOuter}>
            <View style={styles.userDot} />
          </View>
        </Marker>

        {clusters.map((cluster) => {
          const isCluster = cluster.markers.length > 1;
          const first = cluster.markers[0];

          return (
            <Marker
              key={cluster.id}
              coordinate={{ latitude: cluster.lat, longitude: cluster.lng }}
              title={isCluster ? `${cluster.markers.length} nearby items` : first.title}
              description={isCluster ? undefined : first.subtitle}
            >
              {isCluster ? (
                <View style={styles.clusterPin}>
                  <Text style={styles.clusterText}>{cluster.markers.length}</Text>
                </View>
              ) : (
                <View style={[styles.pin, markerStyles[first.kind]]} />
              )}
            </Marker>
          );
        })}
      </MapView>
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

  // Future upgrade: replace this lightweight grouping with supercluster for large datasets.
  return clusters;
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: '#DDE8E3',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userDotOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.blue,
    borderWidth: 2,
    borderColor: colors.card,
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
