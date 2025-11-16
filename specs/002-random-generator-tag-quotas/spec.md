# Feature Specification: Random Exercise Generator with Tag Quotas

**Feature Branch**: `002-random-generator-tag-quotas`
**Created**: 2025-11-15
**Status**: Draft
**Input**: User description: "Random generator with tag quotas, reroll, pin"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Random Workout with Tag Quotas (Priority: P1)

A user wants to generate a random workout plan that includes a balanced distribution of exercises across different muscle groups (e.g., 3 chest exercises, 2 back exercises, 2 leg exercises) rather than purely random selection.

**Why this priority**: This is the core value proposition - generating workouts with balanced muscle group distribution. Without quota control, random generation would be purely chaotic and potentially unbalanced.

**Independent Test**: Can be fully tested by setting tag quotas (e.g., "Chest: 3, Legs: 2"), clicking "Generate Random Workout", and verifying the generated plan contains exactly 3 chest exercises and 2 leg exercises. Delivers immediate value of "I can create balanced random workouts."

**Acceptance Scenarios**:

1. **Given** user has saved exercises with various muscle group tags, **When** user sets quotas ("Chest: 3, Legs: 2, Back: 2") and clicks "Generate Random Workout", **Then** a new workout plan is created with exactly 3 random chest exercises, 2 random leg exercises, and 2 random back exercises

2. **Given** user sets a quota for "Chest: 5" but only 3 chest exercises exist in saved data, **When** user clicks "Generate Random Workout", **Then** system shows warning "Not enough chest exercises (need 5, have 3)" and either reduces quota automatically or prevents generation

3. **Given** user has no quota set for a particular tag, **When** generating workout, **Then** no exercises from that tag are included in the random plan

4. **Given** user generates a random workout, **When** the workout is created, **Then** it appears in the plan list like any manually created plan and can be edited/saved/deleted normally

---

### User Story 2 - Reroll Individual Exercises (Priority: P2)

A user has generated a random workout but wants to replace specific exercises they don't like while keeping the rest of the generated plan intact.

**Why this priority**: After random generation (P1), users need fine-tuning capability. Rerolling individual exercises provides control without regenerating the entire plan.

**Independent Test**: Generate a random workout with 5 exercises, click "Reroll" button next to one exercise, verify that only that exercise changes while the other 4 remain the same.

**Acceptance Scenarios**:

1. **Given** user has a generated random workout with 5 exercises, **When** user clicks "Reroll" button next to "Bench Press", **Then** "Bench Press" is replaced with a different random chest exercise while the other 4 exercises remain unchanged

2. **Given** user rerolls an exercise multiple times, **When** clicking "Reroll" repeatedly, **Then** each click generates a new random exercise from the same tag/quota category, avoiding recently shown exercises if possible

3. **Given** only one exercise exists for a tag in the available pool, **When** user clicks "Reroll" on that exercise, **Then** system shows message "No other [tag] exercises available" or disables the reroll button

4. **Given** user rerolls an exercise, **When** the exercise changes, **Then** the sets, reps, weight, and rest values are copied from the source exercise in the pool (per research.md Decision 10) and remain customizable by user after generation

---

### User Story 3 - Pin Exercises to Lock Them (Priority: P3)

A user wants to lock certain exercises in a generated plan so they aren't changed when regenerating the entire workout.

**Why this priority**: Pinning adds convenience for power users who want to regenerate plans while preserving favorite exercises. Lower priority as users can manually reroll individual exercises (P2).

**Independent Test**: Generate a random workout, click "Pin" icon on 2 exercises, click "Regenerate Workout", verify the 2 pinned exercises remain while others change.

**Acceptance Scenarios**:

1. **Given** user has a generated workout with 7 exercises, **When** user clicks "Pin" icon on "Squats" and "Deadlift", **Then** a pin indicator appears on those 2 exercises

2. **Given** user has pinned 2 exercises, **When** user clicks "Regenerate Workout" button, **Then** the pinned exercises remain in the same positions while the other 5 exercises are replaced with new random selections matching their tag quotas

3. **Given** user has pinned an exercise, **When** user clicks "Unpin" icon, **Then** the pin indicator disappears and the exercise can be replaced on next regeneration

4. **Given** user pins exercises and saves the workout plan, **When** user reopens the plan for editing, **Then** the pin status is preserved and displayed

---

### User Story 4 - Save and Reuse Tag Quota Templates (Priority: P4)

A user wants to save their favorite tag quota configurations (e.g., "Upper Body Day: Chest 3, Shoulders 2, Triceps 2") so they can quickly generate workouts without re-entering quotas each time.

**Why this priority**: Convenience feature for frequent users. Useful but not essential - users can manually set quotas each time.

**Independent Test**: Create a quota template named "Leg Day" with "Legs: 4, Glutes: 2". Save template. Next day, load "Leg Day" template, generate workout, verify correct quotas applied.

**Acceptance Scenarios**:

1. **Given** user has set tag quotas ("Chest: 3, Back: 3, Legs: 2"), **When** user clicks "Save Template" and names it "Full Body", **Then** the template is saved and appears in a templates list

2. **Given** user has saved templates, **When** user selects "Full Body" template from dropdown, **Then** the tag quotas are automatically populated matching the saved configuration

3. **Given** user has multiple saved templates, **When** user clicks "Delete" on a template, **Then** confirmation dialog appears and template is removed if confirmed

4. **Given** user saves a template, **When** user closes and reopens the application, **Then** saved templates persist (stored in localStorage)

