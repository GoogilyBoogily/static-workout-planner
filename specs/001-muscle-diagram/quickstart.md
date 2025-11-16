# Quickstart: Interactive SVG Muscle Diagram

**Feature**: Interactive SVG Muscle Diagram
**Branch**: `001-muscle-diagram`
**Last Updated**: 2025-11-15

## Overview

This feature adds an interactive SVG-based muscle diagram to the workout planner. Users can view front/back body diagrams, hover (desktop) or tap (mobile) to select muscle groups, and filter workout exercises by targeted muscles.

## Prerequisites

- Bun installed (existing project dependency)
- React 18 (existing)
- Vite dev server running (`bun dev`)

No additional dependencies required.

## Development Setup

### 1. Verify Branch

```bash
git branch
# Should show: * 001-muscle-diagram
```

### 2. File Structure

New files to create:

```
src/
├── components/
│   └── MuscleDiagram.jsx       # Main diagram component
├── assets/
│   └── muscle-groups.js        # SVG path data
└── utils/
    └── muscleFilter.js         # Filtering logic

public/
└── sample-workouts.csv         # Update with "Muscles" column
```

### 3. Implementation Order

Follow this sequence to build the feature incrementally:

#### Step 1: Create Muscle Group Data Module

**File**: `src/assets/muscle-groups.js`

Start with simplified placeholder SVG paths:

```javascript
/**
 * @typedef {Object} MuscleGroup
 * @property {string} id
 * @property {string} name
 * @property {"front"|"back"} view
 * @property {string} path
 * @property {"upper"|"core"|"lower"} [category]
 */

/** @type {MuscleGroup[]} */
export const frontMuscles = [
  {
    id: "chest-front",
    name: "Chest",
    view: "front",
    path: "M140,110 L160,110 L170,140 L160,150 L140,150 L130,140 Z",
    category: "upper"
  },
  {
    id: "shoulders-front",
    name: "Shoulders",
    view: "front",
    path: "M110,100 L130,100 L135,120 L125,125 L110,120 Z",
    category: "upper"
  },
  // Add remaining front muscles: Biceps, Forearms, Abdominals, Quadriceps
];

/** @type {MuscleGroup[]} */
export const backMuscles = [
  {
    id: "back-back",
    name: "Back",
    view: "back",
    path: "M130,120 L170,120 L175,180 L165,190 L135,190 L125,180 Z",
    category: "upper"
  },
  // Add remaining back muscles: Trapezius, Triceps, Glutes, Hamstrings, Calves
];
```

**Note**: Start with simple geometric shapes. Refine paths iteratively for visual accuracy.

#### Step 2: Create Filter Utility

**File**: `src/utils/muscleFilter.js`

```javascript
/**
 * Filters exercises by selected muscle groups using OR logic
 * @param {Object[]} exercises - Array of exercise objects
 * @param {string[]} selectedMuscles - Array of muscle names to filter by
 * @returns {Object[]} Filtered exercises
 */
export function filterExercisesByMuscles(exercises, selectedMuscles) {
  // No selections = show all
  if (!selectedMuscles || selectedMuscles.length === 0) {
    return exercises;
  }

  return exercises.filter(exercise => {
    // Handle missing Muscles column (FR-013)
    if (!exercise.Muscles) {
      return false;
    }

    // Parse comma-separated muscle list
    const targetedMuscles = exercise.Muscles
      .split(',')
      .map(m => m.trim().toLowerCase());

    // Match if ANY selected muscle is targeted
    return selectedMuscles.some(selected =>
      targetedMuscles.includes(selected.toLowerCase())
    );
  });
}
```

#### Step 3: Create Muscle Diagram Component

**File**: `src/components/MuscleDiagram.jsx`

