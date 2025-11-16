# Data Model: Random Exercise Generator with Tag Quotas

**Feature**: 002-random-generator-tag-quotas
**Phase**: Phase 1 - Design
**Date**: 2025-11-15

## Overview

This document defines the data entities, state model, and validation rules for random workout generation with tag quotas, exercise pinning, and quota templates. All entities extend or integrate with feature 001's data model.

---

## Entities

### 1. Quota Template

Saved configuration of tag quotas for quick reuse.

**Properties**:
```javascript
{
  id: string,              // UUID v4 (crypto.randomUUID())
  name: string,            // User-provided template name, e.g., "Full Body Day"
  quotas: Array<TagQuota>, // Array of tag quota objects
  createdAt: number        // Unix timestamp (milliseconds)
}
```

**TagQuota Structure**:
```javascript
{
  tag: string,   // Tag name, e.g., "Chest", "Legs", "Back"
  count: number  // Number of exercises to include, e.g., 3
}
```

**Example**:
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Full Body Day",
  quotas: [
    { tag: "Chest", count: 3 },
    { tag: "Legs", count: 2 },
    { tag: "Back", count: 3 },
    { tag: "Shoulders", count: 2 }
  ],
  createdAt: 1731686400000
}
```

**Validation Rules**:
- `name`: Required, 1-50 characters, not whitespace-only
- `quotas`: Required, non-empty array, at least 1 quota
- `quotas[].tag`: Required, non-empty string, must exist in exercise pool at generation time
- `quotas[].count`: Required, positive integer (>= 1)
- `id`: Auto-generated UUID v4
- `createdAt`: Auto-generated timestamp

**Relationships**:
- No direct relationship to WorkoutPlan (templates are independent)
- Quotas reference tags that exist in exercise pool (dynamic validation)

---

### 2. Exercise Pool (Derived Entity)

Runtime-constructed map of exercises grouped by tag. Not persisted separately; derived from saved workout plans.

**Structure**:
```javascript
{
  [tag: string]: Array<Exercise>
}
```

**Example**:
```javascript
{
  "Chest": [
    { id: "...", name: "Bench Press", sets: 4, reps: "8-10", weight: "185 lbs", rest: "90 sec", tag: "Chest" },
    { id: "...", name: "Incline Dumbbell Press", sets: 3, reps: "10-12", weight: "70 lbs", rest: "60 sec", tag: "Chest" },
    { id: "...", name: "Cable Flyes", sets: 3, reps: "12-15", weight: "40 lbs", rest: "45 sec", tag: "Chest" }
  ],
  "Legs": [
    { id: "...", name: "Squats", sets: 4, reps: "6-8", weight: "225 lbs", rest: "120 sec", tag: "Legs" },
    { id: "...", name: "Leg Press", sets: 3, reps: "10-12", weight: "400 lbs", rest: "90 sec", tag: "Legs" }
  ]
}
```

**Construction Logic**:
1. Load all workout plans from feature 001 localStorage
2. Iterate through all exercises in all plans
3. Deduplicate by `name|tag` key (same exercise in multiple plans counted once)
4. Group by `tag` field
5. Return map of `tag -> Exercise[]`

**Validation**:
- Pool is valid if it contains at least 1 exercise
- Tags are extracted dynamically (no hardcoded tag list)
- Exercises without `tag` field are excluded (defensive check)

---

### 3. Generated Workout Plan (Extends Feature 001 WorkoutPlan)

Workout plan created through random generation. Inherits all properties from feature 001's WorkoutPlan entity with additional metadata.

**Extended Properties**:
```javascript
{
  // Feature 001 properties
  id: string,                 // UUID v4
  name: string,               // "Random Workout - Nov 15, 2025" (auto-generated)
  exercises: Array<Exercise>, // Array of randomly selected exercises
  createdAt: number,          // Unix timestamp
  updatedAt: number,          // Unix timestamp

  // Feature 002 additions
  pinStatus: {                // Map of exercise ID -> pin state
    [exerciseId: string]: boolean
  },
  isGenerated: boolean,       // Flag to indicate random generation (optional)
  generationTimestamp: number // When generated (optional)
}
```

**Example**:
```javascript
{
  id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  name: "Random Workout - Nov 15, 2025",
  exercises: [
    { id: "ex-1", name: "Bench Press", sets: 4, reps: "8-10", weight: "185 lbs", rest: "90 sec", tag: "Chest" },
    { id: "ex-2", name: "Squats", sets: 4, reps: "6-8", weight: "225 lbs", rest: "120 sec", tag: "Legs" },
    { id: "ex-3", name: "Pull-ups", sets: 3, reps: "AMRAP", weight: "BW", rest: "90 sec", tag: "Back" }
  ],
  createdAt: 1731686400000,
  updatedAt: 1731686400000,
  pinStatus: {
    "ex-1": true,   // Bench Press is pinned
    "ex-2": false,  // Squats is not pinned (or omitted)
    "ex-3": true    // Pull-ups is pinned
  },
  isGenerated: true,
  generationTimestamp: 1731686400000
}
```

**Validation Rules** (in addition to feature 001 validation):
- `pinStatus`: Optional object, keys must be valid exercise IDs from `exercises` array
- `pinStatus[exerciseId]`: Boolean (true = pinned, false/omitted = unpinned)
- `isGenerated`: Optional boolean, defaults to false
- `generationTimestamp`: Optional number, Unix timestamp

**Backward Compatibility**:
- Plans created by feature 001 do not have `pinStatus`, `isGenerated`, or `generationTimestamp`
- All feature 002 logic treats missing `pinStatus` as empty object (all unpinned)
- Feature 001 components ignore feature 002 properties (no breaking changes)

---

## State Model

### Application State (App.jsx)

Extends feature 001 state with random generation workflow.

**State Variables**:
```javascript
// Feature 001 state (existing)
const [plans, setPlans] = useState([])               // All saved workout plans
const [currentView, setCurrentView] = useState("list") // "list"|"create"|"edit"|"detail"
const [selectedPlan, setSelectedPlan] = useState(null) // Plan being edited/viewed

