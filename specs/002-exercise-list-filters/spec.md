# Feature Specification: Exercise List with Search and Tag Filters

**Feature Branch**: `002-exercise-list-filters`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Exercise list with search and tag filters from CSV"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse All Exercises (Priority: P1)

A user wants to see all available exercises from the uploaded CSV file in an organized list view, with search and filter controls positioned above the list for easy access.

**Why this priority**: This is the foundation of the feature - users need to see the exercise data before they can filter it. Without this, no other functionality is possible.

**Independent Test**: Can be fully tested by uploading a CSV file with exercise data and verifying that all exercises are displayed in a readable list format below the filter controls. Delivers immediate value by showing users their complete exercise library.

**Acceptance Scenarios**:

1. **Given** a CSV file with exercise data has been loaded, **When** the user views the exercise list, **Then** all exercises from the CSV are displayed with their associated information (name, muscle groups, equipment, etc.)
2. **Given** the exercise list is displayed, **When** the user scrolls through the list, **Then** all exercises remain readable and properly formatted
3. **Given** an empty CSV or no CSV loaded, **When** the user views the exercise list area, **Then** a helpful message indicates no exercises are available

---

### User Story 2 - Search Exercises by Name (Priority: P2)

A user wants to quickly find specific exercises by typing part of the exercise name, rather than scrolling through the entire list.

**Why this priority**: Search is the most common and intuitive way users find content. This dramatically improves usability for users with large exercise databases.

**Independent Test**: Can be tested by loading exercises and typing text into a search field. Delivers value by allowing quick access to specific exercises without requiring tag organization.

**Acceptance Scenarios**:

1. **Given** the exercise list is displayed, **When** the user types "bench" into the search field, **Then** only exercises containing "bench" in their name are shown
2. **Given** search results are displayed, **When** the user clears the search field, **Then** all exercises are shown again
3. **Given** the user searches for text that matches no exercises, **When** the search is applied, **Then** a message indicates no matching exercises were found
4. **Given** the user types in the search field, **When** each character is entered, **Then** the list updates in real-time to show matching exercises

---

### User Story 3 - Filter by Tags/Muscle Groups (Priority: P3)

A user wants to filter exercises by specific tags or muscle groups (e.g., "chest", "legs", "bodyweight") to focus on exercises relevant to their current workout plan.

**Why this priority**: Tag filtering enables targeted workout planning and organization. While valuable, it's less critical than search since it requires the CSV to have structured tag data.

**Independent Test**: Can be tested by selecting one or more tags from available options and verifying filtered results. Delivers value by enabling category-based workout planning.

**Acceptance Scenarios**:

1. **Given** the exercise list is displayed, **When** the user selects the "chest" tag, **Then** only exercises tagged with "chest" are shown
2. **Given** tag filters are applied, **When** the user selects multiple tags, **Then** exercises matching ANY of the selected tags are shown
3. **Given** tag filters are active, **When** the user deselects all tags, **Then** all exercises are shown again
4. **Given** the CSV contains tag/muscle group data, **When** the exercise list loads, **Then** all unique tags are available as filter options

---

### User Story 4 - Combine Search and Tag Filters (Priority: P4)

A user wants to use both search and tag filters simultaneously to narrow down exercises very specifically (e.g., search "press" + filter by "shoulders").

**Why this priority**: This is an advanced feature that enhances power-user workflows but isn't essential for basic usage.

**Independent Test**: Can be tested by applying both search text and tag selections together. Delivers value for precise exercise discovery.

**Acceptance Scenarios**:

1. **Given** the user has entered search text and selected tags, **When** both filters are active, **Then** only exercises matching the search text AND containing the selected tags are shown
2. **Given** combined filters show no results, **When** the user views the list, **Then** a message indicates no exercises match the current criteria
3. **Given** combined filters are active, **When** the user removes the search text but keeps tag filters, **Then** results update to show all exercises with the selected tags

---

### Edge Cases

