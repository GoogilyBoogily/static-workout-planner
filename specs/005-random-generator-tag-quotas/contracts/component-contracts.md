# Component Contracts: Random Exercise Generator with Tag Quotas

**Feature**: 002-random-generator-tag-quotas
**Phase**: Phase 1 - Design
**Date**: 2025-11-15

## Overview

This document defines the interface contracts for all React components and utility modules in feature 002. Each contract specifies props, behaviors, state management, and integration points.

---

## Components

### 1. QuotaForm.jsx

**Purpose**: Input form for configuring tag quotas before generating random workout.

**Props**:
```typescript
{
  availableTags: string[],              // Tags from exercise pool, e.g., ["Chest", "Legs", "Back"]
  exercisePool: { [tag: string]: Exercise[] }, // Exercise pool for validation
  quotaTemplates: QuotaTemplate[],      // Saved quota templates for dropdown
  onGenerate: (quotas: TagQuota[]) => void,  // Callback when user clicks "Generate"
  onCancel: () => void,                 // Callback when user clicks "Cancel"
  onSaveTemplate: (template: QuotaTemplate) => void // Callback when user saves template
}
```

**State**:
```javascript
const [quotas, setQuotas] = useState([])  // Array<{ tag: string, count: number }>
const [selectedTemplate, setSelectedTemplate] = useState(null) // QuotaTemplate | null
const [validationErrors, setValidationErrors] = useState([])   // string[]
const [showTemplateSave, setShowTemplateSave] = useState(false) // boolean
```

**Behavior**:

1. **Initial Render**:
   - Display tag selector dropdown (populated from `availableTags`)
   - "Add Tag" button to add new quota row
   - "Load Template" dropdown (if `quotaTemplates.length > 0`)
   - "Generate" button (primary action)
   - "Cancel" button

2. **Add Quota**:
   - User clicks "Add Tag"
   - New quota row appears with tag dropdown + count input
   - Default count: 1
   - User selects tag and enters count
   - Validate: count must be positive integer, tag must not be duplicate

3. **Load Template**:
   - User selects template from dropdown
   - `setQuotas(selectedTemplate.quotas)`
   - Pre-fill quota inputs with template values
   - User can modify before generating

4. **Validation**:
   - On "Generate" click, validate all quotas:
     - Each tag must exist in `exercisePool`
     - Each count must be positive integer
     - `exercisePool[tag].length >= count` (show warning if insufficient)
   - If valid: call `onGenerate(quotas)`
   - If invalid: display `validationErrors` in UI, prevent generation

5. **Save Template**:
   - User clicks "Save as Template" button
   - Prompt for template name (input field + "Save" button)
   - Validate template name (required, 1-50 chars)
   - Call `onSaveTemplate({ id: UUID, name, quotas, createdAt: now })`
   - Close template save UI, show success message

**Validation Rules**:
- At least 1 quota required
- Tag must exist in `availableTags`
- Count must be positive integer (>= 1)
- No duplicate tags in quota list

**Example Render**:
```
┌─────────────────────────────────────┐
│ Generate Random Workout             │
├─────────────────────────────────────┤
│ Load Template: [Dropdown ▼]        │
│                                     │
│ Tag Quotas:                         │
│ [Chest ▼]  Count: [3]  [Remove]    │
│ [Legs  ▼]  Count: [2]  [Remove]    │
│ [Back  ▼]  Count: [3]  [Remove]    │
│                                     │
│ [+ Add Tag]                         │
│                                     │
│ [Save as Template]                  │
│                                     │
│ [Cancel]  [Generate]                │
└─────────────────────────────────────┘
```

**Error Display**:
```
⚠️ Not enough "Chest" exercises. Need 5, have 3.
⚠️ Tag "Arms" has no exercises in pool.
```

---

### 2. QuotaTemplateManager.jsx

**Purpose**: Manage saved quota templates (load, delete).

**Props**:
```typescript
{
  templates: QuotaTemplate[],           // All saved quota templates
  onLoad: (template: QuotaTemplate) => void,  // Callback when template selected
  onDelete: (templateId: string) => void,     // Callback when template deleted
  onSave: (template: QuotaTemplate) => void   // Callback when new template saved
}
```

**State**:
```javascript
const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // templateId | null
```

