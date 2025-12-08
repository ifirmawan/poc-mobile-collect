# Feature Specification: GeoTrace and GeoShape Collection Types

**Feature Branch**: `001-geo-collection-types`
**Created**: 2025-12-08
**Status**: Draft
**Input**: User description: "Implement geotrace and geoshape by integrating akvo-mis-apps as the base data-collection app. Use expo-location for input solution. Replicate backend with static data following /api/v1/device/ API. Test new question types geotrace and geoshape."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Point Recording for Trace Collection (Priority: P1)

Field workers need to manually record individual waypoints while walking along a path (e.g., irrigation canal, road, fence line) to create accurate geotrace data when automatic tracking is unreliable.

**Why this priority**: Core functionality that provides the most control and reliability for field data collection. Works in all network conditions and doesn't depend on continuous GPS accuracy.

**Independent Test**: Can be fully tested by manually tapping "Record a point" button multiple times while moving, then saving the trace. Delivers a complete geotrace with user-controlled waypoint placement.

**Acceptance Scenarios**:

1. **Given** a form with a geotrace question, **When** field worker selects "Manual location recording" input method, **Then** system displays "Record a point" button and map showing current location
2. **Given** manual recording mode is active, **When** field worker taps "Record a point" at each desired location, **Then** system captures coordinates and displays point on map with visual connection to previous points
3. **Given** multiple points have been recorded, **When** field worker reviews the trace on the map, **Then** system displays all points connected by lines showing the path
4. **Given** a geotrace with recorded points, **When** field worker pauses recording, **Then** system allows review and editing before final save
5. **Given** a complete geotrace, **When** field worker saves the answer, **Then** system stores ordered array of coordinates and displays point count

---

### User Story 2 - Automatic Location Tracking for Trace Collection (Priority: P2)

Field workers need to automatically record their path while moving to create geotraces without manual intervention, useful for long paths or when hands-free operation is needed.

**Why this priority**: Significantly improves efficiency for long-distance traces but depends on reliable GPS and is secondary to manual control.

**Independent Test**: Can be tested by selecting automatic recording with 5-second intervals and 5-meter accuracy requirement, walking a path, and verifying waypoints are captured at regular intervals. Delivers hands-free trace collection.

**Acceptance Scenarios**:

1. **Given** a form with a geotrace question, **When** field worker selects "Automatic location recording", **Then** system displays configuration options for recording interval and accuracy requirement
2. **Given** automatic recording configuration screen, **When** field worker selects recording interval from predefined options and accuracy requirement from dropdown (5m, 10m, 15m, or 20m), **Then** system validates and accepts the configuration
3. **Given** automatic recording is started with 5-meter accuracy requirement, **When** field worker moves along the desired path, **Then** system captures waypoints at specified intervals only when GPS accuracy is 5 meters or better
4. **Given** automatic recording is in progress, **When** GPS accuracy drops below selected threshold (e.g., worse than 10m when 10m is selected), **Then** system pauses recording and notifies field worker until accuracy improves
5. **Given** automatic recording is active, **When** field worker pauses or stops, **Then** system displays all captured points on map as a connected trace with total distance

---

### User Story 3 - Placement by Tapping for Trace Collection (Priority: P3)

Field workers need to define traces by tapping on a map when physical access to locations is difficult or when planning future paths before field visit.

**Why this priority**: Useful for planning and remote work but less common than on-site data collection. Requires map availability and familiarity.

**Independent Test**: Can be tested by tapping multiple points on a map view to create a path without physical movement. Delivers desk-based trace creation capability.

**Acceptance Scenarios**:

1. **Given** a form with a geotrace question, **When** field worker selects "Placement by tapping", **Then** system displays map centered on current location or default region
2. **Given** placement by tapping mode, **When** field worker taps on map locations, **Then** system records coordinates at each tap location and draws connecting lines
3. **Given** multiple points placed on map, **When** field worker wants to adjust, **Then** system allows deletion of last point or clearing all points to restart

