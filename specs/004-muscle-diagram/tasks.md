---
description: "Task list for Interactive SVG Muscle Diagram implementation"
---

# Tasks: Interactive SVG Muscle Diagram

**Input**: Design documents from `/specs/001-muscle-diagram/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature specification, so NO test tasks are included. Manual testing will be performed per the constitution's testing approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/` at repository root
- Paths shown below follow the structure defined in plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Create src/components directory if it doesn't exist
- [X] T002 [P] Create src/assets directory if it doesn't exist
- [X] T003 [P] Create src/utils directory if it doesn't exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create muscle group data structure with JSDoc types in src/assets/muscle-groups.js (front view: Chest, Shoulders, Biceps, Forearms, Abdominals, Quadriceps)
- [X] T005 [P] Add back view muscle groups to src/assets/muscle-groups.js (Back, Trapezius, Triceps, Glutes, Hamstrings, Calves)
- [X] T006 Create filtering utility function in src/utils/muscleFilter.js with OR logic for comma-separated muscle matching

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Muscle Groups (Priority: P1) 🎯 MVP

**Goal**: Display interactive front and back body diagrams with 12+ muscle groups, allowing users to toggle between views

**Independent Test**: Load application and verify front/back diagrams are visible with distinguishable muscle groups. Switch between views to confirm toggle functionality works.

### Implementation for User Story 1

- [X] T007 [P] [US1] Create MuscleDiagram component skeleton in src/components/MuscleDiagram.jsx with view toggle state (useState for activeView)
- [X] T008 [P] [US1] Add view toggle buttons (Front/Back) to MuscleDiagram component in src/components/MuscleDiagram.jsx
- [X] T009 [US1] Implement SVG rendering for front view with conditional rendering in src/components/MuscleDiagram.jsx (viewBox="0 0 300 600")
- [X] T010 [US1] Implement SVG rendering for back view with conditional rendering in src/components/MuscleDiagram.jsx
- [X] T011 [US1] Render muscle group paths from muscle-groups.js data in MuscleDiagram SVG in src/components/MuscleDiagram.jsx
- [X] T012 [P] [US1] Add base CSS styles for diagram container and SVG responsive sizing in src/App.css (.muscle-diagram-svg with max-width)
- [X] T013 [P] [US1] Add CSS styles for view toggle buttons (active/inactive states) in src/App.css
- [X] T014 [P] [US1] Add CSS styles for muscle path elements (base fill, stroke, cursor) in src/App.css
- [X] T015 [US1] Integrate MuscleDiagram component into App.jsx (import and render below file upload controls)
- [X] T016 [US1] Add accessibility attributes to SVG (role="img", aria-label) and muscle paths (role="button") in src/components/MuscleDiagram.jsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can view and switch between front/back diagrams

---

## Phase 4: User Story 2 - Highlight Muscles on Hover (Priority: P2)

**Goal**: Add interactive hover feedback with tooltips showing muscle names (desktop only)

**Independent Test**: Hover over muscle groups on desktop and verify visual highlighting and tooltip display. Confirm tooltips disappear on mouse leave.

### Implementation for User Story 2

- [X] T017 [US2] Add hover state management to MuscleDiagram component in src/components/MuscleDiagram.jsx (useState for hoveredMuscle)
- [X] T018 [US2] Add onMouseEnter and onMouseLeave handlers to muscle paths in src/components/MuscleDiagram.jsx
- [X] T019 [US2] Create tooltip div element that displays hovered muscle name in src/components/MuscleDiagram.jsx (conditionally rendered when hoveredMuscle is set)
- [X] T020 [P] [US2] Add CSS :hover pseudo-class for muscle paths (fill color change) in src/App.css
- [X] T021 [P] [US2] Add CSS styles for tooltip positioning (fixed position with cursor offset) in src/App.css (.muscle-tooltip)
- [X] T022 [P] [US2] Add CSS media query to hide tooltips on mobile/tablet devices in src/App.css (@media max-width: 767px)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view diagrams AND get hover feedback

---

## Phase 5: User Story 3 - Select Muscles to Filter Exercises (Priority: P3)

**Goal**: Enable muscle selection with click/tap interactions that filter workout table by targeted muscle groups

**Independent Test**: Click muscle groups to select them, verify table filters to matching exercises. Test deselection, multiple selections (OR logic), and selection persistence across CSV file loads.

### Implementation for User Story 3