**Behavior**:

1. **Display Templates**:
   - List all templates with name and creation date
   - Each template has "Load" and "Delete" buttons

2. **Load Template**:
   - User clicks "Load" on template
   - Call `onLoad(template)`
   - Parent component (QuotaForm) populates quota inputs

3. **Delete Template**:
   - User clicks "Delete" on template
   - Show confirmation dialog: "Delete template '[name]'?"
   - If confirmed: call `onDelete(template.id)`
   - If cancelled: close dialog

**Example Render** (within QuotaForm):
```
┌─────────────────────────────────────┐
│ Saved Templates:                    │
├─────────────────────────────────────┤
│ Full Body Day                       │
│ Created: Nov 10, 2025               │
│ [Load] [Delete]                     │
├─────────────────────────────────────┤
│ Upper Body                          │
│ Created: Nov 12, 2025               │
│ [Load] [Delete]                     │
└─────────────────────────────────────┘
```

**Integration**: Typically rendered within QuotaForm or as collapsible section.

---

### 3. PlanList.jsx (Modified from Feature 001)

**Purpose**: Display all saved workout plans with "Generate Random Workout" button.

**New Props** (in addition to feature 001 props):
```typescript
{
  // Feature 001 props (existing)
  plans: WorkoutPlan[],
  onCreate: () => void,
  onEdit: (planId: string) => void,
  onDelete: (planId: string) => void,
  onView: (planId: string) => void,

  // Feature 002 addition
  onGenerateRandom: () => void  // Callback when "Generate Random Workout" clicked
}
```

**Behavior Changes**:

1. **Add "Generate Random Workout" Button**:
   - Rendered next to "Create New Plan" button
   - Disabled if exercise pool is empty (no saved plans)
   - Tooltip when disabled: "Create workout plans first to build exercise pool"
   - On click: call `onGenerateRandom()`

2. **Visual Indicator for Generated Plans** (optional):
   - Plans with `isGenerated: true` can show icon (e.g., "🎲") or badge
   - Helps user distinguish generated vs manually created plans

**Example Render**:
```
┌─────────────────────────────────────┐
│ My Workout Plans                    │
├─────────────────────────────────────┤
│ [Create New Plan]  [🎲 Generate Random] │
├─────────────────────────────────────┤
│ 🎲 Random Workout - Nov 15, 2025    │
│ 7 exercises • 2 hours ago           │
│ [View] [Edit] [Delete]              │
├─────────────────────────────────────┤
│ Monday Chest Day                    │
│ 5 exercises • 3 days ago            │
│ [View] [Edit] [Delete]              │
└─────────────────────────────────────┘
```

**No Changes**: Existing feature 001 behavior (plan list rendering, sorting, timestamps) remains unchanged.

---

### 4. PlanForm.jsx (Modified from Feature 001)

**Purpose**: Create/edit workout plan with reroll/pin UI for generated plans.

**New Props** (in addition to feature 001 props):
```typescript
{
  // Feature 001 props (existing)
  plan: WorkoutPlan | null,     // null for create, WorkoutPlan for edit
  onSave: (plan: WorkoutPlan) => void,
  onCancel: () => void,

  // Feature 002 additions
  exercisePool: { [tag: string]: Exercise[] }, // For reroll functionality
  isGenerated: boolean          // Whether plan is generated (show reroll/pin UI)
}
```

**New State** (in addition to feature 001 state):
```javascript
// Feature 001 state (existing)
const [planName, setPlanName] = useState("")
const [exercises, setExercises] = useState([])

// Feature 002 additions
const [rerollHistory, setRerollHistory] = useState({}) // { exerciseId: [recentIds] }
const [pinStatus, setPinStatus] = useState({})         // { exerciseId: boolean }
const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
```

**Behavior Changes**:

1. **Reroll Button** (shown if `isGenerated === true`):
   - Rendered inline next to each exercise in exercise list
   - Icon: "🔄" or "Reroll" text
   - Disabled if only 1 exercise exists in `exercisePool[tag]`
   - Tooltip when disabled: "No other [tag] exercises available"
   - On click: `handleReroll(exerciseId, tag)`

