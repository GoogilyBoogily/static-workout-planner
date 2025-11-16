# Component Contracts

**Feature**: 001-planner-localstorage
**Date**: 2025-11-15
**Purpose**: Define component interfaces and prop contracts

## Component Hierarchy

```
App (main container)
├── (conditional) StorageWarning → Cross-tab sync warning banner
├── (conditional) ErrorMessage → localStorage error display
├── (view: list) PlanList → Display all saved plans
├── (view: create|edit) PlanForm → Create or edit workout plan
│   └── ExerciseForm → Add/edit exercises within plan
└── (view: detail) PlanDetail → View plan details modal
```

---

## App Component (Modified from existing)

**File**: `src/App.jsx`

**Purpose**: Root component managing application state, view routing, and localStorage integration

**State**:
```javascript
{
  plans: WorkoutPlan[],          // All plans loaded from localStorage
  currentView: string,            // "list" | "create" | "edit" | "detail"
  selectedPlan: WorkoutPlan | null, // Plan being edited/viewed
  showSyncWarning: boolean,       // Cross-tab sync warning visibility
  storageError: string | null     // localStorage error message
}
```

**Effects**:
- On mount: Load plans from localStorage, check availability
- On storage event: Detect cross-tab changes, show sync warning

**Handlers**:
```javascript
{
  handleCreatePlan: () => void,              // Navigate to create view
  handleEditPlan: (plan: WorkoutPlan) => void, // Navigate to edit view
  handleViewPlan: (plan: WorkoutPlan) => void, // Navigate to detail view
  handleSavePlan: (plan: WorkoutPlan) => void, // Save plan to localStorage
  handleDeletePlan: (planId: string) => void,  // Delete plan with confirmation
  handleCancelEdit: () => void,              // Return to list view
  handleReload: () => void                   // Reload page (for cross-tab sync)
}
```

**Render Logic**:
```jsx
<div className="App">
  <h1>Workout Planner</h1>

  {/* Error banner */}
  {storageError && <ErrorMessage message={storageError} />}

  {/* Cross-tab sync warning */}
  {showSyncWarning && (
    <StorageWarning onReload={handleReload} onDismiss={() => setShowSyncWarning(false)} />
  )}

  {/* View routing */}
  {currentView === "list" && (
    plans.length === 0 ? (
      <EmptyState onCreate={handleCreatePlan} />
    ) : (
      <PlanList
        plans={plans}
        onCreate={handleCreatePlan}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
        onView={handleViewPlan}
      />
    )
  )}

  {(currentView === "create" || currentView === "edit") && (
    <PlanForm
      plan={selectedPlan}
      onSave={handleSavePlan}
      onCancel={handleCancelEdit}
    />
  )}

  {currentView === "detail" && (
    <PlanDetail
      plan={selectedPlan}
      onClose={() => setCurrentView("list")}
    />
  )}
</div>
```

---

## PlanList Component (NEW)

**File**: `src/components/PlanList.jsx`

**Purpose**: Display all saved workout plans in a list sorted by last modified

**Props**:
```typescript
{
  plans: WorkoutPlan[],                       // Plans to display (pre-sorted by updatedAt desc)
  onCreate: () => void,                       // Callback when "Create New Plan" clicked
  onEdit: (plan: WorkoutPlan) => void,        // Callback when "Edit" clicked
  onDelete: (planId: string) => void,         // Callback when "Delete" clicked
  onView: (plan: WorkoutPlan) => void         // Callback when plan name clicked
}
```

**Behavior**:
- Display plans in list format (one per row)
- Each plan shows:
  - Plan name (clickable → calls onView)
  - Number of exercises ("5 exercises")
  - Last modified (relative time with absolute tooltip)
  - Edit button
  - Delete button
- "Create New Plan" button at top
- Plans sorted by updatedAt descending (newest first)

**Example Usage**:
```jsx
<PlanList
  plans={plans}
  onCreate={() => setCurrentView("create")}
  onEdit={(plan) => { setSelectedPlan(plan); setCurrentView("edit"); }}
  onDelete={(planId) => { /* show confirmation, then delete */ }}
  onView={(plan) => { setSelectedPlan(plan); setCurrentView("detail"); }}
/>
```

**Accessibility**:
- Plan names are buttons or links (keyboard accessible)
- Edit/Delete buttons have aria-labels with plan name
- List uses semantic HTML (ul/li or proper headings)

---

## PlanForm Component (NEW)

**File**: `src/components/PlanForm.jsx`

**Purpose**: Create new workout plan or edit existing plan with exercises

