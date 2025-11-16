# Research: Interactive SVG Muscle Diagram

**Phase**: 0 (Outline & Research)
**Date**: 2025-11-15
**Purpose**: Resolve technical unknowns and document best practices for SVG-based interactive diagrams in React

## Research Tasks

### 1. SVG Path Data for Human Body Diagrams

**Question**: Where can we source anatomically reasonable SVG paths for front/back human body muscle groups?

**Decision**: Use simplified custom SVG paths or Creative Commons anatomical diagrams

**Rationale**:
- Custom paths: Maximum control, optimized for web performance, exact muscle grouping
- CC-licensed medical/fitness SVGs: Faster initial implementation but may need simplification
- Avoid complex 3D models or high-detail anatomy (conflicts with Performance by Default principle)

**Recommended Approach**:
1. Start with simplified geometric shapes representing muscle regions (rectangles, ellipses, polygons)
2. Refine paths iteratively based on visual clarity at target screen sizes (375px-1920px)
3. Each muscle group = single `<path>` or `<g>` element with unique ID

**Alternatives Considered**:
- External SVG files: Rejected (requires fetch, harder to make interactive)
- Canvas rendering: Rejected (accessibility issues, no native hover/click DOM events)
- Image maps: Rejected (not scalable, poor mobile experience)

**Implementation Notes**:
- Store paths in `src/assets/muscle-groups.js` as JavaScript objects
- Format: `{ name: "Chest", view: "front", path: "M...", id: "chest-front" }`
- Use viewBox for responsive scaling

### 2. React SVG Event Handling Best Practices

**Question**: What's the performant way to handle hover/click events on SVG paths in React?

**Decision**: Use React synthetic events on `<path>` elements with CSS hover states where possible

**Rationale**:
- React synthetic events (onClick, onMouseEnter, onMouseLeave) work natively on SVG elements
- CSS `:hover` pseudoclass for visual feedback (reduces JavaScript overhead)
- JavaScript state updates only for selection persistence and tooltip content

**Best Practices**:
1. **Hover state**: CSS `:hover { fill: highlight-color; }` for instant visual feedback
2. **Tooltip display**: onMouseEnter sets state with muscle name, onMouseLeave clears
3. **Selection**: onClick toggles selected muscle IDs in state array
4. **Touch devices**: Use onClick only (no mouse events), CSS `:active` for tap feedback

**Performance Optimizations**:
- Use `pointer-events: bounding-box` on paths to reduce hit-test area calculations
- Debounce rapid hover state changes if performance issues observed
- Memoize muscle group components if >20 paths cause re-render lag

