# Feature Specification: Workout Planner with localStorage Persistence

**Feature Branch**: `001-planner-localstorage`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Planner with sets and reps and localStorage"

## Clarifications

### Session 2025-11-15

- Q: How should unique IDs be generated for workout plans and exercises? → A: UUID v4 (random) using crypto.randomUUID()
- Q: How should the "last modified date/time" be displayed in the plan list (FR-005)? → A: Relative + Absolute on hover ("2 hours ago" with tooltip "Nov 15, 2:30 PM")
- Q: Should users be able to reorder exercises within a workout plan? → A: User can reorder with up/down buttons
- Q: What are the maximum limits for workout plans and exercises to prevent localStorage/performance issues? → A: No hard limits - rely on localStorage quota error handling only
- Q: Should users be able to export/import their workout plans for backup or device transfer? → A: Out of scope for v1 - focus on core CRUD operations first

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create and Save a Workout Plan (Priority: P1)

A user wants to create a custom workout plan for Monday that includes exercises with specific sets, reps, and weights. They want this plan to be saved so they can reference it next week.

**Why this priority**: This is the core value proposition - without the ability to create and persist plans, the feature has no purpose. This is the minimum viable product.

**Independent Test**: Can be fully tested by creating a single plan with 2-3 exercises, saving it, refreshing the page, and verifying the plan persists. Delivers immediate value of "I can create and keep a workout plan."

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** user clicks "Create New Plan" and enters plan name "Monday Chest Day" with exercises (Bench Press: 4 sets, 8-10 reps, 185 lbs), **Then** the plan is saved to localStorage and appears in the plan list

2. **Given** a plan has been saved, **When** user refreshes the browser, **Then** the plan still appears with all exercise data intact

3. **Given** user is creating a plan, **When** they try to save without entering a plan name, **Then** validation error appears: "Plan name required"

4. **Given** user is adding an exercise, **When** they enter exercise name, sets, and reps, **Then** the exercise is added to the plan's exercise list

5. **Given** localStorage is full, **When** user tries to save a new plan, **Then** error message appears: "Storage limit reached. Delete old plans to free space"

---

### User Story 2 - View All Saved Plans (Priority: P2)

A user wants to see all their saved workout plans in one place, organized by when they were last modified, so they can quickly find the plan they want to use today.

**Why this priority**: After being able to create plans (P1), viewing all plans is the next critical feature. Without this, users can't navigate between multiple plans.

**Independent Test**: Create 3-5 workout plans with different names. Verify all plans appear in a list showing plan name and exercise count. Edit one plan and verify it moves to the top of the list (most recently modified).

**Acceptance Scenarios**:

1. **Given** user has saved 3 workout plans, **When** they load the application, **Then** all 3 plans appear in a list sorted by last modified date (newest first)

2. **Given** user has no saved plans, **When** they load the application, **Then** empty state message appears: "No workout plans yet. Create your first plan!"

3. **Given** user views the plan list, **When** they look at each plan item, **Then** plan name, number of exercises, and last modified date are displayed

4. **Given** user has multiple plans, **When** they edit and save "Monday Chest Day", **Then** that plan moves to the top of the list

---

### User Story 3 - Edit Existing Workout Plan (Priority: P3)

A user wants to update their "Monday Chest Day" plan by increasing the weight on Bench Press from 185 lbs to 195 lbs because they've gotten stronger.

**Why this priority**: Editing is important for progression tracking, but users can work around this by creating new plans. It's a quality-of-life feature that becomes critical over time.

**Independent Test**: Create a plan, save it, click "Edit", modify an exercise's weight, save changes, refresh page, and verify changes persisted. Can be tested without delete functionality.

**Acceptance Scenarios**:

1. **Given** user has a saved plan, **When** they click "Edit" on the plan, **Then** edit form opens with all current plan and exercise data pre-filled

2. **Given** user is editing a plan, **When** they change the weight on "Bench Press" from 185 to 195 and click "Save Changes", **Then** the updated weight persists to localStorage

3. **Given** user is editing a plan, **When** they click "Cancel", **Then** changes are discarded and original data remains

4. **Given** user is editing a plan, **When** they add a new exercise to the existing list, **Then** the new exercise is saved with the plan

5. **Given** user is editing a plan, **When** they remove an exercise, **Then** that exercise no longer appears in the saved plan

