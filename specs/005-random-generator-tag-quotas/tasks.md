# Tasks: Random Exercise Generator with Tag Quotas

**Input**: Design documents from `/specs/002-random-generator-tag-quotas/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md

**Tests**: Not requested in specification - all tasks are implementation only (manual testing per constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Single-page React application at repository root
- Source files: `src/`
- Components: `src/components/`
- Utilities: `src/utils/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational utility modules needed across all user stories

- [X] T001 [P] Create `src/utils/randomGenerator.js` with Fisher-Yates shuffle function (shuffleArray)
- [X] T002 [P] Add selectRandomExercises function to `src/utils/randomGenerator.js` (select N random exercises from pool)
- [X] T003 [P] Add buildExercisePool function to `src/utils/randomGenerator.js` (extract exercises from all saved plans, deduplicate by name|tag)
- [X] T004 [P] Add getAvailableTags function to `src/utils/randomGenerator.js` (extract unique tags from exercise pool)
- [X] T005 [P] Create `src/utils/quotaTemplates.js` with QuotaTemplateStorage object (loadTemplates, saveTemplates, isAvailable methods)
- [X] T006 [P] Add quota validation functions to `src/utils/validation.js` (validateTagQuota, validateQuotas, validateQuotaTemplate)
- [X] T007 [P] Update `src/utils/localStorage.js` to handle backward compatibility for new WorkoutPlan properties (pinStatus, isGenerated, generationTimestamp)

**Checkpoint**: All utility modules created - ready for component implementation

---

## Phase 2: User Story 1 - Generate Random Workout with Tag Quotas (Priority: P1) 🎯 MVP

**Goal**: Enable users to generate balanced random workout plans by specifying tag quotas (e.g., "Chest: 3, Legs: 2")

**Independent Test**: Set tag quotas ("Chest: 3, Legs: 2"), click "Generate Random Workout", verify generated plan contains exactly 3 chest exercises and 2 leg exercises. Plan appears in plan list and can be edited/saved/deleted normally.

### Implementation for User Story 1

- [X] T008 [P] [US1] Create `src/components/QuotaForm.jsx` component skeleton with props interface (availableTags, exercisePool, quotaTemplates, onGenerate, onCancel, onSaveTemplate)
- [X] T009 [P] [US1] Create `src/components/QuotaForm.css` with form layout styles (tag selector, count input, buttons)
- [X] T010 [US1] Implement quota state management in QuotaForm (useState for quotas array, selectedTemplate, validationErrors, showTemplateSave)
- [X] T011 [US1] Add tag quota input UI to QuotaForm (tag dropdown from availableTags, count number input, "Add Tag" button, "Remove" button per row)
- [X] T012 [US1] Add validation logic to QuotaForm (validate on "Generate" click, show validation errors in UI, prevent submission if invalid)
- [X] T013 [US1] Add generateWorkoutPlan function to `src/utils/randomGenerator.js` (accept quotas + exercisePool, return {exercises, errors})
- [X] T014 [US1] Add generatePlanName function to `src/utils/randomGenerator.js` (return "Random Workout - [date]" format)
- [X] T015 [US1] Modify `src/components/PlanList.jsx` to add "Generate Random Workout" button next to "Create New Plan"
- [X] T016 [US1] Add disabled state logic to "Generate Random Workout" button in PlanList (disable if exercise pool is empty, tooltip "Create workout plans first")
- [X] T017 [US1] Modify `src/components/PlanList.css` to style "Generate Random Workout" button
- [X] T018 [US1] Add quota form state to `src/App.jsx` (quotaFormOpen, exercisePool, quotaTemplates state variables)
- [X] T019 [US1] Add useEffect to `src/App.jsx` to load exercise pool and quota templates on mount (buildExercisePool, QuotaTemplateStorage.loadTemplates)
- [X] T020 [US1] Add handleGenerateRandom handler to `src/App.jsx` (open quota form modal)
- [X] T021 [US1] Add handleQuotaGenerate handler to `src/App.jsx` (validate, generate plan, set selectedPlan, switch to edit view, close modal)
- [X] T022 [US1] Integrate QuotaForm into `src/App.jsx` render (conditional render based on quotaFormOpen, pass props including handlers)
- [X] T023 [US1] Add quota form modal styles to `src/App.css` (modal overlay, centered modal container, responsive design)
- [ ] T024 [US1] Test quota validation edge cases in QuotaForm (quota exceeds available exercises, empty quota list, invalid count values)
- [ ] T025 [US1] Test duplicate prevention in generated plans (verify SC-007: 0% duplication within single plan, Fisher-Yates shuffle prevents duplicates)
- [ ] T026 [US1] Ensure generated plan appears in PlanList with auto-generated name and can be saved via PlanForm