// Feature 002 additions
const [quotaFormOpen, setQuotaFormOpen] = useState(false) // Quota modal visibility
const [exercisePool, setExercisePool] = useState({})     // Derived exercise pool (tag -> exercises)
const [quotaTemplates, setQuotaTemplates] = useState([]) // Saved quota templates
```

**State Transitions**:

1. **App Load** (feature 001 + feature 002):
   ```
   useEffect(() => {
     const loadedPlans = PlansStorage.loadPlans()
     setPlans(loadedPlans)

     const pool = buildExercisePool(loadedPlans)
     setExercisePool(pool)

     const templates = QuotaTemplateStorage.loadTemplates()
     setQuotaTemplates(templates)
   }, [])
   ```

2. **Generate Random Workout** (new workflow):
   ```
   User clicks "Generate Random Workout" (PlanList)
   → setQuotaFormOpen(true)
   → User sets quotas in QuotaForm
   → User clicks "Generate"
   → validateQuotas(quotas, exercisePool)
   → generateWorkoutPlan(quotas, exercisePool)
   → setSelectedPlan(newPlan)
   → setCurrentView("edit")
   → setQuotaFormOpen(false)
   ```

3. **Reroll Exercise** (within PlanForm):
   ```
   User clicks "Reroll" on exercise
   → handleReroll(exerciseId, currentTag)
   → selectRandomExercises(pool[currentTag], 1, rerollHistory)
   → Update selectedPlan.exercises[index]
   → setSelectedPlan({ ...selectedPlan })
   ```

4. **Pin/Unpin Exercise** (within PlanForm):
   ```
   User clicks "Pin" toggle on exercise
   → handlePinToggle(exerciseId)
   → Update selectedPlan.pinStatus[exerciseId] = !current
   → setSelectedPlan({ ...selectedPlan })
   ```

5. **Regenerate Workout** (within PlanForm):
   ```
   User clicks "Regenerate Workout"
   → regenerateWorkout(selectedPlan, quotas, exercisePool)
   → Preserves pinned exercises, replaces unpinned
   → setSelectedPlan(regeneratedPlan)
   ```

6. **Save Quota Template** (within QuotaForm):
   ```
   User clicks "Save Template"
   → createQuotaTemplate(name, quotas)
   → updatedTemplates = [...quotaTemplates, newTemplate]
   → QuotaTemplateStorage.saveTemplates(updatedTemplates)
   → setQuotaTemplates(updatedTemplates)
   ```

### Component State

**QuotaForm.jsx**:
```javascript
const [quotas, setQuotas] = useState([])        // Current quota configuration
const [selectedTemplate, setSelectedTemplate] = useState(null) // Loaded template
const [validationErrors, setValidationErrors] = useState([])   // Validation warnings
```

**PlanForm.jsx** (extends feature 001):
```javascript
// Feature 001 state (existing)
const [planName, setPlanName] = useState("")
const [exercises, setExercises] = useState([])

