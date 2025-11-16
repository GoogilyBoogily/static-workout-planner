# Technical Research: Random Exercise Generator with Tag Quotas

**Feature**: 002-random-generator-tag-quotas
**Phase**: Phase 0 - Research & Technical Decisions
**Date**: 2025-11-15

## Overview

This document captures technical decisions for implementing random workout generation with tag quotas, exercise rerolling, pinning, and quota template management. All functionality extends feature 001's localStorage-based workout planner with no new dependencies.

---

## Decision 1: Randomization Algorithm

**Decision**: Use Fisher-Yates shuffle algorithm for random selection

**Rationale**:
- **Uniform distribution**: Fisher-Yates guarantees each element has equal probability of selection (unbiased randomness)
- **Efficient**: O(n) time complexity for shuffling n exercises
- **No duplicates**: Natural property of shuffling ensures each exercise appears maximum once
- **Standard implementation**: Well-documented algorithm, easy to implement in JavaScript

**Implementation**:
```javascript
/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle (not mutated)
 * @returns {Array} - New shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array]; // Copy to avoid mutation
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select N random exercises from pool
 * @param {Array} pool - Available exercises
 * @param {number} count - Number to select
 * @returns {Array} - Selected exercises
 */
function selectRandomExercises(pool, count) {
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, pool.length));
}
```

**Alternatives Considered**:
- **Math.random() with Set**: Would require loop with duplicate checking, less efficient
- **Lodash _.sample()**: Avoids new dependency per constitution principle III
- **Weighted random selection**: Over-engineering for this use case, no requirement for weighted distribution

**Performance Impact**: Negligible (<1ms for typical exercise pools of 50-100 exercises)

---

## Decision 2: Exercise Pool Source

**Decision**: Extract all exercises from all saved workout plans, deduplicate by exercise name

**Rationale**:
- **Dependency alignment**: Spec assumption states "uses exercises from saved workout plans (feature 001)"
- **No data duplication**: Avoids maintaining separate exercise library
- **Dynamic pool**: Pool automatically grows as user creates more plans
- **Simple implementation**: Single pass through all plans to extract exercises

**Implementation**:
```javascript
/**
 * Build exercise pool from all saved workout plans
 * @param {Array} plans - All workout plans from feature 001
 * @returns {Object} - Map of tag -> exercises array
 */
function buildExercisePool(plans) {
  const poolByTag = {}; // { "Chest": [ex1, ex2], "Legs": [ex3, ex4] }
  const seenExercises = new Set(); // Track by name to deduplicate

  plans.forEach(plan => {
    plan.exercises.forEach(exercise => {
      const key = `${exercise.name}|${exercise.tag}`; // Unique key
      if (!seenExercises.has(key)) {
        seenExercises.add(key);
        if (!poolByTag[exercise.tag]) {
          poolByTag[exercise.tag] = [];
        }
        poolByTag[exercise.tag].push(exercise);
      }
    });
  });

  return poolByTag;
}
```

**Alternatives Considered**:
- **Separate exercise library**: Violates spec assumption, adds complexity
- **Use only exercises from most recent plan**: Too limited, poor user experience
- **Deduplicate by exercise ID**: Would not detect user-created duplicates with same name

**Edge Case Handling**:
- Empty pool (no saved plans): Disable "Generate Random Workout" button, show message "Create workout plans first to build exercise pool"
- Tag has fewer exercises than quota: Show validation warning per FR-003, allow generation with reduced count or prevent

---

## Decision 3: Tag Detection Strategy

**Decision**: Extract tags from exercises in saved plans (dynamic tag discovery)

**Rationale**:
- **Spec assumption**: "Uses existing muscle group tags from CSV data (feature 001). No new tag creation."
- **No hardcoded tags**: Avoids maintenance burden if user adds custom tags in future features
- **Auto-discovery**: Tags appear in quota form automatically as user creates exercises with new tags
- **Flexible**: Works with any tag taxonomy (muscle groups, equipment types, difficulty levels)

