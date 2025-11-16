# Tasks: Exercise Details with YouTube Embed

**Input**: Design documents from `/specs/003-exercise-details-youtube/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests requested in the specification - manual testing only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project (React application with Vite)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and sample data preparation

- [X] T001 Update public/sample-workouts.csv with "YouTube URL" column and add sample YouTube URLs for exercises

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before user stories can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Create src/utils/ directory structure
- [X] T003 [P] Implement extractVideoId() and getEmbedUrl() functions in src/utils/youtube.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Exercise Details (Priority: P1) 🎯 MVP

**Goal**: Enable users to click exercises and view detailed information in a modal overlay

**Independent Test**: Click any exercise from the list and verify that a modal appears showing exercise name, muscle groups, sets, reps, weight, rest, and day. Close the modal via ESC key, close button, or backdrop click.

### Implementation for User Story 1

- [X] T004 [P] [US1] Create src/components/ExerciseDetailModal.jsx with basic modal structure (no video section yet)
- [X] T005 [P] [US1] Create src/components/ExerciseDetailModal.css with modal backdrop, content container, and responsive styles
- [X] T006 [US1] Add selectedExercise and selectedIndex state to src/App.jsx
- [X] T007 [US1] Implement handleExerciseClick() and handleCloseModal() handlers in src/App.jsx
- [X] T008 [US1] Modify src/components/ExerciseList.jsx to add onExerciseClick prop and make exercises clickable
- [X] T009 [US1] Update src/components/ExerciseList.css with hover states and cursor pointer for clickable exercises
- [X] T010 [US1] Add ExerciseDetailModal component to src/App.jsx render with selectedExercise, onClose props
- [X] T011 [US1] Implement ESC key handler in src/components/ExerciseDetailModal.jsx to close modal
- [X] T012 [US1] Implement backdrop click handler in src/components/ExerciseDetailModal.jsx to close modal
- [X] T013 [US1] Implement focus trapping with useEffect in src/components/ExerciseDetailModal.jsx
- [X] T014 [US1] Add aria-modal, aria-labelledby, and role attributes for accessibility in src/components/ExerciseDetailModal.jsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can click exercises, view details in a modal, and close it via ESC/button/backdrop

---

## Phase 4: User Story 2 - Watch Exercise Tutorial Video (Priority: P2)

**Goal**: Embed YouTube videos in the exercise detail modal when YouTube URLs are available

**Independent Test**: Open an exercise that has a YouTube URL and verify that a video player loads and is playable. Open an exercise without a URL and verify the video section is omitted. Test with an invalid URL and verify error message appears.

### Implementation for User Story 2

- [X] T015 [US2] Extend CSV parsing in src/App.jsx to parse "YouTube URL" column and add youtubeUrl field to exercise objects
- [X] T016 [US2] Import extractVideoId and getEmbedUrl from src/utils/youtube.js in src/components/ExerciseDetailModal.jsx
- [X] T017 [US2] Add conditional YouTube iframe rendering in src/components/ExerciseDetailModal.jsx using privacy-enhanced youtube-nocookie.com domain
- [X] T018 [US2] Add 16:9 aspect ratio container styles for YouTube iframe in src/components/ExerciseDetailModal.css
- [X] T019 [US2] Implement conditional logic to omit video section entirely when youtubeUrl is null or empty in src/components/ExerciseDetailModal.jsx
- [X] T020 [US2] Add error message display for invalid YouTube URLs in src/components/ExerciseDetailModal.jsx
- [X] T021 [US2] Update Exercise entity type/prop validation to include optional youtubeUrl field in src/components/ExerciseDetailModal.jsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - modal displays exercise details with embedded videos when available

---

## Phase 5: User Story 3 - Navigate Between Exercise Details (Priority: P3)

**Goal**: Allow users to navigate to next/previous exercises directly from the detail modal

**Independent Test**: Open an exercise detail modal, click Next to navigate to the next exercise, click Previous to navigate back. Verify Previous is disabled on first exercise and Next is disabled on last exercise.

### Implementation for User Story 3

- [X] T022 [P] [US3] Implement handleNext() and handlePrevious() navigation handlers in src/App.jsx
- [X] T023 [US3] Add exerciseIndex and totalExercises props to ExerciseDetailModal in src/App.jsx
- [X] T024 [US3] Pass onNext and onPrevious callbacks to ExerciseDetailModal in src/App.jsx
- [X] T025 [US3] Add navigation button controls (Previous/Next) to src/components/ExerciseDetailModal.jsx
- [X] T026 [US3] Implement disabled state logic for Previous button (when exerciseIndex === 0) in src/components/ExerciseDetailModal.jsx
- [X] T027 [US3] Implement disabled state logic for Next button (when exerciseIndex === totalExercises - 1) in src/components/ExerciseDetailModal.jsx
- [X] T028 [US3] Add navigation button styles with hover and disabled states in src/components/ExerciseDetailModal.css
- [X] T029 [US3] Add keyboard accessibility (tab navigation, space/enter activation) to navigation buttons in src/components/ExerciseDetailModal.jsx

**Checkpoint**: All user stories should now be independently functional - users can view details, watch videos, and navigate between exercises

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [X] T030 [P] Add body scroll prevention when modal is open in src/components/ExerciseDetailModal.jsx
- [X] T031 [P] Verify responsive design on mobile devices (320px+ width) and adjust styles if needed in src/components/ExerciseDetailModal.css
- [X] T032 [P] Optimize modal render performance - ensure no unnecessary re-renders of ExerciseList when modal opens
- [X] T033 Verify all success criteria: modal opens <2s, videos load <5s, navigation <1s
- [X] T034 Test keyboard accessibility: ESC closes, tab trapping works, focus returns to list
- [X] T035 Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [X] T036 Verify privacy-enhanced YouTube embeds use youtube-nocookie.com domain

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 completion (extends ExerciseDetailModal created in US1)
- **User Story 3 (P3)**: Depends on US1 completion (adds navigation to ExerciseDetailModal created in US1)

### Within Each User Story

- Modal structure before modal styles
- State management before component rendering
- Core functionality before accessibility enhancements
- Component implementation before integration with App.jsx

### Parallel Opportunities

- T002 and T003 in Foundational can run in parallel (different files)
- T004 and T005 in US1 can run in parallel (component JS and CSS)
- T008 and T009 in US1 can run in parallel (ExerciseList JS and CSS modifications)
- T022, T023, T024 in US3 can run in parallel (all App.jsx modifications)
- T030, T031, T032 in Polish can run in parallel (different concerns)

---

## Parallel Example: User Story 1

```bash
# Launch component and styles together:
Task T004: "Create src/components/ExerciseDetailModal.jsx with basic modal structure"
Task T005: "Create src/components/ExerciseDetailModal.css with modal styles"