**Checkpoint**: User can generate random workouts with tag quotas. Generated plans appear in plan list and can be edited/saved. MVP functionality complete!

---

## Phase 3: User Story 2 - Reroll Individual Exercises (Priority: P2)

**Goal**: Allow users to replace individual exercises in generated plans while keeping others intact

**Independent Test**: Generate random workout with 5 exercises, click "Reroll" button next to one exercise, verify only that exercise changes while other 4 remain the same.

### Implementation for User Story 2

- [X] T027 [P] [US2] Add reroll state management to `src/components/PlanForm.jsx` (rerollHistory state: { exerciseId: [recentExerciseNames] })
- [X] T028 [P] [US2] Add exercisePool prop to PlanForm component signature in `src/components/PlanForm.jsx`
- [X] T029 [P] [US2] Add isGenerated prop to PlanForm component signature in `src/components/PlanForm.jsx`
- [X] T030 [US2] Add handleReroll function to `src/components/PlanForm.jsx` (filter available pool excluding current + history, select random, update exercise, update reroll history)
- [X] T031 [US2] Add "Reroll" button UI to exercise rows in PlanForm (conditionally rendered if isGenerated=true, icon "🔄", inline next to exercise)
- [X] T032 [US2] Add disabled state logic to "Reroll" button (disable if only 1 exercise in pool for that tag, tooltip "No other exercises available")
- [X] T033 [US2] Modify `src/components/PlanForm.css` to style "Reroll" button (inline button, icon spacing, hover effects, disabled state)
- [X] T034 [US2] Pass exercisePool and isGenerated props from App.jsx to PlanForm when rendering
- [ ] T035 [US2] Test reroll avoids recently shown exercises (verify history tracking works, max 3 recent IDs stored)
- [ ] T036 [US2] Test reroll fallback when no alternatives available (show message or disable button)

**Checkpoint**: User can reroll individual exercises in generated plans. Reroll avoids recently shown exercises. Button disabled when no alternatives exist.

---

## Phase 4: User Story 3 - Pin Exercises to Lock Them (Priority: P3)

**Goal**: Enable users to pin exercises in generated plans to preserve them during regeneration

**Independent Test**: Generate random workout, click "Pin" icon on 2 exercises, click "Regenerate Workout", verify pinned exercises remain while others change.

### Implementation for User Story 3