**Implementation**:
```javascript
/**
 * Extract all unique tags from exercise pool
 * @param {Object} poolByTag - Exercise pool from buildExercisePool()
 * @returns {Array} - Sorted array of unique tags
 */
function getAvailableTags(poolByTag) {
  return Object.keys(poolByTag).sort();
}
```

**Alternatives Considered**:
- **Hardcoded muscle group list**: Breaks if tags change, violates flexibility
- **Read tags from CSV sample**: Tight coupling to sample data, not extensible

---

## Decision 4: Pin Status Storage

**Decision**: Add `pinStatus` object to WorkoutPlan entity (extends feature 001 data model)

**Rationale**:
- **Spec assumption**: "Pin status stored in workout plan object (extends feature 001 data model). No separate pin storage required."
- **Data locality**: Pin status is plan-specific, belongs with plan data
- **Persistence**: Automatically saved with plan via feature 001's localStorage utilities
- **Simple structure**: `{ exerciseId: true/false }` map

**Data Model Extension**:
```javascript
// Feature 001 WorkoutPlan entity
{
  id: "uuid",
  name: "Monday Chest Day",
  exercises: [{ id, name, sets, reps, weight, rest, tag }],
  createdAt: 1731686400000,
  updatedAt: 1731690000000
}

// Feature 002 adds:
{
  ...existingFields,
  pinStatus: {
    "exercise-id-1": true,  // Pinned
    "exercise-id-2": false  // Not pinned (or omitted)
  },
  isGenerated: true,  // Flag to indicate random generation (optional metadata)
  generationTimestamp: 1731693600000  // When generated (optional metadata)
}
```

**Alternatives Considered**:
- **Pin flag on Exercise entity**: Would require modifying feature 001's Exercise structure, breaks single responsibility
- **Separate localStorage key for pins**: Violates spec assumption, adds sync complexity
- **Array of pinned exercise IDs**: Map structure is more performant for lookups

**Backward Compatibility**: Existing plans without `pinStatus` treat all exercises as unpinned (falsy check)

---

## Decision 5: Reroll History Tracking

**Decision**: Store last 2-3 rerolled exercises in component state (not persisted)

**Rationale**:
- **Spec assumption**: "Avoid recently shown exercises means avoid last 2-3 shown in reroll history, not global tracking. Simple local history sufficient."
- **Session-scoped**: Reroll history only matters during active editing session
- **Lightweight**: Small array (max 3 items) in React component state
- **No persistence needed**: User expectation is that reroll avoidance resets on page reload

**Implementation**:
```javascript
// In PlanForm.jsx component
const [rerollHistory, setRerollHistory] = useState({}); // { exerciseId: [lastExerciseIds] }

function handleReroll(exerciseId, currentTag) {
  const history = rerollHistory[exerciseId] || [];
  const availablePool = exercisePoolByTag[currentTag].filter(ex =>
    ex.id !== exerciseId && !history.includes(ex.id)
  );

  if (availablePool.length === 0) {
    // Fallback: include history if no alternatives
    availablePool = exercisePoolByTag[currentTag].filter(ex => ex.id !== exerciseId);
  }

  const newExercise = selectRandomExercises(availablePool, 1)[0];

  // Update history (keep last 3)
  setRerollHistory({
    ...rerollHistory,
    [exerciseId]: [...history, newExercise.id].slice(-3)
  });

  // Replace exercise in plan
  // ...
}
```

**Alternatives Considered**:
- **Global reroll tracking across all plans**: Over-engineering, no user value
- **Persist reroll history in localStorage**: Unnecessary complexity, violates spec assumption
- **No history tracking**: Poor UX, might show same exercise repeatedly

---

## Decision 6: Quota Template Storage

**Decision**: Store quota templates in separate localStorage key `"workout-quota-templates"`

**Rationale**:
- **Spec assumption**: "Templates stored in localStorage (same pattern as workout plans in feature 001). No cloud sync or export."
- **Separation of concerns**: Templates are independent entities, not part of plan data
- **Reuse feature 001 patterns**: Same localStorage utilities, same error handling, same quota management
- **Simple CRUD**: Load all templates, save all templates (same pattern as PlansStorage)