# Launch ExerciseList modifications together:
Task T008: "Modify src/components/ExerciseList.jsx to add onExerciseClick"
Task T009: "Update src/components/ExerciseList.css with hover states"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (update CSV)
2. Complete Phase 2: Foundational (YouTube utilities)
3. Complete Phase 3: User Story 1 (modal with exercise details)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP - clickable exercise details!)
3. Add User Story 2 → Test independently → Deploy/Demo (adds YouTube videos)
4. Add User Story 3 → Test independently → Deploy/Demo (adds navigation)
5. Complete Polish → Final quality assurance
6. Each story adds value without breaking previous stories

### Sequential Strategy (Single Developer)

With one developer working sequentially:

1. Complete Setup (Phase 1)
2. Complete Foundational (Phase 2) - MUST finish before moving to stories
3. Complete User Story 1 (Phase 3) - Validate independently before proceeding
4. Complete User Story 2 (Phase 4) - Validate independently before proceeding
5. Complete User Story 3 (Phase 5) - Validate independently before proceeding
6. Complete Polish (Phase 6) - Final touches and quality checks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No external modal libraries used - custom React component per constitutional principles
- Privacy-enhanced YouTube embeds (youtube-nocookie.com) for GDPR compliance
- Focus management and keyboard support required for accessibility
- Responsive design tested on mobile (320px+) and desktop
- Each user story should be independently completable and testable
- Commit after each task or logical group for easier rollback
- Stop at any checkpoint to validate story independently