---

### User Story 4 - Manual Point Recording for Polygon/Area Definition (Priority: P1)

Field workers need to manually record corner points of an area (e.g., farm plot, building footprint, reservoir boundary) to create accurate geoshape data representing enclosed spaces.

**Why this priority**: Essential for land and property data collection. Closed polygon creation is the primary use case for geoshape questions.

**Independent Test**: Can be tested by recording points around a perimeter, automatically closing the polygon, and calculating area. Delivers complete area measurement capability.

**Acceptance Scenarios**:

1. **Given** a form with a geoshape question, **When** field worker selects "Manual location recording", **Then** system displays "Record a point" button and map showing current location
2. **Given** manual recording mode for geoshape, **When** field worker records 3 or more points, **Then** system automatically closes the polygon by connecting last point to first point
3. **Given** a closed polygon geoshape, **When** field worker completes recording, **Then** system calculates and displays area and perimeter measurements
4. **Given** geoshape with recorded polygon, **When** field worker saves the answer, **Then** system stores ordered array of coordinates forming a closed shape

---

### User Story 5 - Automatic Boundary Tracing for Area Definition (Priority: P2)

Field workers need to walk around the perimeter of an area while system automatically records boundary points to create geoshapes for large or complex parcels.

**Why this priority**: Improves efficiency for large area mapping but requires clear walking path around entire perimeter.

**Independent Test**: Can be tested by walking around a defined area with automatic recording enabled (e.g., 5-second intervals, 10m accuracy) and verifying the system creates a closed polygon. Delivers efficient large-area mapping.

**Acceptance Scenarios**:

1. **Given** a form with a geoshape question, **When** field worker selects "Automatic location recording" and configures interval and accuracy (5m, 10m, 15m, or 20m), **Then** system begins capturing boundary points as field worker walks perimeter
2. **Given** automatic boundary recording in progress, **When** field worker returns to starting location, **Then** system detects proximity to first point and offers to close the polygon
3. **Given** automatically recorded boundary, **When** polygon is closed, **Then** system calculates area and perimeter and displays on map

---

### User Story 6 - Placement by Tapping for Area Definition (Priority: P3)

Field workers need to define area boundaries by tapping polygon corners on a map for planning purposes or when physical access is restricted.

**Why this priority**: Useful for planning and verification but less accurate than on-site measurement. Secondary to physical data collection.

**Independent Test**: Can be tested by tapping corner points on a map to form a polygon and verifying area calculation. Delivers desk-based area definition.

**Acceptance Scenarios**:

1. **Given** a form with a geoshape question, **When** field worker selects "Placement by tapping", **Then** system displays map for manual polygon creation
2. **Given** placement mode for geoshape, **When** field worker taps 3 or more corner points, **Then** system automatically closes polygon and calculates area
3. **Given** completed polygon, **When** field worker saves, **Then** system stores coordinates as closed shape

---

### User Story 7 - Form Submission with Geo Collection Data (Priority: P1)

Field workers need to submit completed forms containing geotrace and geoshape answers to the backend system for storage, synchronization, and further processing.

**Why this priority**: Critical for data persistence and workflow completion. Without reliable submission, all collection work is lost.

**Independent Test**: Can be tested by completing a form with geotrace/geoshape answers and verifying successful submission to backend with proper data format. Delivers end-to-end data collection workflow.

**Acceptance Scenarios**:

1. **Given** a form with completed geotrace and geoshape answers, **When** field worker submits the form, **Then** system serializes geo data to backend-compatible format and sends to API endpoint
2. **Given** form submission in progress, **When** network is unavailable, **Then** system queues submission for retry and notifies field worker of pending status
3. **Given** successful submission, **When** backend confirms receipt, **Then** system marks form as synced and displays confirmation to field worker
4. **Given** submitted geo data, **When** viewed in backend system, **Then** geotrace appears as ordered coordinate arrays and geoshape as closed polygons