6. **Given** user is editing a plan with 3 exercises, **When** they click "Move Down" on the first exercise, **Then** it moves to the second position and the order persists after saving

---

### User Story 4 - Delete Workout Plans (Priority: P4)

A user wants to delete old workout plans they no longer use to keep their plan list clean and free up storage space.

**Why this priority**: Deletion is a cleanup feature. While useful, users can simply ignore old plans. It's lower priority than create, view, and edit.

**Independent Test**: Create 2 plans, delete one with confirmation, verify it's removed from list and localStorage. Refresh page and verify deleted plan doesn't reappear.

**Acceptance Scenarios**:

1. **Given** user has a saved plan "Old Leg Day", **When** they click "Delete" and confirm in the dialog, **Then** the plan is removed from localStorage and no longer appears in list

2. **Given** user clicks "Delete" on a plan, **When** they see the confirmation dialog and click "Cancel", **Then** the plan remains in the list

3. **Given** user deletes their last remaining plan, **When** deletion completes, **Then** empty state message appears: "No workout plans yet. Create your first plan!"

4. **Given** user has multiple plans open in multiple browser tabs, **When** they delete a plan in one tab, **Then** the plan is removed from localStorage (other tabs may need refresh)

---

### User Story 5 - View Plan Details (Priority: P5)

A user at the gym wants to click on their "Monday Chest Day" plan to see all exercises, sets, reps, and weights in a clear, readable format they can reference during their workout.

**Why this priority**: This is a nice-to-have viewing enhancement. Users can see basic info in the plan list, but detailed view improves usability during workouts.

**Independent Test**: Create a plan with 5 exercises, click on the plan name, verify all exercise details display clearly in a readable format (possibly modal or detail panel).

**Acceptance Scenarios**:

1. **Given** user has a saved plan, **When** they click on the plan name, **Then** full plan details open showing all exercises with sets, reps, weight, and rest data

2. **Given** user is viewing plan details, **When** they have a plan with 10+ exercises, **Then** the layout is scrollable and all exercises remain readable

3. **Given** user is viewing plan details on mobile, **When** the viewport is 375px wide, **Then** the layout is responsive and all data is accessible

4. **Given** user is viewing plan details, **When** they click "Close" or press ESC, **Then** they return to the plan list view

---

### Edge Cases

- What happens when localStorage quota is exceeded (typically 5-10MB)?
  - Catch QuotaExceededError and show error: "Storage limit reached. Delete old plans to free space"
  - Prevent data corruption by not partially saving

- How does system handle corrupted localStorage data?
  - Wrap JSON.parse in try-catch
  - If parse fails, clear corrupted data and show error: "Plan data corrupted. Storage has been reset"
  - Log error to console for debugging

- What happens in private browsing mode where localStorage may be disabled?
  - Check localStorage availability on app load
  - Show warning banner: "Private browsing detected. Plans will not be saved between sessions"
  - Allow read-only usage (plans in memory only during session)

- How does system handle concurrent edits in multiple tabs?
  - Use `storage` event listener to detect cross-tab changes
  - Show notification: "Plans updated in another tab. Reload to see changes"
  - Provide "Reload" button to refresh plan list

- What happens when user enters very long plan names (100+ characters)?
  - Enforce max length validation (100 chars)
  - Display character counter: "50/100"
  - Truncate display names in list view if needed

- What happens when user enters special characters, emojis, or HTML in plan names?
  - Allow Unicode characters (emojis OK)
  - Sanitize HTML to prevent XSS (display as plain text)
  - Store raw text, display sanitized text

- What happens when user rapidly clicks "Save" button multiple times?
  - Disable save button after first click
  - Re-enable after save completes
  - Debounce save operations to prevent duplicate writes

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create new workout plans with a custom name (1-100 characters, required). No artificial limit on number of plans (limited only by browser localStorage quota)

- **FR-002**: System MUST allow users to add multiple exercises to a workout plan, each with:
  - Exercise name (required, 1-100 characters)
  - Sets (required, number, 1-20)
  - Reps (required, text, supports ranges like "8-10" or "AMRAP")
  - Weight (optional, text, supports formats like "185 lbs", "80 kg", "BW+25")
  - Rest (optional, text, supports formats like "90 sec", "1.5 min")
  - No artificial limit on number of exercises per plan (limited only by browser localStorage quota)