**Props**:
```typescript
{
  plan: WorkoutPlan | null,                   // Existing plan (edit mode) or null (create mode)
  onSave: (plan: WorkoutPlan) => void,        // Callback when form submitted
  onCancel: () => void                        // Callback when "Cancel" clicked
}
```

**State**:
```javascript
{
  planName: string,                 // Current plan name input
  exercises: Exercise[],            // Current exercises list
  errors: object,                   // Validation errors { planName, exercises: { [index]: { name, sets, reps } } }
  isAddingExercise: boolean         // Whether exercise form is open
}
```

**Behavior**:
- If plan prop is null: Create mode (empty form)
- If plan prop exists: Edit mode (pre-fill form with plan data)
- Plan name input with validation (required, max 100 chars)
- "Add Exercise" button opens ExerciseForm
- Exercise list with:
  - Exercise details display
  - Edit button (opens ExerciseForm with exercise data)
  - Remove button
  - Move Up / Move Down buttons (reorder)
- "Save" button (disabled if validation fails)
- "Cancel" button (calls onCancel, no save)
- Validate on submit:
  - Plan name required
  - All exercises valid (name, sets, reps)

**Example Usage**:
```jsx
{/* Create mode */}
<PlanForm
  plan={null}
  onSave={(newPlan) => { /* add to plans, save to localStorage */ }}
  onCancel={() => setCurrentView("list")}
/>

{/* Edit mode */}
<PlanForm
  plan={selectedPlan}
  onSave={(updatedPlan) => { /* update in plans, save to localStorage */ }}
  onCancel={() => setCurrentView("list")}
/>
```

**Validation**:
- Plan name: Not empty, not whitespace-only, <= 100 chars
- Exercises: Each exercise must have valid name, sets (1-20), reps (not empty)
- Show inline errors near inputs (role="alert")
- Disable submit button until all validation passes

---

## ExerciseForm Component (NEW)

**File**: `src/components/ExerciseForm.jsx`

**Purpose**: Add new exercise or edit existing exercise within a plan

**Props**:
```typescript
{
  exercise: Exercise | null,                  // Existing exercise (edit) or null (create)
  onSave: (exercise: Exercise) => void,       // Callback when exercise saved
  onCancel: () => void                        // Callback when cancelled
}
```

**State**:
```javascript
{
  name: string,           // Exercise name
  sets: number,           // Sets (1-20)
  reps: string,           // Reps (text input)
  weight: string,         // Weight (optional text)
  rest: string,           // Rest (optional text)
  errors: object          // Validation errors { name, sets, reps }
}
```

**Behavior**:
- Input fields for all exercise properties
- Validation on submit:
  - Name required, <= 100 chars
  - Sets required, integer 1-20
  - Reps required (text)
  - Weight optional (text)
  - Rest optional (text)