---

### Edge Cases

- What happens when GPS signal is lost during automatic recording?
  - System should pause recording and notify user, resume when signal returns
- What happens when user records fewer than 2 points for geotrace or fewer than 3 points for geoshape?
  - System should prevent save and display validation message indicating minimum point requirements
- How does system handle when user forgets to close polygon in manual mode?
  - For geoshape, system automatically closes by connecting last point to first point
- What happens when GPS accuracy is very poor (>20 meters)?
  - System should warn user but allow override with explicit confirmation for manual recording; automatic recording will pause until accuracy improves
- How does system handle when user switches input methods mid-recording?
  - System should prompt to save or discard current progress before switching methods
- What happens when backend API is unavailable during submission?
  - System should store form data locally and queue for background sync when connection available
- How does system handle very large geotraces (100+ points)?
  - System should handle and display appropriately, may need to show point count instead of all markers on map for performance
- What happens when automatic recording interval is shorter than time to acquire accurate GPS fix?
  - System should wait for accuracy threshold to be met before recording, potentially resulting in irregular actual intervals

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support three input methods for both geotrace and geoshape: "Placement by tapping", "Manual location recording", and "Automatic location recording"
- **FR-002**: System MUST capture GPS coordinates with latitude, longitude, altitude, and accuracy metadata for each waypoint
- **FR-003**: System MUST display an input method selection dialog when user activates a geotrace or geoshape question
- **FR-004**: System MUST allow configuration of recording interval (in seconds) and accuracy requirement for automatic recording mode
- **FR-005**: System MUST provide accuracy requirement options of exactly 5 meters, 10 meters, 15 meters, and 20 meters for selection in automatic recording mode
- **FR-006**: System MUST validate that geotraces contain at least 2 points and geoshapes contain at least 3 points before allowing save
- **FR-007**: System MUST automatically close geoshape polygons by connecting the last point to the first point
- **FR-008**: System MUST display captured points on an interactive map in real-time during recording
- **FR-009**: System MUST provide visual feedback showing connections between points (lines for geotrace, closed polygon for geoshape)
- **FR-010**: System MUST allow pause and resume functionality during recording sessions
- **FR-011**: System MUST provide controls to delete last point, clear all points, or cancel recording
- **FR-012**: System MUST display current GPS accuracy level and point count to user during recording
- **FR-013**: System MUST only capture waypoints during automatic recording when GPS accuracy meets or exceeds the selected accuracy requirement (5m, 10m, 15m, or 20m)
- **FR-014**: System MUST serialize geotrace answers as ordered arrays of coordinate pairs: `[[lat1, lon1], [lat2, lon2], ...]`
- **FR-015**: System MUST serialize geoshape answers as ordered arrays of coordinate pairs forming closed polygons
- **FR-016**: System MUST submit geo collection data to backend API endpoint `/api/v1/device/sync` following Akvo MIS API specification
- **FR-017**: System MUST retrieve form definitions containing geotrace and geoshape question types from `/api/v1/device/form/{form_id}` endpoint
- **FR-018**: System MUST support offline form completion with queued synchronization when network becomes available
- **FR-019**: System MUST calculate and display distance/length for geotraces
- **FR-020**: System MUST calculate and display area and perimeter for geoshapes
- **FR-021**: System MUST persist incomplete recording sessions to allow continuation after app interruption
- **FR-022**: System MUST display accuracy status with color coding (green for high precision <10m, yellow for moderate ≥10m to <selected threshold, red for low precision ≥selected threshold)

### Key Entities