```javascript
import { useState } from 'react';
import { frontMuscles, backMuscles } from '../assets/muscle-groups.js';
import './MuscleDiagram.css';

/**
 * @typedef {Object} MuscleDiagramProps
 * @property {string[]} selectedMuscles
 * @property {function(string): void} onMuscleToggle
 */

/** @param {MuscleDiagramProps} props */
export default function MuscleDiagram({ selectedMuscles, onMuscleToggle }) {
  const [activeView, setActiveView] = useState('front');
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  const muscles = activeView === 'front' ? frontMuscles : backMuscles;

  const handleMuscleClick = (muscleName) => {
    onMuscleToggle(muscleName);
  };

  const handleMuscleHover = (muscleName) => {
    setHoveredMuscle(muscleName);
  };

  return (
    <div className="muscle-diagram">
      <div className="view-toggle">
        <button
          className={activeView === 'front' ? 'active' : ''}
          onClick={() => setActiveView('front')}
        >
          Front
        </button>
        <button
          className={activeView === 'back' ? 'active' : ''}
          onClick={() => setActiveView('back')}
        >
          Back
        </button>
      </div>

      <svg
        viewBox="0 0 300 600"
        className="muscle-diagram-svg"
        role="img"
        aria-label={`${activeView} view of human body muscle diagram`}
      >
        {muscles.map(muscle => (
          <path
            key={muscle.id}
            id={muscle.id}
            d={muscle.path}
            className={`muscle ${selectedMuscles.includes(muscle.name) ? 'selected' : ''}`}
            onClick={() => handleMuscleClick(muscle.name)}
            onMouseEnter={() => handleMuscleHover(muscle.name)}
            onMouseLeave={() => handleMuscleHover(null)}
            role="button"
            aria-label={`Select ${muscle.name}`}
            tabIndex={0}
          />
        ))}
      </svg>

      {hoveredMuscle && (
        <div className="muscle-tooltip">
          {hoveredMuscle}
        </div>
      )}
    </div>
  );
}
```

#### Step 4: Add Styles

**File**: `src/components/MuscleDiagram.css` (create new) or add to `src/App.css`

```css
.muscle-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-toggle button {
  padding: 0.5rem 1rem;
  border: 2px solid #ccc;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.view-toggle button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.muscle-diagram-svg {
  width: 100%;
  height: auto;
  max-width: 350px;
  border: 1px solid #eee;
}

@media (min-width: 768px) {
  .muscle-diagram-svg {
    max-width: 450px;
  }
}

.muscle {
  fill: #e0e0e0;
  stroke: #999;
  stroke-width: 1.5;
  cursor: pointer;
  transition: fill 0.15s ease;
}

.muscle:hover {
  fill: #b3d9ff;
}

.muscle.selected {
  fill: #007bff;
  stroke: #0056b3;
}

.muscle-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
  transform: translate(10px, -30px);
}

/* Mobile: hide tooltip, use selected state only */
@media (max-width: 767px) {
  .muscle-tooltip {
    display: none;
  }
}
```

#### Step 5: Integrate with App.jsx

**File**: `src/App.jsx` (modify existing)

```javascript
import { useState } from 'react';
import Papa from 'papaparse';
import MuscleDiagram from './components/MuscleDiagram';
import { filterExercisesByMuscles } from './utils/muscleFilter';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState(null);
  const [selectedMuscles, setSelectedMuscles] = useState([]);

  const handleMuscleToggle = (muscleName) => {
    setSelectedMuscles(prev =>
      prev.includes(muscleName)
        ? prev.filter(m => m !== muscleName)
        : [...prev, muscleName]
    );
  };

  const handleFileUpload = (event) => {
    // Existing CSV parsing logic...
    // Note: selections persist (FR-014)
  };

  const loadSampleData = () => {
    // Existing sample data loading...
    // Note: selections persist (FR-014)
  };

  // Filter exercises based on muscle selections
  const filteredData = filterExercisesByMuscles(data, selectedMuscles);

  return (
    <div className="App">
      <h1>Workout Planner</h1>

      {/* File upload controls (existing) */}
      
      <MuscleDiagram
        selectedMuscles={selectedMuscles}
        onMuscleToggle={handleMuscleToggle}
      />

      {/* Display filtered data instead of raw data */}
      {filteredData.length > 0 && (
        <>
          <h2>
            Workout Data
            {selectedMuscles.length > 0 && (
              <span> (Filtered by: {selectedMuscles.join(', ')})</span>
            )}
          </h2>
          <table>
            {/* Render filteredData instead of data */}
          </table>
        </>
      )}
    </div>
  );
}

export default App;
```

#### Step 6: Update Sample CSV

**File**: `public/sample-workouts.csv`

Add "Muscles" column to existing data:

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

## Testing the Feature

### Manual Testing Checklist

