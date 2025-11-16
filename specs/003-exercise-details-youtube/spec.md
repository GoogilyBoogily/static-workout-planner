# Feature Specification: Exercise Details with YouTube Embed

**Feature Branch**: `003-exercise-details-youtube`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Exercise details with YouTube embed"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Exercise Details (Priority: P1)

A user wants to click on an exercise from the list and see detailed information about that exercise, including proper form, technique tips, and related workout parameters.

**Why this priority**: This is the foundation of the feature - users need to be able to view detailed information about individual exercises. Without this, the YouTube embed and other detail features have no context.

**Independent Test**: Can be fully tested by clicking an exercise from the list and verifying that a detail view appears showing the exercise name, muscle groups, and workout parameters (sets, reps, weight, rest). Delivers immediate value by providing full exercise information at a glance.

**Acceptance Scenarios**:

1. **Given** the exercise list is displayed, **When** the user clicks on an exercise, **Then** a detail view appears showing all exercise information (name, muscle groups, sets, reps, weight, rest, day)
2. **Given** the detail view is open, **When** the user clicks a close button or back action, **Then** the detail view closes and returns to the exercise list
3. **Given** no exercise is selected, **When** the user views the list, **Then** no detail view is shown

---

### User Story 2 - Watch Exercise Tutorial Video (Priority: P2)

A user wants to watch a YouTube tutorial video embedded directly in the exercise detail view to learn proper form and technique without leaving the application.

**Why this priority**: Video tutorials are the most effective way to learn exercise form. Embedding the video directly provides seamless learning experience and is the core value of this feature.

**Independent Test**: Can be tested by opening an exercise detail view that has a YouTube URL and verifying that the video player loads and is playable. Delivers value by enabling visual learning of proper exercise technique.

**Acceptance Scenarios**:

1. **Given** an exercise has a YouTube URL in the CSV, **When** the user views the exercise details, **Then** a YouTube video player is embedded and displays the video
2. **Given** the YouTube video is embedded, **When** the user clicks play, **Then** the video plays within the embedded player
3. **Given** an exercise has no YouTube URL, **When** the user views the exercise details, **Then** the video section is omitted entirely (exercise info still displays)
4. **Given** a YouTube URL is invalid or the video is unavailable, **When** the detail view loads, **Then** an appropriate error message is displayed

---

### User Story 3 - Navigate Between Exercise Details (Priority: P3)

A user wants to navigate to the next or previous exercise directly from the detail view without having to close the current view and select from the list.

**Why this priority**: This improves browsing efficiency for users reviewing multiple exercises. While valuable, it's less critical than the core detail view and video embed functionality.

**Independent Test**: Can be tested by opening an exercise detail view and using next/previous controls to navigate through exercises while staying in the detail view. Delivers value by streamlining the exercise review workflow.

**Acceptance Scenarios**:

1. **Given** an exercise detail view is open, **When** the user clicks "Next", **Then** the detail view updates to show the next exercise in the list
2. **Given** an exercise detail view is open, **When** the user clicks "Previous", **Then** the detail view updates to show the previous exercise in the list
3. **Given** the user is viewing the first exercise, **When** the detail view loads, **Then** the Previous button is disabled (cannot be clicked)
4. **Given** the user is viewing the last exercise, **When** the detail view loads, **Then** the Next button is disabled (cannot be clicked)

---

### Edge Cases

