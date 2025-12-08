# Data Model: GeoTrace and GeoShape Collection Types

**Feature**: 001-geo-collection-types
**Date**: 2025-12-08
**Status**: Complete

## Overview

This document defines the data entities, schemas, and relationships for geotrace and geoshape question types in the akvo-mis-apps data collection system.

## Core Entities

### 1. Coordinate Pair

Represents a single geographic point as a simple latitude-longitude pair.

**Format**: `[latitude, longitude]`

**Schema**:
```typescript
type CoordinatePair = [number, number];  // [latitude, longitude]
```

**Validation Rules**:
- Array length: MUST be exactly 2
- latitude (index 0): MUST be between -90 and 90
- longitude (index 1): MUST be between -180 and 180
- Coordinate precision: 6 decimal places (~0.1 meter resolution)

**Storage Examples**:
```json
[-1.2921, 36.8219]
[40.7128, -74.0060]
```

---

### 2. GeoTrace Answer

Represents a path or line consisting of multiple ordered coordinates.

**Schema**:
```typescript
interface GeoTraceAnswer {
  type: 'geotrace';
  coordinates: CoordinatePair[];        // Array of [lat, lon] pairs, minimum 2
  metadata?: {
    distance?: number;                  // Total path length in meters (optional)
    inputMethod?: 'manual' | 'automatic' | 'tap';
    pointCount?: number;                // Number of coordinates
    timestamp?: string;                 // ISO 8601 datetime
  };
}
```

**Simplified Storage Format** (in FormState.currentValues):
```typescript
// Minimal format (coordinates only)
type GeoTraceValue = CoordinatePair[];  // [[lat, lon], [lat, lon], ...]

// Full format (with metadata)
interface GeoTraceValueFull {
  coordinates: CoordinatePair[];
  metadata?: { ... };
}
```

**Validation Rules**:
- coordinates: MUST contain at least 2 valid [latitude, longitude] pairs
- coordinates: MUST be ordered (sequence defines the path)
- Each coordinate pair: MUST have valid lat (-90 to 90) and lon (-180 to 180)

**State Transitions**:
```
EMPTY → RECORDING → PAUSED → RECORDING → SAVED
               ↓                  ↓          ↓
            CANCELLED       CANCELLED   SUBMITTED
```

**Storage Format (FormState.currentValues)**:
```json
{
  "1749612000000": [
    [-1.2921, 36.8219],
    [-1.2925, 36.8225],
    [-1.2928, 36.8230]
  ]
}
```

**Submission Format (answers in sync request)**:
```json
{
  "1749612000000": [
    [-1.2921, 36.8219],
    [-1.2925, 36.8225],
    [-1.2928, 36.8230]
  ]
}
```

---

### 3. GeoShape Answer

Represents an enclosed area or polygon with automatically closed boundary.

**Schema**:
```typescript
interface GeoShapeAnswer {
  type: 'geoshape';
  coordinates: CoordinatePair[];        // Array of [lat, lon] pairs, minimum 3 unique + closure
  metadata?: {
    area?: number;                      // Enclosed area in square meters (optional)
    perimeter?: number;                 // Boundary length in meters (optional)
    inputMethod?: 'manual' | 'automatic' | 'tap';
    pointCount?: number;                // Number of unique coordinates
    closed?: boolean;                   // Always true for geoshape
    timestamp?: string;                 // ISO 8601 datetime
  };
}
```

**Simplified Storage Format** (in FormState.currentValues):
```typescript
// Minimal format (coordinates only)
type GeoShapeValue = CoordinatePair[];  // [[lat, lon], ..., [lat, lon]] (closed)

// Full format (with metadata)
interface GeoShapeValueFull {
  coordinates: CoordinatePair[];
  metadata?: { ... };
}
```

**Validation Rules**:
- coordinates: MUST contain at least 4 coordinate pairs (3 unique + 1 closure)
- coordinates: First and last coordinate pairs MUST be identical (closed polygon)
- coordinates: MUST be ordered (sequence defines polygon boundary)
- Each coordinate pair: MUST have valid lat (-90 to 90) and lon (-180 to 180)

**Polygon Closure Rule**:
- System automatically appends first coordinate to end of array
- User only captures unique corner/boundary points
- Storage includes closure point for complete polygon representation

**State Transitions**:
```
EMPTY → RECORDING → PAUSED → RECORDING → CLOSED → SAVED
               ↓                  ↓          ↓        ↓
            CANCELLED       CANCELLED   EDITING  SUBMITTED
```

**Storage Format (FormState.currentValues)**:
```json
{
  "1749612100000": [
    [-1.2921, 36.8219],
    [-1.2925, 36.8225],
    [-1.2925, 36.8219],
    [-1.2921, 36.8219]
  ]
}
```

**Submission Format (answers in sync request)**:
```json
{
  "1749612100000": [
    [-1.2921, 36.8219],
    [-1.2925, 36.8225],
    [-1.2925, 36.8219],
    [-1.2921, 36.8219]
  ]
}
```

