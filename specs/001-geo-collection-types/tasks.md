# Tasks: GeoTrace and GeoShape Collection Types

**Input**: Design documents from `/specs/001-geo-collection-types/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification, therefore test tasks are NOT included in this plan. Manual testing scenarios are documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Frontend paths based on akvo-mis-apps integration:
- **Form components**: `src/form/fields/`, `src/form/components/`
- **Types**: `src/types/`
- **Utils**: `src/utils/`
- **Constants**: `src/lib/constants.js`
- **Backend**: `backend/server.js`, `backend/routes/`, `backend/data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for geotrace/geoshape support

- [ ] T001 Add geotrace and geoshape constants to src/lib/constants.js (QUESTION_TYPES object)
- [ ] T002 [P] Create TypeScript type definitions file src/types/geo-answers.ts with CoordinatePair, GeoTraceValue, GeoShapeValue interfaces
- [ ] T003 [P] Create geo calculations utility file src/utils/geo-calculations.ts with Haversine distance, Shoelace area, and perimeter functions
- [ ] T004 [P] Create backend mock server structure: backend/server.js with Express setup
- [ ] T005 [P] Create backend routes directory backend/routes/ with device-form.js and device-sync.js stubs
- [ ] T006 [P] Create backend data storage directory backend/data/ with submissions.json file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create InputMethodDialog component in src/form/components/InputMethodDialog.tsx (modal with 3 radio options: manual, automatic, tap placement)
- [ ] T008 Add automatic recording configuration UI to InputMethodDialog.tsx (interval input, accuracy dropdown with 5m/10m/15m/20m options)
- [ ] T009 Create platform-specific GeoMapView component in src/form/components/GeoMapView.tsx (Platform.select for react-native-maps vs Leaflet)
- [ ] T010 Implement polyline rendering in GeoMapView.tsx for geotrace visualization
- [ ] T011 Implement polygon rendering in GeoMapView.tsx for geoshape visualization
- [ ] T012 [P] Implement backend GET /api/v1/device/form/{form_id} endpoint in backend/routes/device-form.js (return form JSON with geotrace/geoshape questions)
- [ ] T013 [P] Implement backend POST /api/v1/device/sync endpoint in backend/routes/device-sync.js (accept coordinate arrays, store in submissions.json)
- [ ] T014 [P] Create sample form JSON backend/source/forms/test-geo-form.json with both geotrace and geoshape questions
- [ ] T015 Export TypeGeoTrace and TypeGeoShape placeholder components from src/form/fields/index.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manual Point Recording for Trace Collection (Priority: P1) 🎯 MVP

**Goal**: Enable field workers to manually record waypoints by tapping "Record a point" button to create geotrace paths

**Independent Test**: Open form with geotrace question, select "Manual location recording", tap "Record a point" 5 times while moving, verify points appear on map with connecting lines, save and verify [[lat, lon], ...] array stored

### Implementation for User Story 1

- [ ] T016 [US1] Create TypeGeoTrace component skeleton in src/form/fields/TypeGeoTrace.tsx with standard field component props interface
- [ ] T017 [US1] Add useState for recording session state in TypeGeoTrace.tsx (status, inputMethod, accumulatedPoints)
- [ ] T018 [US1] Implement InputMethodDialog integration in TypeGeoTrace.tsx (show modal on field activation, handle manual selection)
- [ ] T019 [US1] Implement "Record a point" button in TypeGeoTrace.tsx for manual mode
- [ ] T020 [US1] Add expo-location getCurrentPosition call on button tap in TypeGeoTrace.tsx
- [ ] T021 [US1] Implement coordinate capture logic: append [latitude, longitude] to accumulatedPoints array in TypeGeoTrace.tsx
- [ ] T022 [US1] Update FormState.currentValues with coordinate array on each point capture in TypeGeoTrace.tsx
- [ ] T023 [US1] Integrate GeoMapView in TypeGeoTrace.tsx to display captured points with polyline
- [ ] T024 [US1] Implement distance calculation using geo-calculations.ts and display total distance in TypeGeoTrace.tsx
- [ ] T025 [US1] Add point count display in TypeGeoTrace.tsx UI
- [ ] T026 [US1] Implement pause/resume functionality for manual recording in TypeGeoTrace.tsx
- [ ] T027 [US1] Implement "Clear all points" button in TypeGeoTrace.tsx
- [ ] T028 [US1] Implement save validation (minimum 2 points) in TypeGeoTrace.tsx
- [ ] T029 [US1] Add TypeGeoTrace case to switch statement in src/form/components/QuestionField.js
- [ ] T030 [US1] Add geotrace validation rules in src/form/lib/index.js (minimum 2 points, valid coordinate pairs)