2. **Pin Toggle** (shown if `isGenerated === true`):
   - Rendered inline next to each exercise
   - Icon: "📌" (filled if pinned, outline if unpinned)
   - On click: `handlePinToggle(exerciseId)`
   - Visual feedback: icon updates immediately (<100ms)

3. **Regenerate Workout Button** (shown if `isGenerated === true`):
   - Rendered at bottom of exercise list
   - Label: "🔄 Regenerate Workout"
   - Disabled if all exercises are pinned
   - Tooltip when disabled: "All exercises are pinned"
   - On click: show confirmation dialog
   - Confirmation: "Regenerate workout? Unpinned exercises will be replaced."
   - If confirmed: `handleRegenerate()`

4. **Reroll Logic**:
   ```javascript
   function handleReroll(exerciseId, tag) {
     const history = rerollHistory[exerciseId] || [];
     const currentExercise = exercises.find(ex => ex.id === exerciseId);

     // Filter pool: exclude current + recent history
     let availablePool = exercisePool[tag].filter(ex =>
       ex.name !== currentExercise.name && !history.includes(ex.name)
     );

     // Fallback: if no alternatives, include history
     if (availablePool.length === 0) {
       availablePool = exercisePool[tag].filter(ex => ex.name !== currentExercise.name);
     }

     if (availablePool.length === 0) {
       alert("No other exercises available for this tag");
       return;
     }

     // Select random exercise
     const newExercise = selectRandomExercises(availablePool, 1)[0];

     // Copy properties + generate new ID
     const replacementExercise = {
       id: crypto.randomUUID(),
       name: newExercise.name,
       sets: newExercise.sets,
       reps: newExercise.reps,
       weight: newExercise.weight || "",
       rest: newExercise.rest || "",
       tag: newExercise.tag
     };

     // Update exercises array
     const updatedExercises = exercises.map(ex =>
       ex.id === exerciseId ? replacementExercise : ex
     );
     setExercises(updatedExercises);

     // Update reroll history (keep last 3)
     setRerollHistory({
       ...rerollHistory,
       [exerciseId]: [...history, newExercise.name].slice(-3)
     });
   }
   ```

5. **Pin Logic**:
   ```javascript
   function handlePinToggle(exerciseId) {
     setPinStatus({
       ...pinStatus,
       [exerciseId]: !pinStatus[exerciseId]
     });
   }
   ```

6. **Regenerate Logic**:
   ```javascript
   function handleRegenerate() {
     // Calculate remaining quotas (excluding pinned exercises)
     const quotasByTag = {}; // Extract from original generation
     const pinnedExercises = exercises.filter(ex => pinStatus[ex.id]);

     pinnedExercises.forEach(ex => {
       quotasByTag[ex.tag] = (quotasByTag[ex.tag] || 0) + 1;
     });

     // Generate new exercises for unpinned slots
     const newExercises = [...exercises];
     exercises.forEach((ex, idx) => {
       if (!pinStatus[ex.id]) {
         const availablePool = exercisePool[ex.tag].filter(poolEx =>
           !newExercises.some(newEx => newEx.name === poolEx.name)
         );
         const replacement = selectRandomExercises(availablePool, 1)[0];
         if (replacement) {
           newExercises[idx] = {
             id: crypto.randomUUID(),
             name: replacement.name,
             sets: replacement.sets,
             reps: replacement.reps,
             weight: replacement.weight || "",
             rest: replacement.rest || "",
             tag: replacement.tag
           };
         }
       }
     });

     setExercises(newExercises);
     setShowRegenerateConfirm(false);
   }
   ```

7. **Save Plan**:
   - When saving, include `pinStatus` in plan object:
     ```javascript
     const planToSave = {
       ...plan,
       name: planName,
       exercises,
       pinStatus,
       updatedAt: Date.now()
     };
     onSave(planToSave);
     ```