---

### 4. Form Question Definition

Extended question schema to support geotrace and geoshape types.

**Schema Extension**:
```typescript
interface FormQuestion {
  id: number;
  name: string;
  label: string;
  order: number;
  type: 'geotrace' | 'geoshape' | 'geo' | 'text' | ... // Extended with new types
  required: boolean;
  meta: boolean;
  dependency?: object;
  tooltip?: string;
  options?: any;
}
```

**Example Question Definitions (from form JSON)**:
```json
{
  "id": 1749612000000,
  "name": "nearest_pump_station_route",
  "label": "Nearest Pump Station Route",
  "order": 5,
  "type": "geotrace",
  "required": false,
  "meta": false,
  "options": null,
  "dependency": null
}
```

```json
{
  "id": 1749612100000,
  "name": "pump_station_area",
  "label": "Pump Station Area",
  "order": 6,
  "type": "geoshape",
  "required": false,
  "meta": false,
  "options": null,
  "dependency": null
}
```

---

### 5. Recording Session State

Temporary state during active geotrace/geoshape recording (stored in component state or FormState).

**Schema**:
```typescript
interface RecordingSessionState {
  questionId: number;
  questionType: 'geotrace' | 'geoshape';
  status: 'idle' | 'configuring' | 'recording' | 'paused' | 'completed';
  inputMethod?: 'manual' | 'automatic' | 'tap';
  configuration?: {
    interval?: number;              // Recording interval in seconds
    accuracyThreshold?: number;     // GPS accuracy threshold (5|10|15|20 meters)
  };
  accumulatedPoints: CoordinatePair[];  // [lat, lon] pairs captured so far
  startTime?: number;               // Session start timestamp (Unix ms)
  lastCaptureTime?: number;         // Last point capture timestamp (Unix ms)
  currentAccuracy?: number;         // Current GPS accuracy in meters
  watchSubscription?: any;          // expo-location watch subscription reference
}
```

**State Management**:
- Stored temporarily during recording in component state
- `accumulatedPoints` synced to `FormState.currentValues[questionId]` on each capture
- Cleared on save/cancel
- Can be persisted to allow app interruption recovery (FR-021)

---

### 6. Submission Payload

Data structure sent to backend via `/api/v1/device/sync`.

**Schema**:
```typescript
interface SyncDeviceFormDataRequest {
  formId: number;
  name: string;                     // Datapoint display name
  duration: number;                 // Survey duration in seconds
  submittedAt: string;              // ISO 8601 datetime
  geo: [number, number];            // Representative point [lat, lng]
  uuid?: string;                    // Optional client-generated UUID
  answers: {
    [questionId: string]: CoordinatePair[] | any;  // Simple array format
  };
}
```

**Geo Field Derivation**:
- For GeoTrace: First coordinate of the trace → `[coordinates[0][0], coordinates[0][1]]`
- For GeoShape: First coordinate (or calculate centroid) → `[coordinates[0][0], coordinates[0][1]]`
- Format: `[latitude, longitude]` as array of two numbers

**Example Submission**:
```json
{
  "formId": 1749611049520,
  "name": "Pump Station Route Survey",
  "duration": 450,
  "submittedAt": "2025-12-08T10:15:30Z",
  "geo": [-1.2921, 36.8219],
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "answers": {
    "1749612000000": [
      [-1.2921, 36.8219],
      [-1.2925, 36.8225],
      [-1.2928, 36.8230]
    ],
    "1749612100000": [
      [-1.2921, 36.8219],
      [-1.2925, 36.8225],
      [-1.2925, 36.8219],
      [-1.2921, 36.8219]
    ]
  }
}
```

---

### 7. SQLite Local Storage

Database schema for offline storage using existing app.db structure.

**Table**: `datapoints` (existing table, no schema changes needed)

**Relevant Columns**:
```sql
CREATE TABLE IF NOT EXISTS datapoints (
  uuid TEXT PRIMARY KEY,
  form INTEGER NOT NULL,
  user INTEGER NOT NULL,
  name TEXT NOT NULL,
  geo TEXT,                  -- "lat|lng" format for representative point
  json TEXT NOT NULL,        -- JSON-stringified answers object
  submitted INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  repeats TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**JSON Column Content Example**:
```json
{
  "1749612000000": [
    [-1.2921, 36.8219],
    [-1.2925, 36.8225]
  ],
  "1749612100000": [
    [-1.2921, 36.8219],
    [-1.2925, 36.8225],
    [-1.2925, 36.8219],
    [-1.2921, 36.8219]
  ]
}
```

**Geo Column Format**: `"latitude|longitude"` (pipe-separated string, first point of trace/shape)

---

## Relationships

```
FormDefinition
  ├── 1:N QuestionGroups
  │     └── 1:N Questions (including geotrace/geoshape types)
  │
Submission
  ├── 1:1 FormDefinition (formId)
  ├── 1:N Answers
  │     ├── GeoTraceAnswer: Array of [lat, lon] pairs
  │     └── GeoShapeAnswer: Array of [lat, lon] pairs (closed)
  │
