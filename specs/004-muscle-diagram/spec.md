# Feature Specification: Interactive SVG Muscle Diagram

**Feature Branch**: `004-muscle-diagram`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Interactive SVG muscle diagram for front and back"

## Clarifications

### Session 2025-11-15

- Q: When exercises in the CSV have muscle group data, how should multiple muscle groups be represented in the CSV file? → A: Single column with comma-separated values (e.g., "Chest, Shoulders")
- Q: When a user hovers over a muscle group on desktop, where should the muscle name label be displayed? → A: As a tooltip that follows the cursor or appears near the hovered muscle
- Q: On touch devices (mobile/tablet), how should the tap interaction work since there's no hover state? → A: Single tap immediately selects the muscle (no preview/tooltip)
- Q: Should the diagram show individual muscles or grouped muscle regions? → A: Grouped muscle regions using common fitness terminology
- Q: When a user has muscle groups selected and then loads a new CSV file, what should happen to the selection state? → A: Keep selections and immediately filter the new data based on existing selections

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Muscle Groups (Priority: P1)

Users need to visualize muscle groups on a human body diagram to understand which muscles are being targeted during their workouts. They can view both front and back perspectives of the body to see all major muscle groups.

**Why this priority**: This is the foundational capability that delivers immediate value. Users can reference the diagram while planning or performing workouts to ensure balanced muscle development and proper exercise targeting.

**Independent Test**: Can be fully tested by loading the application and verifying that front and back body diagrams are visible with labeled muscle groups.

**Acceptance Scenarios**:

1. **Given** the user opens the workout planner, **When** they navigate to the muscle diagram section, **Then** they see a front-view body diagram with major muscle groups displayed
2. **Given** the user is viewing the front diagram, **When** they switch to the back view, **Then** they see a back-view body diagram with posterior muscle groups displayed
3. **Given** the user views either diagram, **When** they look at the muscle groups, **Then** each major muscle group is clearly distinguishable and visually separated

---

### User Story 2 - Highlight Muscles on Hover (Priority: P2)

Users can hover their mouse over individual muscle groups on the diagram to see them highlighted, making it easier to identify specific muscles and understand their location on the body.

**Why this priority**: This adds interactivity that significantly improves the user experience by making muscle identification intuitive and educational. It builds on P1 by adding engagement without requiring P1 changes.

**Independent Test**: Can be fully tested by hovering over different muscle areas and verifying visual feedback. Delivers value as an educational tool for muscle identification.

**Acceptance Scenarios**:

1. **Given** the user is viewing a muscle diagram, **When** they hover their cursor over a muscle group, **Then** that muscle group is visually highlighted
2. **Given** the user hovers over a muscle group, **When** the muscle is highlighted, **Then** the muscle name is displayed in a tooltip near the muscle or following the cursor
3. **Given** the user moves their cursor away from a muscle group, **When** the hover ends, **Then** the highlight is removed and the diagram returns to its default state
4. **Given** the user hovers over different muscle groups in sequence, **When** moving between muscles, **Then** only the currently hovered muscle is highlighted

---

### User Story 3 - Select Muscles to Filter Exercises (Priority: P3)

Users can click on muscle groups in the diagram to select them, and the workout data is filtered to show only exercises that target the selected muscles. This helps users find exercises for specific muscle groups quickly.

**Why this priority**: This integrates the diagram with the workout data, creating a powerful filtering mechanism. It depends on having workout data with muscle group associations but delivers significant workflow improvement.

**Independent Test**: Can be fully tested by clicking muscle groups and verifying the workout table filters correctly. Demonstrates clear value as an exercise discovery tool.

**Acceptance Scenarios**:

1. **Given** the user is viewing the muscle diagram and workout data, **When** they click on a muscle group, **Then** that muscle group is marked as selected (visually distinct from hover state)
2. **Given** the user has selected one or more muscle groups, **When** the selection changes, **Then** the workout table filters to show only exercises that target the selected muscles
3. **Given** the user has selected muscle groups, **When** they click a selected muscle group again, **Then** that muscle is deselected and the filter updates accordingly
4. **Given** the user has selected multiple muscle groups, **When** viewing filtered exercises, **Then** exercises targeting ANY of the selected muscles are shown (OR logic)
5. **Given** the user has muscle groups selected, **When** they clear all selections, **Then** the full workout data is displayed again
6. **Given** the user has muscle groups selected, **When** they load a new CSV file, **Then** the selections persist and the new data is immediately filtered based on the existing selections