**Checkpoint**: At this point, User Story 1 should be fully functional - manual geotrace recording works end-to-end

---

## Phase 4: User Story 2 - Automatic Location Tracking for Trace Collection (Priority: P2)

**Goal**: Enable automatic waypoint capture at configured intervals with GPS accuracy filtering for hands-free geotrace recording

**Independent Test**: Open form with geotrace question, select "Automatic location recording", configure 5-second interval and 10m accuracy, start and walk for 1 minute, verify points captured every ~5 seconds only when accuracy ≤10m, verify pause on poor accuracy

### Implementation for User Story 2

- [ ] T031 [US2] Implement automatic mode configuration state in TypeGeoTrace.tsx (interval, accuracyThreshold)
- [ ] T032 [US2] Add automatic recording configuration submission handler in TypeGeoTrace.tsx (validate interval > 0, accuracy ∈ {5,10,15,20})
- [ ] T033 [US2] Implement expo-location watchPositionAsync setup in TypeGeoTrace.tsx with configured interval (timeInterval in milliseconds)
- [ ] T034 [US2] Add GPS accuracy filtering logic in location watch callback: only capture if accuracy ≤ accuracyThreshold
- [ ] T035 [US2] Implement automatic recording state: recording/paused based on accuracy threshold in TypeGeoTrace.tsx
- [ ] T036 [US2] Add accuracy status display in TypeGeoTrace.tsx UI (green <10m, yellow 10m-threshold, red >threshold)
- [ ] T037 [US2] Implement accuracy-based pause notification in TypeGeoTrace.tsx ("Paused: GPS accuracy poor")
- [ ] T038 [US2] Add automatic resume when accuracy improves in location watch callback
- [ ] T039 [US2] Implement stop recording button and cleanup watchPositionAsync subscription in TypeGeoTrace.tsx
- [ ] T040 [US2] Store accuracy metadata with coordinates for automatic mode (optional, for debugging)

**Checkpoint**: User Story 2 functional - automatic geotrace recording works with accuracy filtering, independent of US1

---

## Phase 5: User Story 3 - Placement by Tapping for Trace Collection (Priority: P3)

**Goal**: Enable desk-based geotrace creation by tapping points on a map without physical movement

**Independent Test**: Open form with geotrace question, select "Placement by tapping", tap 4 locations on map, verify polyline drawn connecting points, save and verify coordinate array

### Implementation for User Story 3

- [ ] T041 [US3] Implement tap placement mode state in TypeGeoTrace.tsx
- [ ] T042 [US3] Add map tap event handler to GeoMapView.tsx (extract lat/lng from tap event)
- [ ] T043 [US3] Pass tap handler callback from TypeGeoTrace.tsx to GeoMapView.tsx for tap mode
- [ ] T044 [US3] Implement coordinate capture from map tap: append [latitude, longitude] to accumulatedPoints
- [ ] T045 [US3] Add visual feedback for tap placement: show crosshair or pin icon on map in GeoMapView.tsx
- [ ] T046 [US3] Implement "Delete last point" button for tap mode in TypeGeoTrace.tsx
- [ ] T047 [US3] Update polyline in real-time as points are tapped in GeoMapView.tsx

**Checkpoint**: User Story 3 functional - tap-based geotrace creation works, independent of US1 and US2

---

## Phase 6: User Story 4 - Manual Point Recording for Polygon/Area Definition (Priority: P1) 🎯 MVP

**Goal**: Enable field workers to manually record corner points to create closed polygon geoshapes with area/perimeter calculations

**Independent Test**: Open form with geoshape question, select "Manual location recording", record 4 corner points, verify polygon auto-closes (first point === last point), verify area and perimeter displayed, save and verify closed coordinate array

### Implementation for User Story 4

