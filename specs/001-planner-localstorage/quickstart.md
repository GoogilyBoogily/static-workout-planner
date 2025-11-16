# Quickstart: Workout Planner with localStorage

**Feature**: 001-planner-localstorage
**Branch**: `001-planner-localstorage`
**Last Updated**: 2025-11-15
**Dependencies**: None (standalone feature)

## Overview

This feature adds a complete workout planner interface that allows users to create, edit, view, and delete custom workout plans. All data persists in browser localStorage with no backend required, enabling true offline-first functionality.

## Prerequisites

- **Bun** installed (package manager and runtime)
- Modern web browser (Chrome, Firefox, Safari, Edge - last 2 versions)
- localStorage enabled (not in private browsing mode for full functionality)

## Quick Setup

### 1. Install Dependencies

```bash
# From repository root
bun install
```

**Note**: No new dependencies required. This feature uses existing React and standard browser APIs only.

### 2. Start Development Server

```bash
bun dev
```

Visit `http://localhost:5173` to see the application.

### 3. Initial State

On first load, the application shows:
- Empty state message: "No workout plans yet. Create your first plan!"
- "Create New Plan" button

---

## Feature Usage

### End User Flow

1. **Create your first plan**: Click "Create New Plan"
2. **Name your plan**: Enter a plan name (e.g., "Monday Chest Day")
3. **Add exercises**: Click "Add Exercise" and fill in:
   - Exercise name (required): e.g., "Bench Press"
   - Sets (required): e.g., 4
   - Reps (required): e.g., "8-10"
   - Weight (optional): e.g., "185 lbs"
   - Rest (optional): e.g., "90 sec"
4. **Reorder exercises** (optional): Use ↑ ↓ buttons to adjust exercise order
5. **Save plan**: Click "Save Plan" - plan persists to localStorage
6. **View all plans**: See your plans listed with last modified time
7. **Edit plan**: Click "Edit" to modify plan name or exercises
8. **View details**: Click plan name to see full exercise list
9. **Delete plan**: Click "Delete" and confirm to remove plan

---

## Development Guide

### Project Structure

```
src/
├── App.jsx              # Main component (MODIFIED - plan management state)
├── App.css              # Main styles (MODIFIED - plan list, form styles)
├── components/          # NEW DIRECTORY
│   ├── PlanList.jsx     # NEW - Display all saved plans
│   ├── PlanList.css     # NEW - Plan list styles
│   ├── PlanForm.jsx     # NEW - Create/edit plan form
│   ├── PlanForm.css     # NEW - Form styles
│   ├── PlanDetail.jsx   # NEW - View plan details modal
│   ├── PlanDetail.css   # NEW - Detail view styles
│   ├── ExerciseForm.jsx # NEW - Add/edit exercises within plan
│   └── ExerciseForm.css # NEW - Exercise form styles
├── utils/               # NEW DIRECTORY
│   ├── localStorage.js  # NEW - localStorage utilities
│   ├── dateFormat.js    # NEW - Relative date formatting
│   └── validation.js    # NEW - Form validation
├── index.css            # Global styles (MINOR MODIFICATIONS)
└── main.jsx             # Entry point (NO CHANGES)
```

### Key Components

**App.jsx** - Main container
- Manages global state (plans, currentView, selectedPlan)
- Loads plans from localStorage on mount
- Handles view routing (list/create/edit/detail)
- Provides plan CRUD handlers

**PlanList.jsx** - Plan list view
- Props: `plans`, `onCreate`, `onEdit`, `onDelete`, `onView`
- Displays plans sorted by last modified (newest first)
- Shows relative timestamps with absolute tooltips
- "Create New Plan" button

**PlanForm.jsx** - Create/edit plan form
- Props: `plan` (null for create, WorkoutPlan for edit), `onSave`, `onCancel`
- Plan name input with validation
- Exercise list with add/edit/remove/reorder controls
- Integrates ExerciseForm for adding/editing exercises
- Validates before save

**ExerciseForm.jsx** - Add/edit exercise
- Props: `exercise` (null for create, Exercise for edit), `onSave`, `onCancel`
- Input fields for name, sets, reps, weight, rest
- Inline validation (required fields, sets range 1-20)

**PlanDetail.jsx** - Plan details modal
- Props: `plan`, `onClose`
- Modal overlay showing all exercises
- Scrollable if many exercises
- Closes on ESC key or backdrop click

