# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

POC Mobile Collect is an Expo React Native application for remote geographic data collection. The app captures three types of geo data: **GeoPoint** (single locations), **GeoTrace** (paths/lines), and **GeoShape** (areas/polygons) using `expo-location`.

## Development Commands

### Running the App
```bash
npm start              # Start Expo development server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in web browser
```

### Installation
```bash
npm install            # Install dependencies
```

## Architecture

### State Management Pattern

The app uses **React Context + useReducer** for centralized geo data state management:

- **GeoDataProvider** (`src/hooks/useGeoData.tsx`): Wraps the entire app in `App.tsx`
- **useGeoData hook**: Accessed from any screen to add/remove/submit geo data
- State includes: `collectedData`, `isSubmitting`, `error`, `lastSubmissionId`
- Actions: `ADD_GEOPOINT`, `ADD_GEOTRACE`, `ADD_GEOSHAPE`, `REMOVE_ITEM`, `CLEAR_ALL`, `SUBMIT_*`

When modifying data collection logic, always update the reducer in `useGeoData.tsx` rather than creating local state in screens.

### Location Services

Two custom hooks in `src/hooks/useLocation.ts`:

1. **useLocation**: Single-point location capture with permission management
   - Returns: `coordinate`, `getCurrentLocation()`, `requestPermission()`, `hasPermission`, `loading`, `error`

2. **useLocationTracking**: Continuous location tracking for traces/shapes
   - Returns: `coordinates[]`, `isTracking`, `startTracking()`, `stopTracking()`, `clearCoordinates()`
   - Uses `expo-location`'s `watchPositionAsync` with 2-second intervals and 5-meter distance threshold
   - **Important**: `startTracking()` clears previous coordinates - users must save before starting a new session

### Mock API Service

`src/services/api.ts` provides an in-memory mock serverless backend:

- Uses `mockStorage` array to simulate a database
- All methods return `ApiResponse<T>` with `success`, `data`, `error`, `message`
- Methods: `submitGeoData()`, `getSubmittedData()`, `getCollectionById()`, `deleteCollection()`, `syncData()`, `clearMockStorage()`
- Simulates 500ms network delay (800ms for sync)

When adding new API endpoints, follow the existing pattern and maintain the `ApiResponse` wrapper type.

### Navigation Structure

Stack navigator in `src/navigation/AppNavigator.tsx`:

- **Home** → Main dashboard (header hidden)
- **GeoPoint** → Single point capture (green header)
- **GeoTrace** → Path tracking (orange header)
- **GeoShape** → Area/polygon capture (purple header)
- **DataList** → View collected data
- **MapView** → Leaflet map visualization

Each screen receives typed navigation props via `RootStackParamList` in `src/navigation/types`.

### Type System

Core types in `src/types/geo.ts`:

- **Coordinate**: Base location type with `latitude`, `longitude`, optional `altitude`, `accuracy`, `timestamp`
- **GeoPoint/GeoTrace/GeoShape**: All have `id`, `type`, `createdAt`, optional `name`/`description`
- **GeoData**: Union type for all three geo types
- **GeoDataCollection**: Container with `id`, `items[]`, `submittedAt`, `status` ('draft' | 'submitted' | 'synced')

### UUID Generation

The app uses a custom UUID v4 configuration in `src/utils/uuid.tsx`:

- Exports `v4options` with a static random byte array
- Used instead of `crypto.getRandomValues()` which isn't available in React Native
- All UUIDs are generated with `uuidv4(v4options)`

**Important**: Always use `v4options` when calling `uuidv4()` to prevent runtime errors about `getRandomValues`.

### Web Platform Considerations

The app supports web via `react-native-web` and includes Leaflet for map visualization:

- **MapViewScreen** (`src/screens/MapViewScreen.tsx`): Uses `react-leaflet` for web-based mapping
- **LeafletMapView** (`src/components/LeafletMapView.tsx`): Dedicated Leaflet component following the `react-native-maps-leaflet` pattern
- Platform-specific rendering handled via React Native's Platform API where needed

### Location Permissions

Configured in `app.json`:

**iOS**:
- `NSLocationWhenInUseUsageDescription`: Location while using app
- `NSLocationAlwaysAndWhenInUseUsageDescription`: Background location for tracking

**Android**:
- `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`

Permissions are requested at runtime via `useLocation` hook.

## Key Implementation Notes

1. **Data Flow**: User captures location → Hook updates → Reducer processes → Context provides to all screens → Submit via API service

2. **Tracking Behavior**: When `startTracking()` is called, it clears previous coordinates. Screens must call `addGeoTrace()`/`addGeoShape()` to save before starting a new tracking session.

3. **Error Handling**: All async operations (location, API) use try-catch and update state with error messages. Check `error` field in hook returns.

4. **Coordinate Format**: GeoTrace uses `coordinates: number[][]` (latitude-longitude pairs), while GeoShape uses full `Coordinate[]` objects with metadata.

5. **Mock Data Persistence**: Mock API storage is in-memory only and resets on app restart. Use `clearMockStorage()` for testing.

## Active Technologies
- TypeScript 5.9.x (new components), JavaScript ES6+ (existing akvo-mis-apps) (001-geo-collection-types)
- expo-sqlite (app.db) - existing datapoints table, JSON column for answers (001-geo-collection-types)

## Recent Changes
- 001-geo-collection-types: Added TypeScript 5.9.x (new components), JavaScript ES6+ (existing akvo-mis-apps)