- [ ] T048 [US4] Create TypeGeoShape component skeleton in src/form/fields/TypeGeoShape.tsx (similar structure to TypeGeoTrace)
- [ ] T049 [US4] Add useState for recording session state in TypeGeoShape.tsx (status, inputMethod, accumulatedPoints)
- [ ] T050 [US4] Implement InputMethodDialog integration in TypeGeoShape.tsx (show modal, handle manual selection)
- [ ] T051 [US4] Implement "Record a point" button for manual mode in TypeGeoShape.tsx
- [ ] T052 [US4] Add expo-location getCurrentPosition call on button tap in TypeGeoShape.tsx
- [ ] T053 [US4] Implement coordinate capture logic: append [latitude, longitude] to accumulatedPoints in TypeGeoShape.tsx
- [ ] T054 [US4] Implement automatic polygon closure: when saving, append first coordinate to end if not already closed
- [ ] T055 [US4] Integrate GeoMapView in TypeGeoShape.tsx to display polygon with fill
- [ ] T056 [US4] Implement area calculation using geo-calculations.ts Shoelace formula in TypeGeoShape.tsx
- [ ] T057 [US4] Implement perimeter calculation using geo-calculations.ts Haversine sum in TypeGeoShape.tsx
- [ ] T058 [US4] Display area (square meters) and perimeter (meters) in TypeGeoShape.tsx UI
- [ ] T059 [US4] Add point count display (unique points, excluding closure) in TypeGeoShape.tsx
- [ ] T060 [US4] Implement "Clear all points" button in TypeGeoShape.tsx
- [ ] T061 [US4] Implement save validation (minimum 3 unique points) in TypeGeoShape.tsx
- [ ] T062 [US4] Update FormState.currentValues with closed coordinate array on save in TypeGeoShape.tsx
- [ ] T063 [US4] Add TypeGeoShape case to switch statement in src/form/components/QuestionField.js
- [ ] T064 [US4] Add geoshape validation rules in src/form/lib/index.js (minimum 3 unique points, first === last for closed polygon)

**Checkpoint**: User Story 4 functional - manual geoshape recording works with automatic closure and calculations

---

## Phase 7: User Story 5 - Automatic Boundary Tracing for Area Definition (Priority: P2)

**Goal**: Enable automatic boundary point capture while walking around an area perimeter with proximity-based polygon closure

**Independent Test**: Open form with geoshape question, select "Automatic location recording", configure 5-second interval and 5m accuracy, walk around a small area, verify points captured at intervals, return to start, verify closure prompt, accept closure, verify area/perimeter calculated

### Implementation for User Story 5

- [ ] T065 [US5] Implement automatic mode configuration in TypeGeoShape.tsx (interval, accuracyThreshold)
- [ ] T066 [US5] Implement expo-location watchPositionAsync setup in TypeGeoShape.tsx for automatic boundary capture
- [ ] T067 [US5] Add GPS accuracy filtering in location watch callback (only capture if accuracy ≤ threshold)
- [ ] T068 [US5] Implement proximity detection to first point in TypeGeoShape.tsx (calculate distance to first coordinate)
- [ ] T069 [US5] Add "Close polygon" prompt when within 10 meters of first point during automatic recording
- [ ] T070 [US5] Implement manual close action: append first coordinate to end when user confirms closure
- [ ] T071 [US5] Add accuracy status display in TypeGeoShape.tsx UI (color-coded: green/yellow/red)
- [ ] T072 [US5] Implement pause notification on poor accuracy in TypeGeoShape.tsx
- [ ] T073 [US5] Add stop recording button and cleanup subscription in TypeGeoShape.tsx
- [ ] T074 [US5] Calculate and display area/perimeter after polygon closure

**Checkpoint**: User Story 5 functional - automatic geoshape boundary tracing works with proximity closure

---

## Phase 8: User Story 6 - Placement by Tapping for Area Definition (Priority: P3)

**Goal**: Enable desk-based geoshape polygon creation by tapping corner points on a map

**Independent Test**: Open form with geoshape question, select "Placement by tapping", tap 5 corner points on map, verify polygon auto-closes and fills, verify area/perimeter calculated, save and verify closed coordinate array

### Implementation for User Story 6

- [ ] T075 [US6] Implement tap placement mode state in TypeGeoShape.tsx
- [ ] T076 [US6] Reuse GeoMapView tap event handler for geoshape tap mode
- [ ] T077 [US6] Pass tap handler callback from TypeGeoShape.tsx to GeoMapView.tsx
- [ ] T078 [US6] Implement coordinate capture from map tap: append [latitude, longitude] to accumulatedPoints
- [ ] T079 [US6] Add visual polygon preview in GeoMapView.tsx as points are tapped (auto-close preview)
- [ ] T080 [US6] Implement "Delete last point" button for tap mode in TypeGeoShape.tsx
- [ ] T081 [US6] Update area/perimeter calculations in real-time as points are tapped

**Checkpoint**: User Story 6 functional - tap-based geoshape creation works with live calculations

---

## Phase 9: User Story 7 - Form Submission with Geo Collection Data (Priority: P1) 🎯 MVP

**Goal**: Enable complete form submission workflow with geotrace/geoshape answers persisted to backend and offline queue