### State Management

```javascript
// In App.jsx
const [plans, setPlans] = useState([])               // All saved plans
const [currentView, setCurrentView] = useState("list") // "list"|"create"|"edit"|"detail"
const [selectedPlan, setSelectedPlan] = useState(null) // Plan being edited/viewed
const [showSyncWarning, setShowSyncWarning] = useState(false) // Cross-tab warning
const [storageError, setStorageError] = useState(null) // localStorage error

// Load plans on mount
useEffect(() => {
  const loadedPlans = PlansStorage.loadPlans()
  setPlans(loadedPlans)
  if (!PlansStorage.isAvailable()) {
    setStorageError("Private browsing detected. Plans will not be saved between sessions.")
  }
}, [])

// Save plan (create or update)
const handleSavePlan = (plan) => {
  const isNew = !plan.id
  const planToSave = isNew
    ? { ...plan, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() }
    : { ...plan, updatedAt: Date.now() }

  const updatedPlans = isNew
    ? [...plans, planToSave]
    : plans.map(p => p.id === planToSave.id ? planToSave : p)

  const result = PlansStorage.savePlans(updatedPlans)
  if (result.success) {
    setPlans(updatedPlans)
    setCurrentView("list")
  } else if (result.error === "quota") {
    setStorageError("Storage limit reached. Delete old plans to free space.")
  }
}

// Delete plan with confirmation
const handleDeletePlan = (planId) => {
  if (confirm(`Delete this plan?`)) {
    const updatedPlans = plans.filter(p => p.id !== planId)
    PlansStorage.savePlans(updatedPlans)
    setPlans(updatedPlans)
  }
}
```

### localStorage Structure