**Example Render** (generated plan):
```
┌─────────────────────────────────────┐
│ Edit Plan: Random Workout - Nov 15  │
├─────────────────────────────────────┤
│ Plan Name: [Random Workout - Nov 15]│
│                                     │
│ Exercises:                          │
│ 1. Bench Press                      │
│    4 sets • 8-10 reps • 185 lbs     │
│    [🔄 Reroll] [📌 Pinned] [Edit]   │
├─────────────────────────────────────┤
│ 2. Squats                           │
│    4 sets • 6-8 reps • 225 lbs      │
│    [🔄 Reroll] [📍 Pin] [Edit]      │
├─────────────────────────────────────┤
│ 3. Pull-ups                         │
│    3 sets • AMRAP • BW              │
│    [🔄 Reroll] [📌 Pinned] [Edit]   │
├─────────────────────────────────────┤
│                                     │
│ [+ Add Exercise] [🔄 Regenerate]    │
│                                     │
│ [Cancel] [Save Plan]                │
└─────────────────────────────────────┘
```

**No Changes**: Existing feature 001 behavior (add exercise, edit exercise, remove exercise, reorder) remains unchanged. Reroll/pin UI only appears for generated plans.

---

## Utility Modules

### 5. randomGenerator.js

**Purpose**: Random exercise selection and workout generation logic.

**Exports**:

```javascript
/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array (original not mutated)
 */
export function shuffleArray(array) { ... }

/**
 * Select N random exercises from pool
 * @param {Array} pool - Available exercises
 * @param {number} count - Number to select
 * @param {Array} excludeIds - Exercise IDs to exclude (optional)
 * @returns {Array} - Selected exercises
 */
export function selectRandomExercises(pool, count, excludeIds = []) { ... }

/**
 * Generate workout plan from tag quotas
 * @param {Array} quotas - Array of { tag, count }
 * @param {Object} exercisePool - Map of tag -> exercises
 * @returns {Object} - { exercises: [...], errors: [...] }
 */
export function generateWorkoutPlan(quotas, exercisePool) { ... }

/**
 * Build exercise pool from all saved workout plans
 * @param {Array} plans - All workout plans
 * @returns {Object} - Map of tag -> exercises array
 */
export function buildExercisePool(plans) { ... }

/**
 * Get all unique tags from exercise pool
 * @param {Object} poolByTag - Exercise pool from buildExercisePool()
 * @returns {Array} - Sorted array of unique tags
 */
export function getAvailableTags(poolByTag) { ... }

/**
 * Regenerate workout preserving pinned exercises
 * @param {Object} currentPlan - Existing workout plan with pinStatus
 * @param {Object} exercisePool - Exercise pool by tag
 * @returns {Object} - Updated plan with regenerated exercises
 */
export function regenerateWorkout(currentPlan, exercisePool) { ... }
```

**Implementation Notes**:
- All functions are pure (no side effects)
- Array mutations avoided (use spread operator for copies)
- crypto.randomUUID() for generating new exercise IDs
- Math.random() for randomization (sufficient for this use case)

---

### 6. quotaTemplates.js

**Purpose**: CRUD operations for quota templates in localStorage.

**Exports**:

```javascript
/**
 * QuotaTemplateStorage utility object
 */
export const QuotaTemplateStorage = {
  /**
   * Load all quota templates from localStorage
   * @returns {Array} - Array of QuotaTemplate objects (empty array if none)
   */
  loadTemplates() { ... },

  /**
   * Save quota templates to localStorage
   * @param {Array} templates - Array of QuotaTemplate objects
   * @returns {Object} - { success: boolean, error?: string }
   */
  saveTemplates(templates) { ... },

  /**
   * Check if localStorage is available (not private browsing)
   * @returns {boolean} - True if available
   */
  isAvailable() { ... }
};
```

**localStorage Key**: `"workout-quota-templates"`

**Error Handling**:
- JSON parse errors: Return empty array, log error
- QuotaExceededError: Return `{ success: false, error: "quota" }`
- Private browsing: `isAvailable()` returns false

