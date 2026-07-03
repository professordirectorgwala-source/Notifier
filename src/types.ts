export type ShareMode = 'exact' | 'approx' | 'hidden';

export type Circle = {
  id: string;
  name: string;
  members: number;
  shareMode: ShareMode;
};

export type Restaurant = {
  id: string;
  name: string;
  distance: number;
  open: boolean;
  rating: number;
  cuisines: string[];
  price: string;
  address: string;
  menu: string[];
  hero: string;
  lat: number;
  lng: number;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  venue: string;
  distance: number;
  category: string;
  hero: string;
  lat: number;
  lng: number;
};

export type ShareSession = {
  circleId: string;
  mode: ShareMode;
  startedAt: number;
  expiresAt: number | null;
  untilArrival: boolean;
};

export type Coords = {
  lat: number;
  lng: number;
};

export type MapMarkerKind = 'friend' | 'business' | 'event';

export type MapMarkerItem = Coords & {
  id: string;
  title: string;
  subtitle?: string;
  kind: MapMarkerKind;
};
