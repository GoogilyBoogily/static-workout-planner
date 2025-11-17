# Quickstart: Random Exercise Generator with Tag Quotas

**Feature**: 002-random-generator-tag-quotas
**Branch**: `002-random-generator-tag-quotas`
**Last Updated**: 2025-11-15
**Dependencies**: Feature 001 (planner-localstorage)

## Overview

This feature extends the workout planner with random workout generation capabilities. Users can specify tag quotas (e.g., "Chest: 3, Legs: 2") to generate balanced workout plans by randomly selecting exercises from their existing exercise pool. Individual exercises can be rerolled, pinned to lock during regeneration, and quota configurations can be saved as templates for quick reuse.

## Prerequisites

- **Feature 001 completed**: Workout planner with localStorage persistence must be implemented
- **Bun** installed (package manager and runtime)
- **Modern web browser** (Chrome, Firefox, Safari, Edge - last 2 versions)
- **localStorage enabled** (not in private browsing mode for full functionality)
- **Saved workout plans**: At least 1 workout plan with exercises created (provides exercise pool)

## Quick Setup

### 1. Install Dependencies

```bash
# From repository root
bun install
```

**Note**: No new dependencies required. This feature uses standard JavaScript APIs (Math.random(), crypto.randomUUID(), Array methods) and extends feature 001's React components.

### 2. Start Development Server

```bash
bun dev
```

Visit `http://localhost:5173` to see the application.

### 3. Initial State

On first load with feature 002 implemented:
- Plan list view shows existing plans (from feature 001)
- New "Generate Random Workout" button appears next to "Create New Plan"
- If no saved plans exist: button is disabled with tooltip "Create workout plans first to build exercise pool"

---

## Feature Usage

### End User Flow

1. **Create workout plans first** (if not already done):
   - Use feature 001 to create 1+ workout plans with exercises
   - Ensure exercises have muscle group tags (e.g., "Chest", "Legs", "Back")
   - These exercises form the pool for random generation

2. **Generate random workout**:
   - Click "Generate Random Workout" in plan list view
   - Quota form modal opens

3. **Set tag quotas**:
   - Click "Add Tag" to add quota row
   - Select tag (e.g., "Chest") from dropdown
   - Enter count (e.g., 3)
   - Repeat for other muscle groups
   - Example: Chest: 3, Legs: 2, Back: 3

4. **Optional: Load saved template**:
   - Select template from "Load Template" dropdown
   - Quota inputs pre-fill with template values
   - Modify if needed or generate directly

5. **Generate plan**:
   - Click "Generate" button
   - Validation runs (ensures sufficient exercises for quotas)
   - If valid: new workout plan created with random exercises
   - Plan opens in edit mode

6. **Fine-tune generated plan**:
   - **Reroll exercise**: Click "🔄 Reroll" button next to exercise to replace with different random exercise
   - **Pin exercise**: Click "📌" to lock exercise (prevents replacement during regeneration)
   - **Regenerate workout**: Click "Regenerate Workout" to replace all unpinned exercises

7. **Save plan**:
   - Click "Save Plan" - plan persists to localStorage
   - Pin status is preserved

8. **Optional: Save quota template**:
   - In quota form, click "Save as Template"
   - Enter template name (e.g., "Full Body Day")
   - Template saved for future use

---

## Development Guide

### Project Structure