**Code Pattern**:
```javascript
const MuscleGroup = ({ muscle, isSelected, isHovered, onHover, onClick }) => (
  <path
    id={muscle.id}
    d={muscle.path}
    className={`muscle ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
    onMouseEnter={() => onHover(muscle.name)}
    onMouseLeave={() => onHover(null)}
    onClick={() => onClick(muscle.id)}
    role="button"
    aria-label={`Select ${muscle.name}`}
  />
);
```

### 3. Tooltip Positioning Strategies

**Question**: How should tooltips follow the cursor or position near hovered SVG elements?

**Decision**: Fixed-position tooltip that updates coordinates on mousemove

**Rationale**:
- Cursor-following: Smooth UX but requires mousemove listener (potential performance cost)
- Fixed near element: Simpler but may obscure adjacent muscles
- Hybrid: Fixed offset from cursor (e.g., 10px right, 10px down) updated on enter/move

**Recommended Implementation**:
1. Single tooltip `<div>` positioned absolutely
2. Update position on `onMouseMove` with throttle (16ms for 60fps)
3. Offset from cursor to avoid obscuring muscle being hovered
4. Hide tooltip on touch devices (selection happens immediately)

**CSS Strategy**:
```css
.muscle-tooltip {
  position: fixed; /* or absolute relative to diagram container */
  pointer-events: none; /* prevent tooltip from blocking mouse events */
  transform: translate(10px, -30px); /* offset from cursor */
  white-space: nowrap;
  z-index: 1000;
}
```

**Alternatives Considered**:
- Portal-based tooltips: Overkill for simple text display
- SVG `<title>` element: Not styleable, poor mobile support
- Third-party tooltip library: Violates Component Simplicity (unnecessary dependency)

### 4. Muscle Group Filtering Logic

**Question**: How should CSV exercise data be filtered when muscles are selected?

**Decision**: Pure filtering function that matches any selected muscle in comma-separated list

**Rationale**:
- CSV format: `"Muscles": "Chest, Shoulders, Triceps"`
- Filtering logic: OR semantics (show if ANY selected muscle matches)
- Case-insensitive matching with whitespace trimming

**Implementation**:
```javascript
// utils/muscleFilter.js
export function filterExercisesByMuscles(exercises, selectedMuscles) {
  if (selectedMuscles.length === 0) return exercises;
  
  return exercises.filter(exercise => {
    if (!exercise.Muscles) return false; // FR-013: handle missing data
    
    const targetedMuscles = exercise.Muscles
      .split(',')
      .map(m => m.trim().toLowerCase());
    
    return selectedMuscles.some(selected =>
      targetedMuscles.includes(selected.toLowerCase())
    );
  });
}
```

**Edge Cases Handled**:
- Empty selection → show all exercises
- Missing "Muscles" column → exclude exercise (or show warning per FR-013)
- Whitespace variations → trim and normalize
- Case sensitivity → toLowerCase for comparison

### 5. State Management for Diagram + Table Integration

**Question**: How should selection state be shared between MuscleD iagram and CSV table?

**Decision**: Lift state to App.jsx, pass down as props with callback functions

**Rationale**:
- Aligns with constitution principle III (use React hooks, no external state library)
- App.jsx already manages CSV data state
- Selections need to persist across CSV file loads (FR-014)

**State Structure in App.jsx**:
```javascript
const [selectedMuscles, setSelectedMuscles] = useState([]);
const [csvData, setCsvData] = useState([]);

// When user selects muscle in diagram
const handleMuscleToggle = (muscleName) => {
  setSelectedMuscles(prev =>
    prev.includes(muscleName)
      ? prev.filter(m => m !== muscleName) // deselect
      : [...prev, muscleName] // select
  );
};

// Filter exercises based on selections
const filteredExercises = filterExercisesByMuscles(csvData, selectedMuscles);
```

**Persistence Strategy** (FR-014):
- Selections stored in component state (lost on page refresh - acceptable for MVP)
- When new CSV loaded: keep `selectedMuscles` state intact, reapply filter
- Optional future enhancement: localStorage persistence

### 6. Responsive SVG Sizing

**Question**: How to make SVG responsive from 375px (mobile) to 1920px (desktop)?

**Decision**: Use viewBox with 100% width container and CSS max-width constraints

**Rationale**:
- viewBox preserves aspect ratio while scaling
- Container width 100% allows mobile responsiveness
- max-width prevents excessive size on large screens

**Implementation**:
```javascript
<svg
  viewBox="0 0 300 600" // Aspect ratio ~1:2 for human body
  className="muscle-diagram-svg"
  role="img"
  aria-label="Human body muscle diagram"
>
  {/* paths */}
</svg>
```

```css
.muscle-diagram-svg {
  width: 100%;
  height: auto;
  max-width: 400px; /* Prevent excessive size on desktop */
}

@media (min-width: 768px) {
  .muscle-diagram-svg {
    max-width: 500px;
  }
}
```

**Accessibility Considerations**:
- Add `role="img"` and `aria-label` to SVG
- Each muscle path gets `role="button"` and `aria-label="Select {muscle name}"`
- Ensure color contrast for hover/selected states meets WCAG AA

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| SVG Source | Custom simplified paths in JS module | Performance, control, simplicity |
| Event Handling | React synthetic events + CSS hover | Native support, performant |
| Tooltips | Fixed position with cursor offset | Balance of UX and performance |
| Filtering | Pure function with OR semantics | Testable, clear logic |
| State Management | Lift to App.jsx with useState | Constitution compliance, simple |
| Responsiveness | viewBox with max-width constraints | Scalable, mobile-first |

## Next Steps

Phase 1 will document:
- Exact muscle group data model (names, SVG paths, front/back assignment)
- Component prop interfaces (JSDoc)
- Integration points with existing App.jsx