**Data Model**:
```javascript
// QuotaTemplate entity
{
  id: "uuid",
  name: "Full Body Day",
  quotas: [
    { tag: "Chest", count: 3 },
    { tag: "Legs", count: 2 },
    { tag: "Back", count: 3 }
  ],
  createdAt: 1731686400000
}

// localStorage structure
localStorage.setItem("workout-quota-templates", JSON.stringify([
  { id: "...", name: "Full Body Day", quotas: [...], createdAt: ... },
  { id: "...", name: "Leg Day", quotas: [...], createdAt: ... }
]));
```

**Implementation**:
```javascript
// In src/utils/quotaTemplates.js
const STORAGE_KEY = "workout-quota-templates";

export const QuotaTemplateStorage = {
  loadTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to load quota templates:", error);
      return [];
    }
  },

  saveTemplates(templates) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      return { success: true };
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        return { success: false, error: "quota" };
      }
      return { success: false, error: error.message };
    }
  },

  isAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};
```

**Alternatives Considered**:
- **Store templates in same key as plans**: Mixes concerns, harder to manage
- **IndexedDB for templates**: Over-engineering, localStorage sufficient for simple key-value

---

## Decision 7: Quota Validation Strategy

**Decision**: Validate quotas before generation, show detailed warnings, offer auto-correction

**Rationale**:
- **FR-003**: "System MUST validate that sufficient exercises exist for each tag quota before generating plan"
- **User guidance**: Clear error messages help users understand issue and take action
- **Auto-correction option**: Offer to generate with maximum available if quota exceeds pool

**Validation Rules**:
1. Quota count must be positive integer
2. Tag must exist in exercise pool
3. Sufficient exercises must exist for quota
4. Total quota must be > 0

**Implementation**:
```javascript
/**
 * Validate quotas against exercise pool
 * @param {Array} quotas - [{ tag, count }, ...]
 * @param {Object} poolByTag - Exercise pool by tag
 * @returns {Object} - { valid: boolean, warnings: [...] }
 */
function validateQuotas(quotas, poolByTag) {
  const warnings = [];

  quotas.forEach(({ tag, count }) => {
    if (count <= 0) {
      warnings.push(`Quota for "${tag}" must be positive (got ${count})`);
    }

    if (!poolByTag[tag]) {
      warnings.push(`Tag "${tag}" has no exercises in pool`);
    } else if (poolByTag[tag].length < count) {
      warnings.push(
        `Not enough "${tag}" exercises. Need ${count}, have ${poolByTag[tag].length}. ` +
        `Generate with ${poolByTag[tag].length}?`
      );
    }
  });

  return {
    valid: warnings.length === 0,
    warnings
  };
}
```

**User Experience**:
- Show validation warnings in UI
- Offer "Generate Anyway" button that adjusts quotas to maximum available
- Or "Cancel" to let user modify quotas manually

---

## Decision 8: Regenerate Workflow

**Decision**: "Regenerate Workout" replaces only unpinned exercises, preserves pinned positions

**Rationale**:
- **FR-008**: "System MUST preserve pinned exercises when user triggers 'Regenerate Workout', replacing only unpinned exercises"
- **Position preservation**: Pinned exercises stay in same positions (index maintained)
- **Quota recalculation**: Only unpinned slots count toward quotas

**Implementation**:
```javascript
/**
 * Regenerate workout preserving pinned exercises
 * @param {Object} currentPlan - Existing workout plan
 * @param {Array} quotas - Tag quotas
 * @param {Object} poolByTag - Exercise pool
 * @returns {Object} - New plan with pinned exercises preserved
 */
function regenerateWorkout(currentPlan, quotas, poolByTag) {
  const newExercises = [...currentPlan.exercises]; // Copy array

  // Calculate remaining quotas after accounting for pins
  const remainingQuotas = {};
  quotas.forEach(({ tag, count }) => {
    const pinnedCount = currentPlan.exercises.filter((ex, idx) =>
      currentPlan.pinStatus?.[ex.id] && ex.tag === tag
    ).length;
    remainingQuotas[tag] = Math.max(0, count - pinnedCount);
  });

  // Generate new exercises for unpinned slots
  const newPool = generateExercisesByQuotas(remainingQuotas, poolByTag);

  // Replace unpinned exercises
  let poolIndex = 0;
  newExercises.forEach((ex, idx) => {
    if (!currentPlan.pinStatus?.[ex.id]) {
      newExercises[idx] = newPool[poolIndex++];
    }
  });

  return {
    ...currentPlan,
    exercises: newExercises,
    updatedAt: Date.now()
  };
}
```

