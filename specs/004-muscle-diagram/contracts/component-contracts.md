# Component Contracts: Interactive SVG Muscle Diagram

**Feature**: 004-muscle-diagram
**Phase**: Phase 1 - Design
**Date**: 2025-11-16

## Overview

This document defines the interface contracts for all React components and utility modules in feature 004. Each contract specifies props, behaviors, state management, and integration points.

---

## Components

### 1. MuscleDiagram.jsx

**Purpose**: Interactive SVG-based muscle diagram showing front and back views with hover/tap interactions.

**Props**:
```typescript
{
  selectedMuscles: string[],              // Currently selected muscle groups
  onMuscleSelect: (muscle: string) => void,  // Callback when muscle is selected/deselected
  view: "front" | "back",                 // Which body view to display
  gender: "male" | "female",              // Body type to display
  showLabels: boolean                     // Whether to show muscle name labels (default: true)
}
```

**State**:
```javascript
const [hoveredMuscle, setHoveredMuscle] = useState(null)  // string | null
const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })  // { x, y }
```

**Behavior**:

1. **Initial Render**:
   - Display SVG with body outline and 12+ muscle regions
   - Each muscle region is a clickable SVG path element
   - Muscle regions have unique IDs (e.g., "chest", "quads", "lats")
   - Apply styling based on selection state and hover state

2. **Hover Interaction (Desktop)**:
   - User hovers over muscle region
   - Region highlights with visual feedback (<100ms)
   - Tooltip appears showing muscle name
   - Tooltip follows cursor or appears near muscle
   - On hover exit: remove highlight and tooltip

3. **Tap Interaction (Mobile/Touch)**:
   - User taps muscle region
   - Region toggles selection state immediately
   - No hover preview on touch devices
   - Call `onMuscleSelect(muscleId)`

4. **Selection State**:
   - Selected muscles have distinct visual styling
   - Selection persists across view/gender changes
   - Click/tap on selected muscle deselects it
   - Visual feedback: filled color for selected, outline for unselected

5. **View Toggle**:
   - Switching between front/back views preserves selection state
   - SVG paths change to show appropriate body side
   - Smooth transition if possible (<300ms)

6. **Gender Toggle**:
   - Switching between male/female updates body outline
   - Muscle regions remain in same positions
   - Selection state preserved

**Muscle Groups** (minimum 12):
- Front view: Chest, Shoulders, Biceps, Abs, Quads, Forearms
- Back view: Upper Back, Lats, Lower Back, Triceps, Glutes, Hamstrings, Calves

**SVG Structure**:
```xml
<svg viewBox="0 0 300 600" className="muscle-diagram">
  <g id="body-outline">
    <!-- Body shape paths -->
  </g>
  <g id="muscle-regions">
    <path id="chest" d="..." onClick={handleMuscleClick} onMouseEnter={handleHover} />
    <path id="shoulders" d="..." onClick={handleMuscleClick} onMouseEnter={handleHover} />
    <!-- More muscle paths -->
  </g>
</svg>
```

**Event Handlers**:
```javascript
function handleMuscleClick(muscleId) {
  onMuscleSelect(muscleId);
}

function handleHover(event, muscleId) {
  // Desktop only (check for touch device)
  if (isTouchDevice()) return;

  setHoveredMuscle(muscleId);
  setTooltipPosition({ x: event.clientX, y: event.clientY });
}

function handleHoverExit() {
  setHoveredMuscle(null);
}
```

**Styling Classes**:
- `.muscle-region` - Base muscle path styling
- `.muscle-region--selected` - Selected state styling
- `.muscle-region--hovered` - Hover state styling
- `.muscle-tooltip` - Tooltip styling

**Performance**:
- SVG inline (not external file)
- Hover feedback <100ms
- Responsive 375px-1920px viewport
- Bundle size <50KB for SVG assets

---

### 2. MuscleDiagramControls.jsx

**Purpose**: Controls for toggling view (front/back) and gender (male/female).

**Props**:
```typescript
{
  view: "front" | "back",
  gender: "male" | "female",
  onViewChange: (view: "front" | "back") => void,
  onGenderChange: (gender: "male" | "female") => void
}
```

**State**: None (controlled component)

**Behavior**:

1. **View Toggle**:
   - Two-state toggle button: "Front" / "Back"
   - Visual indicator for active view
   - On click: call `onViewChange(newView)`

2. **Gender Toggle**:
   - Two-state toggle button: "Male" / "Female"
   - Visual indicator for active gender
   - On click: call `onGenderChange(newGender)`

**Example Render**:
```
┌─────────────────────────────────────┐
│ View: [Front] [Back]                │
│ Gender: [Male] [Female]             │
└─────────────────────────────────────┘
```

**Styling**:
- Toggle buttons with clear active/inactive states
- Keyboard accessible (tab navigation, space/enter to toggle)
- Touch-friendly button size (min 44x44px)

---

### 3. MuscleSelectionSummary.jsx

**Purpose**: Display currently selected muscle groups with clear/remove options.

**Props**:
```typescript
{
  selectedMuscles: string[],              // Currently selected muscles
  onClear: () => void,                    // Clear all selections
  onRemove: (muscle: string) => void      // Remove single muscle
}
```

**State**: None (controlled component)

**Behavior**:

1. **Display Selections**:
   - List selected muscle names as chips/badges
   - Each chip has remove button (X icon)
   - Show count: "3 muscles selected"

2. **Remove Individual**:
   - User clicks X on muscle chip
   - Call `onRemove(muscleId)`
   - Visual feedback: chip fades out

3. **Clear All**:
   - "Clear All" button visible when selections exist
   - On click: call `onClear()`
   - Confirmation optional for >3 selections