- **GeoTrace Answer**: Represents a path or line consisting of ordered coordinate waypoints, associated with a specific form question, including metadata such as total distance and timestamp
- **GeoShape Answer**: Represents an enclosed area or polygon consisting of ordered coordinate boundary points (automatically closed), associated with a specific form question, including metadata such as area, perimeter, and timestamp
- **Form Definition**: Contains question configurations including type (geotrace/geoshape), labels, validation rules, and whether questions are required
- **Submission**: Collection of form answers including geo collection data, submitted to backend via sync endpoint
- **Recording Session**: Temporary state during active collection including input method, configuration (interval and accuracy requirement), and accumulated points before final save

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Field workers can record a 10-point geotrace in under 2 minutes using manual recording mode
- **SC-002**: System captures waypoints at configured intervals (±1 second tolerance) during automatic recording when GPS accuracy meets selected threshold
- **SC-003**: GPS coordinates captured meet or exceed the selected accuracy requirement (5m, 10m, 15m, or 20m) or system pauses automatic recording
- **SC-004**: Form submissions containing geotrace and geoshape data are successfully stored in backend system with 100% data integrity
- **SC-005**: Users can complete a form with 3 geotrace questions and 2 geoshape questions within 15 minutes
- **SC-006**: System handles recording sessions with up to 500 waypoints without performance degradation
- **SC-007**: Map displays all recorded points and connections within 1 second of capture
- **SC-008**: 95% of form submissions succeed on first attempt when network is available
- **SC-009**: Offline submissions sync successfully within 5 minutes of network restoration
- **SC-010**: Area and perimeter calculations for geoshapes are accurate within 2% margin of error
- **SC-011**: Users can select and configure accuracy requirements (5m, 10m, 15m, 20m) in under 10 seconds
- **SC-012**: Automatic recording correctly pauses when GPS accuracy exceeds selected threshold and resumes when accuracy improves

## Out of Scope

- Advanced map features like satellite imagery, terrain layers, or offline map tiles
- Editing previously submitted geo data (read-only after submission)
- Import/export of geo data in specialized GIS formats (KML, GeoJSON, Shapefile)
- Integration with external GPS devices beyond device built-in GPS
- Real-time collaborative editing of geo collections
- Historical tracking or versioning of geo data edits
- Custom accuracy requirements beyond the four predefined options (5m, 10m, 15m, 20m)

## Assumptions

- Field workers have mobile devices with built-in GPS capability
- GPS accuracy of 5-20 meters is acceptable for data collection use cases
- Network connectivity is intermittent, requiring offline-first design
- Backend API follows Akvo MIS (v1) specification for device endpoints
- Forms are pre-configured by administrators and downloaded to devices
- Single user completes each form (no multi-user collaboration required)
- Map rendering uses standard web mapping libraries compatible with React Native
- Recording sessions typically involve 5-50 waypoints per geotrace/geoshape
- Measurement units are metric (meters for distance/perimeter, square meters for area)
- The four accuracy options (5m, 10m, 15m, 20m) cover the range of field data collection scenarios

## Dependencies

- **Backend API**: Must implement `/api/v1/device/form/{form_id}` and `/api/v1/device/sync` endpoints according to Akvo MIS specification
- **Location Services**: Requires device GPS/location permissions and expo-location library functionality
- **Map Component**: Requires React Native compatible mapping solution (e.g., react-native-maps, Leaflet for web)
- **Form Framework**: Depends on akvo-mis-apps form rendering architecture and state management patterns
- **Local Storage**: Requires persistent storage for offline forms and queued submissions

## Notes

- This feature extends existing akvo-mis-apps form infrastructure to support two new question types: geotrace and geoshape
- Visual design and interaction patterns shown in screenshots (3-input-methods-dialog.jpeg, automatic-location-recording.jpeg, manual-location-recordng.jpeg, placement-by-tapping.jpeg) serve as reference UI
- TypeScript implementation should follow existing akvo-mis-apps code patterns and type safety standards
- Backend endpoints should return static mock data during development/testing phase before full API implementation
- The accuracy requirement dropdown in automatic recording mode must present exactly four options: 5 meters, 10 meters, 15 meters, and 20 meters