**Implementation** (similar to feature 001's PlansStorage):
```javascript
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

---

### 7. validation.js (Modified from Feature 001)

**Purpose**: Form validation utilities.

**New Exports** (in addition to feature 001 validation):

```javascript
/**
 * Validate tag quota object
 * @param {Object} quota - { tag, count }
 * @param {Array} availableTags - List of valid tags
 * @returns {Array} - Array of error messages (empty if valid)
 */
export function validateTagQuota(quota, availableTags) { ... }

/**
 * Validate quota array against exercise pool
 * @param {Array} quotas - Array of { tag, count }
 * @param {Object} exercisePool - Map of tag -> exercises
 * @returns {Object} - { valid: boolean, warnings: string[] }
 */
export function validateQuotas(quotas, exercisePool) { ... }

/**
 * Validate quota template
 * @param {Object} template - QuotaTemplate object
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateQuotaTemplate(template) { ... }
```

**Validation Rules**:
- Tag must be non-empty string
- Count must be positive integer (>= 1)
- Tag must exist in available tags
- Exercise pool must have sufficient exercises for quota

---

### 8. localStorage.js (Modified from Feature 001)

**Purpose**: localStorage utilities for workout plans.

**No New Exports**: Feature 002 uses separate `quotaTemplates.js` for template storage.

**Modification**: Ensure `PlansStorage.savePlans()` and `PlansStorage.loadPlans()` handle new WorkoutPlan properties (`pinStatus`, `isGenerated`, `generationTimestamp`) gracefully.

**Backward Compatibility**:
```javascript
// In PlansStorage.loadPlans()
function loadPlans() {
  try {
    const data = localStorage.getItem("workout-plans");
    const plans = data ? JSON.parse(data) : [];

    // Ensure backward compatibility: add default values for missing properties
    return plans.map(plan => ({
      ...plan,
      pinStatus: plan.pinStatus || {},
      isGenerated: plan.isGenerated || false,
      generationTimestamp: plan.generationTimestamp || null
    }));
  } catch (error) {
    console.error("Failed to load plans:", error);
    return [];
  }
}
```

---

## Integration Points

### App.jsx State Management

**New State Variables**:
```javascript
const [quotaFormOpen, setQuotaFormOpen] = useState(false)
const [exercisePool, setExercisePool] = useState({})
const [quotaTemplates, setQuotaTemplates] = useState([])
```

**New Handlers**:
```javascript
function handleGenerateRandom() {
  setQuotaFormOpen(true);
}

function handleQuotaGenerate(quotas) {
  const result = generateWorkoutPlan(quotas, exercisePool);

  if (result.errors.length > 0) {
    alert(result.errors.join("\n"));
    return;
  }

  const newPlan = {
    id: crypto.randomUUID(),
    name: generatePlanName(),
    exercises: result.exercises,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinStatus: {},
    isGenerated: true,
    generationTimestamp: Date.now()
  };

  setSelectedPlan(newPlan);
  setCurrentView("edit");
  setQuotaFormOpen(false);
}

function handleSaveQuotaTemplate(template) {
  const updatedTemplates = [...quotaTemplates, template];
  const result = QuotaTemplateStorage.saveTemplates(updatedTemplates);

  if (result.success) {
    setQuotaTemplates(updatedTemplates);
    alert("Template saved successfully");
  } else {
    alert("Failed to save template: " + result.error);
  }
}

function handleDeleteQuotaTemplate(templateId) {
  const updatedTemplates = quotaTemplates.filter(t => t.id !== templateId);
  QuotaTemplateStorage.saveTemplates(updatedTemplates);
  setQuotaTemplates(updatedTemplates);
}
```

**Component Hierarchy**:
```
App.jsx
├─ PlanList.jsx (modified: onGenerateRandom prop)
│  └─ "Generate Random Workout" button
├─ QuotaForm.jsx (new: modal for quota input)
│  ├─ Tag quota inputs
│  └─ QuotaTemplateManager.jsx (new: template CRUD)
├─ PlanForm.jsx (modified: reroll/pin UI)
│  └─ Exercise list with reroll/pin buttons
└─ PlanDetail.jsx (no changes)
```

---

## Summary

### New Components
1. **QuotaForm**: Quota input form with template management
2. **QuotaTemplateManager**: Template CRUD UI

### Modified Components
1. **PlanList**: Added "Generate Random Workout" button
2. **PlanForm**: Added reroll/pin UI for generated plans

### New Utilities
1. **randomGenerator.js**: Random selection and generation logic
2. **quotaTemplates.js**: localStorage utilities for templates

### Modified Utilities
1. **validation.js**: Added quota validation functions
2. **localStorage.js**: Ensured backward compatibility for new plan properties

### Integration
- App.jsx manages quota form state, exercise pool, quota templates
- All components follow existing patterns from feature 001
- Backward compatibility maintained (existing plans work without changes)
