# Quickstart Guide: GeoTrace and GeoShape Implementation

**Feature**: 001-geo-collection-types
**Target Audience**: Developers implementing geotrace and geoshape support
**Est. Time**: 15-20 minutes to understand architecture

## Prerequisites

Before starting implementation, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Expo CLI (`npm install -g expo-cli`)
- [ ] iOS Simulator (macOS) or Android Emulator installed
- [ ] Code editor with TypeScript support (VS Code recommended)
- [ ] Read `spec.md` and `research.md` for context
- [ ] Reviewed `data-model.md` for data structures

## Architecture Overview

### Component Hierarchy

```
FormContainer
  └── QuestionGroup
        └── QuestionField (dispatcher)
              ├── TypeGeo (existing, single point)
              ├── TypeGeoTrace (NEW - path/line)
              └── TypeGeoShape (NEW - polygon/area)
```

### State Flow

```
expo-location (GPS)
      ↓
TypeGeoTrace/TypeGeoShape (capture)
      ↓
FormState.currentValues (Pullstate)
      ↓
FormContainer.handleOnSubmit
      ↓
ApiService.submitGeoData
      ↓
/api/v1/device/sync (backend)
```

## Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/ifirmawan/poc-mobile-collect.git
cd poc-mobile-collect

# Checkout feature branch
git checkout 001-geo-collection-types

# Install dependencies
npm install

# Start development server
npm start
```

### 2. Environment Check

```bash
# Verify TypeScript configuration
cat tsconfig.json

# Verify dependencies
npm list expo-location
npm list react-native-maps
npm list leaflet

# Check existing constants
grep -r "QUESTION_TYPES" example/akvo-mis-apps/src/lib/constants.js
```

## Key Files Reference

### Files to Create (TypeScript)

| File Path | Purpose | Lines (Est.) |
|-----------|---------|--------------|
| `src/form/fields/TypeGeoTrace.tsx` | GeoTrace question component | ~350-400 |
| `src/form/fields/TypeGeoShape.tsx` | GeoShape question component | ~350-400 |
| `src/form/components/InputMethodDialog.tsx` | Input method selection modal | ~150-200 |
| `src/form/components/GeoMapView.tsx` | Map display component | ~200-250 |
| `src/types/geo-answers.ts` | TypeScript type definitions | ~50-80 |
| `src/utils/geo-calculations.ts` | Distance/area/perimeter algorithms | ~100-150 |

### Files to Modify (JavaScript)

| File Path | Modification | Impact |
|-----------|--------------|--------|
| `src/lib/constants.js` | Add `geotrace`, `geoshape` to QUESTION_TYPES | 2 lines |
| `src/form/fields/index.js` | Export TypeGeoTrace, TypeGeoShape | 2 lines |
| `src/form/components/QuestionField.js` | Add cases in switch for new types | ~10-15 lines |
| `src/form/lib/index.js` | Add validation for geotrace/geoshape | ~20-30 lines |

## Implementation Checklist

### Phase 1: Setup (15 min)

- [ ] Add question type constants to `src/lib/constants.js`
- [ ] Create type definitions file `src/types/geo-answers.ts`
- [ ] Set up utility functions in `src/utils/geo-calculations.ts`
- [ ] Create base component files with skeleton structure

### Phase 2: Components (4-6 hours)

- [ ] Implement `InputMethodDialog` component
  - Radio selection for 3 input methods
  - Configuration UI for automatic mode (interval, accuracy dropdown)
  - Cancel/Start button handlers
- [ ] Implement `GeoMapView` component
  - Platform check (react-native-maps vs Leaflet)
  - Polyline rendering for GeoTrace
  - Polygon rendering for GeoShape
  - Point markers with custom icons
- [ ] Implement `TypeGeoTrace` component
  - Input method selection
  - Manual recording: "Record a point" button
  - Automatic recording: GPS watch with interval/accuracy filtering
  - Placement by tapping: Map tap handlers
  - Real-time distance calculation
  - Point count display
  - Pause/resume/clear/save controls
- [ ] Implement `TypeGeoShape` component
  - Similar to TypeGeoTrace plus:
  - Automatic polygon closure
  - Area and perimeter calculation
  - Visual polygon fill on map

### Phase 3: Integration (2-3 hours)

- [ ] Register components in `src/form/fields/index.js`
- [ ] Add switch cases in `src/form/components/QuestionField.js`
- [ ] Add validation rules in `src/form/lib/index.js`
- [ ] Test FormState integration
- [ ] Verify submission payload format

### Phase 4: Backend (3-4 hours)

- [ ] Create mock backend endpoints in `backend/` directory
- [ ] Implement `GET /api/v1/device/form/{form_id}` with geotrace/geoshape questions
- [ ] Implement `POST /api/v1/device/sync` accepting coordinate arrays
- [ ] Add sample form JSON with both question types
- [ ] Test full submission flow

### Phase 5: Testing (4-5 hours)

- [ ] Unit tests for geo calculation utilities
- [ ] Component tests for TypeGeoTrace/TypeGeoShape
- [ ] Integration test: Full form submission
- [ ] Manual testing: 3 input methods × 2 question types = 6 scenarios
- [ ] GPS accuracy threshold testing (5m, 10m, 15m, 20m)
- [ ] Offline/online sync testing

## Code Examples

### 1. Adding Question Type Constants

```javascript
// src/lib/constants.js
export const QUESTION_TYPES = {
  text: 'text',
  number: 'number',
  // ... existing types
  geo: 'geo',
  geotrace: 'geotrace',      // ADD THIS
  geoshape: 'geoshape',      // ADD THIS
  option: 'option',
  // ... rest
};
```

### 2. Component Registration

```javascript
// src/form/fields/index.js
export { default as TypeGeo } from './TypeGeo';
export { default as TypeGeoTrace } from './TypeGeoTrace';  // ADD THIS
export { default as TypeGeoShape } from './TypeGeoShape';  // ADD THIS
```

### 3. QuestionField Switch Case

```javascript
// src/form/components/QuestionField.js
import { TypeGeoTrace, TypeGeoShape } from '../fields';