RecordingSession (temporary, in-memory)
  └── accumulatedPoints: Array of [lat, lon] pairs
```

---

## Calculated Fields and Algorithms

### Distance Calculation (GeoTrace)

**Algorithm**: Haversine formula for great-circle distance

```typescript
function calculateDistance(coordinates: CoordinatePair[]): number {
  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const R = 6371000; // Earth radius in meters
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[i + 1];

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    totalDistance += R * c;
  }

  return Math.round(totalDistance * 10) / 10; // Round to 1 decimal place
}
```

### Area Calculation (GeoShape)

**Algorithm**: Shoelace formula (Surveyor's formula) for polygon area on sphere

```typescript
function calculateArea(coordinates: CoordinatePair[]): number {
  const R = 6371000; // Earth radius in meters
  let area = 0;
  const n = coordinates.length - 1; // Exclude closure point

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [lat1, lon1] = coordinates[i];
    const [lat2, lon2] = coordinates[j];

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const λ1 = toRadians(lon1);
    const λ2 = toRadians(lon2);

    area += (λ2 - λ1) * (2 + Math.sin(φ1) + Math.sin(φ2));
  }

  area = Math.abs(area * R * R / 2);
  return Math.round(area * 10) / 10; // Round to 1 decimal place (sq meters)
}
```

### Perimeter Calculation (GeoShape)

**Algorithm**: Sum of segment distances using Haversine

```typescript
function calculatePerimeter(coordinates: CoordinatePair[]): number {
  // Perimeter is total distance around all sides
  return calculateDistance(coordinates);
}
```

### Polygon Closure

**Algorithm**: Automatic closure by duplicating first coordinate

```typescript
function closePolygon(coordinates: CoordinatePair[]): CoordinatePair[] {
  if (coordinates.length < 3) {
    throw new Error('Polygon requires at least 3 points');
  }

  const lastPoint = coordinates[coordinates.length - 1];
  const firstPoint = coordinates[0];

  // Check if already closed (compare both lat and lon)
  if (lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]) {
    return coordinates;
  }

  // Close by appending first point
  return [...coordinates, firstPoint];
}
```

---

## Validation Rules Summary

| Entity | Field | Rule | Error Message |
|--------|-------|------|---------------|
| CoordinatePair | latitude (index 0) | -90 ≤ lat ≤ 90 | "Latitude must be between -90 and 90" |
| CoordinatePair | longitude (index 1) | -180 ≤ lon ≤ 180 | "Longitude must be between -180 and 180" |
| CoordinatePair | array length | length === 2 | "Coordinate must be [latitude, longitude]" |
| GeoTrace | coordinates | length ≥ 2 | "GeoTrace requires at least 2 points" |
| GeoTrace | distance | > 0 (if calculated) | "Distance must be positive" |
| GeoShape | coordinates | length ≥ 4 (3 unique + closure) | "GeoShape requires at least 3 unique points" |
| GeoShape | closed | first === last | "GeoShape must be a closed polygon" |
| GeoShape | area | > 0 (if calculated) | "Area must be positive" |
| GeoShape | perimeter | > 0 (if calculated) | "Perimeter must be positive" |
| RecordingConfig | accuracyThreshold | ∈ {5, 10, 15, 20} | "Accuracy must be 5, 10, 15, or 20 meters" |
| RecordingConfig | interval | > 0 | "Interval must be positive" |

---

## Data Format Examples

### FormState.currentValues Example

```typescript
// After capturing geotrace and geoshape
{
  currentValues: {
    // Other question answers
    "1749611657406": "Main Pump Station",
    "1749611049541": [123, 456],  // Administration cascade
    "1749611742881": [-1.2921, 36.8219],  // Single geo point

    // GeoTrace answer
    "1749612000000": [
      [-1.2921, 36.8219],
      [-1.2923, 36.8222],
      [-1.2925, 36.8225],
      [-1.2928, 36.8230]
    ],

    // GeoShape answer
    "1749612100000": [
      [-1.2921, 36.8219],
      [-1.2925, 36.8225],
      [-1.2925, 36.8219],
      [-1.2923, 36.8217],
      [-1.2921, 36.8219]  // Automatically closed
    ]
  }
}
```

---

## Migration Notes

**Existing Geo Question Type**:
- Current `type: 'geo'` represents single point (GeoPoint)
- Stores value as `[latitude, longitude]` array
- **Perfect consistency**: New geotrace/geoshape use same array-of-arrays format
- No migration needed - new types are additive

**Backward Compatibility**:
- All existing forms with `type: 'geo'` continue to work unchanged
- New forms can use `type: 'geotrace'` or `type: 'geoshape'`
- Backend answers object handles all types via flexible `additionalProperties: {}` schema
- Coordinate format is consistent: always `[latitude, longitude]` pairs

---

**Data Model Complete** ✓
All entities, schemas, and relationships defined with simplified coordinate format.