- "Save Exercise" button (adds to plan's exercises array)
- "Cancel" button (closes form without saving)
- Inline validation errors

**Example Usage**:
```jsx
{/* Add new exercise */}
<ExerciseForm
  exercise={null}
  onSave={(newExercise) => {
    const ex = { ...newExercise, id: crypto.randomUUID() }
    setExercises([...exercises, ex])
    setIsAddingExercise(false)
  }}
  onCancel={() => setIsAddingExercise(false)}
/>

{/* Edit existing exercise */}
<ExerciseForm
  exercise={selectedExercise}
  onSave={(updatedExercise) => {
    const updated = exercises.map(e => e.id === updatedExercise.id ? updatedExercise : e)
    setExercises(updated)
    setEditingExercise(null)
  }}
  onCancel={() => setEditingExercise(null)}
/>
```

**Validation Rules** (from FR-008):
- Name: Required, not empty, <= 100 chars
- Sets: Required, integer, 1 <= sets <= 20
- Reps: Required, not empty (flexible text format)
- Weight: Optional (no validation)
- Rest: Optional (no validation)

---

## PlanDetail Component (NEW)

**File**: `src/components/PlanDetail.jsx`

**Purpose**: Display full plan details in a modal overlay (User Story 5 - P5)

**Props**:
```typescript
{
  plan: WorkoutPlan,                          // Plan to display
  onClose: () => void                         // Callback when modal closed
}
```

**Behavior**:
- Modal overlay with backdrop
- Display plan name as heading
- List all exercises with full details:
  - Exercise name
  - Sets × Reps
  - Weight (if present)
  - Rest (if present)
- "Close" button (top right)
- ESC key closes modal
- Click backdrop closes modal
- Scrollable if many exercises

**Example Usage**:
```jsx
<PlanDetail
  plan={selectedPlan}
  onClose={() => setCurrentView("list")}
/>
```

**Accessibility**:
- Modal has role="dialog" and aria-modal="true"
- aria-labelledby points to plan name heading
- Focus trapped within modal while open
- ESC key closes modal (keyboard support)
- Focus returns to trigger element on close

---

## Utility Modules (NEW)

### localStorage.js

**File**: `src/utils/localStorage.js`

**Purpose**: Centralize localStorage operations with error handling

**Exports**:
```javascript
export const PlansStorage = {
  KEY: 'workout-plans',

  // Load all plans from localStorage
  // Returns: WorkoutPlan[] or [] if empty/corrupted
  loadPlans(): WorkoutPlan[] {},

  // Save all plans to localStorage
  // Returns: { success: boolean, error?: 'quota' | 'unknown' }
  savePlans(plans: WorkoutPlan[]): SaveResult {},

  // Check if localStorage is available (not disabled)
  // Returns: boolean
  isAvailable(): boolean {}
}
```

**Error Handling**:
- JSON.parse error → Clear corrupted data, return []
- QuotaExceededError → Return { success: false, error: 'quota' }
- localStorage disabled (private browsing) → isAvailable() returns false

---

### dateFormat.js

**File**: `src/utils/dateFormat.js`

**Purpose**: Format timestamps for display (relative + absolute)

**Exports**:
```javascript
// Format relative time ("2 hours ago", "3 days ago")
// Input: timestamp (number, milliseconds)
// Returns: string (e.g., "just now", "5 minutes ago", "2 days ago")
export function formatRelativeTime(timestamp: number): string {}

// Format absolute time for tooltip ("Nov 15, 2:30 PM")
// Input: timestamp (number, milliseconds)
// Returns: string (e.g., "Nov 15, 2:30 PM")
export function formatAbsoluteTime(timestamp: number): string {}
```

**Usage**:
```jsx
<span title={formatAbsoluteTime(plan.updatedAt)}>
  {formatRelativeTime(plan.updatedAt)}
</span>
```

---

### validation.js

**File**: `src/utils/validation.js`

**Purpose**: Form validation utilities

**Exports**:
```javascript
// Validate plan name
// Returns: error message or null if valid
export function validatePlanName(name: string): string | null {}

// Validate exercise
// Returns: errors object or null if valid
export function validateExercise(exercise: Exercise): object | null {}
```

**Validation Logic**:
- Plan name: Required (not empty/whitespace), <= 100 chars
- Exercise name: Required, <= 100 chars
- Exercise sets: Required, integer, 1-20
- Exercise reps: Required, not empty
- Weight/Rest: No validation (optional text)

---

## Data Flow Summary

```
App initialization:
  → PlansStorage.loadPlans() from localStorage
  → Set plans state
  → Render PlanList (if plans.length > 0) or EmptyState

Create Plan Flow:
  User clicks "Create New Plan"
  → App.handleCreatePlan() → currentView = "create"
  → Render PlanForm (plan=null)
  User fills form, adds exercises via ExerciseForm
  User clicks "Save"
  → PlanForm validates, calls onSave(newPlan)
  → App.handleSavePlan() → Add newPlan to plans, PlansStorage.savePlans()
  → currentView = "list", render PlanList with new plan

Edit Plan Flow:
  User clicks "Edit" on plan
  → App.handleEditPlan(plan) → selectedPlan = plan, currentView = "edit"
  → Render PlanForm (plan=selectedPlan)
  User modifies, reorders exercises
  User clicks "Save Changes"
  → PlanForm validates, calls onSave(updatedPlan)
  → App.handleSavePlan() → Update plan in plans array, PlansStorage.savePlans()
  → currentView = "list"

Delete Plan Flow:
  User clicks "Delete" on plan
  → App.handleDeletePlan(planId) → Show confirmation dialog
  User confirms
  → Remove plan from plans array, PlansStorage.savePlans()
  → Re-render PlanList (or EmptyState if last plan deleted)

View Plan Flow:
  User clicks plan name
  → App.handleViewPlan(plan) → selectedPlan = plan, currentView = "detail"
  → Render PlanDetail modal
  User clicks "Close" or ESC
  → currentView = "list"
```

---

## Performance Contract

**Component Rendering**:
- PlanList re-renders only when plans array changes
- PlanForm uses controlled components (updates on every keystroke)
- ExerciseForm isolated (doesn't affect parent until saved)

**localStorage Operations**:
- Read: Once on app initialization (<10ms for 50 plans)
- Write: On every save/delete operation (<50ms for 50 plans)
- Target: SC-005 (<100ms per operation) - easily achievable

**Sorting**:
- Plans sorted by updatedAt before passing to PlanList
- Can use useMemo to avoid re-sorting on every render (optional optimization)

**Modal Rendering**:
- PlanDetail only renders when currentView === "detail"
- No performance impact when closed (not in DOM)