**Independent Test**: Complete a form with 1 geotrace question (manual mode, 3 points) and 1 geoshape question (manual mode, 4 points), submit form, verify backend receives request with coordinate arrays in correct format, verify offline queue works when network unavailable

### Implementation for User Story 7

- [ ] T082 [US7] Verify FormState.currentValues stores geotrace/geoshape as [[lat, lon], ...] arrays (integration check)
- [ ] T083 [US7] Update form submission payload generation in FormContainer to include geotrace/geoshape answers
- [ ] T084 [US7] Implement "geo" representative point derivation in submission payload (first coordinate of trace/shape)
- [ ] T085 [US7] Add geotrace/geoshape serialization validation before submission (verify array format, minimum points)
- [ ] T086 [US7] Test backend endpoint integration: POST /api/v1/device/sync accepts coordinate array format
- [ ] T087 [US7] Verify backend response handling and success confirmation in ApiService
- [ ] T088 [US7] Test offline submission queue: verify geotrace/geoshape data persists to SQLite json column
- [ ] T089 [US7] Verify background sync task handles geotrace/geoshape submissions when network restores
- [ ] T090 [US7] Add submission validation error messages for invalid geotrace/geoshape data (< minimum points, malformed coordinates)
- [ ] T091 [US7] Test end-to-end flow: form creation → geotrace/geoshape capture → submit → backend storage → view in backend

**Checkpoint**: User Story 7 functional - complete submission workflow works online and offline

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T092 [P] Update CLAUDE.md with geotrace/geoshape implementation patterns and coordinate format details
- [ ] T093 [P] Add error boundary handling for GPS permission denial in TypeGeoTrace and TypeGeoShape components
- [ ] T094 [P] Implement session recovery: persist recording state to allow app interruption recovery (FR-021)
- [ ] T095 [P] Add loading states for GPS position acquisition in both components
- [ ] T096 [P] Optimize map performance for large coordinate arrays (>100 points): implement point clustering or simplification
- [ ] T097 [P] Add accessibility labels (aria-labels) to all buttons in TypeGeoTrace and TypeGeoShape
- [ ] T098 [P] Implement edge case handling: switch input method mid-recording (prompt to save or discard)
- [ ] T099 [P] Add edge case handling: GPS signal loss during automatic recording (pause and notify)
- [ ] T100 Validate all acceptance scenarios from spec.md for User Stories 1, 2, 3, 4, 5, 6, 7
- [ ] T101 Run complete manual test suite from quickstart.md (3 input methods × 2 question types = 6 scenarios)
- [ ] T102 Validate GPS accuracy threshold behavior (test with 5m, 10m, 15m, 20m settings)
- [ ] T103 Performance testing: record 500-point geotrace and verify map rendering < 1 second (SC-006, SC-007)
- [ ] T104 Test form completion time: 3 geotraces + 2 geoshapes < 15 minutes (SC-005)
- [ ] T105 Code cleanup: remove console.log statements, add proper TypeScript types where missing
- [ ] T106 Documentation: add inline code comments for complex algorithms (Haversine, Shoelace)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-9)**: All depend on Foundational phase completion
  - US1 (Manual Geotrace), US4 (Manual Geoshape), US7 (Submission) form MVP set
  - US2, US3, US5, US6 can be added incrementally
  - User stories can proceed in parallel if staffed
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Manual Geotrace - No dependencies on other stories after Foundational
- **User Story 2 (P2)**: Automatic Geotrace - Extends US1, shares TypeGeoTrace component
- **User Story 3 (P3)**: Tap Geotrace - Extends US1, shares TypeGeoTrace component
- **User Story 4 (P1)**: Manual Geoshape - No dependencies on other stories after Foundational
- **User Story 5 (P2)**: Automatic Geoshape - Extends US4, shares TypeGeoShape component
- **User Story 6 (P3)**: Tap Geoshape - Extends US4, shares TypeGeoShape component
- **User Story 7 (P1)**: Submission - Requires at least one geotrace or geoshape story complete (recommend US1 and US4 for MVP)

### Within Each User Story

- Setup tasks (Phase 1) before Foundational (Phase 2)
- Foundational phase MUST complete before any user story work
- Within user stories:
  - Component skeleton before implementation
  - State management before UI logic
  - Core capture logic before calculations
  - Validation before save/submit
  - Integration tasks last

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks except T001 can run in parallel (T002-T006 are independent files)

