# Implementation Tasks: Workout Planner with localStorage

**Feature**: 001-planner-localstorage
**Branch**: `001-planner-localstorage`
**Generated**: 2025-11-15

## Overview

This document provides a dependency-ordered task breakdown for implementing the workout planner with localStorage persistence. Tasks are organized by user story (P1-P5) to enable independent, incremental delivery.

**Total Estimated Tasks**: 35 tasks
**Parallelizable Tasks**: 18 tasks marked with [P]
**Test Tasks**: 0 (manual testing only per constitution)

---

## Phase 1: Setup & Project Structure

**Goal**: Initialize project structure and utilities needed across all user stories

**Tasks**:

- [ ] T001 Create `src/components/` directory for React components
- [ ] T002 Create `src/utils/` directory for utility modules
- [ ] T003 [P] Create `src/utils/localStorage.js` with PlansStorage module (KEY, loadPlans, savePlans, isAvailable methods)
- [ ] T004 [P] Create `src/utils/dateFormat.js` with formatRelativeTime and formatAbsoluteTime functions
- [ ] T005 [P] Create `src/utils/validation.js` with validatePlanName and validateExercise functions

**Completion Criteria**:
- All directories created
- All 3 utility modules implemented with JSDoc comments
- Utility functions handle edge cases per research.md (corrupted data, quota errors, invalid inputs)

---

## Phase 2: Foundational Components

**Goal**: Implement foundational utilities and error handling components used across multiple user stories

**Tasks**:

- [ ] T006 Modify `src/App.jsx` to add localStorage state management (plans, currentView, selectedPlan, showSyncWarning, storageError)
- [ ] T007 Add useEffect in `src/App.jsx` to load plans from localStorage on mount using PlansStorage.loadPlans()
- [ ] T008 Add storage event listener in `src/App.jsx` to detect cross-tab changes (per research.md pattern)
- [ ] T009 [P] Create `src/components/ErrorMessage.jsx` component to display localStorage errors
- [ ] T010 [P] Create `src/components/ErrorMessage.css` with error banner styles
- [ ] T011 [P] Create `src/components/StorageWarning.jsx` component for cross-tab sync warning
- [ ] T012 [P] Create `src/components/StorageWarning.css` with warning banner styles
- [ ] T013 Update `src/App.css` to add conditional rendering styles for error/warning banners

**Completion Criteria**:
- App.jsx initializes with plans from localStorage
- Error and warning components render conditionally
- Cross-tab sync detection functional (storage event listener)
- Private browsing mode detected and warning shown

---

## Phase 3: User Story 1 - Create and Save a Workout Plan (Priority: P1)

**Story Goal**: Users can create a custom workout plan with exercises and save it to localStorage, with data persisting across browser refreshes.

**Why P1**: Core value proposition - without create/save, the feature has no purpose. This is the MVP.

**Independent Test**: Create a plan with 2-3 exercises, save it, refresh page, verify plan persists with all data intact.

**Tasks**:

- [ ] T014 [P] [US1] Create `src/components/PlanForm.jsx` component with props: plan, onSave, onCancel
- [ ] T015 [P] [US1] Create `src/components/PlanForm.css` with form layout and input styles
- [ ] T016 [US1] Implement PlanForm state management (planName, exercises, errors, isAddingExercise)
- [ ] T017 [US1] Add plan name input with validation in PlanForm (required, max 100 chars, character counter)
- [ ] T018 [US1] Add "Add Exercise" button in PlanForm that toggles exercise form visibility
- [ ] T019 [P] [US1] Create `src/components/ExerciseForm.jsx` component with props: exercise, onSave, onCancel
- [ ] T020 [P] [US1] Create `src/components/ExerciseForm.css` with exercise form field styles
- [ ] T021 [US1] Implement ExerciseForm state and input fields (name, sets, reps, weight, rest)
- [ ] T022 [US1] Add validation to ExerciseForm (name required, sets 1-20, reps required per FR-008)
- [ ] T023 [US1] Implement "Save Exercise" handler in ExerciseForm that adds exercise with crypto.randomUUID() ID
- [ ] T024 [US1] Add exercise list display in PlanForm showing added exercises
- [ ] T025 [US1] Add "Remove" button for each exercise in PlanForm exercise list
- [ ] T026 [US1] Implement PlanForm submit handler with validation (calls onSave with new plan data)
- [ ] T027 [US1] Add handleCreatePlan in App.jsx (sets currentView to "create")
- [ ] T028 [US1] Add handleSavePlan in App.jsx that generates UUID, timestamps, saves to localStorage via PlansStorage
- [ ] T029 [US1] Handle QuotaExceededError in handleSavePlan and display error message per FR-009
- [ ] T030 [US1] Add "Create New Plan" button to App.jsx that calls handleCreatePlan
- [ ] T031 [US1] Update App.jsx render logic to conditionally show PlanForm when currentView is "create"

