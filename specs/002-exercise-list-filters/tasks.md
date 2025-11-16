# Tasks: Exercise List with Search and Tag Filters

**Input**: Design documents from `/specs/002-exercise-list-filters/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md

**Tests**: Manual testing only (per constitution - automated tests not required for this feature scope)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

**Single-page web application structure** (per plan.md):
- Source files: `src/` at repository root
- Components: `src/components/`
- Styles: Co-located with components
- Public assets: `public/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [ ] T001 Create `src/components/` directory for new filter components
- [ ] T002 [P] Verify Bun and Vite configuration (no changes needed per plan.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Update `public/sample-workouts.csv` to include "Muscle Group" column with example data
- [ ] T004 Modify CSV parsing in `src/App.jsx` to use PapaParse header mode (`header: true`)
- [ ] T005 Add exercise data extraction logic in `src/App.jsx` (filter empty muscle groups, parse tags)
- [ ] T006 Add unique tag extraction logic in `src/App.jsx` (deduplicate, sort alphabetically)
- [ ] T007 Add state management in `src/App.jsx` for exercises and availableTags arrays
- [ ] T008 Add useMemo import and setup for filteredExercises derived state in `src/App.jsx`

**Checkpoint**: Foundation ready - CSV parsing works with new structure, exercise data flows to components

---

## Phase 3: User Story 1 - Browse All Exercises (Priority: P1) 🎯 MVP

**Goal**: Display all exercises with muscle groups in a dedicated list view below filter controls

**Independent Test**: Upload CSV with muscle group data → verify all exercises appear in list format with name and tags displayed

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create `src/components/ExerciseList.jsx` component file
- [ ] T010 [P] [US1] Create `src/components/ExerciseList.css` style file
- [ ] T011 [US1] Implement ExerciseList component with props contract (exercises array, emptyMessage)
- [ ] T012 [US1] Add exercise display logic in ExerciseList.jsx (map over exercises, show name + tags)
- [ ] T013 [US1] Add empty state handling in ExerciseList.jsx ("No exercises available" message)
- [ ] T014 [US1] Style ExerciseList component in ExerciseList.css (list/card layout, tag pills display)
- [ ] T015 [US1] Import and render ExerciseList in `src/App.jsx` (pass exercises array)
- [ ] T016 [US1] Add conditional rendering in `src/App.jsx` (show list only when exercises exist)
- [ ] T017 [US1] Update `src/App.css` with filter-section and layout styles (filters above list)

**Checkpoint**: At this point, uploading a CSV displays all exercises in a formatted list with muscle group tags visible

---

## Phase 4: User Story 2 - Search Exercises by Name (Priority: P2)

**Goal**: Add real-time text search to filter exercises by name

**Independent Test**: Load exercises → type in search field → verify only matching exercises appear, updates in real-time

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create `src/components/SearchInput.jsx` component file
- [ ] T019 [P] [US2] Create `src/components/SearchInput.css` style file
- [ ] T020 [US2] Implement SearchInput component with props contract (value, onChange, placeholder)
- [ ] T021 [US2] Add input element with type="search" in SearchInput.jsx
- [ ] T022 [US2] Add onChange handler in SearchInput.jsx (call parent onChange with input value)
- [ ] T023 [US2] Style SearchInput component in SearchInput.css (accessible, clear visual design)
- [ ] T024 [US2] Add searchText state in `src/App.jsx` (useState with empty string default)
- [ ] T025 [US2] Import and render SearchInput in `src/App.jsx` filter-section
- [ ] T026 [US2] Implement search filter logic in useMemo (case-insensitive .includes(), literal text matching)
- [ ] T027 [US2] Update ExerciseList to receive filteredExercises (derived from useMemo)
- [ ] T028 [US2] Add empty state for no search results in ExerciseList ("No exercises match your search")

**Checkpoint**: At this point, typing in search box filters exercises in real-time, special characters handled literally

---

## Phase 5: User Story 3 - Filter by Tags/Muscle Groups (Priority: P3)

**Goal**: Add clickable tag pills to filter exercises by muscle groups

**Independent Test**: Load exercises → click tag pill → verify only exercises with that tag appear, pill shows active state

### Implementation for User Story 3

- [ ] T029 [P] [US3] Create `src/components/TagFilter.jsx` component file
- [ ] T030 [P] [US3] Create `src/components/TagFilter.css` style file
- [ ] T031 [US3] Implement TagFilter component with props contract (availableTags, selectedTags, onTagToggle)
- [ ] T032 [US3] Add button elements for each tag in TagFilter.jsx (map over availableTags)
- [ ] T033 [US3] Add onClick handler in TagFilter.jsx (call onTagToggle with tag name)
- [ ] T034 [US3] Add active state CSS class logic in TagFilter.jsx (selectedTags.includes(tag))
- [ ] T035 [US3] Add aria-pressed attribute in TagFilter.jsx (accessibility for screen readers)
- [ ] T036 [US3] Style TagFilter component in TagFilter.css (pill design, active/inactive states, hover)
- [ ] T037 [US3] Add selectedTags state in `src/App.jsx` (useState with empty array default)
- [ ] T038 [US3] Implement handleTagToggle function in `src/App.jsx` (add/remove tag from selectedTags)
- [ ] T039 [US3] Import and render TagFilter in `src/App.jsx` filter-section (below SearchInput)
- [ ] T040 [US3] Implement tag filter logic in useMemo (OR logic - match ANY selected tag)
- [ ] T041 [US3] Update empty state message for no tag matches in ExerciseList

**Checkpoint**: At this point, clicking tag pills filters exercises, multiple tags show OR logic, visual active state works

---

## Phase 6: User Story 4 - Combine Search and Tag Filters (Priority: P4)

**Goal**: Enable simultaneous use of search and tag filters for precise exercise discovery

**Independent Test**: Load exercises → enter search text AND select tags → verify only exercises matching both criteria appear

### Implementation for User Story 4

- [ ] T042 [US4] Verify combined filter logic in useMemo (AND relationship: search AND tags)
- [ ] T043 [US4] Test edge case: search with no tag filters (should work independently)
- [ ] T044 [US4] Test edge case: tag filters with no search (should work independently)
- [ ] T045 [US4] Update empty state message in ExerciseList for combined filters ("No exercises match your current filters")
- [ ] T046 [US4] Add visual clarity in UI (show active filter count or clear all filters button - optional enhancement)

**Checkpoint**: All user stories complete - search + tags work independently and in combination

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T047 [P] Add responsive design media queries in component CSS files (mobile-friendly layout)
- [ ] T048 [P] Verify accessibility: keyboard navigation through filter controls (tab order, focus indicators)
- [ ] T049 [P] Verify accessibility: screen reader support (aria labels, semantic HTML)
- [ ] T050 Test performance with 500 exercise CSV (verify <1 second filter updates per SC-002)
- [ ] T051 Code cleanup: remove console.log statements, verify no warnings in dev console
- [ ] T052 Verify constitution compliance: Bun commands in docs, no new dependencies, component simplicity
- [ ] T053 Manual testing checklist: run through all acceptance scenarios from spec.md
- [ ] T054 Update CLAUDE.md if needed (verify recent changes section is current)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - MVP starting point
- **User Story 2 (Phase 4)**: Depends on Foundational + User Story 1 (needs ExerciseList component)
- **User Story 3 (Phase 5)**: Depends on Foundational + User Story 1 (needs ExerciseList component)
- **User Story 4 (Phase 6)**: Depends on User Story 2 + User Story 3 (combines both filters)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - independently testable MVP
- **User Story 2 (P2)**: Requires US1 ExerciseList component - adds search functionality
- **User Story 3 (P3)**: Requires US1 ExerciseList component - adds tag filtering functionality
- **User Story 4 (P4)**: Requires US2 + US3 - combines existing filters, minimal new code

### Within Each User Story

- Component files ([P]) can be created in parallel
- Component implementation must follow: props definition → render logic → styling
- App.jsx integration happens after component is ready
- Filter logic (useMemo) added after state management is in place

### Parallel Opportunities

**Phase 1 (Setup)**:
- Both tasks can run in parallel (different concerns)

**Phase 2 (Foundational)**:
- T003 (CSV update) can run in parallel with T004-T008 (code changes) if different developers

**User Story 1**:
- T009, T010 (create files) can run in parallel
- T014 (CSS) can run in parallel with T011-T013 (component logic)

**User Story 2**:
- T018, T019 (create files) can run in parallel
- T023 (CSS) can run in parallel with T020-T022 (component logic)

**User Story 3**:
- T029, T030 (create files) can run in parallel
- T036 (CSS) can run in parallel with T031-T035 (component logic)

**Phase 7 (Polish)**:
- T047, T048, T049 (different files/concerns) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component file creation together:
Task: "Create src/components/ExerciseList.jsx component file"
Task: "Create src/components/ExerciseList.css style file"

# After component structure is ready, parallelize if multiple developers:
Task: "Implement ExerciseList component with props contract"
Task: "Style ExerciseList component in ExerciseList.css"
```

## Parallel Example: User Story 2

```bash
# Launch component file creation together:
Task: "Create src/components/SearchInput.jsx component file"
Task: "Create src/components/SearchInput.css style file"

# After component structure is ready:
Task: "Implement SearchInput component with props contract"
Task: "Style SearchInput component in SearchInput.css"
```

## Parallel Example: User Story 3

```bash
# Launch component file creation together:
Task: "Create src/components/TagFilter.jsx component file"
Task: "Create src/components/TagFilter.css style file"

# After component structure is ready:
Task: "Implement TagFilter component with props contract"
Task: "Style TagFilter component in TagFilter.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Create directory structure
2. Complete Phase 2: Foundational → CSV parsing with muscle groups works
3. Complete Phase 3: User Story 1 → Exercise list displays all exercises
4. **STOP and VALIDATE**: Upload CSV, verify exercises appear with tags
5. Deploy/demo basic exercise list (no filtering yet, but data displays correctly)

**MVP Deliverable**: Users can upload CSV with muscle groups and see all exercises in a formatted list

### Incremental Delivery

1. **Foundation** (Phases 1-2) → CSV parsing ready, data flows correctly
2. **MVP** (Phase 3 / US1) → Exercise list displays → Test independently → Demo
3. **Search** (Phase 4 / US2) → Add search filter → Test independently → Demo enhanced version
4. **Tag Filters** (Phase 5 / US3) → Add tag pills → Test independently → Demo filtering
5. **Combined Filters** (Phase 6 / US4) → Enable combination → Test independently → Demo power feature
6. **Polish** (Phase 7) → Accessibility, performance, responsiveness → Final release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With 2-3 developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Team completes User Story 1 together** (foundation for all filters)
3. Once US1 is done:
   - **Developer A**: User Story 2 (SearchInput component + integration)
   - **Developer B**: User Story 3 (TagFilter component + integration)
4. **Team integrates US2 + US3**
5. **Developer A or B**: User Story 4 (verify combination logic)
6. **Team completes Polish together** (Phase 7)

**Note**: US2 and US3 can be developed in parallel since they operate on different components and add independent filter capabilities.

---

## Notes

- [P] tasks = different files, no dependencies on other tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual testing throughout (per constitution - automated tests not required)
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story independently
- All components follow controlled component pattern (state in App.jsx, presentation in component)
- All styling follows co-location pattern (component + CSS in same directory)
- Performance optimization via useMemo (prevent unnecessary recalculations)
- Accessibility built-in from start (semantic HTML, ARIA attributes, keyboard support)

---

## Task Summary

**Total Tasks**: 54
- Setup: 2 tasks
- Foundational: 6 tasks (CRITICAL - blocks all stories)
- User Story 1: 9 tasks (MVP)
- User Story 2: 11 tasks
- User Story 3: 13 tasks
- User Story 4: 5 tasks
- Polish: 8 tasks

**Parallel Opportunities**: 15 tasks marked [P]

**Independent Test Criteria**:
- US1: Upload CSV → all exercises display with tags
- US2: Type in search → exercises filter in real-time
- US3: Click tag pills → exercises filter by muscle group
- US4: Use search + tags → exercises match both criteria

**Suggested MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = 17 tasks