**P1: View Muscle Groups**
- [ ] Front view displays with at least 6 muscle groups visible
- [ ] Back view displays with at least 6 muscle groups visible
- [ ] Toggle switches between front and back views
- [ ] Muscle groups are visually distinct and clickable

**P2: Hover Interactions (Desktop)**
- [ ] Hovering over muscle highlights it
- [ ] Tooltip appears showing muscle name
- [ ] Tooltip follows cursor or appears near muscle
- [ ] Hover state clears when mouse leaves
- [ ] Multiple rapid hovers don't cause visual glitches

**P3: Selection and Filtering**
- [ ] Clicking muscle selects it (visual change)
- [ ] Clicking again deselects
- [ ] Table filters to show only exercises targeting selected muscles
- [ ] Multiple muscle selections work (OR logic - any match shown)
- [ ] Clearing all selections shows all exercises
- [ ] Loading new CSV preserves selections and filters new data (FR-014)

**Mobile/Touch**
- [ ] Tap directly selects muscle (no tooltip on mobile)
- [ ] Diagram is responsive on 375px width
- [ ] Tap interactions feel responsive (<100ms feedback)

**Edge Cases**
- [ ] Exercises without "Muscles" column are hidden when filters active
- [ ] Unknown muscle names in CSV logged as warning (check console)
- [ ] Rapid selection changes don't cause lag

### Performance Validation

**Baseline (before feature)**:
```bash
bun run build
ls -lh dist/assets/*.js  # Note bundle sizes
```

**After implementation**:
```bash
bun run build
ls -lh dist/assets/*.js  # Should increase <50KB
```

**Load time test**:
- Open DevTools Network tab
- Hard refresh (Cmd/Ctrl + Shift + R)
- Check "DOMContentLoaded" and "Load" times
- Target: Interactive <2s on 3G throttling

## Common Issues & Solutions

### Issue: Tooltip doesn't follow cursor

**Solution**: Add mousemove listener to update tooltip position:

```javascript
const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

const handleMouseMove = (e) => {
  setTooltipPos({ x: e.clientX, y: e.clientY });
};

<svg onMouseMove={handleMouseMove}>
  {/* paths */}
</svg>

{hoveredMuscle && (
  <div 
    className="muscle-tooltip"
    style={{ left: tooltipPos.x + 10, top: tooltipPos.y - 30 }}
  >
    {hoveredMuscle}
  </div>
)}
```

### Issue: SVG paths not clickable on mobile

**Solution**: Increase touch target size with CSS:

```css
@media (max-width: 767px) {
  .muscle {
    stroke-width: 8;  /* Larger touch target */
    stroke-opacity: 0;  /* But invisible */
  }
}
```

### Issue: Muscle names in CSV don't match diagram

**Solution**: Add validation on CSV load:

```javascript
const muscleNames = new Set([...frontMuscles, ...backMuscles].map(m => m.name.toLowerCase()));

csvData.forEach(exercise => {
  if (exercise.Muscles) {
    exercise.Muscles.split(',').forEach(muscle => {
      const normalized = muscle.trim().toLowerCase();
      if (!muscleNames.has(normalized)) {
        console.warn(`Unknown muscle: "${muscle}" in "${exercise.Exercise}"`);
      }
    });
  }
});
```

## Performance Optimization Tips

1. **Memoize filtered data** if filtering becomes slow:
```javascript
import { useMemo } from 'react';

const filteredData = useMemo(
  () => filterExercisesByMuscles(data, selectedMuscles),
  [data, selectedMuscles]
);
```

2. **Memoize muscle group components** if >20 paths:
```javascript
const MuscleGroup = React.memo(({ muscle, isSelected, onClick }) => (
  <path /* ... */ />
));
```

3. **Use CSS transitions** instead of JS animations for hover effects

## Accessibility Notes

- Each muscle path has `role="button"` and `aria-label`
- Keyboard navigation supported via `tabIndex={0}`
- Consider adding `aria-pressed` for selected state:

```javascript
<path
  aria-pressed={selectedMuscles.includes(muscle.name)}
  /* ... */
/>
```

## Next Steps After Implementation

1. Run `/speckit.tasks` to generate task breakdown for implementation
2. Follow task list to implement feature incrementally
3. Test each user story independently per priorities (P1 → P2 → P3)
4. Track bundle size impact and load time metrics
5. Consider adding localStorage persistence for selections (future enhancement)