- Exercises with empty or missing "Muscle Group" values are excluded from the exercise list entirely
- Search text special characters (quotes, slashes, regex metacharacters) are treated as literal text for matching
- How does the system handle very large CSV files with thousands of exercises?
- What happens if the CSV structure doesn't include expected tag columns?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all exercises from the loaded CSV file in a list format
- **FR-002**: System MUST provide a search input field that filters exercises by name in real-time
- **FR-003**: System MUST perform case-insensitive search matching
- **FR-003a**: System MUST treat special characters in search input as literal text (escape/sanitize regex metacharacters)
- **FR-004**: System MUST extract unique tags/muscle groups from the CSV data to present as filter options
- **FR-005**: System MUST allow users to select one or more tags to filter the exercise list via clickable tag pills/badges that toggle on/off
- **FR-006**: System MUST update the exercise list immediately when search or filter criteria change
- **FR-007**: System MUST show all exercises when no search text is entered and no tags are selected
- **FR-008**: System MUST display a message when no exercises match the current filter criteria
- **FR-009**: System MUST preserve existing CSV upload functionality while adding filter capabilities
- **FR-010**: System MUST handle CSV files where tag data is stored in a "Muscle Group" column
- **FR-011**: System MUST parse tags that are comma-separated within the "Muscle Group" column (e.g., "Chest, Shoulders, Triceps") and trim leading/trailing whitespace from each tag
- **FR-012**: System MUST display exercise name and associated muscle groups/tags in the filtered list view
- **FR-013**: System MUST exclude exercises with empty or missing "Muscle Group" values from the exercise list display
- **FR-014**: System MUST provide visual indication (e.g., highlight, color change) when tag pills are in active/selected state
- **FR-015**: System MUST position the search input and tag filter pills above the exercise list (top-to-bottom layout)

### Key Entities

- **Exercise**: Represents a single workout exercise with attributes including name, associated muscle groups/tags, and additional workout parameters (sets, reps, weight, rest periods, etc.)
- **Tag/Muscle Group**: Categorical labels associated with exercises (e.g., "chest", "legs", "cardio", "bodyweight") used for filtering and organization

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can find a specific exercise by name in under 5 seconds using the search feature
- **SC-002**: Users can filter exercises by muscle group and see results update in under 1 second
- **SC-003**: The exercise list correctly displays and filters datasets containing up to 500 exercises without performance degradation
- **SC-004**: 90% of users can successfully locate exercises relevant to their workout plan using search and/or filters on their first attempt
- **SC-005**: Search functionality returns accurate results for partial name matches (e.g., searching "press" finds "Bench Press", "Shoulder Press", "Leg Press")

## Clarifications

### Session 2025-11-15

- Q: How should the system handle exercises that have an empty or missing "Muscle Group" column value? → A: Exclude exercises without muscle groups from the list entirely (hide them)
- Q: How should users select muscle group tags to filter the exercise list? → A: Clickable tag pills/badges that toggle on/off when clicked (visual, compact)
- Q: How should the search feature handle special characters (e.g., quotes, slashes, regex metacharacters) in the search input? → A: Treat all special characters as literal text (escape/sanitize before matching)
- Q: How should the system handle whitespace in muscle group tags when parsing comma-separated values? → A: Trim leading/trailing whitespace from each tag
- Q: Where should the search input and tag filter pills be positioned relative to the exercise list? → A: Above the exercise list (filters at top, results below)

## Assumptions

- CSV files follow the existing format used by the application (first row as headers, subsequent rows as data)
- CSV files must include a "Muscle Group" column containing muscle group/tag data for each exercise
- Multiple muscle groups per exercise are separated by commas within the "Muscle Group" column (e.g., "Chest, Shoulders, Triceps")
- The existing CSV parsing infrastructure (PapaParse) can be extended to support filtering without major refactoring
- The existing sample CSV (sample-workouts.csv) will need to be updated to include the "Muscle Group" column as a reference example
- Tag filtering uses an "OR" relationship when multiple tags are selected (show exercises with ANY selected tag, not ALL tags)
- Performance expectations are based on typical personal workout libraries (50-500 exercises), not commercial databases
- Exercise list display shows only exercise name and muscle groups - full workout parameters (sets, reps, weight) are available in the complete data table view