**Edge Cases**:
- All exercises pinned: Show warning "All exercises pinned, nothing to regenerate"
- Quotas can't be met due to pins: Show warning with details

---

## Decision 9: UI Layout & Integration

**Decision**: Add "Generate Random Workout" button to PlanList, quota form as modal

**Rationale**:
- **Spec assumption**: "Random generation accessible from plan list view (new 'Generate Random Workout' button). Quota input can be inline form or modal."
- **Modal choice**: Keeps quota form focused, avoids cluttering plan list
- **Consistent with feature 001**: PlanForm already uses modal-like workflow (separate view state)
- **Mobile-friendly**: Modal works well on small screens

**UI Flow**:
1. User clicks "Generate Random Workout" in PlanList
2. Modal opens with QuotaForm (tag selectors + count inputs) + QuotaTemplateManager (load saved templates)
3. User sets quotas or loads template
4. User clicks "Generate"
5. Validation runs, shows warnings if needed
6. On success, creates new plan and opens PlanForm in edit mode with reroll/pin UI
7. User can reroll individual exercises, pin favorites
8. User saves plan normally

**Reroll/Pin UI Location**:
- Add inline buttons to each exercise row in PlanForm:
  - "🔄 Reroll" button (disabled if only 1 exercise in pool for that tag)
  - "📌 Pin" toggle (visual indicator: filled vs outline icon)

---

## Decision 10: Sets/Reps/Weight Inheritance

**Decision**: Copy sets, reps, weight, rest from source exercise in pool (prefer consistency)

**Rationale**:
- **Spec assumption**: "Generated exercises use default values (user can edit after generation) or copy from source exercise in pool. Prefer copying from source for consistency."
- **User expectation**: If user has "Bench Press" with "4 sets, 8-10 reps, 185 lbs" in saved plan, generated plan should inherit those values
- **Consistency**: User's saved data reflects their actual workout parameters
- **Editable after generation**: User can modify in PlanForm if needed

**Implementation**:
```javascript
/**
 * Select random exercise and copy all properties
 * @param {Array} pool - Available exercises for tag
 * @param {Array} excludeIds - Exercise IDs to avoid
 * @returns {Object} - New exercise object (deep copy)
 */
function selectExercise(pool, excludeIds = []) {
  const available = pool.filter(ex => !excludeIds.includes(ex.id));
  const selected = selectRandomExercises(available, 1)[0];

  return {
    id: crypto.randomUUID(), // New ID for generated plan
    name: selected.name,
    sets: selected.sets,
    reps: selected.reps,
    weight: selected.weight || "",
    rest: selected.rest || "",
    tag: selected.tag
  };
}
```

**Alternatives Considered**:
- **Default values**: Less useful, user would need to edit every exercise
- **Prompt user for defaults**: Adds friction to generation workflow

---

## Decision 11: Generated Plan Naming

**Decision**: Auto-generate name as "Random Workout - [date]", allow user to rename in PlanForm

**Rationale**:
- **Spec assumption**: "Auto-generate name like 'Random Workout - [date]' or prompt user to name plan after generation. Prefer auto-naming for faster workflow."
- **Speed**: Reduces friction, user can generate plan in <30s per SC-001
- **Uniqueness**: Date ensures distinct names
- **Editable**: User can rename in PlanForm before saving

**Implementation**:
```javascript
/**
 * Generate default plan name with timestamp
 * @returns {string} - Plan name
 */
function generatePlanName() {
  const date = new Date();
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return `Random Workout - ${formatted}`;
}
// Example: "Random Workout - Nov 15, 2025"
```