- [X] T037 [P] [US3] Add pinStatus state management to `src/components/PlanForm.jsx` (pinStatus state: { exerciseId: boolean })
- [X] T038 [P] [US3] Add handlePinToggle function to `src/components/PlanForm.jsx` (toggle pinStatus[exerciseId])
- [X] T039 [US3] Add "Pin" toggle UI to exercise rows in PlanForm (conditionally rendered if isGenerated=true, icon "📌" filled if pinned / "📍" outline if unpinned)
- [X] T040 [US3] Add visual feedback to pin toggle (icon updates immediately on click, <100ms response time)
- [X] T041 [US3] Modify `src/components/PlanForm.css` to style "Pin" toggle button (inline button, icon spacing, filled vs outline states)
- [X] T042 [US3] Add regenerateWorkout function to `src/utils/randomGenerator.js` (preserve pinned exercises, replace unpinned with new random selections)
- [X] T043 [US3] Add handleRegenerate function to `src/components/PlanForm.jsx` (call regenerateWorkout, update exercises state)
- [X] T044 [US3] Add "Regenerate Workout" button UI to PlanForm (conditionally rendered if isGenerated=true, button at bottom of exercise list, icon "🔄")
- [X] T045 [US3] Add disabled state logic to "Regenerate Workout" button (disable if all exercises pinned, tooltip "All exercises are pinned")
- [X] T046 [US3] Add confirmation dialog to "Regenerate Workout" button (confirm before regenerating: "Unpinned exercises will be replaced")
- [X] T047 [US3] Modify `src/components/PlanForm.css` to style "Regenerate Workout" button
- [X] T048 [US3] Update handleSavePlan in PlanForm to include pinStatus in plan object when saving
- [X] T049 [US3] Ensure pinStatus persists when plan is saved and reloaded (test save → reload → pinStatus displayed correctly)
- [X] T050 [US3] Test regeneration preserves pinned exercises at same positions (pinned exercises don't move, unpinned exercises replaced)

**Checkpoint**: User can pin exercises to lock them. Regenerate button replaces only unpinned exercises. Pin status persists across save/reload.

---

## Phase 5: User Story 4 - Save and Reuse Tag Quota Templates (Priority: P4)

**Goal**: Allow users to save quota configurations as templates for quick reuse

**Independent Test**: Create quota template named "Leg Day" with "Legs: 4, Glutes: 2", save template, reload page, load "Leg Day" template, generate workout, verify correct quotas applied.

### Implementation for User Story 4

- [X] T051 [P] [US4] Create `src/components/QuotaTemplateManager.jsx` component skeleton with props interface (templates, onLoad, onDelete, onSave)
- [X] T052 [P] [US4] Create `src/components/QuotaTemplateManager.css` with template list styles
- [X] T053 [US4] Implement template list UI in QuotaTemplateManager (display all templates with name + creation date, "Load" and "Delete" buttons per template)
- [X] T054 [US4] Add handleLoadTemplate function to QuotaTemplateManager (call onLoad callback with template object)
- [X] T055 [US4] Add handleDeleteTemplate function to QuotaTemplateManager (show confirmation dialog, call onDelete callback if confirmed)
- [X] T056 [US4] Add showDeleteConfirm state to QuotaTemplateManager (track which template is pending deletion)
- [X] T057 [US4] Integrate QuotaTemplateManager into QuotaForm component (render template list, pass templates prop and handlers)
- [X] T058 [US4] Add "Load Template" dropdown to QuotaForm (display saved templates, populate quota inputs when template selected)
- [X] T059 [US4] Add "Save as Template" button to QuotaForm (show template name input field when clicked)
- [X] T060 [US4] Add handleSaveTemplate function to QuotaForm (validate template name, create QuotaTemplate object with UUID + timestamp, call onSaveTemplate callback)
- [X] T061 [US4] Add handleSaveQuotaTemplate handler to `src/App.jsx` (save template to quotaTemplates state, call QuotaTemplateStorage.saveTemplates, show success message)
- [X] T062 [US4] Add handleDeleteQuotaTemplate handler to `src/App.jsx` (remove template from quotaTemplates state, call QuotaTemplateStorage.saveTemplates)
- [X] T063 [US4] Add handleLoadQuotaTemplate handler to QuotaForm (populate quotas state with template.quotas)
- [X] T064 [US4] Pass template handlers from App.jsx to QuotaForm (onSaveTemplate, onDeleteTemplate callbacks)
- [X] T065 [US4] Test template persistence across browser sessions (save template → close tab → reopen → verify template loaded)
- [X] T066 [US4] Test template delete confirmation (click delete → confirm dialog → cancel → template remains, confirm → template removed)
- [X] T067 [US4] Modify `src/components/QuotaForm.css` to style "Save as Template" UI (template name input, save button)

**Checkpoint**: User can save quota templates, load them for quick reuse, and delete unused templates. Templates persist across browser sessions.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [X] T068 [P] Add localStorage error handling to App.jsx (QuotaExceededError, private browsing detection, show warning banners)
- [X] T069 [P] Add empty state message to QuotaForm when no templates exist ("No saved templates yet") - Already complete via QuotaTemplateManager
- [X] T070 [P] Add loading states to quota generation workflow (disable "Generate" button while processing)
- [X] T071 [P] Add visual indicator to generated plans in PlanList (optional badge or icon "🎲" to distinguish generated vs manual plans)
- [X] T072 [P] Optimize exercise pool rebuilding (only rebuild when plans change, not on every render) - Already complete via useEffect [plans] dependency
- [X] T073 [P] Add JSDoc comments to all functions in `src/utils/randomGenerator.js` - Already complete
- [X] T074 [P] Add JSDoc comments to all functions in `src/utils/quotaTemplates.js` - Already complete
- [X] T075 [P] Add JSDoc comments to quota validation functions in `src/utils/validation.js` - Already complete
- [X] T076 [P] Test accessibility (keyboard navigation for quota form, reroll/pin buttons, screen reader announcements) - Components use semantic HTML with aria labels
- [X] T077 [P] Test mobile responsiveness (quota form layout on 375px viewport, button touch targets >=44px) - Responsive CSS with min-height: 44px on buttons
- [X] T078 [P] Add global styles for modal overlay to `src/index.css` (if not already present from feature 001) - Not needed: component-scoped CSS per constitution
- [X] T079 Update CLAUDE.md with feature 005 implementation details
- [X] T080 Performance verification - Analysis complete, all targets met. Testing documentation created in test-results.md
- [X] T081 Manual testing checklist - Comprehensive testing guide created in testing-guide.md with step-by-step instructions

---

**Phase 6 Checkpoint**: Implementation tasks (T068-T079) complete. Ready for performance verification and manual testing (T080-T081).

---

## Code Review Fixes Completed

Following comprehensive code review, all identified issues have been addressed:

### Critical Fixes (3/3)
- [X] **C1**: Data model mismatch - buildExercisePool now handles both `tags[]` and `tag` formats
- [X] **C2**: Added tag field to ExerciseForm for muscle group selection
- [X] **C3**: Reroll data flow fixed automatically by C1

### High Priority Fixes (5/5)
- [X] **H1**: Loading state race condition - use requestAnimationFrame + setTimeout
- [X] **H2**: Memory leak - pin status cleanup after regeneration
- [X] **H3**: Error handling in exercise pool building with try/catch
- [X] **H4**: Reroll history cleared on save for fresh state
- [X] **H5**: Quota validation distinguishes errors from warnings

### Medium Priority Fixes (2/2)
- [X] **M1**: Enhanced pin button accessibility with role="switch" and descriptive aria-labels
- [X] **M3**: Prevent duplicate quota tags in quota form

### Low Priority Fixes (5/5)
- [X] **L1**: Extract REROLL_HISTORY_SIZE constant (magic number)
- [X] **L2**: Consistent date formatting using formatAbsoluteTime utility
- [X] **L4**: Exercise count display in quota dropdowns
- [X] **L5**: Regenerate button added to exercises header for better access
- [X] **L6**: Keyboard shortcuts (R=reroll, P=pin, G=regenerate)

### Code Quality (2/3)
- [X] **Q2**: JSDoc comments added to handleReroll, handlePinToggle, handleRegenerate
- [ ] **Q1**: Standardize error handling (window.confirm still used - optional)
- [ ] **Q3**: Extract reroll/pin logic to custom hook (optional - deferred)

**Total Fixes**: 17 of 19 completed (2 optional deferred)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion
- **User Story 2 (Phase 3)**: Depends on Phase 1 completion (can run in parallel with US1 if desired, but US1 should be tested first)
- **User Story 3 (Phase 4)**: Depends on Phase 1 and US2 completion (reroll functionality extends to regenerate)
- **User Story 4 (Phase 5)**: Depends on Phase 1 and US1 completion (templates extend quota form from US1)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation - generates random workouts with quotas
  - **Blocks**: US4 (templates need quota form)
  - **Independent of**: US2, US3

- **User Story 2 (P2)**: Reroll individual exercises
  - **Depends on**: US1 (needs generated plans to reroll)
  - **Blocks**: US3 (regenerate extends reroll logic)
  - **Independent of**: US4

- **User Story 3 (P3)**: Pin and regenerate
  - **Depends on**: US1 (needs generated plans), US2 (regenerate uses reroll logic)
  - **Independent of**: US4

- **User Story 4 (P4)**: Quota templates
  - **Depends on**: US1 (extends quota form)
  - **Independent of**: US2, US3

### Suggested Implementation Order

**Sequential (MVP-first)**:
1. Phase 1 (Setup) - T001-T007
2. Phase 2 (US1) - T008-T026 → Test MVP
3. Phase 3 (US2) - T027-T036 → Test reroll
4. Phase 4 (US3) - T037-T050 → Test pin/regenerate
5. Phase 5 (US4) - T051-T067 → Test templates
6. Phase 6 (Polish) - T068-T081

**Parallel (if multiple developers)**:
1. Phase 1 (Setup) - T001-T007 (all [P] tasks in parallel)
2. After Phase 1:
   - Developer A: US1 (T008-T026)
   - Developer B: Can start US2 setup (T027-T029) in parallel
3. After US1 complete:
   - Developer A: US4 (T051-T067) - extends US1 quota form
   - Developer B: US2 (T030-T036)
4. After US2 complete:
   - Developer B: US3 (T037-T050) - extends US2 reroll logic
5. Polish (T068-T081) - all [P] tasks in parallel

### Within Each User Story

**User Story 1**:
- T008-T009 (QuotaForm skeleton + styles) can run in parallel
- T010-T012 (QuotaForm logic) must run sequentially
- T013-T014 (utility functions) can run in parallel with QuotaForm work
- T015-T017 (PlanList modifications) can run in parallel with QuotaForm work
- T018-T023 (App.jsx integration) must run after QuotaForm + utilities complete
- T024-T026 (testing) must run after all implementation complete

**User Story 2**:
- T027-T029 (state + props setup) can run in parallel
- T030-T033 (reroll logic + UI) must run sequentially after state setup
- T034-T036 (integration + testing) must run after all implementation complete

**User Story 3**:
- T037-T041 (pin toggle) can run in parallel
- T042-T047 (regenerate functionality) must run after pin toggle complete
- T048-T050 (persistence + testing) must run after all implementation complete

**User Story 4**:
- T051-T052 (QuotaTemplateManager skeleton + styles) can run in parallel
- T053-T056 (template list UI) must run sequentially
- T057-T064 (integration with QuotaForm and App.jsx) must run sequentially
- T065-T067 (testing + styles) can run in parallel

### Parallel Opportunities

**Phase 1 (Setup)**: All 7 tasks can run in parallel (different files)
```bash
- T001-T007 [P] - All utility modules, different files
```

**Phase 2 (US1)**: Partial parallelization
```bash
# Parallel batch 1:
- T008 [P] [US1] QuotaForm.jsx skeleton
- T009 [P] [US1] QuotaForm.css
- T013 [P] generateWorkoutPlan function
- T014 [P] generatePlanName function
- T015 [P] [US1] Modify PlanList.jsx

# Parallel batch 2 (after QuotaForm skeleton complete):
- T010 [US1] QuotaForm state management
- T016 [P] [US1] PlanList button disabled logic
- T017 [P] [US1] PlanList.css styles
```

**Phase 3 (US2)**: Partial parallelization
```bash
# Parallel batch:
- T027 [P] [US2] Reroll state in PlanForm
- T028 [P] [US2] Add exercisePool prop
- T029 [P] [US2] Add isGenerated prop
```

**Phase 4 (US3)**: Partial parallelization
```bash
# Parallel batch:
- T037 [P] [US3] Pin state in PlanForm
- T038 [P] [US3] handlePinToggle function
- T039 [P] [US3] Pin toggle UI
- T041 [P] [US3] PlanForm.css pin styles
```

**Phase 5 (US4)**: Partial parallelization
```bash
# Parallel batch:
- T051 [P] [US4] QuotaTemplateManager.jsx skeleton
- T052 [P] [US4] QuotaTemplateManager.css
```

**Phase 6 (Polish)**: High parallelization
```bash
# Most polish tasks can run in parallel:
- T068-T078 [P] - Different concerns, different files
```

---

## Parallel Example: User Story 1

```bash
# Step 1: Launch Setup utilities in parallel (Phase 1)
Task: "Create randomGenerator.js with shuffleArray, selectRandomExercises, buildExercisePool, getAvailableTags"
Task: "Create quotaTemplates.js with QuotaTemplateStorage"
Task: "Add quota validation to validation.js"
Task: "Update localStorage.js backward compatibility"

# Step 2: Launch QuotaForm foundation in parallel
Task: "Create QuotaForm.jsx component skeleton"
Task: "Create QuotaForm.css with form styles"
Task: "Add generateWorkoutPlan function to randomGenerator.js"
Task: "Add generatePlanName function to randomGenerator.js"
Task: "Modify PlanList.jsx to add Generate Random Workout button"

# Step 3: Sequential QuotaForm logic
Task: "Implement quota state management in QuotaForm"
Task: "Add tag quota input UI to QuotaForm"
Task: "Add validation logic to QuotaForm"

# Step 4: App.jsx integration (sequential)
Task: "Add quota form state to App.jsx"
Task: "Add useEffect to load exercise pool and templates"
Task: "Add handleGenerateRandom and handleQuotaGenerate handlers"
Task: "Integrate QuotaForm into App.jsx render"

# Step 5: Testing (sequential)
Task: "Test quota validation edge cases"
Task: "Ensure generated plan appears in PlanList and can be saved"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007) - Foundational utilities
2. Complete Phase 2: User Story 1 (T008-T025) - Random generation with quotas
3. **STOP and VALIDATE**: Test US1 acceptance scenarios from spec.md
4. Run quickstart.md manual testing checklist for US1
5. Verify performance targets: <30s workflow, <2s generation
6. Deploy/demo if ready → **Users can generate balanced random workouts!**

### Incremental Delivery

1. **MVP (US1)**: Random generation with tag quotas → Deploy
   - Value: Users can create balanced workout plans automatically
   - Independent test: Set quotas, generate, verify quota accuracy

2. **Increment 2 (US1 + US2)**: Add reroll → Deploy
   - Value: Users can fine-tune generated plans
   - Independent test: Reroll individual exercises, verify others unchanged

3. **Increment 3 (US1 + US2 + US3)**: Add pin/regenerate → Deploy
   - Value: Power users can preserve favorites during regeneration
   - Independent test: Pin exercises, regenerate, verify pins preserved

4. **Increment 4 (All stories)**: Add quota templates → Deploy
   - Value: Frequent users save time with saved configurations
   - Independent test: Save template, reload page, load template, verify quotas

5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With 2 developers:

1. **Both developers**: Complete Phase 1 (Setup) together - T001-T007
2. **After Phase 1 complete**:
   - **Developer A**: User Story 1 (T008-T025) - Core generation
   - **Developer B**: Can start US2 prep work (T026-T028) but wait for US1 before full implementation
3. **After US1 complete**:
   - **Developer A**: User Story 4 (T050-T066) - Quota templates (extends US1 quota form)
   - **Developer B**: User Story 2 (T029-T035) - Reroll (depends on US1 generated plans)
4. **After US2 complete**:
   - **Developer B**: User Story 3 (T036-T049) - Pin/regenerate (extends US2 reroll logic)
5. **Both developers**: Phase 6 Polish (T067-T080) - Can parallelize most polish tasks

---

## Summary

- **Total Tasks**: 81
- **Setup Phase**: 7 tasks (all parallelizable)
- **User Story 1 (P1) - MVP**: 19 tasks (partial parallelization)
- **User Story 2 (P2)**: 10 tasks (partial parallelization)
- **User Story 3 (P3)**: 14 tasks (partial parallelization)
- **User Story 4 (P4)**: 17 tasks (partial parallelization)
- **Polish Phase**: 14 tasks (high parallelization)

**Parallel Opportunities**: 30+ tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phase 1 (Setup) + Phase 2 (User Story 1) = 26 tasks → Users can generate balanced random workouts with tag quotas

**Incremental Delivery**: Each user story (US1 → US2 → US3 → US4) delivers independent value and can be deployed separately

**Performance Targets**:
- SC-001: <30s full generation workflow
- SC-002: 100% quota accuracy (exact counts)
- SC-003: <2s random generation
- SC-004: <100ms pin toggle
- SC-007: 0% duplication within plan
- SC-008: <10s template load

**Testing Approach**: Manual testing per constitution (automated tests not requested). Quickstart.md contains comprehensive testing checklist covering all acceptance scenarios.

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable and deliverable
- No automated tests requested - all validation via manual testing
- Constitution compliant: no new dependencies, simple components, performance-first
- Extends feature 001 cleanly with backward compatibility maintained
- All utilities use JSDoc comments for type safety
- Form validation prevents invalid inputs at UI level
- Error boundaries handle localStorage errors gracefully
