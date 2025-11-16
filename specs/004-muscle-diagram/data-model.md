# Data Model: Interactive SVG Muscle Diagram

**Phase**: 1 (Design & Contracts)
**Date**: 2025-11-15
**Purpose**: Define entities, attributes, relationships, and validation rules

## Entity Definitions

### 1. MuscleGroup

Represents a grouped muscle region on the human body using common fitness terminology.

**Attributes**:

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `id` | string | Yes | Unique identifier (kebab-case) | Pattern: `^[a-z]+-(?:front\|back)$` |
| `name` | string | Yes | Display name (fitness terminology) | Length: 3-20 chars, examples: "Chest", "Quadriceps" |
| `view` | enum | Yes | Body perspective | Values: `"front"` or `"back"` |
| `path` | string | Yes | SVG path data | Valid SVG path syntax (M, L, C, Z commands) |
| `category` | enum | No | Muscle group category | Values: `"upper"`, `"core"`, `"lower"` |

**Example**:
```javascript
{
  id: "chest-front",
  name: "Chest",
  view: "front",
  path: "M150,100 L180,120 L180,160 L150,180 L120,160 L120,120 Z",
  category: "upper"
}
```

**Business Rules**:
- Each muscle group MUST have a unique `id` across all views
- `name` should match terminology used in CSV "Muscles" column (case-insensitive matching)
- `path` coordinates are relative to viewBox (0 0 300 600)
- Front view groups: Chest, Shoulders, Biceps, Forearms, Abdominals, Quadriceps
- Back view groups: Back, Trapezius, Triceps, Glutes, Hamstrings, Calves

**State Transitions**:
- Default → Hovered (onMouseEnter)
- Hovered → Default (onMouseLeave)
- Default/Hovered → Selected (onClick)
- Selected → Default (onClick again)

### 2. BodyView

Represents a perspective of the human body (front or back).

**Attributes**:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `orientation` | enum | Yes | View type: `"front"` or `"back"` |
| `muscles` | MuscleGroup[] | Yes | Array of muscle groups visible in this view |
| `isActive` | boolean | Yes | Whether this view is currently displayed |

**Example**:
```javascript
{
  orientation: "front",
  muscles: [chestMuscle, shouldersMuscle, bicepsMuscle, ...],
  isActive: true
}
```

**Business Rules**:
- Exactly ONE view is active at any time
- Switching views is a toggle operation (front ↔ back)
- Muscle selections persist across view switches

### 3. Exercise (Extended)

Extends existing CSV exercise entity with muscle group targeting.

**New Attributes**:

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `Muscles` | string | No | Comma-separated muscle group names | Format: `"Group1, Group2, ..."` |

**Example CSV Row**:
```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day,Muscles
Bench Press,4,8-10,185,90,Monday,"Chest, Shoulders, Triceps"
Squats,4,8-10,225,120,Monday,"Quadriceps, Glutes, Hamstrings"
Pull-ups,3,6-8,Bodyweight,60,Monday,"Back, Biceps"
```

**Parsing Logic**:
```javascript
function parseMuscleTags(muscleString) {
  if (!muscleString || muscleString.trim() === '') return [];
  return muscleString.split(',').map(m => m.trim());
}
```

**Business Rules**:
- Muscle names in CSV MUST match `MuscleGroup.name` (case-insensitive)
- Multiple muscles separated by commas
- Leading/trailing whitespace ignored
- Empty or missing "Muscles" column → exercise shown only when no filters active

### 4. SelectionState

Application state tracking user's selected muscle groups.

**Attributes**:

| Attribute | Type | Description |
|-----------|------|-------------|
| `selectedMuscles` | string[] | Array of selected muscle group names |
| `hoveredMuscle` | string \| null | Currently hovered muscle name (desktop only) |
| `activeView` | enum | Current body view: `"front"` or `"back"` |

**Example**:
```javascript
{
  selectedMuscles: ["Chest", "Shoulders"],
  hoveredMuscle: "Triceps",
  activeView: "front"
}
```

**State Relationships**:
- `selectedMuscles` persists across CSV file loads (FR-014)
- `selectedMuscles` filters exercises via OR logic (any muscle matches)
- `hoveredMuscle` resets to null on view switch or mouse leave
- `activeView` determines which `BodyView` is rendered

## Relationships

```
App.jsx
├── selectedMuscles: string[] (state)
├── hoveredMuscle: string | null (state)
├── activeView: "front" | "back" (state)
├── csvData: Exercise[] (state)
└── filteredData: Exercise[] (derived from csvData + selectedMuscles)

MuscleDiagram Component
├── Props:
│   ├── selectedMuscles: string[]
│   ├── onMuscleToggle: (name: string) => void
│   ├── onMuscleHover: (name: string | null) => void
│   ├── activeView: "front" | "back"
│   └── onViewToggle: () => void
└── Renders:
    ├── ViewToggle (front/back buttons)
    ├── SVG container
    └── MuscleGroup paths (filtered by activeView)

muscle-groups.js (data module)
└── exports:
    ├── frontMuscles: MuscleGroup[]
    └── backMuscles: MuscleGroup[]
```