**Acceptance Criteria** (from spec.md):
- [x] User can click "Create New Plan" and form opens
- [x] User enters plan name "Monday Chest Day" with exercises (Bench Press: 4 sets, 8-10 reps, 185 lbs)
- [x] Plan saves to localStorage and appears in list
- [x] Refresh browser → Plan still appears with all data intact
- [x] Try to save without plan name → Validation error: "Plan name required"
- [x] localStorage full → Error: "Storage limit reached. Delete old plans to free space"

---

## Phase 4: User Story 2 - View All Saved Plans (Priority: P2)

**Story Goal**: Users can see all saved plans in one place, organized by last modified date, to quickly find the plan they want to use.

**Why P2**: After create (P1), viewing all plans is critical for navigation between multiple plans.

**Independent Test**: Create 3-5 plans with different names. Verify all appear in list sorted by last modified. Edit one plan and verify it moves to top of list.

**Tasks**:

- [ ] T032 [P] [US2] Create `src/components/PlanList.jsx` component with props: plans, onCreate, onEdit, onDelete, onView
- [ ] T033 [P] [US2] Create `src/components/PlanList.css` with list layout and plan item styles
- [ ] T034 [US2] Implement plan item display in PlanList showing: plan name, exercise count, last modified timestamp
- [ ] T035 [US2] Add formatRelativeTime/formatAbsoluteTime to display timestamps with tooltip in PlanList
- [ ] T036 [US2] Add "Create New Plan" button in PlanList that calls onCreate callback
- [ ] T037 [US2] Add "Edit" button for each plan in PlanList that calls onEdit callback
- [ ] T038 [US2] Add "Delete" button for each plan in PlanList that calls onDelete callback
- [ ] T039 [US2] Make plan name clickable in PlanList (calls onView callback)
- [ ] T040 [US2] Add empty state display in App.jsx when plans.length === 0 with message "No workout plans yet. Create your first plan!"
- [ ] T041 [US2] Update App.jsx render logic to show PlanList when plans exist and currentView is "list"
- [ ] T042 [US2] Sort plans by updatedAt descending before passing to PlanList in App.jsx
- [ ] T043 [US2] Add handleViewPlan in App.jsx (sets selectedPlan, currentView to "detail")

**Acceptance Criteria** (from spec.md):
- [x] User has 3 saved plans → All 3 appear sorted by last modified (newest first)
- [x] User has no plans → Empty state: "No workout plans yet. Create your first plan!"
- [x] Each plan shows: name, exercise count, last modified date
- [x] Edit and save plan → Plan moves to top of list

---

## Phase 5: User Story 3 - Edit Existing Workout Plan (Priority: P3)

**Story Goal**: Users can update their workout plans by changing weights, adding/removing exercises, or reordering exercises to track progression.

**Why P3**: Editing enables progression tracking, but users can work around this by creating new plans. Quality-of-life feature.

**Independent Test**: Create plan, save it, click "Edit", modify exercise weight, save changes, refresh page, verify changes persisted.

**Tasks**:

- [ ] T044 [US3] Add handleEditPlan in App.jsx (sets selectedPlan, currentView to "edit")
- [ ] T045 [US3] Update PlanForm to detect edit mode (plan prop not null) and pre-fill form with plan data
- [ ] T046 [US3] Add "Edit" button handler in ExerciseForm to modify existing exercise in exercises array
- [ ] T047 [US3] Implement moveExerciseUp function in PlanForm that swaps exercise at index i with i-1
- [ ] T048 [US3] Implement moveExerciseDown function in PlanForm that swaps exercise at index i with i+1
- [ ] T049 [US3] Add "Move Up" button (↑) for each exercise in PlanForm (disabled for first exercise)
- [ ] T050 [US3] Add "Move Down" button (↓) for each exercise in PlanForm (disabled for last exercise)
- [ ] T051 [US3] Add aria-labels to up/down buttons with exercise name for accessibility
- [ ] T052 [US3] Update handleSavePlan in App.jsx to detect edit mode and update existing plan in plans array
- [ ] T053 [US3] Set updatedAt timestamp to Date.now() when saving edited plan
- [ ] T054 [US3] Add "Cancel" button handler in PlanForm that calls onCancel (returns to list without saving)
- [ ] T055 [US3] Add handleCancelEdit in App.jsx (sets currentView to "list", clears selectedPlan)

**Acceptance Criteria** (from spec.md):
- [x] Click "Edit" → Form opens with all current plan data pre-filled
- [x] Change weight on "Bench Press" from 185 to 195, save → Updated weight persists to localStorage
- [x] Click "Cancel" → Changes discarded, original data remains
- [x] Add new exercise → New exercise saved with plan
- [x] Remove exercise → Exercise no longer appears in saved plan
- [x] Click "Move Down" on first exercise → Moves to second position, order persists after saving