**Alternatives Considered**:
- **Prompt user for name**: Slows down workflow, may not meet SC-001 (<30s)
- **Include quota summary in name**: Too verbose ("Random Workout - Chest: 3, Legs: 2, Back: 2")

---

## Performance Considerations

### Randomization Performance
- **Fisher-Yates shuffle**: O(n) where n = pool size
- **Typical pool size**: 50-100 exercises
- **Expected time**: <1ms for shuffle, <2ms total for generation
- **Meets SC-003**: Reroll operation <2s ✅

### localStorage Performance
- **Quota template storage**: ~1-2KB per template, negligible overhead
- **Pin status storage**: ~50 bytes per plan, negligible overhead
- **Expected operations**: <10ms read, <50ms write (same as feature 001)
- **Meets SC-004**: Pin toggle <100ms ✅
- **Meets SC-008**: Template load <10s ✅

### Component Rendering Performance
- **QuotaForm**: Simple controlled inputs, no heavy computation
- **Reroll button**: Updates single exercise in array, React efficiently re-renders
- **Pin toggle**: Updates pinStatus object, minimal re-render
- **Expected**: <16ms per interaction (60fps), meets SC-004 (<100ms) ✅

---

## Error Handling

### localStorage Errors
- **QuotaExceededError**: Show message "Storage limit reached. Delete old plans or templates."
- **Private browsing**: Warning banner "Quota templates will not be saved between sessions."
- **JSON parse errors**: Log error, return empty array, show notification "Failed to load templates."

### Validation Errors
- **Empty exercise pool**: Disable "Generate Random Workout" button, show empty state "Create workout plans first to build exercise pool"
- **Quota exceeds pool**: Show warning with auto-correction option per Decision 7
- **Invalid quota input**: Inline validation prevents negative/zero/non-integer values

### Edge Cases
- **Reroll with no alternatives**: Disable reroll button, show tooltip "No other exercises available"
- **All exercises pinned**: Disable "Regenerate Workout" button or show warning
- **Tag no longer exists**: Remove invalid tags from quota template, show notification

---

## Dependencies on Feature 001

### Required Feature 001 Entities
- **WorkoutPlan**: Base structure for generated plans
- **Exercise**: Entity structure with name, sets, reps, weight, rest, tag
- **PlansStorage utilities**: Load/save plans to localStorage

### Required Feature 001 Components
- **PlanForm**: Will be modified to add reroll/pin UI
- **PlanList**: Will be modified to add "Generate Random Workout" button
- **localStorage.js utilities**: Will be extended for quota templates

### Assumptions
- Feature 001 is fully implemented and tested
- Exercises in saved plans have `tag` field (muscle group)
- PlansStorage.loadPlans() and PlansStorage.savePlans() work as documented
- Workout plans persist across browser sessions via localStorage

---

## Summary of Technical Decisions

| Decision | Choice | Key Rationale |
|----------|--------|---------------|
| Randomization Algorithm | Fisher-Yates shuffle | Uniform distribution, O(n), no duplicates |
| Exercise Pool Source | Extract from saved plans | Aligns with spec, no duplication |
| Tag Detection | Dynamic discovery | Flexible, no hardcoded tags |
| Pin Status Storage | In WorkoutPlan.pinStatus object | Data locality, spec assumption |
| Reroll History | Component state (last 2-3) | Session-scoped, spec assumption |
| Quota Template Storage | localStorage key "workout-quota-templates" | Separation of concerns, reuse patterns |
| Quota Validation | Pre-generation with auto-correction | FR-003, user guidance |
| Regenerate Workflow | Preserve pinned positions | FR-008, natural UX |
| UI Layout | Modal for quota form | Mobile-friendly, focused |
| Sets/Reps Inheritance | Copy from source exercise | Spec assumption, consistency |
| Plan Naming | Auto-generate "Random Workout - [date]" | Spec assumption, speed |

All decisions align with constitutional principles (no new dependencies, simple architecture, performance-first, Bun-compatible).
