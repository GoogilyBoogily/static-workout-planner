# Data Model: Workout Planner with localStorage Persistence

**Feature**: 001-planner-localstorage
**Date**: 2025-11-15
**Source**: Derived from spec.md functional requirements and clarifications

## Entities

### Workout Plan

Represents a complete workout plan with multiple exercises.

**Fields**:
- `id` (string, UUID v4): Unique identifier generated via crypto.randomUUID()
- `name` (string, 1-100 chars, required): User-defined plan name
- `exercises` (array of Exercise, ordered): List of exercises in user-defined order
- `createdAt` (number, timestamp): Creation time in milliseconds (Date.now())
- `updatedAt` (number, timestamp): Last modification time in milliseconds (Date.now())

**Validation Rules**:
- Plan name MUST NOT be empty or whitespace-only (from FR-008)
- Plan name MUST be <= 100 characters (from FR-001)
- exercises array can be empty (new plan) or contain unlimited exercises (clarification #4)
- createdAt MUST be set on creation, never modified
- updatedAt MUST update on any plan or exercise modification

**Source**: Created via PlanForm component, persisted to localStorage

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Monday Chest Day",
  "exercises": [
    {
      "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Bench Press",
      "sets": 4,
      "reps": "8-10",
      "weight": "185 lbs",
      "rest": "90 sec"
    },
    {
      "id": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      "name": "Incline Dumbbell Press",
      "sets": 3,
      "reps": "10-12",
      "weight": "70 lbs",
      "rest": "60 sec"
    }
  ],
  "createdAt": 1731686400000,
  "updatedAt": 1731690000000
}
```

---

### Exercise

Represents a single exercise within a workout plan.

**Fields**:
- `id` (string, UUID v4): Unique identifier within plan, generated via crypto.randomUUID()
- `name` (string, 1-100 chars, required): Exercise name (e.g., "Bench Press", "Squats")
- `sets` (number, 1-20, required): Number of sets
- `reps` (string, required): Repetition count or range (flexible text format)
- `weight` (string, optional): Weight with unit (flexible text format)
- `rest` (string, optional): Rest period (flexible text format)

**Validation Rules**:
- Exercise name MUST NOT be empty (from FR-008)
- Exercise name MUST be <= 100 characters (from FR-002)
- sets MUST be integer between 1-20 inclusive (from FR-002, FR-008)
- reps MUST NOT be empty (from FR-008)
- reps supports flexible formats: "8-10", "12", "AMRAP", "max" (from FR-002)
- weight is optional, supports formats: "185 lbs", "80 kg", "BW+25", "BW" (from FR-002)
- rest is optional, supports formats: "90 sec", "1.5 min", "2 minutes" (from FR-002)

**Ordering**:
- Exercises maintain position in parent plan's exercises array
- User can reorder via up/down buttons (clarification #3)
- Order persists in localStorage

**Source**: Created via ExerciseForm component, stored in parent plan's exercises array

**Example**:
```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "name": "Bench Press",
  "sets": 4,
  "reps": "8-10",
  "weight": "185 lbs",
  "rest": "90 sec"
}
```

**Example (Minimal)**:
```json
{
  "id": "7ca8c920-adae-22e2-90c5-11d15fe540d9",
  "name": "Pull-ups",
  "sets": 3,
  "reps": "max"
}
```

---

## State Model

### Application State

**Plans Collection** (user-controlled):
- `plans` (array of Workout Plan): All saved plans loaded from localStorage (default: [])
- Sorted by `updatedAt` descending (newest first) before display (from FR-005)

**UI State** (user-controlled):
- `currentView` (string): Current view state - "list" | "create" | "edit" | "detail"
- `selectedPlan` (Workout Plan | null): Plan being edited/viewed (default: null)
- `showSyncWarning` (boolean): Cross-tab sync warning banner visibility (default: false)
- `storageError` (string | null): localStorage error message if any (default: null)

**Form State** (ephemeral, not persisted):
- `planForm` (object): Current plan being created/edited in form
- `exerciseForm` (object): Current exercise being added/edited
- `formErrors` (object): Validation errors for current form

**Derived State** (computed):
- `isEmpty` (boolean): `plans.length === 0` (determines empty state display)
- `isStorageFull` (boolean): Last save attempt returned QuotaExceededError

### State Transitions

```
Initial State:
  plans = loadPlans() from localStorage
  currentView = "list"
  → If plans.length === 0: Show empty state
  → If plans.length > 0: Show plan list sorted by updatedAt desc

