# Research: GeoTrace and GeoShape Implementation

**Feature**: 001-geo-collection-types
**Date**: 2025-12-08
**Status**: Complete

## Overview

This document consolidates research findings for implementing geotrace and geoshape question types in the akvo-mis-apps data collection framework with TypeScript migration.

## Decision 1: Form Framework Extension Pattern

**Decision**: Extend akvo-mis-apps using the existing switch-based registration pattern for new question types.

**Rationale**:
- akvo-mis-apps already has a proven architecture for 12 question types
- QuestionField.js uses a switch statement to dispatch field components
- Field components follow a consistent interface pattern
- Minimal invasive changes to existing codebase
- Preserves existing form state management with Pullstate

**Implementation Pattern**:
```javascript
// 1. Add to constants (src/lib/constants.js)
export const QUESTION_TYPES = {
  // ... existing types
  geotrace: 'geotrace',
  geoshape: 'geoshape',
};

// 2. Create field components
// src/form/fields/TypeGeoTrace.tsx (TypeScript)
// src/form/fields/TypeGeoShape.tsx (TypeScript)

// 3. Export from registry (src/form/fields/index.js)
export { default as TypeGeoTrace } from './TypeGeoTrace';
export { default as TypeGeoShape } from './TypeGeoShape';

// 4. Add to QuestionField switch (src/form/components/QuestionField.js)
case QUESTION_TYPES.geotrace:
  return <TypeGeoTrace {...commonProps} />;
case QUESTION_TYPES.geoshape:
  return <TypeGeoShape {...commonProps} />;
```

**Alternatives Considered**:
- **Plugin-based architecture**: Rejected because it would require significant refactoring of existing form infrastructure
- **Separate micro-frontend**: Rejected due to complexity and deployment overhead
- **Complete rewrite in TypeScript**: Rejected for scope - incremental migration is safer

## Decision 2: Coordinate Data Format

**Decision**: Store coordinates as arrays of `[latitude, longitude]` pairs in FormState, following GeoJSON convention.

**Rationale**:
- GeoJSON standard: widely recognized, library-compatible
- Existing TypeGeo stores `[lat, lng]` array format
- Easy serialization to backend API
- Compatible with mapping libraries (Leaflet, react-native-maps)
- Efficient storage and transmission

**Data Structures**:
```typescript
// GeoTrace answer format
{
  questionId: number,
  type: 'geotrace',
  value: [[lat1, lon1], [lat2, lon2], ...],  // Minimum 2 points
  metadata: {
    distance: number,  // meters
    timestamp: string,
  }
}

// GeoShape answer format
{
  questionId: number,
  type: 'geoshape',
  value: [[lat1, lon1], [lat2, lon2], ..., [lat1, lon1]],  // Closed polygon, minimum 3 unique points
  metadata: {
    area: number,       // square meters
    perimeter: number,  // meters
    timestamp: string,
  }
}
```

**Alternatives Considered**:
- **GeoJSON Feature objects**: Rejected as over-engineered for mobile form use case
- **Flat array [lat1, lon1, lat2, lon2]**: Rejected for poor readability
- **WKT format**: Rejected as not JavaScript-friendly

## Decision 3: Backend API Integration

**Decision**: Extend Akvo MIS `/api/v1/device/sync` endpoint to accept geotrace/geoshape answers in the flexible `answers` object.

**Rationale**:
- SyncDeviceFormDataRequest uses `additionalProperties: {}` for answers
- No schema changes needed - already supports any answer structure
- Backward compatible with existing question types
- geo field can store representative point (center or first point)

**API Contract**:
```typescript
POST /api/v1/device/sync
{
  formId: number,
  name: string,
  duration: number,
  submittedAt: string,  // ISO 8601 datetime
  geo: [lat, lon],      // Representative point (first point of trace/shape)
  uuid?: string,
  answers: {
    [questionId]: {
      type: 'geotrace' | 'geoshape',
      coordinates: [[lat, lon], ...],
      metadata: {
        distance?: number,      // For geotrace
        area?: number,          // For geoshape
        perimeter?: number,     // For geoshape
      }
    }
  }
}
```