**Phase 2 (Foundational)**: Tasks can run in 2 parallel streams:
- Stream 1: T007-T011 (Frontend components)
- Stream 2: T012-T014 (Backend endpoints)
- T015 depends on nothing, can run anytime

**User Story Parallelization**:
Once Foundational phase completes, these story groups can run fully in parallel:
- **Team A**: US1 (Manual Geotrace) → US2 (Auto Geotrace) → US3 (Tap Geotrace)
- **Team B**: US4 (Manual Geoshape) → US5 (Auto Geoshape) → US6 (Tap Geoshape)
- **Team C**: US7 (Submission) after US1 and US4 complete

**Within User Stories**: Most tasks are sequential (shared file TypeGeoTrace.tsx or TypeGeoShape.tsx)

---

## Parallel Example: User Story 1

Since US1 tasks mostly modify the same file (TypeGeoTrace.tsx), parallelization is limited. However, these can run in parallel:

```bash
# After T016-T018 complete (component skeleton and dialog integration):
- T019 (Record button UI)
- T024 (Distance calculation util integration)
- T025 (Point count display UI)
# These modify different sections of the component

# After core recording works (T016-T023):
- T026 (Pause/resume - separate state)
- T027 (Clear button - separate handler)
# Can be developed independently

# Integration tasks (different files):
- T029 [QuestionField.js switch case]
- T030 [form/lib validation]
# Can run in parallel with component finalization
```

---

## Implementation Strategy

### MVP First (Minimum Viable Product)

**MVP Scope = Phase 1 + Phase 2 + US1 + US4 + US7**

This delivers the core value proposition:
- Manual geotrace recording (path tracking)
- Manual geoshape recording (area measurement)
- Form submission with backend integration

**MVP Task Count**: T001-T030 (Setup + Foundational + US1) + T048-T064 (US4) + T082-T091 (US7) = **91 tasks**

**Recommended MVP Order**:
1. Complete Phase 1: Setup (T001-T006) - 30 min
2. Complete Phase 2: Foundational (T007-T015) - 4 hours
3. Complete Phase 3: User Story 1 (T016-T030) - 3 hours
4. Complete Phase 6: User Story 4 (T048-T064) - 3 hours
5. Complete Phase 9: User Story 7 (T082-T091) - 2 hours
6. **STOP and VALIDATE**: Test MVP independently - 1 hour
7. Deploy/demo if ready

**Estimated MVP Time**: ~14 hours

### Incremental Delivery (Post-MVP)

After MVP validation, add features incrementally:

**Increment 1 (Automatic Recording)**:
- Add Phase 4: User Story 2 (Automatic Geotrace) - 2 hours
- Add Phase 7: User Story 5 (Automatic Geoshape) - 2 hours
- Deploy/demo automatic tracking capability

**Increment 2 (Tap Placement)**:
- Add Phase 5: User Story 3 (Tap Geotrace) - 1.5 hours
- Add Phase 8: User Story 6 (Tap Geoshape) - 1.5 hours
- Deploy/demo desk-based planning capability

**Increment 3 (Polish)**:
- Complete Phase 10: Polish tasks - 3 hours
- Final testing and documentation

**Total Time (All Features)**: ~24-26 hours

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

**Week 1**:
- Developer A: User Story 1 (Manual Geotrace)
- Developer B: User Story 4 (Manual Geoshape)
- Developer C: User Story 7 (Submission prep, backend integration)

**Week 2**:
- Developer A: User Story 2 (Automatic Geotrace)
- Developer B: User Story 5 (Automatic Geoshape)
- Developer C: Testing, integration, edge cases

**Week 3**:
- Developer A: User Story 3 (Tap Geotrace)
- Developer B: User Story 6 (Tap Geoshape)
- Developer C: Polish, documentation, final validation

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story (except US2, US3, US5, US6 which extend US1/US4) should be independently completable and testable
- Commit after each logical task group (e.g., after completing one user story)
- Stop at any checkpoint to validate story independently
- TypeGeoTrace and TypeGeoShape components follow the same pattern as existing TypeGeo.js
- Coordinate format is always [[lat, lon], ...] in storage, FormState, and submission
- GPS accuracy thresholds are exactly 5m, 10m, 15m, 20m (no other values)
- Minimum points: 2 for geotrace, 3 unique for geoshape (4 total with closure)

---

**Total Tasks**: 106
**MVP Tasks**: 91 (86% of total)
**P1 Stories**: US1, US4, US7 (Manual recording + Submission = MVP)
**P2 Stories**: US2, US5 (Automatic recording = Increment 1)
**P3 Stories**: US3, US6 (Tap placement = Increment 2)