```
src/
├── App.jsx              # MODIFIED - Add random generation trigger, quota state
├── App.css              # MODIFIED - Quota form, pin/reroll button styles
├── components/
│   ├── PlanList.jsx     # MODIFIED - Add "Generate Random Workout" button
│   ├── PlanList.css     # MINOR MODIFICATIONS
│   ├── PlanForm.jsx     # MODIFIED - Add reroll/pin UI, integrate QuotaForm
│   ├── PlanForm.css     # MODIFIED - Reroll/pin button styles
│   ├── PlanDetail.jsx   # NO CHANGES (from feature 001)
│   ├── ExerciseForm.jsx # NO CHANGES (from feature 001)
│   ├── QuotaForm.jsx    # NEW - Tag quota input form
│   ├── QuotaForm.css    # NEW - Quota form styles
│   ├── QuotaTemplateManager.jsx # NEW - Save/load quota templates
│   └── QuotaTemplateManager.css # NEW - Template manager styles
├── utils/
│   ├── localStorage.js  # MODIFIED - Ensure backward compatibility
│   ├── validation.js    # MODIFIED - Add quota validation
│   ├── randomGenerator.js # NEW - Random exercise selection logic
│   └── quotaTemplates.js  # NEW - Quota template CRUD utilities
└── ...
```

### Key Components

**QuotaForm.jsx** - Quota configuration UI
- Props: `availableTags`, `exercisePool`, `quotaTemplates`, `onGenerate`, `onCancel`, `onSaveTemplate`
- Renders tag selector dropdowns + count inputs
- Validates quotas before generation
- Integrates QuotaTemplateManager for template CRUD

**QuotaTemplateManager.jsx** - Template management UI
- Props: `templates`, `onLoad`, `onDelete`, `onSave`
- Displays saved quota templates
- Provides load/delete actions

**PlanForm.jsx** - Extended with reroll/pin UI
- New props: `exercisePool`, `isGenerated`
- Reroll button: "🔄 Reroll" (replaces exercise with random alternative)
- Pin toggle: "📌" (locks exercise during regeneration)
- Regenerate button: "Regenerate Workout" (replaces unpinned exercises)

**PlanList.jsx** - Extended with random generation button
- New prop: `onGenerateRandom`
- "Generate Random Workout" button next to "Create New Plan"
- Disabled if exercise pool is empty

### State Management

```javascript
// In App.jsx
const [plans, setPlans] = useState([])               // Feature 001 state
const [exercisePool, setExercisePool] = useState({}) // NEW - Derived from plans
const [quotaTemplates, setQuotaTemplates] = useState([]) // NEW - Saved templates
const [quotaFormOpen, setQuotaFormOpen] = useState(false) // NEW - Modal visibility

// Load on mount
useEffect(() => {
  const loadedPlans = PlansStorage.loadPlans()
  setPlans(loadedPlans)

  const pool = buildExercisePool(loadedPlans)
  setExercisePool(pool)

  const templates = QuotaTemplateStorage.loadTemplates()
  setQuotaTemplates(templates)
}, [])

// Generate random workout
function handleQuotaGenerate(quotas) {
  const result = generateWorkoutPlan(quotas, exercisePool)

  if (result.errors.length > 0) {
    alert(result.errors.join("\n"))
    return
  }

  const newPlan = {
    id: crypto.randomUUID(),
    name: `Random Workout - ${new Date().toLocaleDateString()}`,
    exercises: result.exercises,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pinStatus: {},
    isGenerated: true,
    generationTimestamp: Date.now()
  }

  setSelectedPlan(newPlan)
  setCurrentView("edit")
  setQuotaFormOpen(false)
}
```

### Data Model Extensions

**WorkoutPlan** (extended from feature 001):
```javascript
{
  // Feature 001 properties
  id: "uuid",
  name: "Random Workout - Nov 15, 2025",
  exercises: [...],
  createdAt: 1731686400000,
  updatedAt: 1731690000000,

  // Feature 002 additions
  pinStatus: {
    "exercise-id-1": true,  // Pinned
    "exercise-id-2": false  // Unpinned
  },
  isGenerated: true,
  generationTimestamp: 1731693600000
}
```

**QuotaTemplate** (new entity):
```javascript
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
```

### localStorage Structure

**Key: `"workout-plans"`** (from feature 001, extended)
- Stores all workout plans including generated plans with pin status