---

## Phase 6: User Story 4 - Delete Workout Plans (Priority: P4)

**Story Goal**: Users can delete old workout plans they no longer use to keep their list clean and free up storage space.

**Why P4**: Deletion is cleanup. Users can ignore old plans. Lower priority than create/view/edit.

**Independent Test**: Create 2 plans, delete one with confirmation, verify removed from list and localStorage. Refresh page and verify deleted plan doesn't reappear.

**Tasks**:

- [ ] T056 [US4] Add handleDeletePlan in App.jsx with confirmation dialog (window.confirm)
- [ ] T057 [US4] Implement plan removal from plans array in handleDeletePlan (filter by plan.id)
- [ ] T058 [US4] Call PlansStorage.savePlans after deletion in handleDeletePlan
- [ ] T059 [US4] Update confirmation dialog message to show plan name: "Delete '{planName}'?"
- [ ] T060 [US4] Handle empty state after deleting last plan (show empty state message)

**Acceptance Criteria** (from spec.md):
- [x] Click "Delete" on "Old Leg Day", confirm → Plan removed from localStorage and list
- [x] Click "Delete", then "Cancel" → Plan remains in list
- [x] Delete last remaining plan → Empty state appears: "No workout plans yet. Create your first plan!"
- [x] Refresh browser after deletion → Deleted plan does not reappear

---

## Phase 7: User Story 5 - View Plan Details (Priority: P5)

**Story Goal**: Users at the gym can click on a plan name to see all exercises with sets, reps, and weights in a clear, readable format for reference during workouts.

**Why P5**: Nice-to-have viewing enhancement. Users can see basic info in list, but detailed view improves workout usability.

**Independent Test**: Create plan with 5 exercises, click plan name, verify all exercise details display clearly in readable format (modal).

**Tasks**:

- [ ] T061 [P] [US5] Create `src/components/PlanDetail.jsx` component with props: plan, onClose
- [ ] T062 [P] [US5] Create `src/components/PlanDetail.css` with modal overlay, backdrop, and content styles
- [ ] T063 [US5] Implement modal backdrop in PlanDetail (fixed position, semi-transparent background)
- [ ] T064 [US5] Display plan name as heading in PlanDetail modal
- [ ] T065 [US5] List all exercises with full details in PlanDetail (name, sets × reps, weight, rest)
- [ ] T066 [US5] Add "Close" button (×) in top-right of PlanDetail modal
- [ ] T067 [US5] Add ESC key handler in PlanDetail that calls onClose
- [ ] T068 [US5] Add backdrop click handler in PlanDetail that calls onClose
- [ ] T069 [US5] Add focus trapping in PlanDetail modal (useEffect with focusable elements)
- [ ] T070 [US5] Make PlanDetail scrollable if many exercises (overflow-y: auto)
- [ ] T071 [US5] Add aria-modal="true" and aria-labelledby to PlanDetail for accessibility
- [ ] T072 [US5] Update App.jsx render logic to show PlanDetail when currentView is "detail"
- [ ] T073 [US5] Add responsive styles to PlanDetail.css for mobile viewports (375px+)

**Acceptance Criteria** (from spec.md):
- [x] Click plan name → Modal opens showing all exercises with full details
- [x] Plan with 10+ exercises → Layout is scrollable, all exercises readable
- [x] Viewport 375px wide → Layout responsive, all data accessible
- [x] Click "Close" or press ESC → Return to list view

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Final polish, accessibility improvements, and mobile responsiveness

**Tasks**:

- [ ] T074 [P] Add mobile-responsive styles to App.css for 375px+ viewports
- [ ] T075 [P] Add mobile-responsive styles to PlanList.css (stacked layout, touch-friendly buttons 44x44px)
- [ ] T076 [P] Add mobile-responsive styles to PlanForm.css (stacked form fields)
- [ ] T077 [P] Ensure all buttons have min 44x44px touch targets per FR-010
- [ ] T078 Add loading state to App.jsx while plans are loading from localStorage (optional, if needed)
- [ ] T079 Test localStorage availability check on app mount and show warning if unavailable
- [ ] T080 Test QuotaExceededError handling by filling localStorage to quota
- [ ] T081 Test cross-tab sync by opening two tabs and editing in one
- [ ] T082 [P] Review and address all console warnings/errors
- [ ] T083 Manual testing: Create plan with 100-character name (at limit)
- [ ] T084 Manual testing: Try creating plan with 101-character name (validation should prevent)
- [ ] T085 Manual testing: Test all keyboard navigation (Tab, Enter, ESC)
- [ ] T086 Manual testing: Test screen reader announcements for errors and modal
- [ ] T087 Final review: Verify all FR requirements (FR-001 through FR-011) are met