## Validation Rules

### Client-Side Validation

**Muscle Group Path Data**:
- All required attributes present (`id`, `name`, `view`, `path`)
- No duplicate IDs
- Path syntax valid (starts with M, uses valid SVG commands)
- Minimum 12 muscle groups total (6 front + 6 back)

**CSV Muscle Column**:
- Muscle names in CSV match available muscle groups (log warning if mismatch)
- Comma-separated format maintained
- Graceful handling of missing column (FR-013)

**Selection State**:
- `selectedMuscles` array contains only valid muscle names
- Maximum 12 selections (all muscles) - no enforced limit but UI should handle gracefully

### Runtime Validation

**On Component Mount**:
```javascript
// Validate muscle group data completeness
console.assert(
  frontMuscles.length >= 6 && backMuscles.length >= 6,
  "Minimum 12 muscle groups required (6 front + 6 back)"
);

// Validate no duplicate IDs
const allIds = [...frontMuscles, ...backMuscles].map(m => m.id);
console.assert(
  allIds.length === new Set(allIds).size,
  "Duplicate muscle group IDs detected"
);
```

**On CSV Load**:
```javascript
// Warn if CSV muscle names don't match diagram
const muscleNames = new Set([...frontMuscles, ...backMuscles].map(m => m.name.toLowerCase()));
csvData.forEach(exercise => {
  if (exercise.Muscles) {
    exercise.Muscles.split(',').forEach(muscle => {
      const normalized = muscle.trim().toLowerCase();
      if (!muscleNames.has(normalized)) {
        console.warn(`Unknown muscle in CSV: "${muscle}" in exercise "${exercise.Exercise}"`);
      }
    });
  }
});
```

## Data Volume Assumptions

- **Muscle Groups**: ~12-15 total (static data, loaded once)
- **SVG Paths**: ~200-500 bytes per path, ~5-8KB total
- **Exercises**: 10-200 per CSV file (existing assumption from current app)
- **Selection State**: Max 12 items in `selectedMuscles` array
- **Memory Footprint**: <10KB for muscle diagram data + component state

## Performance Considerations

**Rendering**:
- Conditional rendering: Only active view's SVG is mounted (reduces DOM nodes by 50%)
- Memoization: Wrap MuscleGroup in React.memo if >20 paths cause re-render lag
- CSS-based hover: Offload visual feedback from JavaScript

**Filtering**:
- Filter function runs on every selection change or CSV load
- O(n*m) complexity where n=exercises, m=selected muscles
- Expected: <1ms for 200 exercises × 5 selections

**State Updates**:
- Immutable state updates (spread operators for arrays)
- Avoid setState in loops (batch selection changes if multi-select added)

## JSDoc Type Definitions

```javascript
/**
 * @typedef {Object} MuscleGroup
 * @property {string} id - Unique identifier (e.g., "chest-front")
 * @property {string} name - Display name (e.g., "Chest")
 * @property {"front"|"back"} view - Body perspective
 * @property {string} path - SVG path data
 * @property {"upper"|"core"|"lower"} [category] - Optional categorization
 */

/**
 * @typedef {Object} SelectionState
 * @property {string[]} selectedMuscles - Array of selected muscle names
 * @property {string|null} hoveredMuscle - Currently hovered muscle (desktop only)
 * @property {"front"|"back"} activeView - Current body view
 */

/**
 * @typedef {Object} Exercise
 * @property {string} Exercise - Exercise name
 * @property {string} [Muscles] - Comma-separated muscle groups targeted
 * @property {string} [Sets] - Number of sets
 * @property {string} [Reps] - Repetition range
 * @property {string} [Weight] - Weight used
 * @property {string} [Rest] - Rest period
 * @property {string} [Day] - Training day
 */
```

## Migration Notes

**Existing CSV Files**:
- Current sample CSV does NOT have "Muscles" column
- Need to update `public/sample-workouts.csv` with muscle group data
- Maintain backward compatibility: if "Muscles" column missing, all exercises shown (no filter applied)

**Example Updated Sample CSV**:
```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day,Muscles
Bench Press,4,8-10,185,90,Monday,"Chest, Shoulders, Triceps"
Squats,4,8-10,225,120,Monday,"Quadriceps, Glutes, Hamstrings"
Deadlifts,3,5,315,180,Monday,"Back, Glutes, Hamstrings"
Pull-ups,3,6-8,Bodyweight,60,Wednesday,"Back, Biceps"
Overhead Press,4,8-10,95,90,Wednesday,"Shoulders, Triceps"
Rows,4,10-12,135,60,Wednesday,"Back, Biceps"
Bicep Curls,3,12-15,30,45,Friday,"Biceps"
Tricep Dips,3,10-12,Bodyweight,60,Friday,"Triceps"
Leg Press,4,12-15,405,90,Friday,"Quadriceps, Glutes"
Calf Raises,3,15-20,135,45,Friday,"Calves"
```