**Key: `"workout-quota-templates"`** (new)
- Stores saved quota templates
- JSON array of QuotaTemplate objects

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
  }
]
```

---

## Testing Checklist

### Manual Testing

**Generate Random Workout**:
- [ ] Click "Generate Random Workout" → Quota form modal opens
- [ ] Exercise pool empty → Button disabled with tooltip
- [ ] Add tag quota → Tag dropdown populated from exercise pool
- [ ] Enter count → Accepts positive integers only
- [ ] Set quota exceeding available exercises → Validation warning shown
- [ ] Click "Generate" with valid quotas → New plan created with exact quota counts
- [ ] Generated plan opens in edit mode → Reroll/pin UI visible
- [ ] Generated plan name auto-generated → "Random Workout - [date]" format

**Reroll Exercise**:
- [ ] Click "Reroll" button → Exercise replaced with different random exercise
- [ ] Click "Reroll" multiple times → Avoids showing same exercise consecutively
- [ ] Only 1 exercise in pool → Reroll button disabled with tooltip
- [ ] Rerolled exercise → Sets, reps, weight inherited from source

**Pin/Unpin Exercise**:
- [ ] Click "Pin" toggle → Icon changes to filled (📌)
- [ ] Click "Pin" again → Icon changes to outline (📍)
- [ ] Pin toggle responds instantly → <100ms (SC-004)

**Regenerate Workout**:
- [ ] Pin 2 exercises, click "Regenerate Workout" → Pinned exercises preserved, others replaced
- [ ] All exercises pinned → "Regenerate Workout" button disabled
- [ ] Regenerate confirmation dialog → "Unpinned exercises will be replaced"
- [ ] Cancel regeneration → No changes to plan

**Save/Load Quota Template**:
- [ ] Click "Save as Template" → Prompt for template name
- [ ] Enter template name, save → Template appears in template list
- [ ] Select template from dropdown → Quota inputs pre-filled
- [ ] Delete template → Confirmation dialog, template removed
- [ ] Refresh browser → Saved templates persist

**Validation**:
- [ ] Empty quota list → Error: "At least one quota is required"
- [ ] Duplicate tags → Warning or prevented by UI
- [ ] Count = 0 → Validation error
- [ ] Count negative → Validation error or prevented by input type
- [ ] Tag with 3 exercises, quota 5 → Warning: "Not enough exercises. Need 5, have 3."

**Edge Cases**:
- [ ] Generate with no saved plans → Button disabled
- [ ] Generate with 1 exercise per tag → Works, no reroll options
- [ ] Pin all exercises, regenerate → Warning or button disabled
- [ ] Tag no longer exists (deleted exercises) → Template loads but shows warning
- [ ] localStorage quota exceeded → Error message shown
- [ ] Private browsing mode → Warning: "Templates will not be saved"

### Performance Testing

- [ ] Random generation completes in <2s (SC-003)
- [ ] Pin toggle responds in <100ms (SC-004)
- [ ] Full generation workflow (quotas + generate) <30s (SC-001)
- [ ] Template load <10s (SC-008)
- [ ] No duplicate exercises in generated plan (SC-007: 0% duplication)
- [ ] Generated workouts match exact quota counts (SC-002: 100% accuracy)

### Integration Testing (with Feature 001)

- [ ] Create plan in feature 001 → Exercises added to pool
- [ ] Delete plan in feature 001 → Pool updated
- [ ] Edit plan in feature 001 → Pool reflects changes
- [ ] Generated plan appears in feature 001 plan list
- [ ] Generated plan can be edited/deleted like manual plans
- [ ] Feature 001 plans without `pinStatus` work correctly

---

## Common Tasks

### Generating a Random Workout

1. Click "Generate Random Workout"
2. In quota form:
   - Add tag: [Chest ▼] Count: 3
   - Add tag: [Legs ▼] Count: 2
   - Add tag: [Back ▼] Count: 3
3. Click "Generate"
4. Edit generated plan (reroll exercises, pin favorites)
5. Save plan

### Saving a Quota Template

1. Open quota form
2. Set quotas (e.g., Chest: 3, Legs: 2, Back: 3)
3. Click "Save as Template"
4. Enter name: "Full Body Day"
5. Click "Save"
6. Template saved to localStorage

### Using a Saved Template

1. Open quota form
2. Select "Full Body Day" from "Load Template" dropdown
3. Quotas automatically populated
4. Click "Generate" or modify quotas first

### Rerolling an Exercise

1. Open generated plan in edit mode
2. Find exercise you want to replace
3. Click "🔄 Reroll" button
4. Exercise replaced with random alternative
5. Repeat if needed
6. Save plan when satisfied

### Pinning Exercises

1. Open generated plan in edit mode
2. Click "📌" on exercises you want to preserve
3. Click "Regenerate Workout"
4. Pinned exercises stay, others replaced
5. Save plan

### Clearing All Templates

Open browser DevTools console and run:
```javascript
localStorage.removeItem('workout-quota-templates')
window.location.reload()
```

### Exporting Templates (Manual)

Open browser DevTools console and run:
```javascript
const templates = JSON.parse(localStorage.getItem('workout-quota-templates'))
console.log(JSON.stringify(templates, null, 2))
// Copy output to save as .json file
```

---

## Troubleshooting

### "Generate Random Workout" button disabled

**Cause**: No saved workout plans (exercise pool is empty)

**Solution**:
- Create at least 1 workout plan using feature 001
- Ensure exercises have muscle group tags
- Exercise pool is built from saved plans

### Validation warning: "Not enough exercises"

**Cause**: Quota exceeds available exercises for a tag

**Solution**:
- Reduce quota count to match available exercises
- Add more exercises for that tag in feature 001
- Generate with reduced quota (auto-correction option)

### Reroll button disabled

**Cause**: Only 1 exercise exists for that tag in pool

**Solution**:
- Add more exercises for that tag in feature 001
- Or accept the current exercise (no alternatives available)

### Templates not persisting after refresh

**Cause**: Private browsing mode or localStorage disabled

**Solution**:
- Disable private browsing
- Check browser settings for localStorage permissions
- Look for warning banner on app load

### "Storage limit reached" error

**Cause**: Browser localStorage quota exceeded (typically 5-10MB)

**Solution**:
- Delete old workout plans to free space
- Delete unused quota templates
- Check localStorage usage in DevTools (Application → Storage)

### Pin status not saving

**Cause**: Plan not saved after pinning exercises

**Solution**:
- Pin status only persists when plan is saved
- Click "Save Plan" after pinning exercises
- Check plan object in localStorage has `pinStatus` property

---

## Performance Benchmarks

**Target** (per specification):
- Random generation: <2s (SC-003)
- Pin toggle: <100ms (SC-004)
- Full workflow: <30s (SC-001)
- Template load: <10s (SC-008)
- Quota accuracy: 100% (SC-002)
- No duplicates: 0% duplication (SC-007)

**Expected** (on modern browsers):
- Random generation: <100ms (Fisher-Yates shuffle + selection)
- Pin toggle: <10ms (state update + re-render)
- Quota form open: <50ms
- Template save: <50ms (localStorage write)
- Reroll operation: <50ms (random selection + re-render)

**Monitoring**:
- Use browser DevTools Performance tab
- Check React DevTools Profiler for component re-renders
- Monitor localStorage size in Application → Storage
- Test with 50+ saved plans to validate performance at scale

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
- **Feature 001**: `../001-planner-localstorage/` - Base workout planner
- **Constitution**: `.specify/memory/constitution.md` - Project principles

---

## Support

**Issues**: Report bugs via project issue tracker
**Questions**: Refer to plan.md and research.md for technical details
**Feature 001 Dependency**: Ensure feature 001 is fully implemented before using feature 002
**Constitution**: See `.specify/memory/constitution.md` for project principles
