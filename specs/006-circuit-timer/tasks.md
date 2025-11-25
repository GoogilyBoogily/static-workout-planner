# Tasks: Circuit Timer

**Input**: Design documents from `/specs/006-circuit-timer/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated tests - manual testing only per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single React app**: `src/components/`, `src/utils/` at repository root
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new files and basic structure for timer feature

- [x] T001 [P] Create audio utility module at src/utils/timerAudio.js with initAudio() and playBeep() functions
- [x] T002 [P] Create CircuitTimer component file at src/components/CircuitTimer.jsx with basic component skeleton
- [x] T003 [P] Create CircuitTimer styles at src/components/CircuitTimer.css with CSS custom properties for theming

**Checkpoint**: All new files created, ready for implementation ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add timer view state to App.jsx (timerActive boolean, selected plan context)
- [x] T005 Add timer button to plan cards in src/components/PlanList.jsx with onStartTimer callback
- [x] T006 Add handleStartTimer and handleCloseTimer handlers in src/App.jsx
- [x] T007 Add conditional render for CircuitTimer component in src/App.jsx view routing logic

**Checkpoint**: Foundation ready - timer button visible on plan cards, clicking opens empty timer view ✅

---

## Phase 3: User Story 1 - Basic Circuit Timer (Priority: P1) 🎯 MVP

**Goal**: Timer automatically cycles between exercise and rest periods for a configurable number of rounds

**Independent Test**: Configure exercise=30s, rest=15s, rounds=3, start timer, observe it cycle through all 3 rounds of exercise→rest phases and display completion

### Implementation for User Story 1

- [x] T008 [US1] Implement timer configuration form in src/components/CircuitTimer.jsx (exercise duration, rest duration, rounds inputs with validation)
- [x] T009 [US1] Add timer state management (phase, currentRound, remainingSeconds, isRunning) in src/components/CircuitTimer.jsx
- [x] T010 [US1] Implement countdown timer logic with setInterval in src/components/CircuitTimer.jsx useEffect hook
- [x] T011 [US1] Implement phase transition logic (exercise→rest→exercise) in src/components/CircuitTimer.jsx
- [x] T012 [US1] Add round increment logic when rest phase completes in src/components/CircuitTimer.jsx
- [x] T013 [US1] Implement timer display UI (phase indicator, countdown, round counter) in src/components/CircuitTimer.jsx
- [x] T014 [US1] Add completion state display when all rounds finish in src/components/CircuitTimer.jsx
- [x] T015 [US1] Style timer display with prominent countdown, phase colors in src/components/CircuitTimer.css
- [x] T016 [US1] Add close button to return to plan list in src/components/CircuitTimer.jsx

**Checkpoint**: User Story 1 complete - timer cycles through exercise/rest phases and shows completion. MVP is functional. ✅

---

## Phase 4: User Story 2 - Audio Countdown Alerts (Priority: P2)

**Goal**: Beep sounds play during final 5 seconds of each phase

**Independent Test**: Start timer, listen for beeps at 5, 4, 3, 2, 1 seconds in both exercise and rest phases; verify no beeps when >5 seconds remain

### Implementation for User Story 2

- [x] T017 [US2] Implement Web Audio API oscillator beep in src/utils/timerAudio.js playBeep function
- [x] T018 [US2] Add audio context initialization on start button click in src/components/CircuitTimer.jsx
- [x] T019 [US2] Add beep trigger condition (remainingSeconds <= 5 && remainingSeconds > 0) in src/components/CircuitTimer.jsx countdown effect
- [x] T020 [US2] Handle AudioContext suspended state with resume() in src/utils/timerAudio.js

**Checkpoint**: User Story 2 complete - audio beeps play at correct countdown intervals ✅

---

## Phase 5: User Story 3 - Finisher Period (Priority: P3)

**Goal**: Optional extended exercise period after all circuit rounds complete

**Independent Test**: Configure finisher=60s, complete all rounds, verify timer enters "Finisher" phase for 60 seconds before completion; verify finisher=0 skips directly to completion

### Implementation for User Story 3

- [x] T021 [US3] Add finisher duration input to configuration form in src/components/CircuitTimer.jsx
- [x] T022 [US3] Add 'finisher' phase to timer state machine in src/components/CircuitTimer.jsx
- [x] T023 [US3] Implement transition from final exercise to finisher (FR-015: skip final rest phase when finisher > 0, go directly exercise → finisher) in src/components/CircuitTimer.jsx
- [x] T024 [US3] Add finisher phase display styling in src/components/CircuitTimer.css
- [x] T025 [US3] Add beep trigger for finisher phase final 5 seconds in src/components/CircuitTimer.jsx

**Checkpoint**: User Story 3 complete - finisher period works correctly when configured ✅

---

## Phase 6: User Story 4 - Pause and Resume (Priority: P4)

**Goal**: User can pause the timer and resume from where they left off

**Independent Test**: Start timer, pause mid-countdown, verify time freezes, resume, verify countdown continues from paused value

### Implementation for User Story 4

- [x] T026 [US4] Add isPaused state to timer state in src/components/CircuitTimer.jsx
- [x] T027 [US4] Implement pause/resume button that toggles isPaused in src/components/CircuitTimer.jsx
- [x] T028 [US4] Modify countdown effect to check isPaused before decrementing in src/components/CircuitTimer.jsx
- [x] T029 [US4] Add paused visual indicator in src/components/CircuitTimer.css
- [x] T030 [US4] Prevent beep sounds when paused in src/components/CircuitTimer.jsx

**Checkpoint**: User Story 4 complete - pause/resume works correctly ✅

---

## Phase 7: User Story 5 - Stop and Reset (Priority: P5)

**Goal**: User can stop the timer and return to configuration with values preserved

**Independent Test**: Start timer, press stop mid-workout, verify return to config screen with previous values intact; press start again, verify fresh start from round 1

### Implementation for User Story 5

- [x] T031 [US5] Implement stop/reset button in src/components/CircuitTimer.jsx
- [x] T032 [US5] Add reset handler that clears runtime state but preserves config in src/components/CircuitTimer.jsx
- [x] T033 [US5] Clear interval and reset to idle phase on stop in src/components/CircuitTimer.jsx
- [x] T034 [US5] Add restart capability from completion screen in src/components/CircuitTimer.jsx

**Checkpoint**: User Story 5 complete - stop/reset returns to configuration, restart works ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T035 [P] Add JSDoc comments to CircuitTimer component props in src/components/CircuitTimer.jsx
- [x] T036 [P] Add JSDoc comments to timerAudio utility functions in src/utils/timerAudio.js
- [x] T037 Add keyboard accessibility (Enter to start, Space to pause) in src/components/CircuitTimer.jsx
- [x] T038 Add responsive styling for mobile viewports in src/components/CircuitTimer.css
- [x] T039 Handle edge case: rest duration = 0 (skip rest phases entirely, go directly to next exercise round or finisher/completion) in src/components/CircuitTimer.jsx
- [x] T040 Handle edge case: exercise duration <= 5 seconds (all available seconds should have beeps - this is acceptable per spec) in src/components/CircuitTimer.jsx
- [ ] T041 Run manual test scenarios from specs/006-circuit-timer/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories should be completed sequentially (P1 → P2 → P3 → P4 → P5)
  - Each builds on previous story's implementation
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - Core timer, no dependencies
- **User Story 2 (P2)**: Depends on US1 - Adds audio to existing timer
- **User Story 3 (P3)**: Depends on US1 - Extends phase state machine
- **User Story 4 (P4)**: Depends on US1 - Adds pause state to running timer
- **User Story 5 (P5)**: Depends on US1 - Adds reset to running timer

### Within Each User Story

- Configuration UI before timer logic
- Timer logic before display UI
- Core implementation before edge cases
- Commit after each task or logical group

### Parallel Opportunities

- All Phase 1 tasks (T001-T003) can run in parallel (different files)
- Phase 8 documentation tasks (T035-T036) can run in parallel

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all setup tasks together:
Task: "Create audio utility module at src/utils/timerAudio.js"
Task: "Create CircuitTimer component file at src/components/CircuitTimer.jsx"
Task: "Create CircuitTimer styles at src/components/CircuitTimer.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test timer cycles through all phases
5. Deploy/demo if ready - basic timer is functional

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Test audio alerts → Deploy
4. Add User Story 3 → Test finisher → Deploy
5. Add User Story 4 → Test pause/resume → Deploy
6. Add User Story 5 → Test stop/reset → Deploy
7. Polish phase → Final testing → Complete

### File Touch Summary

| File | Tasks |
|------|-------|
| src/utils/timerAudio.js | T001, T017, T020, T036 |
| src/components/CircuitTimer.jsx | T002, T008-T016, T018-T019, T021-T034, T035, T037, T039-T040 |
| src/components/CircuitTimer.css | T003, T015, T024, T029, T038 |
| src/components/PlanList.jsx | T005 |
| src/App.jsx | T004, T006, T007 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after completion
- Manual testing per constitution - no automated tests
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Terminology**: Use lowercase `finisher` in code identifiers (variables, state keys), Title Case "Finisher" in UI display strings