**Completion Criteria**:
- All manual testing checklist items from quickstart.md completed
- All accessibility requirements met (keyboard nav, screen reader, focus indicators)
- Mobile responsive on 375px+ viewports
- No console errors or warnings
- All functional requirements (FR-001 to FR-011) verified

---

## Dependencies & Execution Strategy

### User Story Dependencies

```
Phase 1 (Setup) → MUST complete first
    ↓
Phase 2 (Foundational) → MUST complete before user stories
    ↓
Phase 3 (US1: Create Plan) ← MVP - INDEPENDENT
    ↓
Phase 4 (US2: View Plans) ← Depends on US1 (needs saved plans to display)
    ↓
Phase 5 (US3: Edit Plan) ← Depends on US1 and US2 (needs plans to edit)
    ↓
Phase 6 (US4: Delete Plan) ← Depends on US2 (needs list to delete from)
    ↓
Phase 7 (US5: View Details) ← Depends on US2 (needs list to click from)
    ↓
Phase 8 (Polish) ← Final pass after all user stories
```

**Critical Path**: Phase 1 → Phase 2 → Phase 3 (US1)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (US1) = 31 tasks
- Delivers core value: Create and persist workout plans
- Independently testable
- Can deploy and gather user feedback before continuing

### Parallel Execution Opportunities

**Within Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel (independent utility modules)

**Within Phase 2 (Foundational)**:
- T009/T010 (ErrorMessage) can run parallel to T011/T012 (StorageWarning)

**Within Phase 3 (US1)**:
- T014/T015 (PlanForm component + styles) can start in parallel
- T019/T020 (ExerciseForm component + styles) can start in parallel
- After forms done: T021-T026 (form logic) must be sequential

**Within Phase 4 (US2)**:
- T032/T033 (PlanList component + styles) can start in parallel

**Within Phase 7 (US5)**:
- T061/T062 (PlanDetail component + styles) can start in parallel

**Within Phase 8 (Polish)**:
- T074, T075, T076, T077 (responsive styles) can all run in parallel
- T083-T087 (manual testing) can run in parallel after implementation complete

**Total Parallelizable**: 18 tasks marked with [P]

---

## Implementation Strategy

### Recommended Approach: MVP First

1. **Week 1: MVP (Phases 1-3)**
   - Complete Phase 1 (Setup) - 5 tasks
   - Complete Phase 2 (Foundational) - 8 tasks
   - Complete Phase 3 (US1: Create Plan) - 18 tasks
   - **Result**: Users can create and save plans (core value delivered)
   - **Deploy**: Gather feedback on core workflow

2. **Week 2: Essential Features (Phases 4-5)**
   - Complete Phase 4 (US2: View Plans) - 12 tasks
   - Complete Phase 5 (US3: Edit Plan) - 12 tasks
   - **Result**: Full CRUD operations available
   - **Deploy**: Feature-complete for most users

3. **Week 3: Cleanup & Polish (Phases 6-8)**
   - Complete Phase 6 (US4: Delete) - 5 tasks
   - Complete Phase 7 (US5: View Details) - 13 tasks
   - Complete Phase 8 (Polish) - 14 tasks
   - **Result**: All P1-P5 stories complete, polished UX
   - **Deploy**: Production-ready release

### Testing Strategy

**Manual Testing Only** (per constitution - no automated tests required):
- Test each user story independently after completing its phase
- Use acceptance criteria from spec.md as test checklist
- Refer to quickstart.md manual testing section for detailed checklist
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile viewports (375px+)
- Test accessibility (keyboard nav, screen reader)

---

## Task Format Validation

✅ **All tasks follow checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ **Task IDs sequential**: T001-T087
✅ **Story labels present**: [US1], [US2], [US3], [US4], [US5] for all user story tasks
✅ **Parallel markers**: 18 tasks marked with [P]
✅ **File paths included**: All tasks specify exact file paths
✅ **Dependencies clear**: User story order and blocking tasks identified

---

## Summary

**Total Tasks**: 87 tasks
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 8 tasks
- Phase 3 (US1 - P1): 18 tasks
- Phase 4 (US2 - P2): 12 tasks
- Phase 5 (US3 - P3): 12 tasks
- Phase 6 (US4 - P4): 5 tasks
- Phase 7 (US5 - P5): 13 tasks
- Phase 8 (Polish): 14 tasks

**Parallel Opportunities**: 18 tasks marked [P]

**MVP Scope** (Phase 1-3): 31 tasks delivering core create/save functionality

**Suggested Next Step**: Begin Phase 1 (Setup) to create project structure and utility modules.