**Example Render**:
```
┌─────────────────────────────────────┐
│ Selected Muscles (3)                │
├─────────────────────────────────────┤
│ [Chest ✕] [Shoulders ✕] [Quads ✕]  │
│                                     │
│ [Clear All]                         │
└─────────────────────────────────────┘
```

**Empty State**:
```
┌─────────────────────────────────────┐
│ No muscles selected                 │
│ Click on diagram to select          │
└─────────────────────────────────────┘
```

---

## Utility Modules

### 4. muscleData.js

**Purpose**: Muscle group definitions and SVG path data.

**Exports**:

```javascript
/**
 * Muscle group definitions
 */
export const MUSCLE_GROUPS = [
  { id: "chest", name: "Chest", view: "front" },
  { id: "shoulders", name: "Shoulders", view: "front" },
  { id: "biceps", name: "Biceps", view: "front" },
  { id: "abs", name: "Abs", view: "front" },
  { id: "quads", name: "Quadriceps", view: "front" },
  { id: "forearms", name: "Forearms", view: "front" },
  { id: "upper-back", name: "Upper Back", view: "back" },
  { id: "lats", name: "Lats", view: "back" },
  { id: "lower-back", name: "Lower Back", view: "back" },
  { id: "triceps", name: "Triceps", view: "back" },
  { id: "glutes", name: "Glutes", view: "back" },
  { id: "hamstrings", name: "Hamstrings", view: "back" },
  { id: "calves", name: "Calves", view: "back" }
];

/**
 * Get muscle name by ID
 * @param {string} muscleId - Muscle group ID
 * @returns {string} - Human-readable muscle name
 */
export function getMuscleName(muscleId) { ... }

/**
 * Get muscles for specific view
 * @param {"front" | "back"} view - Body view
 * @returns {Array} - Muscle groups for that view
 */
export function getMusclesForView(view) { ... }

/**
 * SVG path data for muscle regions (organized by view and gender)
 */
export const SVG_PATHS = {
  male: {
    front: {
      chest: "M150,120 L180,140...",
      shoulders: "M120,110 L140,120...",
      // More paths
    },
    back: {
      upperBack: "M140,115 L160,125...",
      lats: "M130,140 L150,160...",
      // More paths
    }
  },
  female: {
    front: { /* Similar structure */ },
    back: { /* Similar structure */ }
  }
};

/**
 * Get SVG path for muscle region
 * @param {string} muscleId - Muscle group ID
 * @param {string} gender - "male" or "female"
 * @param {string} view - "front" or "back"
 * @returns {string} - SVG path data
 */
export function getMusclePath(muscleId, gender, view) { ... }
```

**Implementation Notes**:
- SVG paths are hardcoded (not loaded from external files)
- Paths optimized for minimal size (simplified shapes)
- All paths use relative positioning for scalability

---

### 5. deviceDetection.js

**Purpose**: Detect touch devices to adjust interaction behavior.

**Exports**:

```javascript
/**
 * Check if device supports touch
 * @returns {boolean} - True if touch device
 */
export function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Check if hover is supported
 * @returns {boolean} - True if hover supported (not touch-only)
 */
export function supportsHover() {
  return window.matchMedia('(hover: hover)').matches;
}
```

**Usage**:
- Use `isTouchDevice()` to disable hover tooltips on touch screens
- Use `supportsHover()` for CSS media query fallback

---

## Integration Points

### App.jsx State Management

**New State Variables**:
```javascript
const [selectedMuscles, setSelectedMuscles] = useState([])
const [muscleView, setMuscleView] = useState("front")  // "front" or "back"
const [muscleGender, setMuscleGender] = useState("male")  // "male" or "female"
```

**New Handlers**:
```javascript
function handleMuscleSelect(muscleId) {
  setSelectedMuscles(prev =>
    prev.includes(muscleId)
      ? prev.filter(m => m !== muscleId)  // Deselect
      : [...prev, muscleId]                // Select
  );
}

function handleClearMuscles() {
  setSelectedMuscles([]);
}

function handleRemoveMuscle(muscleId) {
  setSelectedMuscles(prev => prev.filter(m => m !== muscleId));
}
```

**Integration with CSV Data**:
```javascript
// Filter exercises by selected muscles
const filteredExercises = useMemo(() => {
  if (selectedMuscles.length === 0) return csvData;

  return csvData.filter(exercise => {
    const exerciseMuscles = exercise.muscleGroups?.split(',').map(m => m.trim()) || [];
    return exerciseMuscles.some(m => selectedMuscles.includes(m.toLowerCase()));
  });
}, [csvData, selectedMuscles]);
```

**Component Hierarchy**:
```
App.jsx
├─ MuscleDiagramControls.jsx
├─ MuscleDiagram.jsx
│  └─ SVG muscle regions
├─ MuscleSelectionSummary.jsx
└─ WorkoutTable.jsx (filtered by selectedMuscles)
```

---

## Summary

### New Components
1. **MuscleDiagram**: Main interactive SVG diagram
2. **MuscleDiagramControls**: View/gender toggle controls
3. **MuscleSelectionSummary**: Selected muscles display with clear/remove

### New Utilities
1. **muscleData.js**: Muscle definitions and SVG path data
2. **deviceDetection.js**: Touch device detection for interaction behavior

### Integration
- App.jsx manages muscle selection state
- Selection state persists across view/gender changes
- CSV data filtered by selected muscles
- Touch-first interaction design (single tap selects, no hover on mobile)
- Responsive SVG scales to viewport

### Performance Targets
- SVG load and interactive <2s on broadband
- Hover feedback <100ms
- Responsive 375px-1920px viewport
- Bundle size increase <50KB for SVG assets