---

### Edge Cases

- What happens when the user's device doesn't support hover (touch screen)? System should support touch interactions where a single tap directly selects/deselects the muscle group, bypassing the hover/tooltip state.
- What happens when workout data doesn't include muscle group information? Filtering feature (P3) should gracefully handle missing data by showing a message like "No muscle group data available for this exercise."
- What happens when the user rapidly hovers over multiple muscles? System should handle rapid state changes smoothly without visual glitches or performance degradation.
- What happens when the SVG fails to load? System should show a fallback message or simplified representation.
- What happens when the user has selected muscles but loads new CSV data? Selections persist and the new data is immediately filtered based on the existing muscle group selections.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a front-view human body diagram showing major muscle groups as distinct, identifiable regions
- **FR-002**: System MUST display a back-view human body diagram showing major posterior muscle groups as distinct, identifiable regions
- **FR-003**: System MUST provide a mechanism to switch between front and back views (e.g., toggle buttons or tabs)
- **FR-004**: Users MUST be able to hover over muscle groups to see visual highlighting
- **FR-005**: System MUST display the muscle group name in a tooltip that appears near the hovered muscle region or follows the cursor
- **FR-006**: System MUST support clicking on muscle groups to select/deselect them
- **FR-007**: System MUST visually distinguish between hover state and selected state for muscle groups
- **FR-008**: System MUST filter workout exercise data based on selected muscle groups
- **FR-009**: System MUST support touch interactions on mobile/tablet devices where a single tap directly selects/deselects a muscle group (bypassing hover state)
- **FR-010**: System MUST display grouped muscle regions using common fitness terminology, including at minimum: Chest, Shoulders, Biceps, Triceps, Forearms, Abdominals, Quadriceps, Hamstrings, Calves, Back, Trapezius, Glutes
- **FR-011**: System MUST maintain diagram responsiveness and visual quality across different screen sizes
- **FR-012**: Workout CSV data MUST support a muscle group column with comma-separated values for exercises targeting multiple muscle groups (e.g., "Chest, Shoulders, Triceps")
- **FR-013**: System MUST handle cases where exercise data lacks muscle group information gracefully
- **FR-014**: System MUST persist muscle group selections when a new CSV file is loaded and immediately apply the filter to the new data

### Assumptions

- SVG format is chosen for diagrams because it provides scalability, interactivity, and small file size suitable for web applications
- Muscle groups use common fitness terminology (e.g., "Chest", "Back") rather than precise anatomical names, grouped into regions familiar to workout enthusiasts
- Users accessing the application will primarily use mouse/trackpad (desktop) or touch (mobile) for interaction
- Workout CSV data can be extended to include muscle group associations without breaking existing functionality
- Performance expectations align with standard web application responsiveness (interactions under 100ms)

### Key Entities

- **Muscle Group**: Represents a grouped muscle region on the human body using common fitness terminology. Attributes include: name (e.g., "Chest", "Quadriceps"), anatomical position (front/back), visual region definition (SVG path coordinates), and associated exercises.

- **Body View**: Represents a perspective of the human body (front or back). Attributes include: orientation (front/back), collection of visible muscle groups, and active/inactive state.

- **Exercise**: (extends existing entity) Represents a workout exercise. New attribute: targeted muscle groups stored as comma-separated values (e.g., "Chest, Shoulders" for exercises targeting multiple muscle groups).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify and name major muscle groups using the diagram within 30 seconds of viewing
- **SC-002**: Users can successfully filter exercises by muscle group with 95% accuracy on first attempt
- **SC-003**: Diagram loads and becomes interactive within 2 seconds of page load on standard broadband connections
- **SC-004**: Hover interactions provide visual feedback within 100 milliseconds of cursor movement
- **SC-005**: Diagram remains fully functional and visually clear on screen sizes from mobile (375px width) to desktop (1920px width)
- **SC-006**: 90% of users can successfully complete a workflow of viewing diagram, selecting muscles, and finding relevant exercises without instructions
- **SC-007**: Touch interactions on mobile devices (single tap to select) work as intuitively as mouse interactions on desktop (measured by task completion time parity within 20%)