Create Plan Flow:
  User clicks "Create New Plan"
  → currentView = "create"
  → planForm = { name: "", exercises: [] }
  User fills form, adds exercises
  → exerciseForm updated for each exercise
  → Validate on submit (FR-008)
  User clicks "Save Plan"
  → newPlan = { id: crypto.randomUUID(), name, exercises, createdAt: Date.now(), updatedAt: Date.now() }
  → plans.push(newPlan)
  → savePlans(plans)
  → If QuotaExceededError: Show error "Storage limit reached"
  → If success: currentView = "list", show plan in list

Edit Plan Flow:
  User clicks "Edit" on plan
  → selectedPlan = plan
  → currentView = "edit"
  → planForm = { ...plan } (shallow copy for editing)
  User modifies plan/exercises
  → Validate changes (FR-008)
  User clicks "Save Changes"
  → plan.updatedAt = Date.now()
  → Update plan in plans array
  → savePlans(plans)
  → currentView = "list"
  User clicks "Cancel"
  → Discard planForm changes
  → currentView = "list"

Delete Plan Flow:
  User clicks "Delete" on plan
  → Show confirmation dialog with plan name (FR-007)
  User clicks "Confirm"
  → Remove plan from plans array
  → savePlans(plans)
  → If plans.length === 0: Show empty state
  User clicks "Cancel"
  → Close dialog, no changes

View Plan Details Flow:
  User clicks plan name
  → selectedPlan = plan
  → currentView = "detail"
  → Show all exercises with full details
  User clicks "Close" or ESC
  → currentView = "list"

Exercise Reordering Flow (within Edit Plan):
  User clicks "Move Up" on exercise at index i (i > 0)
  → Swap exercises[i] with exercises[i-1]
  → Re-render exercise list with new order
  User clicks "Move Down" on exercise at index i (i < length-1)
  → Swap exercises[i] with exercises[i+1]
  → Re-render exercise list with new order
  Order persists when user clicks "Save Changes"
```

---

## localStorage Storage Format

### Key

**localStorage Key**: `"workout-plans"` (single key for all plans)

### Value Format

**Type**: JSON string (array of Workout Plan objects)

**Example**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Monday Chest Day",
    "exercises": [
      {
        "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "name": "Bench Press",
        "sets": 4,
        "reps": "8-10",
        "weight": "185 lbs",
        "rest": "90 sec"
      }
    ],
    "createdAt": 1731686400000,
    "updatedAt": 1731690000000
  },
  {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "name": "Wednesday Leg Day",
    "exercises": [
      {
        "id": "7ca8c920-adae-22e2-90c5-11d15fe540d9",
        "name": "Squats",
        "sets": 4,
        "reps": "8-10",
        "weight": "225 lbs",
        "rest": "120 sec"
      },
      {
        "id": "8db9d031-bebe-33f3-a1d6-22e26gf651e0",
        "name": "Leg Press",
        "sets": 3,
        "reps": "12-15",
        "weight": "300 lbs",
        "rest": "90 sec"
      }
    ],
    "createdAt": 1731686500000,
    "updatedAt": 1731686500000
  }
]
```

### Storage Operations

**Load** (on app startup):
```javascript
const plansJson = localStorage.getItem('workout-plans')
const plans = plansJson ? JSON.parse(plansJson) : []
```

**Save** (after any create/edit/delete):
```javascript
localStorage.setItem('workout-plans', JSON.stringify(plans))
```

**Clear** (on corrupted data):
```javascript
localStorage.removeItem('workout-plans')
```

---

## Validation Rules Summary