// Feature 002 additions
const [rerollHistory, setRerollHistory] = useState({}) // { exerciseId: [lastExerciseIds] }
const [pinStatus, setPinStatus] = useState({})         // { exerciseId: boolean }
```

**QuotaTemplateManager.jsx**:
```javascript
const [templates, setTemplates] = useState([]) // All saved templates
const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // Template ID to delete
```

---

## Data Flow

### Generation Flow

```
User Action: Click "Generate Random Workout"
  ↓
QuotaForm Opens
  ← Load available tags from exercisePool
  ← Load saved templates from quotaTemplates
  ↓
User Action: Set quotas or load template
  ↓
User Action: Click "Generate"
  ↓
Validation: validateQuotas(quotas, exercisePool)
  ↓
  ├─ Valid → Generate Plan
  │    ↓
  │    generateWorkoutPlan(quotas, exercisePool)
  │      ├─ For each quota: selectRandomExercises(pool[tag], count)
  │      ├─ Create new WorkoutPlan with generated exercises
  │      ├─ Set isGenerated = true, generationTimestamp = now
  │      └─ Return new plan
  │    ↓
  │    Open PlanForm in "edit" mode with newPlan
  │    ↓
  │    User can reroll, pin, edit normally
  │    ↓
  │    User clicks "Save Plan"
  │    ↓
  │    PlansStorage.savePlans([...plans, newPlan])
  │
  └─ Invalid → Show validation warnings
       ↓
       User can adjust quotas or cancel
```

### Reroll Flow

```
User Action: Click "Reroll" on exercise
  ↓
Get current exercise tag
  ↓
Filter exercisePool[tag] excluding:
  - Current exercise ID
  - Last 2-3 rerolled IDs (from rerollHistory)
  ↓
  ├─ Pool has alternatives → Select random exercise
  │    ↓
  │    Copy sets, reps, weight, rest from source
  │    ↓
  │    Generate new ID with crypto.randomUUID()
  │    ↓
  │    Replace exercise in selectedPlan.exercises
  │    ↓
  │    Update rerollHistory[exerciseId]
  │
  └─ Pool empty → Show message "No other [tag] exercises available"
```

### Pin/Regenerate Flow

```
User Action: Click "Pin" toggle
  ↓
Update selectedPlan.pinStatus[exerciseId] = !current
  ↓
Visual indicator updates (filled vs outline icon)

---

User Action: Click "Regenerate Workout"
  ↓
Calculate remaining quotas:
  For each tag:
    remaining = quota - count(pinned exercises with this tag)
  ↓
Generate new exercises for remaining quotas
  ↓
Replace unpinned exercises in selectedPlan.exercises
  (Preserve pinned exercises at same positions)
  ↓
Update selectedPlan.updatedAt = now
  ↓
Re-render PlanForm with regenerated plan
```

### Template Save/Load Flow

```
User Action: Click "Save Template" in QuotaForm
  ↓
Prompt for template name
  ↓
Validate name (required, 1-50 chars)
  ↓
Create QuotaTemplate object:
  { id: UUID, name, quotas: [...], createdAt: now }
  ↓
Update quotaTemplates state
  ↓
QuotaTemplateStorage.saveTemplates(updatedTemplates)
  ↓
Show success message "Template saved"

---

User Action: Select template from dropdown
  ↓
Load template.quotas into QuotaForm
  ↓
Populate quota inputs with template values
  ↓
