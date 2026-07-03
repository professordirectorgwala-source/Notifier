# Notifier

Notifier is a location-based Expo React Native app for staying connected with friends and family, discovering nearby businesses, and finding local events.

Tagline: Keeping you updated and in touch with the world around you.

## Quick Start

```bash
npm install
npm start
```

Then open the app with Expo Go, an Android emulator, or an iOS simulator.

## Scripts

- `npm start` starts Expo.
- `npm run android` starts Expo for Android.
- `npm run ios` starts Expo for iOS.
- `npm run web` starts Expo for web.
- `npm run typecheck` runs TypeScript checks after dependencies are installed.
- `npm run self-test` explains where the lightweight self-checks run.

## App Structure

```text
src/
  App.tsx
  types.ts
  components/
    Button.tsx
    Card.tsx
    Chip.tsx
    MapPreview.tsx
    Screen.tsx
    Toast.tsx
  lib/
    format.ts
    location.ts
    query.ts
    selfTests.ts
  screens/
    FriendsScreen.tsx
    BusinessesScreen.tsx
    EventsScreen.tsx
    MapScreen.tsx
    ProfileScreen.tsx
  services/
    api.ts
  theme/
    tokens.ts
```

## Google Maps Keys

The MVP uses `react-native-maps`. For production builds, add Google Maps API keys through Expo config:

- Android: add the Google Maps API key under the Android config for `react-native-maps`.
- iOS: add the iOS Maps key if using Google as the provider instead of Apple Maps.
- Keep keys out of source control and inject them through EAS secrets or environment-specific config.

## Mock API

`src/services/api.ts` provides mock endpoints:

- `/api/circles`
- `/api/businesses`
- `/api/events`

Each response is validated with Zod before it is returned. To replace the mock layer with a real backend, keep the same response models, move fetching into `apiGet`, and validate server responses with the existing schemas before screens consume data.

## Location

`src/lib/location.ts` contains foreground permission helpers, current-location lookup, and a foreground geofence stub. Background geofencing is intentionally not implemented in this MVP; add Expo Task Manager and background location registration there when the product is ready for it.

## Self-Checks

Development self-checks run from `src/lib/selfTests.ts` when the app starts in Expo development mode. They assert that mock arrays are populated, circle share modes are valid, and `formatRemaining` returns the expected countdown strings.

## Future Upgrades

- Authentication and trusted-circle invites
- Real backend and persistent profile settings
- Push notifications
- Background geofencing
- Payments and event tickets
- Business portal for menus, offers, and analytics
