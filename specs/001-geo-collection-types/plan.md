# Implementation Plan: GeoTrace and GeoShape Collection Types

**Branch**: `001-geo-collection-types` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-geo-collection-types/spec.md`

## Summary

Extend akvo-mis-apps data collection framework to support geotrace (path/line) and geoshape (polygon/area) question types with three input methods: manual recording, automatic GPS tracking, and placement by tapping on map. Data is captured using expo-location and submitted to Akvo MIS backend via `/api/v1/device/sync` endpoint. Coordinates are stored as simple `[[latitude, longitude], ...]` arrays for compatibility and efficiency.

**Primary Requirements**:
- Add 2 new question types (geotrace, geoshape) to form framework
- Implement 3 input methods: manual, automatic (with configurable accuracy 5m/10m/15m/20m), tap placement
- Real-time distance calculation for geotrace, area/perimeter for geoshape
- Offline-first with queued sync when network available
- TypeScript migration for new components, JavaScript interop for existing code

**Technical Approach** (from research.md):
- Extend akvo-mis-apps switch-based registration pattern
- Use Pullstate FormState for reactive state management
- Platform-specific maps: react-native-maps (native), Leaflet (web)
- Haversine formula for distance, Shoelace formula for area
- Simple coordinate format: `[[lat, lon], ...]` in both storage and submission

## Technical Context

**Language/Version**: TypeScript 5.9.x (new components), JavaScript ES6+ (existing akvo-mis-apps)
**Primary Dependencies**:
  - Expo SDK 54.x (React Native 0.81.5, React 19.1.0)
  - expo-location 19.x (GPS/location services)
  - react-native-maps (native platforms)
  - Leaflet 1.9.x + react-leaflet 5.x (web platform)
  - Pullstate (state management - already in akvo-mis-apps)
  - expo-sqlite (offline storage)

**Storage**: expo-sqlite (app.db) - existing datapoints table, JSON column for answers
**Testing**: Jest + React Native Testing Library (existing test infrastructure)
**Target Platform**: iOS 15+, Android (Expo), Web (React Native Web)
**Project Type**: Mobile + Web hybrid (React Native via Expo)

**Performance Goals**:
- Map rendering: <1 second for up to 500 points (SC-006, SC-007)
- GPS capture: At configured intervals ±1 second (SC-002)
- Distance/area calculation: <100ms for typical polygons (<100 points)
- Form submission: 95% success rate on first attempt when online (SC-008)

**Constraints**:
- Offline-capable with background sync (FR-016, FR-018)
- GPS accuracy filtering: only capture when ≤ selected threshold (FR-013)
- Coordinate precision: 6 decimal places (~0.1m)
- Minimum points: 2 for geotrace, 3 unique for geoshape (FR-006)

**Scale/Scope**:
- Recording sessions: 5-500 waypoints typical
- Form completion time: <15 minutes for 3 geotraces + 2 geoshapes (SC-005)
- Concurrent features: Integration with existing 12 question types
- Field workers: Mobile devices with built-in GPS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS - No constitution principles defined (constitution.md is template)

**Notes**:
- Project constitution file is in template state with no specific principles
- Following existing akvo-mis-apps patterns and React Native best practices
- TypeScript migration strategy: new components in TS, existing JS files unchanged except minimal additions
- No architectural violations detected

## Project Structure

### Documentation (this feature)

```text
specs/001-geo-collection-types/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 research and technical decisions
├── data-model.md        # Phase 1 data entities and schemas
├── quickstart.md        # Phase 1 developer guide
├── contracts/           # Phase 1 API specifications
│   ├── device-form-endpoint.json       # GET /api/v1/device/form/{form_id}
│   └── device-sync-endpoint.json       # POST /api/v1/device/sync
└── checklists/          # Quality validation checklists
    └── requirements.md
```

### Source Code (repository root)

**Structure Decision**: Hybrid mobile + backend architecture

```text
# Frontend (React Native / Expo)
src/
├── form/
│   ├── fields/
│   │   ├── TypeGeoTrace.tsx        # NEW - GeoTrace question component (TS)
│   │   ├── TypeGeoShape.tsx        # NEW - GeoShape question component (TS)
│   │   ├── TypeGeo.js              # EXISTING - Single point geo
│   │   └── index.js                # MODIFIED - Export new components
│   ├── components/
│   │   ├── QuestionField.js        # MODIFIED - Add switch cases
│   │   ├── InputMethodDialog.tsx   # NEW - Input method selection modal (TS)
│   │   └── GeoMapView.tsx          # NEW - Platform-specific map component (TS)
│   └── lib/
│       └── index.js                # MODIFIED - Add validation rules
├── types/
│   └── geo-answers.ts              # NEW - TypeScript type definitions
├── utils/
│   └── geo-calculations.ts         # NEW - Distance/area/perimeter algorithms (TS)
├── lib/
│   └── constants.js                # MODIFIED - Add geotrace/geoshape constants
├── hooks/
│   ├── useLocation.ts              # EXISTING - Location hook
│   └── useGeoData.tsx              # EXISTING - Form data management
├── services/
│   └── api.ts                      # EXISTING - API client (may need type updates)
└── store/
    └── forms.js                    # EXISTING - Pullstate FormState