// ... inside switch statement
case QUESTION_TYPES.geotrace:
  return (
    <TypeGeoTrace
      {...commonProps}
      onChange={onChange}
      value={value}
    />
  );

case QUESTION_TYPES.geoshape:
  return (
    <TypeGeoShape
      {...commonProps}
      onChange={onChange}
      value={value}
    />
  );
```

### 4. TypeScript Interface Example

```typescript
// src/types/geo-answers.ts
export type CoordinatePair = [number, number];  // [latitude, longitude]

export interface GeoTraceValue {
  coordinates: CoordinatePair[];
}

export interface GeoShapeValue {
  coordinates: CoordinatePair[];  // First === Last (closed)
}
```

### 5. State Update Pattern

```typescript
// In TypeGeoTrace.tsx or TypeGeoShape.tsx
import { FormState } from '../../store';

const handleAddPoint = (latitude: number, longitude: number) => {
  const newCoordinates: CoordinatePair[] = [
    ...currentCoordinates,
    [latitude, longitude]
  ];

  // Update FormState
  FormState.update((s) => {
    s.currentValues = {
      ...s.currentValues,
      [questionId]: newCoordinates
    };
  });
};
```

### 6. GPS Watch Example (Automatic Recording)

```typescript
import * as Location from 'expo-location';

const startAutomaticRecording = async (
  interval: number,
  accuracyThreshold: number
) => {
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: interval * 1000,
      distanceInterval: 5,
    },
    (location) => {
      const { latitude, longitude, accuracy } = location.coords;

      // Only capture if accuracy meets threshold
      if (accuracy && accuracy <= accuracyThreshold) {
        handleAddPoint(latitude, longitude);
      }
    }
  );

  return subscription;
};
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- TypeGeoTrace.test.tsx

# Watch mode
npm test -- --watch
```

### Manual Testing Scenarios

1. **Manual Recording - GeoTrace**
   - Open form with geotrace question
   - Select "Manual location recording"
   - Tap "Record a point" 5 times while moving
   - Verify points appear on map with connecting lines
   - Check distance calculation updates
   - Save and verify submission payload

2. **Automatic Recording - GeoTrace**
   - Select "Automatic location recording"
   - Configure: 5 seconds interval, 10 meters accuracy
   - Start and walk for 1 minute
   - Verify points captured every ~5 seconds
   - Test pause when accuracy drops
   - Save and verify coordinates

3. **Placement by Tapping - GeoShape**
   - Select "Placement by tapping"
   - Tap 4 corners of a square on map
   - Verify polygon automatically closes
   - Check area and perimeter calculations
   - Save and verify closed polygon in payload

4. **Offline Sync**
   - Turn off device network
   - Complete form with geotrace/geoshape
   - Submit (should queue)
   - Turn on network
   - Verify automatic sync to backend

## Troubleshooting

### Common Issues

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| "GPS not available" | Location permissions not granted | Check app.json permissions, request at runtime |
| Map not rendering | Platform-specific import issue | Verify Platform.select() for web vs native |
| Coordinates not saving | FormState not updated | Check dispatch pattern, verify questionId |
| Polygon not closing | Closure logic bug | Debug closePolygon() function |
| Distance/area incorrect | Calculation formula error | Test with known coordinates |

### Debug Commands

```bash
# Check expo-location permissions
expo-location permissions

# View FormState in React DevTools
# Add debugger; or console.log(FormState.getRawState())

# Test backend endpoint
curl -X POST http://localhost:3000/api/v1/device/sync \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## Resources

### Documentation

- [Expo Location Docs](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Leaflet Docs](https://leafletjs.com/reference.html)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Shoelace Formula](https://en.wikipedia.org/wiki/Shoelace_formula)

### Specification Files

- `specs/001-geo-collection-types/spec.md` - Feature requirements
- `specs/001-geo-collection-types/research.md` - Technical decisions
- `specs/001-geo-collection-types/data-model.md` - Data structures
- `specs/001-geo-collection-types/contracts/` - API specifications

### Example Code

- `src/form/fields/TypeGeo.js` - Reference for single point geo
- `src/hooks/useLocation.ts` - Location hooks pattern
- `src/screens/GeoTraceScreen.tsx` - POC implementation (if exists)

## Next Steps

After completing implementation:

1. Run full test suite
2. Perform manual testing with real GPS device
3. Test all 3 input methods for both question types
4. Verify backend integration
5. Update CLAUDE.md with any new patterns
6. Create pull request following project guidelines

---

**Questions or Issues?**
- Review `spec.md` for requirements clarification
- Check `research.md` for design decisions
- Consult `data-model.md` for data structures
- Refer to API contracts in `contracts/` directory

**Happy coding! 🚀**