---

### Edge Cases

- What happens when user sets quotas that exceed available exercises?
  - Show validation warning: "Not enough [tag] exercises. Need X, have Y."
  - Offer to generate with maximum available or prevent generation

- How does system handle when all exercises of a tag are already pinned?
  - Respect pins, fill remaining quota slots only
  - If quota cannot be met due to pins, show warning

- What happens when user regenerates a workout where some tags no longer exist?
  - Remove invalid tags from quotas
  - Show notification: "Tag [X] no longer exists, removed from quotas"

- How does system handle duplicate exercises in random generation?
  - Ensure each exercise appears maximum once per generated plan
  - If pool is smaller than quota, allow repetition or warn user

- What happens when rerolling with no alternative exercises?
  - Disable reroll button or show "No alternatives available"

- How does pin status interact with editing exercise details?
  - Pinned exercises can still be manually edited (sets, reps, weight)
  - Pin only affects random regeneration, not manual edits

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to set tag quotas for random workout generation, specifying how many exercises from each muscle group tag to include (e.g., "Chest: 3, Legs: 2")

- **FR-002**: System MUST generate a random workout plan by randomly selecting exercises from saved exercise pool according to specified tag quotas

- **FR-003**: System MUST validate that sufficient exercises exist for each tag quota before generating plan, showing warning if quota cannot be met

- **FR-004**: Generated workout plans MUST appear in the standard plan list and be editable/deletable like manually created plans

- **FR-005**: System MUST provide "Reroll" button for each exercise in a generated plan that replaces that specific exercise with a different random exercise from the same tag

- **FR-006**: Reroll function MUST avoid showing the same exercise consecutively if multiple options exist

- **FR-007**: System MUST provide "Pin" toggle for each exercise in a generated plan that marks it as locked

- **FR-008**: System MUST preserve pinned exercises when user triggers "Regenerate Workout", replacing only unpinned exercises with new random selections

- **FR-009**: System MUST persist pin status when user saves a workout plan (pins remain on reload)

- **FR-010**: System MUST allow users to save tag quota configurations as named templates (e.g., "Leg Day", "Upper Body")

- **FR-011**: Saved quota templates MUST persist in localStorage and be loadable for quick random generation

- **FR-012**: System MUST prevent duplicate exercises within a single generated workout plan (each exercise appears maximum once)

- **FR-013**: Random generation MUST use existing saved exercises (from workout plan pool created in feature 001), not create new exercises

### Key Entities

- **Tag Quota**: Configuration specifying number of exercises needed per muscle group tag
  - Tag name (e.g., "Chest", "Legs", "Back")
  - Quantity (number of exercises to include)
  - Collection of tag quotas forms generation criteria

- **Quota Template**: Saved configuration of tag quotas for reuse
  - Template name (e.g., "Full Body Day", "Leg Day")
  - Tag quotas (array of tag/quantity pairs)
  - Created timestamp

- **Exercise Pin Status**: Flag indicating exercise should be preserved during regeneration
  - Exercise ID reference
  - Boolean pin status (pinned/unpinned)
  - Associated with workout plan

- **Generated Workout Plan**: Workout plan created through random generation
  - Inherits all properties from Workout Plan (feature 001)
  - Additional metadata: isGenerated flag, generation timestamp
  - Pin status for each exercise

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate a random workout plan with specified tag quotas in under 30 seconds (including setting quotas)

- **SC-002**: Generated workouts contain exactly the number of exercises specified in tag quotas (100% accuracy)

- **SC-003**: Reroll operation completes in under 2 seconds and successfully replaces exercise with different option

- **SC-004**: Pin/unpin toggle responds instantly (< 100ms) and visual indicator updates immediately

- **SC-005**: Regeneration with pinned exercises preserves 100% of pinned exercises while replacing unpinned exercises

- **SC-006**: Quota templates save and load successfully 100% of the time across browser sessions

- **SC-007**: No duplicate exercises appear in generated plans (0% duplication within single plan)

- **SC-008**: Users can create a quota template and reuse it to generate workouts in under 10 seconds

## Assumptions

**Exercise Pool**: Random generation uses exercises from saved workout plans (created in feature 001). Users must have exercises in their plan pool before generating random workouts. If exercise pool is empty, random generation is unavailable.

**Tag System**: Uses existing muscle group tags from CSV data (feature 001). No new tag creation in this feature - works with existing tag taxonomy.

**Default Quotas**: If user does not set quotas, default behavior is to show quota input form (empty). No automatic quota assumptions.

**Randomization Algorithm**: Standard pseudo-random selection is sufficient. No requirement for sophisticated distribution algorithms (e.g., Fisher-Yates shuffle acceptable).

**Reroll Avoidance**: "Avoid recently shown exercises" means avoid last 2-3 shown in reroll history, not global tracking. Simple local history sufficient.

**Pin Persistence**: Pin status stored in workout plan object (extends feature 001 data model). No separate pin storage required.

**Quota Template Storage**: Templates stored in localStorage (same pattern as workout plans in feature 001). No cloud sync or export.

**UI Location**: Random generation accessible from plan list view (new "Generate Random Workout" button). Quota input can be inline form or modal.

**Generated Plan Naming**: Auto-generate name like "Random Workout - [date]" or prompt user to name plan after generation. Prefer auto-naming for faster workflow.

**Sets/Reps/Weight**: Generated exercises use default values (user can edit after generation) or copy from source exercise in pool. Prefer copying from source for consistency.