**Key**: `"workout-plans"`
**Value**: JSON array of WorkoutPlan objects

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
  }
]
```

### Validation Rules

**Plan**:
- Name: Required, 1-100 characters, not whitespace-only

**Exercise**:
- Name: Required, 1-100 characters
- Sets: Required, integer, 1-20
- Reps: Required, text (flexible format: "8-10", "12", "AMRAP")
- Weight: Optional, text (flexible format: "185 lbs", "80 kg", "BW")
- Rest: Optional, text (flexible format: "90 sec", "1.5 min")

---

## Testing Checklist

### Manual Testing

**Create Plan**:
- [ ] Click "Create New Plan" → Form opens
- [ ] Enter plan name → Name displayed in form
- [ ] Try to save without name → Error: "Plan name required"
- [ ] Add exercise with all fields → Exercise appears in list
- [ ] Try to save exercise without name → Error: "Exercise name required"
- [ ] Try to save exercise with sets = 0 → Error: "Sets must be between 1 and 20"
- [ ] Save plan → Redirects to list, plan appears
- [ ] Refresh browser → Plan still present

**Edit Plan**:
- [ ] Click "Edit" on plan → Form opens with plan data
- [ ] Change plan name → Name updates
- [ ] Add new exercise → Exercise added to list
- [ ] Remove exercise → Exercise removed from list
- [ ] Click "Move Up" on second exercise → Exercise moves to first position
- [ ] Click "Move Down" on first exercise → Exercise moves to second position
- [ ] Save changes → Returns to list with updates
- [ ] Click "Cancel" → Returns to list without saving changes

**Delete Plan**:
- [ ] Click "Delete" on plan → Confirmation dialog appears
- [ ] Click "Cancel" → Plan remains in list
- [ ] Click "Delete" again, confirm → Plan removed from list
- [ ] Refresh browser → Deleted plan does not reappear
- [ ] Delete last plan → Empty state appears

**View Plan Details**:
- [ ] Click plan name → Modal opens with full details
- [ ] All exercises displayed with sets, reps, weight, rest
- [ ] Click "Close" button → Modal closes
- [ ] Press ESC key → Modal closes
- [ ] Click backdrop → Modal closes

**Timestamps**:
- [ ] Create plan → Shows "just now" or "X minutes ago"
- [ ] Hover timestamp → Tooltip shows absolute time (e.g., "Nov 15, 2:30 PM")
- [ ] Edit plan → Timestamp updates, plan moves to top of list

**Edge Cases**:
- [ ] Enter plan name with 100 characters → Saves successfully
- [ ] Enter plan name with 101 characters → Prevented by maxLength or validation error
- [ ] Create 10+ plans → All plans visible in list
- [ ] Private browsing mode → Warning banner: "Plans will not be saved between sessions"
- [ ] Fill localStorage to quota → Error: "Storage limit reached. Delete old plans to free space"
- [ ] Open two browser tabs, edit plan in both → Warning: "Plans updated in another tab. Reload to see changes."

### Performance Testing

- [ ] Load app with 50 saved plans → Loads in <500ms (SC-004)
- [ ] Save plan → Completes in <100ms (SC-005)
- [ ] Create plan with 5 exercises → Completes in <2 minutes (SC-001)
- [ ] No console errors or warnings

### Accessibility Testing

- [ ] Keyboard: Tab through all interactive elements
- [ ] Keyboard: Enter/Space activate buttons
- [ ] Keyboard: ESC closes modal
- [ ] Screen reader announces form errors
- [ ] Focus indicators visible on all buttons/inputs
- [ ] Modal has aria-modal and aria-labelledby

---

## Common Tasks

### Adding a New Plan

1. Click "Create New Plan"
2. Enter plan name (e.g., "Tuesday Leg Day")
3. Click "Add Exercise"
4. Fill exercise details:
   - Name: "Squats"
   - Sets: 4
   - Reps: "8-10"
   - Weight: "225 lbs"
   - Rest: "120 sec"
5. Click "Save Exercise"
6. Repeat for more exercises
7. Reorder exercises with ↑ ↓ buttons if needed
8. Click "Save Plan"

### Editing an Existing Plan

1. Find plan in list
2. Click "Edit" button
3. Modify plan name or exercises
4. Click "Save Changes"

### Clearing All Data

Open browser DevTools console and run:
```javascript
localStorage.removeItem('workout-plans')
window.location.reload()
```

### Exporting Plans (Manual)

Open browser DevTools console and run:
```javascript
const plans = JSON.parse(localStorage.getItem('workout-plans'))
console.log(JSON.stringify(plans, null, 2))
// Copy output to save as .json file
```

---

## Troubleshooting

### Plans not persisting after refresh

**Cause**: Private browsing mode or localStorage disabled
**Solution**:
- Disable private browsing
- Check browser settings to ensure localStorage is enabled
- Look for warning banner on app load

### "Storage limit reached" error

**Cause**: Browser localStorage quota exceeded (typically 5-10MB)
**Solution**:
- Delete old plans to free space
- Check localStorage usage in DevTools (Application → Storage)
- Consider exporting important plans before deleting

### Validation errors not clearing

**Cause**: Form state not resetting on input change
**Solution**:
- Type in the input field - error should clear
- Click "Cancel" to reset form completely

### Cross-tab sync warning persists

**Cause**: Another tab modified plans while this tab was open
**Solution**:
- Click "Reload" to refresh with latest data
- Or click "Dismiss" and continue (next save will overwrite)

---

## Performance Benchmarks

**Target** (per specification):
- Plan list load: <500ms with 50 plans
- localStorage operations: <100ms per operation
- Plan creation (5 exercises): <2 minutes

**Expected** (on modern browsers):
- Plan list load: <100ms (React render + sort)
- localStorage read: <10ms for 50 plans
- localStorage write: <50ms for 50 plans
- Plan creation: 30-60 seconds (user input time)

**Monitoring**:
- Use browser DevTools Performance tab
- Check React DevTools Profiler for component re-renders
- Monitor localStorage size in Application → Storage

---

## Build & Deploy

### Development Build

```bash
bun dev
```

Runs on `http://localhost:5173` with HMR (Hot Module Replacement).

### Production Build

```bash
bun run build
```

Output in `dist/` directory. Optimized and minified.

### Preview Production Build

```bash
bun run preview
```

Serves production build locally for testing.

---

## Related Documentation

- **Specification**: [spec.md](./spec.md) - Requirements and user stories
- **Implementation Plan**: [plan.md](./plan.md) - Technical approach
- **Research**: [research.md](./research.md) - Technical decisions
- **Data Model**: [data-model.md](./data-model.md) - Entities and state
- **Component Contracts**: [contracts/component-contracts.md](./contracts/component-contracts.md) - Component APIs
- **Constitution**: `.specify/memory/constitution.md` - Project principles

---

## Support

**Issues**: Report bugs via project issue tracker
**Questions**: Refer to plan.md and research.md for technical details
**Constitution**: See `.specify/memory/constitution.md` for project principles