# Backend (Mock Serverless API)
backend/
├── source/
│   └── forms/
│       └── 4_1749611049520.prod.json  # EXISTING - Example form JSON
├── server.js                       # NEW - Express mock server
├── routes/
│   ├── device-form.js              # NEW - GET /api/v1/device/form/{form_id}
│   └── device-sync.js              # NEW - POST /api/v1/device/sync
└── data/
    └── submissions.json            # NEW - Mock storage

# Tests
__tests__/
├── form/fields/
│   ├── TypeGeoTrace.test.tsx       # NEW
│   └── TypeGeoShape.test.tsx       # NEW
└── utils/
    └── geo-calculations.test.ts    # NEW

# Configuration
tsconfig.json                       # EXISTING - TS config
app.json                            # EXISTING - Expo config with location permissions
package.json                        # MODIFIED - Add any missing dependencies
```

**Key Design Decisions**:

1. **TypeScript Incremental Migration**:
   - New components (TypeGeoTrace, TypeGeoShape, InputMethodDialog, GeoMapView) in `.tsx`
   - Existing JavaScript files stay in `.js`, minimal changes only
   - Type definitions in `src/types/` for interop
   - No mass migration - focused, safe, incremental

2. **Component Architecture**:
   - Follow existing akvo-mis-apps pattern (TypeGeo.js as template)
   - Props interface: `{id, label, value, onChange, required, disabled, ...}`
   - State updates via `FormState.update()` (Pullstate pattern)
   - Platform-specific map rendering via `Platform.select()`

3. **Backend Structure**:
   - Simple Express server for local development/testing
   - Static JSON responses from `/backend/data/`
   - Follows Akvo MIS (v1) API specification
   - Easy to replace with real API later

4. **Data Flow**:
   ```
   GPS (expo-location)
     → Component State (recording session)
     → FormState.currentValues (Pullstate)
     → DataPoint (SQLite json column)
     → API Submission (sync endpoint)
     → Backend Storage
   ```

## Complexity Tracking

*No Constitution violations to justify - constitution is in template state.*

## Phase 0: Research (Complete ✓)

**Status**: Complete
**Artifacts**: `research.md`

**Key Decisions Documented**:

1. **Form Framework Extension**: Switch-based registration pattern
2. **Coordinate Format**: Simple `[[lat, lon], ...]` arrays (not GeoJSON objects)
3. **Backend Integration**: Flexible `additionalProperties: {}` in Akvo MIS answers schema
4. **Input Methods**: Modal dialog with 3 options + configuration for automatic mode
5. **Map Components**: Platform-specific (react-native-maps / Leaflet)
6. **TypeScript Strategy**: Gradual migration, new components only
7. **GPS Accuracy**: Color-coded feedback + accuracy threshold filtering (5m/10m/15m/20m)
8. **Storage**: Extend existing SQLite pattern, no schema changes needed

**Research Tasks Completed**:
- ✅ Analyzed akvo-mis-apps form framework architecture
- ✅ Reviewed Akvo MIS backend API specification
- ✅ Evaluated coordinate storage formats
- ✅ Assessed map library options
- ✅ Determined TypeScript migration approach
- ✅ Researched GPS accuracy handling patterns
- ✅ Validated offline storage compatibility

## Phase 1: Design & Contracts (Complete ✓)

**Status**: Complete
**Artifacts**: `data-model.md`, `contracts/device-form-endpoint.json`, `contracts/device-sync-endpoint.json`, `quickstart.md`

**Data Model Summary** (from data-model.md):

1. **CoordinatePair**: `[latitude, longitude]` - simple two-element array
2. **GeoTraceAnswer**: Array of coordinate pairs, minimum 2 points
3. **GeoShapeAnswer**: Array of coordinate pairs, closed polygon (first === last), minimum 4 points (3 unique + closure)
4. **FormState Storage**: `currentValues[questionId]` = coordinate pair array
5. **Submission Format**: Direct array submission in `answers` object
6. **SQLite Storage**: JSON-stringified in existing `json` column

**API Contracts** (OpenAPI 3.0.3):

1. **GET /api/v1/device/form/{form_id}**:
   - Extended FormDefinition schema with `type: 'geotrace' | 'geoshape'`
   - Example form JSON with both new question types

2. **POST /api/v1/device/sync**:
   - SyncDeviceFormDataRequest schema
   - GeoTraceAnswer: `[[lat, lon], ...]` minimum 2 pairs
   - GeoShapeAnswer: `[[lat, lon], ..., [lat, lon]]` closed polygon, minimum 4 pairs
   - Representative geo point: First coordinate of trace/shape

**Calculation Algorithms**:
- Distance (GeoTrace): Haversine formula for great-circle distance
- Area (GeoShape): Shoelace formula (Surveyor's formula) for polygon area on sphere
- Perimeter (GeoShape): Sum of segment distances using Haversine
- Polygon Closure: Automatic append of first coordinate to end

**Agent Context Update**: (To be run next)
- Add TypeScript as primary language for new geo components
- Add expo-location, react-native-maps, leaflet to tech stack
- Document Pullstate state management pattern
- Note coordinate format: simple arrays not GeoJSON

## Phase 2: Implementation Tasks

**Status**: Not yet started (run `/speckit.tasks` to generate tasks.md)

**Estimated Breakdown** (from quickstart.md):
- Setup (constants, types, utilities): ~15 minutes
- Component development: 4-6 hours
- Integration: 2-3 hours
- Backend mock: 3-4 hours
- Testing: 4-5 hours
- **Total**: ~14-19 hours

**High-Level Task Sequence**:

1. **Foundation Setup**
   - Add QUESTION_TYPES constants
   - Create TypeScript type definitions
   - Implement geo calculation utilities
   - Set up component skeletons

2. **Core Components**
   - InputMethodDialog (3 radio options + config UI)
   - GeoMapView (platform-specific rendering)
   - TypeGeoTrace (3 input methods, distance calculation)
   - TypeGeoShape (3 input methods, area/perimeter calculation)

3. **Integration**
   - Register components in fields/index.js
   - Add QuestionField.js switch cases
   - Add validation in form/lib/index.js
   - Test FormState integration

4. **Backend Mock**
   - Create Express server
   - Implement form retrieval endpoint
   - Implement sync endpoint
   - Add sample form JSON with geotrace/geoshape

5. **Testing & Quality**
   - Unit tests for utilities
   - Component tests
   - Integration tests
   - Manual testing (3 methods × 2 types = 6 scenarios)
   - GPS accuracy testing (4 thresholds)

## Implementation Notes

### Critical Success Factors

1. **Coordinate Format Consistency**:
   - Always `[[lat, lon], ...]` in storage, FormState, and submission
   - Never mix with full Coordinate objects containing altitude/accuracy
   - First and last must match for GeoShape (closed polygon)

2. **GPS Accuracy Handling**:
   - Automatic mode: Pause capture when accuracy > threshold
   - Manual mode: Warn but allow override
   - Visual feedback: Green (<10m), Yellow (10m-threshold), Red (>threshold)
   - Accuracy dropdown: Exactly 4 options (5m, 10m, 15m, 20m)

3. **State Management**:
   - Use FormState.update() for all value changes
   - Update accumulatedPoints on every capture
   - Sync to FormState.currentValues immediately
   - Clear session state on save/cancel

4. **Platform Compatibility**:
   - Use Platform.select() for map components
   - Test web builds with Leaflet
   - Test native builds with react-native-maps
   - Ensure consistent behavior across platforms

5. **Offline Support**:
   - Save to SQLite immediately on form save
   - Queue submissions when offline
   - Background sync task handles retry
   - User sees pending status

### Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| GPS signal loss during automatic recording | Pause recording, notify user, resume on signal return |
| Large coordinate arrays (500+ points) | Test performance, implement point clustering if needed |
| TypeScript/JavaScript interop bugs | Comprehensive type definitions, runtime validation |
| Map rendering differences web vs native | Platform-specific testing, fallback rendering |
| Backend API format mismatch | Mock API for testing, schema validation before real API |

### Testing Strategy

1. **Unit Tests** (Jest):
   - geo-calculations.ts: All formulas with known coordinate sets
   - Validation functions: Edge cases (0 points, 1 point, etc.)

2. **Component Tests** (React Native Testing Library):
   - TypeGeoTrace/TypeGeoShape rendering
   - Button interactions
   - State updates
   - GPS watch lifecycle

3. **Integration Tests**:
   - Full form submission with geotrace/geoshape
   - Offline queue and sync
   - FormState persistence

4. **Manual Tests**:
   - 3 input methods × 2 question types = 6 combinations
   - 4 accuracy thresholds for automatic mode
   - GPS signal degradation/recovery
   - App interruption recovery

## Next Steps

1. **Generate Tasks**: Run `/speckit.tasks` to create detailed implementation checklist
2. **Update Agent Context**: Run agent context update script (in progress)
3. **Create GitHub Issues**: Run `/speckit.taskstoissues` to convert tasks to issues
4. **Begin Implementation**: Start with Phase 2 setup tasks

---

**Plan Complete** ✓
Ready for task generation and implementation.