| Field | Validation | Error Message | Source |
|-------|------------|---------------|--------|
| **Plan.name** | Required, 1-100 chars | "Plan name required" | FR-001, FR-008 |
| **Plan.exercises** | Array (can be empty) | N/A | FR-002 |
| **Exercise.name** | Required, 1-100 chars | "Exercise name required" | FR-002, FR-008 |
| **Exercise.sets** | Required, integer 1-20 | "Sets must be between 1 and 20" | FR-002, FR-008 |
| **Exercise.reps** | Required, text | "Reps required" | FR-002, FR-008 |
| **Exercise.weight** | Optional, text | N/A | FR-002 |
| **Exercise.rest** | Optional, text | N/A | FR-002 |

---

## Data Flow

```
User Action: Create New Plan
    ↓
PlanForm Component
    ↓
User fills plan name, adds exercises via ExerciseForm
    ↓
Validation (planName required, exercises valid)
    ↓
On Submit:
  - newPlan = { id: crypto.randomUUID(), name, exercises, createdAt: Date.now(), updatedAt: Date.now() }
  - plans = [...existingPlans, newPlan]
  - localStorage.setItem('workout-plans', JSON.stringify(plans))
    ↓
If QuotaExceededError:
  - Show error: "Storage limit reached. Delete old plans to free space"
  - Do not update plans state (prevent data corruption)
If Success:
  - Update plans state
  - Navigate to list view
  - Plan appears in list sorted by updatedAt (newest first)
```

```
User Action: Edit Plan
    ↓
User selects plan from list
    ↓
PlanForm Component (edit mode) loaded with plan data
    ↓
User modifies fields, reorders exercises, adds/removes exercises
    ↓
Validation (same as create)
    ↓
On Save:
  - plan.updatedAt = Date.now()
  - Update plan in plans array (find by id)
  - localStorage.setItem('workout-plans', JSON.stringify(plans))
  - Navigate to list view
On Cancel:
  - Discard changes (no localStorage update)
  - Navigate to list view
```

```
User Action: Delete Plan
    ↓
Confirmation Dialog ("Delete 'Monday Chest Day'?")
    ↓
On Confirm:
  - plans = plans.filter(p => p.id !== deletedPlan.id)
  - localStorage.setItem('workout-plans', JSON.stringify(plans))
  - If plans.length === 0: Show empty state
On Cancel:
  - Close dialog, no changes
```

```
localStorage Event (cross-tab sync):
    ↓
Another tab saves changes to 'workout-plans'
    ↓
storage event fires on this window
    ↓
Show sync warning banner:
  "Plans updated in another tab. Reload to see changes."
  [Reload] [Dismiss]
    ↓
User clicks Reload:
  - window.location.reload()
  - App re-initializes with latest data
User clicks Dismiss:
  - Hide banner
  - Continue with current data (last-write-wins on next save)
```

---

## Performance Considerations

**localStorage Read** (on app startup):
- Operation: JSON.parse of ~5KB per plan × N plans
- Expected: <10ms for 50 plans (~250KB total)
- Target: <500ms per SC-004 (easily achievable)

**localStorage Write** (on save):
- Operation: JSON.stringify of all plans + localStorage.setItem
- Expected: <50ms for 50 plans
- Target: <100ms per SC-005 (achievable)

**Memory Usage**:
- All plans loaded in React state (~5KB per plan × N plans)
- Expected: ~500KB in memory for 100 plans (negligible for modern browsers)

**Sorting**:
- Sort plans by updatedAt on every render of list view
- Array.sort() is O(n log n), fast for <1000 plans
- Can memoize with useMemo if needed (not required for MVP)

**UUID Generation**:
- crypto.randomUUID() is synchronous, <1ms per call
- No performance concern

**Storage Quota**:
- Browser localStorage limit: 5-10MB (browser-dependent)
- Average plan size: ~5KB (10 exercises)
- Capacity: ~1000-2000 plans before quota exceeded
- Target per SC-007: <5KB per plan with 10 exercises (achievable with JSON)