**Alternatives Considered**:
- **Separate geo endpoints**: Rejected to maintain consistency with existing patterns
- **Binary encoding**: Rejected for complexity and debugging difficulty
- **Compression**: Rejected for initial implementation (can add later if needed)

## Decision 4: Location Input Methods

**Decision**: Implement three input modes as modal configuration: Manual, Automatic, and Placement by Tapping.

**Rationale**:
- Matches requirements from spec.md user stories
- Provides flexibility for different field conditions
- Aligns with screenshots showing input method dialog
- Follows mobile UX best practices for complex inputs

**Input Method Specifications**:

1. **Manual Location Recording**:
   - User taps "Record a point" button at each desired location
   - Captures GPS coordinates on demand
   - Shows real-time point count
   - Best for: Precise corner points, waypoints along a path

2. **Automatic Location Recording**:
   - Configuration: interval (seconds) + accuracy threshold (5m/10m/15m/20m)
   - Auto-captures points while user moves
   - Pauses if GPS accuracy below threshold
   - Shows accuracy status (green/yellow/red)
   - Best for: Long traces, boundary perimeters

3. **Placement by Tapping**:
   - User taps on map to place points
   - Useful for desk planning or inaccessible areas
   - Shows tap coordinates immediately
   - Best for: Planning, remote mapping

**Alternatives Considered**:
- **Single automatic mode**: Rejected as insufficient for varied use cases
- **Import from GPX files**: Deferred to future enhancement
- **Drawing tools on map**: Partially implemented via tap placement

## Decision 5: Map Component Selection

**Decision**: Use `react-native-maps` for native platforms and Leaflet (via react-leaflet) for web.

**Rationale**:
- react-native-maps: Native performance, standard for RN geo apps
- Leaflet: Proven web mapping, already in dependencies
- Platform-specific rendering ensures best UX
- Both support polyline/polygon rendering
- Existing codebase pattern (see LeafletMapView.tsx)

**Implementation**:
```typescript
// Platform check
import { Platform } from 'react-native';

const MapView = Platform.select({
  web: () => require('./LeafletMapView').default,
  default: () => require('react-native-maps').default,
})();
```

**Alternatives Considered**:
- **Mapbox**: Rejected due to API key requirements and cost
- **Google Maps**: Rejected due to licensing complexity
- **Leaflet for all platforms**: Rejected due to poor native performance

## Decision 6: TypeScript Migration Strategy

**Decision**: Implement new components in TypeScript (.tsx), gradually migrate touched files.

**Rationale**:
- Existing codebase is JavaScript
- Incremental migration reduces risk
- New code gets type safety benefits
- TypeScript in devDependencies already
- tsconfig.json already configured

**Migration Scope**:
- **New files (TypeScript)**: TypeGeoTrace.tsx, TypeGeoShape.tsx, types/geo-answers.ts
- **Modified files (keep JavaScript)**: QuestionField.js, constants.js, fields/index.js
- **Shared types**: Create type definition files (.d.ts) for JavaScript interop

**Type Safety Approach**:
```typescript
// types/geo-answers.ts
export interface Coordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeoTraceAnswer {
  type: 'geotrace';
  coordinates: Coordinate[];
  distance: number;
}

export interface GeoShapeAnswer {
  type: 'geoshape';
  coordinates: Coordinate[];
  area: number;
  perimeter: number;
}
```

**Alternatives Considered**:
- **Full codebase migration**: Rejected as out of scope
- **JSDoc comments**: Rejected as insufficient type enforcement
- **Separate TypeScript project**: Rejected for deployment complexity

## Decision 7: GPS Accuracy Handling

**Decision**: Implement accuracy filtering with visual feedback (color-coded status) and configurable thresholds.

**Rationale**:
- GPS quality varies significantly in field conditions
- User needs transparency about data quality
- Automatic mode should enforce minimums
- Manual mode should warn but allow override

**Accuracy Tiers** (FR-022, FR-013):
- **Green**: High precision (<10m) - Ideal
- **Yellow**: Moderate (≥10m to <selected threshold) - Acceptable
- **Red**: Low precision (≥selected threshold) - Warning or auto-pause