- [X] T023 [US3] Lift selectedMuscles state to App.jsx in src/App.jsx (useState for selectedMuscles array)
- [X] T024 [US3] Create handleMuscleToggle callback function in App.jsx in src/App.jsx (toggle muscle in/out of selectedMuscles array)
- [X] T025 [US3] Pass selectedMuscles and onMuscleToggle props to MuscleDiagram component in src/App.jsx
- [X] T026 [US3] Add onClick handler to muscle paths in MuscleDiagram in src/components/MuscleDiagram.jsx (calls onMuscleToggle prop)
- [X] T027 [US3] Apply selected CSS class to muscle paths based on selectedMuscles prop in src/components/MuscleDiagram.jsx
- [X] T028 [P] [US3] Add CSS styles for selected state (distinct from hover) in src/App.css (.muscle.selected with different fill/stroke)
- [X] T029 [US3] Import filterExercisesByMuscles utility in App.jsx in src/App.jsx
- [X] T030 [US3] Apply muscle filter to csvData to create filteredData in App.jsx in src/App.jsx (use filterExercisesByMuscles function)
- [X] T031 [US3] Update table rendering to use filteredData instead of data in src/App.jsx
- [X] T032 [US3] Add filter indicator UI showing selected muscles above table in src/App.jsx (e.g., "Filtered by: Chest, Shoulders")
- [X] T033 [US3] Verify selection persistence across CSV file loads in App.jsx (selections maintained when handleFileUpload or loadSampleData called)
- [X] T034 [P] [US3] Update public/sample-workouts.csv to include "Muscles" column with comma-separated values for each exercise

**Checkpoint**: All user stories should now be independently functional - full feature complete with viewing, hovering, and filtering

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T035 [P] Add console warning for exercises with unknown muscle names (CSV validation) in src/utils/muscleFilter.js
- [X] T036 [P] Add console validation for muscle group data completeness on component mount in src/components/MuscleDiagram.jsx (assert 6+ front and back muscles, no duplicate IDs)
- [X] T037 [P] Optimize with React.memo if >20 muscle paths cause performance issues in src/components/MuscleDiagram.jsx (conditional optimization)
- [X] T038 [P] Add JSDoc type comments for component props in src/components/MuscleDiagram.jsx
- [X] T039 Document performance metrics (bundle size delta, load time) in specs/001-muscle-diagram/quickstart.md
- [X] T040 Manual testing against all acceptance scenarios from spec.md (use quickstart.md checklist)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 component but independently testable (could theoretically run in parallel with different developer)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with US1/US2 but independently testable (requires App.jsx modification for state lifting)

### Within Each User Story

#### User Story 1 (View Muscle Groups)
- T007-T008 can run in parallel (component skeleton + toggle buttons)
- T009-T010 sequential (front view before back view, but could be parallel)
- T011 depends on T009-T010 (rendering paths requires SVG structure)
- T012-T014 can run in parallel (CSS is independent)
- T015 depends on T007-T011 (component must exist to integrate)
- T016 can run in parallel with T015 (accessibility is additive)

#### User Story 2 (Highlight on Hover)
- T017-T019 sequential (state → handlers → tooltip rendering)
- T020-T022 can run in parallel (CSS is independent)

#### User Story 3 (Select & Filter)
- T023-T025 sequential (lift state → create handler → pass props)
- T026-T027 sequential (add onClick → apply selected class)
- T028 can run in parallel with T026-T027 (CSS independent)
- T029-T031 sequential (import → apply filter → update rendering)
- T032-T033 can run in parallel with T031 (UI enhancements)
- T034 can run at any time in Phase 5 (CSV data update)

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- All Foundational tasks (T004-T006) can run in parallel
- Within US1: T007-T008 parallel, T012-T014 parallel
- Within US2: T020-T022 parallel
- Within US3: T028 parallel with T026-T027, T034 anytime
- All Polish tasks (T035-T039) can run in parallel (T040 must be last)

---

## Parallel Example: User Story 1

```bash
# Launch Setup tasks together:
Task T001: "Create src/components directory"
Task T002: "Create src/assets directory"  
Task T003: "Create src/utils directory"

# Launch Foundational tasks together:
Task T004: "Create muscle group data - front view"
Task T005: "Create muscle group data - back view"
Task T006: "Create filtering utility"

# Within US1, parallel opportunities:
Task T007: "Create component skeleton"
Task T008: "Add view toggle buttons"

Task T012: "Add diagram container CSS"
Task T013: "Add toggle button CSS"
Task T014: "Add muscle path CSS"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T006)
3. Complete Phase 3: User Story 1 (T007-T016)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Verify all acceptance scenarios for US1 pass
6. Demo if ready (functional diagram with view toggle)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate (MVP! Diagram viewing works)
3. Add User Story 2 → Test independently → Validate (Hover feedback works)
4. Add User Story 3 → Test independently → Validate (Filtering works)
5. Complete Polish phase → Final validation
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T006)
2. Once Foundational is done:
   - Developer A: User Story 1 (T007-T016)
   - Developer B: Can prepare for User Story 2 (CSS T020-T022) or User Story 3 (CSV data T034)
3. After US1 complete:
   - Developer A: User Story 2 (T017-T022)
   - Developer B: User Story 3 (T023-T034)
4. Stories complete and integrate

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No tests included - manual testing per constitution (tests not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Selection state persists across CSV loads per FR-014
- Touch devices use tap-to-select (bypass hover) per FR-009
- Bundle size target: <50KB increase for SVG assets