- **FR-003**: System MUST persist all workout plan data to browser localStorage in JSON format

- **FR-004**: System MUST load saved plans from localStorage on application startup

- **FR-005**: System MUST display a list of all saved workout plans showing:
  - Plan name
  - Number of exercises in plan
  - Last modified date/time (relative format like "2 hours ago" with absolute timestamp on hover/tooltip like "Nov 15, 2:30 PM")
  - Plans sorted by last modified (newest first)

- **FR-006**: Users MUST be able to edit existing workout plans:
  - Modify plan name
  - Add new exercises to plan
  - Edit existing exercise details (sets, reps, weight, rest)
  - Reorder exercises using up/down buttons
  - Remove exercises from plan
  - Save changes to localStorage
  - Cancel editing without saving

- **FR-007**: Users MUST be able to delete workout plans with confirmation:
  - Confirmation dialog clearly states plan name being deleted
  - "Confirm" permanently removes plan from localStorage
  - "Cancel" closes dialog without deleting

- **FR-008**: System MUST validate user input before saving:
  - Plan name required (not empty, not whitespace-only)
  - Exercise name required
  - Sets must be positive integer (1-20)
  - Reps required (text field, flexible format)
  - Show validation errors inline near input fields
  - Disable form submission until validation passes

- **FR-009**: System MUST handle localStorage errors gracefully:
  - Quota exceeded: Show error "Storage limit reached. Delete old plans to free space"
  - localStorage unavailable (private browsing): Show warning "Plans cannot be saved in private browsing mode"
  - JSON parse error: Clear corrupted data, show error message
  - localStorage not supported: Show error "Your browser doesn't support plan storage"

- **FR-010**: System MUST work on mobile and desktop devices:
  - Responsive layout on viewports 375px and larger
  - Touch-friendly buttons (min 44x44px)
  - No horizontal scrolling required
  - Text readable without zooming

- **FR-011**: System MUST show empty state when no plans exist:
  - Message: "No workout plans yet. Create your first plan!"
  - "Create New Plan" button prominently displayed

### Key Entities *(include if feature involves data)*

- **Workout Plan**: Represents a complete workout plan with multiple exercises
  - Unique identifier (UUID v4 generated via crypto.randomUUID())
  - Plan name (1-100 characters)
  - List of exercises (ordered array, user can reorder via up/down buttons)
  - Creation timestamp
  - Last modified timestamp

- **Exercise**: Represents a single exercise within a workout plan
  - Unique identifier within plan (UUID v4 generated via crypto.randomUUID())
  - Exercise name (e.g., "Bench Press", "Squats")
  - Sets (number, 1-20)
  - Reps (text, flexible format: "8-10", "12", "AMRAP")
  - Weight (optional text: "185 lbs", "80 kg", "BW")
  - Rest period (optional text: "90 sec", "1.5 min")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new workout plan with 5 exercises in under 2 minutes using the interface

- **SC-002**: 100% of saved plans persist correctly across browser refreshes (test with 10 plans, 10 refreshes, verify no data loss)

- **SC-003**: All required fields (plan name, exercise name, sets, reps) are validated and prevent submission when empty

- **SC-004**: Application loads and displays all saved plans in under 500ms with up to 50 saved plans in localStorage

- **SC-005**: localStorage operations (save, load, delete) complete in under 100ms per operation

- **SC-006**: All features are accessible on mobile viewport (375px width minimum) with touch-friendly targets (44x44px)

- **SC-007**: Storage usage per plan averages under 5KB for plans with 10 exercises (measured via browser DevTools)

- **SC-008**: Application gracefully handles localStorage quota exceeded error by showing clear error message and preventing data corruption

- **SC-009**: Application works in private browsing mode with appropriate warning about lack of persistence

## Out of Scope (v1)

The following features are explicitly **out of scope** for the initial version and may be considered for future iterations:

- **Export/Import functionality**: No JSON file export or import for backup or device transfer (users rely on localStorage only)
- **Cross-device sync**: Plans are local to each browser/device only
- **Workout history tracking**: No tracking of completed workouts or progress over time
- **Exercise library/database**: Users manually enter exercise names (no autocomplete or preset library)
- **Plan templates**: No pre-built workout plan templates
- **Plan sharing**: No ability to share plans with other users
- **Workout day scheduling**: No calendar integration or workout day assignment beyond manual plan naming
