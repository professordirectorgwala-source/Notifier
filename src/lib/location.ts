import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';

import type { Coords } from '../types';

type GeofencePoint = Coords & {
  id: string;
  title: string;
};

type GeofenceOptions = {
  radiusMeters: number;
  points: GeofencePoint[];
  enabled?: boolean;
  onNear?: (point: GeofencePoint, distanceMeters: number) => void;
};

export const PMB_COORDS: Coords = {
  lat: -29.6006,
  lng: 30.3794,
};

export async function ensureForegroundPermission() {
  const current = await Location.getForegroundPermissionsAsync();
  if (current.granted) {
    return current;
  }

  return Location.requestForegroundPermissionsAsync();
}

export async function getCurrentCoords(): Promise<Coords> {
  const permission = await ensureForegroundPermission();

  if (!permission.granted) {
    throw new Error('Location permission was denied.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

export function distanceMeters(a: Coords, b: Coords): number {
  const earthRadius = 6371000;
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);

  const h =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function useGeofence({ radiusMeters, points, enabled = true, onNear }: GeofenceOptions) {
  useEffect(() => {
    if (!enabled || points.length === 0) {
      return;
    }

    let cancelled = false;

    getCurrentCoords()
      .then((current) => {
        if (cancelled) {
          return;
        }

        points.forEach((point) => {
          const distance = distanceMeters(current, point);
          if (distance <= radiusMeters) {
            if (onNear) {
              onNear(point, distance);
            } else {
              Alert.alert('Notifier', `You are near ${point.title}.`);
            }
          }
        });
      })
      .catch((error) => {
        console.log('Geofence foreground check skipped:', error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, onNear, points, radiusMeters]);

  // Future upgrade: register Expo background tasks here for real background geofencing.
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