User can modify or generate directly
```

---

## localStorage Structure

### Key: `"workout-plans"` (from feature 001, extended)

**Value**: JSON array of WorkoutPlan objects

**Example**:
```json
[
  {
    "id": "plan-1",
    "name": "Monday Chest Day",
    "exercises": [...],
    "createdAt": 1731686400000,
    "updatedAt": 1731690000000
  },
  {
    "id": "plan-2",
    "name": "Random Workout - Nov 15, 2025",
    "exercises": [...],
    "createdAt": 1731693600000,
    "updatedAt": 1731693600000,
    "pinStatus": {
      "ex-1": true,
      "ex-3": true
    },
    "isGenerated": true,
    "generationTimestamp": 1731693600000
  }
]
```

### Key: `"workout-quota-templates"` (new)

**Value**: JSON array of QuotaTemplate objects

**Example**:
```json
[
  {
    "id": "template-1",
    "name": "Full Body Day",
    "quotas": [
      { "tag": "Chest", "count": 3 },
      { "tag": "Legs", "count": 2 },
      { "tag": "Back", "count": 3 }
    ],
    "createdAt": 1731686400000
  },
  {
    "id": "template-2",
    "name": "Upper Body",
    "quotas": [
      { "tag": "Chest", "count": 4 },
      { "tag": "Shoulders", "count": 3 },
      { "tag": "Triceps", "count": 2 },
      { "tag": "Biceps", "count": 2 }
    ],
    "createdAt": 1731690000000
  }
]
```

---

## Validation Rules

### Quota Validation

**TagQuota Validation**:
```javascript
function validateTagQuota(quota, availableTags) {
  const errors = [];

  if (!quota.tag || quota.tag.trim() === "") {
    errors.push("Tag is required");
  }

  if (!Number.isInteger(quota.count) || quota.count < 1) {
    errors.push("Count must be a positive integer");
  }

  if (!availableTags.includes(quota.tag)) {
    errors.push(`Tag "${quota.tag}" does not exist in exercise pool`);
  }

  return errors;
}
```

**Quota Array Validation**:
```javascript
function validateQuotas(quotas, exercisePool) {
  const warnings = [];

  if (!quotas || quotas.length === 0) {
    warnings.push("At least one quota is required");
    return { valid: false, warnings };
  }

  quotas.forEach(({ tag, count }) => {
    if (!exercisePool[tag]) {
      warnings.push(`Tag "${tag}" has no exercises in pool`);
    } else if (exercisePool[tag].length < count) {
      warnings.push(
        `Not enough "${tag}" exercises. Need ${count}, have ${exercisePool[tag].length}.`
      );
    }
  });

  return {
    valid: warnings.length === 0,
    warnings
  };
}
```

### Quota Template Validation

```javascript
function validateQuotaTemplate(template) {
  const errors = [];

  if (!template.name || template.name.trim() === "") {
    errors.push("Template name is required");
  }

  if (template.name && template.name.length > 50) {
    errors.push("Template name must be 50 characters or less");
  }

  if (!template.quotas || template.quotas.length === 0) {
    errors.push("Template must have at least one quota");
  }

  template.quotas.forEach((quota, idx) => {
    if (!quota.tag || quota.tag.trim() === "") {
      errors.push(`Quota ${idx + 1}: Tag is required`);
    }
    if (!Number.isInteger(quota.count) || quota.count < 1) {
      errors.push(`Quota ${idx + 1}: Count must be a positive integer`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Pin Status Validation

```javascript
function validatePinStatus(pinStatus, exerciseIds) {
  // Defensive: ensure all keys in pinStatus exist in exercises array
  const validPinStatus = {};

  Object.keys(pinStatus).forEach(exerciseId => {
    if (exerciseIds.includes(exerciseId)) {
      validPinStatus[exerciseId] = Boolean(pinStatus[exerciseId]);
    }
  });

  return validPinStatus;
}
```

---

## Error Handling

### localStorage Errors

**QuotaExceededError** (storage limit reached):
```javascript
try {
  localStorage.setItem("workout-quota-templates", JSON.stringify(templates));
} catch (error) {
  if (error.name === "QuotaExceededError") {
    return {
      success: false,
      error: "quota",
      message: "Storage limit reached. Delete old plans or templates to free space."
    };
  }
  throw error;
}
```

**JSON Parse Errors** (corrupted data):
```javascript
try {
  const data = localStorage.getItem("workout-quota-templates");
  return data ? JSON.parse(data) : [];
} catch (error) {
  console.error("Failed to parse quota templates:", error);
  // Return empty array, show notification to user
  return [];
}
```

**Private Browsing Mode** (localStorage unavailable):
```javascript
function isLocalStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Show warning banner if not available
if (!isLocalStorageAvailable()) {
  setStorageWarning("Private browsing detected. Quota templates will not be saved.");
}
```

---

## Summary

### New Entities
1. **QuotaTemplate**: Saved quota configurations for reuse
2. **Exercise Pool**: Runtime-derived map of exercises by tag (not persisted)

### Extended Entities
1. **WorkoutPlan**: Added `pinStatus`, `isGenerated`, `generationTimestamp`

### State Management
- App-level state for quota templates, exercise pool, quota form visibility
- Component-level state for reroll history, pin status, quota inputs

### Data Flow
- Generation: Quotas → Validation → Random Selection → Plan Creation
- Reroll: Exercise ID → Filter Pool → Random Selection → Replace Exercise
- Pin/Regenerate: Pin Status → Filter Unpinned → Random Selection → Replace
- Templates: CRUD operations via QuotaTemplateStorage (localStorage)

### Validation
- Quota validation (tag exists, count positive, sufficient exercises)
- Template validation (name required, quotas valid)
- Pin status validation (exercise IDs exist)

All data structures extend feature 001 cleanly with backward compatibility maintained.