- What happens when a YouTube URL is malformed or invalid?
- What happens when the YouTube video has been removed or is unavailable in the user's region?
- How does the video player behave on mobile devices (responsive sizing, touch controls)?
- What happens if the CSV doesn't include a YouTube URL column?
- Modal detail view supports keyboard navigation: ESC key closes the modal and returns to exercise list
- Arrow keys do NOT navigate between exercises - users must click buttons or use tab navigation to reach Next/Previous buttons
- Focus management: When modal opens, focus moves to first interactive element; when modal closes, focus returns to the clicked exercise in the list
- Keyboard users can tab to Next/Previous buttons and activate with space or enter key

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a way to select individual exercises from the list to view details
- **FR-002**: System MUST display a detail view showing all exercise information (name, muscle groups, sets, reps, weight, rest, day)
- **FR-003**: System MUST provide a way to close the modal detail view (close button, clicking backdrop, ESC key) and return to the exercise list
- **FR-003a**: Modal MUST trap focus within the detail view while open (accessibility requirement)
- **FR-003b**: Modal MUST display with a semi-transparent backdrop over the exercise list
- **FR-004**: System MUST parse a YouTube URL column from the CSV file for each exercise
- **FR-005**: System MUST embed a YouTube video player in the detail view when a YouTube URL is present
- **FR-006**: System MUST omit the video section entirely when an exercise has no YouTube URL (no empty space or placeholder)
- **FR-007**: System MUST handle invalid or unavailable YouTube videos with appropriate error messages
- **FR-008**: System MUST support full YouTube URLs in the format youtube.com/watch?v=VIDEO_ID (extract video ID from 'v' parameter)
- **FR-009**: System MUST provide clickable next/previous button controls in the detail view
- **FR-009a**: System MUST make next/previous buttons keyboard accessible (tab navigation, space/enter to activate)
- **FR-010**: System MUST update the detail view when next/previous is clicked without closing the view
- **FR-011**: System MUST disable the Previous button when viewing the first exercise in the list
- **FR-011a**: System MUST disable the Next button when viewing the last exercise in the list
- **FR-012**: Detail view MUST be responsive and work on mobile devices
- **FR-013**: YouTube embed MUST use privacy-enhanced mode (youtube-nocookie.com domain) to avoid setting cookies until user plays the video
- **FR-013a**: YouTube embed MUST comply with YouTube's embedding policies and terms of service

### Key Entities

- **Exercise Detail**: Extended view of an Exercise with all attributes visible and optional YouTube video embed
  - Inherits all attributes from Exercise entity (name, tags, sets, reps, weight, rest, day)
  - Adds: youtubeUrl (optional string) - URL to instructional video

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open an exercise detail view in under 2 seconds with a single click
- **SC-002**: YouTube videos load and are playable within 5 seconds on standard broadband connections
- **SC-003**: Detail view displays correctly on mobile devices (smartphones 320px+ width) and desktop
- **SC-004**: 90% of users successfully watch embedded videos to learn exercise form
- **SC-005**: Navigation between exercise details (next/previous) updates the view in under 1 second

## Clarifications

### Session 2025-11-15

- Q: Which YouTube URL formats should the system support and parse correctly? → A: Support full YouTube URLs only in the format youtube.com/watch?v=VIDEO_ID
- Q: How should the exercise detail view be presented to the user? → A: Modal overlay (popup/dialog that appears over the exercise list with backdrop)
- Q: When the user reaches the first or last exercise in the detail view, how should the Previous/Next buttons behave? → A: Disable buttons at boundaries (Previous disabled on first exercise, Next disabled on last exercise)
- Q: When an exercise has no YouTube URL, what should be displayed in the video area of the detail view? → A: Show nothing (omit the video section entirely, no empty space)
- Q: Should the YouTube embed use privacy-enhanced mode (youtube-nocookie.com domain)? → A: Yes, use privacy-enhanced mode (youtube-nocookie.com domain, no cookies until video plays)
- Q: Should keyboard arrow keys navigate between exercises in the detail view? → A: No, only mouse clicks on Next/Previous buttons work (keyboard users must tab to buttons)

## Assumptions

- CSV files may optionally include a "YouTube URL" column containing video links in the format youtube.com/watch?v=VIDEO_ID
- YouTube videos are publicly accessible (not age-restricted or region-blocked)
- Users have internet connectivity to load YouTube videos
- The application will use YouTube's privacy-enhanced iframe embed API (youtube-nocookie.com domain)
- Video playback respects YouTube's terms of service and embedding policies
- Privacy-enhanced mode prevents tracking cookies until user actively plays the video (GDPR-friendly)
- Detail view is implemented as a modal overlay that appears over the exercise list with a semi-transparent backdrop
- Exercise list from feature 002-exercise-list-filters will be the source of selectable exercises
- If no YouTube URL is provided for an exercise, the detail view still shows all other exercise information
- Standard YouTube embed parameters will be used (allow fullscreen, show controls, etc.)
- Short URLs (youtu.be/ID) and other YouTube URL formats are NOT supported - users must use the full watch URL format