**Automatic Recording Behavior**:
- Only capture points when accuracy ≤ selected threshold (5m/10m/15m/20m)
- Pause and notify when accuracy degrades
- Resume automatically when accuracy improves

**Alternatives Considered**:
- **No accuracy filtering**: Rejected for poor data quality
- **Hard rejection of poor accuracy**: Rejected as too restrictive for field work
- **Post-processing accuracy improvement**: Deferred to future enhancement

## Decision 8: Local Storage and Offline Support

**Decision**: Extend existing SQLite storage pattern (expo-sqlite) for geotrace/geoshape answers.

**Rationale**:
- akvo-mis-apps already uses expo-sqlite (DATABASE_NAME: 'app.db')
- Proven offline-first architecture with sync queue
- JSON column can store complex geo answer objects
- Background sync task already implemented (SYNC_FORM_SUBMISSION_TASK_NAME)

**Storage Pattern**:
```javascript
// Extend existing saveDataPoint in crud-datapoints.js
saveDataPoint(db, {
  uuid,
  form,
  user,
  name,
  geo: `${firstLat}|${firstLng}`,  // Representative point
  json: JSON.stringify({           // Stringified answers
    [questionId]: {
      type: 'geotrace',
      coordinates: [[lat, lon], ...],
      metadata: { distance: 1234 }
    }
  }),
  submitted: 0,  // Draft
  duration,
  repeats: JSON.stringify(repeats),
})
```

**Alternatives Considered**:
- **Separate geo database**: Rejected for unnecessary complexity
- **AsyncStorage**: Rejected as insufficient for structured queries
- **Cloud-first with no offline**: Rejected per requirements (FR-016, FR-018)

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Mobile Framework** | React Native (Expo) | 54.x | Already established |
| **Location Services** | expo-location | 19.x | Already in use, proven reliability |
| **Map (Native)** | react-native-maps | Latest | Standard for RN geo apps |
| **Map (Web)** | Leaflet + react-leaflet | 1.9.x / 5.x | Already in dependencies |
| **State Management** | Pullstate | Current | Already in use (FormState) |
| **Local Database** | expo-sqlite | Current | Already in use (app.db) |
| **Language** | TypeScript | 5.9.x | Gradual migration, already configured |
| **Backend API** | Akvo MIS v1 | Current | Existing specification |
| **Coordinate Format** | GeoJSON-like arrays | N/A | Standard, library-compatible |

## Open Questions Resolved

1. **Q: How to handle interrupted recording sessions?**
   - **A**: Persist to FormState.currentValues immediately; SQLite autosaves drafts (FR-019, FR-021)

2. **Q: Should we allow editing after save?**
   - **A**: No - out of scope per spec.md "Out of Scope" section

3. **Q: How to detect polygon closure for automatic boundary tracing?**
   - **A**: Calculate distance to first point; offer close option when within 10 meters

4. **Q: What coordinate precision to store?**
   - **A**: 6 decimal places (~0.1 meter precision) for latitude/longitude

5. **Q: How to handle very large polygons (500+ points)?**
   - **A**: Support per SC-006; optimize rendering with point clustering if needed

## Implementation Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| GPS accuracy issues in field | High | High | Multi-tier accuracy handling with user feedback |
| Large coordinate arrays crash app | High | Medium | Implement point count limits, pagination |
| TypeScript/JavaScript interop bugs | Medium | Medium | Comprehensive type definitions, runtime validation |
| Map library conflicts on web/mobile | Medium | Low | Platform-specific imports, fallback rendering |
| Backend API geo field format mismatch | High | Low | Mock API for testing, schema validation |

## Next Steps

Phase 1 (Design & Contracts):
1. Generate data-model.md with entity schemas
2. Create OpenAPI contracts for backend endpoints in /contracts/
3. Create quickstart.md for developer onboarding
4. Update agent context with new technologies

Phase 2 (Tasks):
1. Generate tasks.md with dependency-ordered implementation steps
2. Create GitHub issues via /speckit.taskstoissues

---

**Research Complete** ✓
All technical decisions documented and justified.
