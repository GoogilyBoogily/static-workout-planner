# Quickstart: Exercise List with Search and Tag Filters

**Feature**: 002-exercise-list-filters
**Branch**: `002-exercise-list-filters`
**Last Updated**: 2025-11-15

## Overview

This feature adds exercise filtering capabilities to the workout planner. Users can search exercises by name and filter by muscle groups using an intuitive tag-based interface.

## Prerequisites

- Bun installed (package manager and runtime)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic familiarity with React and JSX

## Quick Setup

### 1. Install Dependencies

```bash
# From repository root
bun install
```

**Note**: No new dependencies required. This feature uses existing React and PapaParse packages.

### 2. Start Development Server

```bash
bun dev
```

Visit `http://localhost:5173` to see the application.

### 3. Load Sample Data

Click "Load Sample Data" button to populate with example workouts. The sample CSV will be updated to include a "Muscle Group" column.

---

## Feature Usage

### End User Flow

1. **Upload CSV** or load sample data
2. **View exercise list** with all exercises displayed below filter controls
3. **Search by name**: Type in search box to filter exercises in real-time
4. **Filter by muscle group**: Click tag pills to toggle filter (blue = active)
5. **Combine filters**: Use search + tags together for precise results
6. **Clear filters**: Delete search text or click active tags to reset

### CSV Format Requirements

Your CSV file must include:

**Required Column**: `Muscle Group` (comma-separated tags)

**Example CSV**:
```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day,Muscle Group
Bench Press,4,8-10,185,90,Monday,"Chest, Shoulders, Triceps"
Squats,4,8-10,225,120,Monday,"Legs, Glutes"
Dumbbell Rows,3,10-12,70,60,Monday,"Back, Biceps"
```

**Important**:
- Exercises without a "Muscle Group" value will NOT appear in the filtered list
- Multiple muscle groups per exercise: separate with commas
- Whitespace around tags is automatically trimmed

---

## Development Guide

### Project Structure

```
src/
├── App.jsx              # Main component (MODIFIED)
├── App.css              # Main styles (MODIFIED)
├── components/          # NEW DIRECTORY
│   ├── ExerciseList.jsx # Exercise list component
│   ├── ExerciseList.css # Exercise list styles
│   ├── SearchInput.jsx  # Search filter component
│   ├── SearchInput.css  # Search input styles
│   ├── TagFilter.jsx    # Tag pill component
│   └── TagFilter.css    # Tag filter styles
└── ...

public/
└── sample-workouts.csv  # MODIFIED (add Muscle Group column)
```

### Key Components

**SearchInput**: Text input for exercise name filtering
- Props: `value`, `onChange`, `placeholder` (optional)
- Behavior: Controlled component, real-time updates

**TagFilter**: Clickable tag pills for muscle group filtering
- Props: `availableTags`, `selectedTags`, `onTagToggle`
- Behavior: Multi-select, toggle on/off, visual active state

**ExerciseList**: Displays filtered exercises with name and tags
- Props: `exercises`, `emptyMessage` (optional)
- Behavior: Read-only list, shows empty state when no matches

### State Management

```javascript
// In App.jsx
const [searchText, setSearchText] = useState('')
const [selectedTags, setSelectedTags] = useState([])
const [exercises, setExercises] = useState([])
const [availableTags, setAvailableTags] = useState([])

// Derived state (automatically recomputed)
const filteredExercises = useMemo(() => {
  // Filter logic here
}, [exercises, searchText, selectedTags])
```

### Filtering Logic

**Search Filter** (case-insensitive, literal text):
```javascript
exercise.name.toLowerCase().includes(searchText.toLowerCase())
```

**Tag Filter** (OR logic - match ANY selected tag):
```javascript
exercise.tags.some(tag => selectedTags.includes(tag))
```

**Combined** (AND relationship):
```javascript
matchesSearch && matchesAnyTag
```

---

## Testing Checklist

### Manual Testing

- [ ] Upload CSV with "Muscle Group" column → exercises appear
- [ ] Upload CSV without "Muscle Group" column → error message
- [ ] Search by exercise name → real-time filtering works
- [ ] Search with special chars (e.g., "press.") → treated literally
- [ ] Click tag pill → toggles active state (visual change)
- [ ] Select multiple tags → shows exercises with ANY tag (OR logic)
- [ ] Combine search + tags → shows intersection (AND logic)
- [ ] Clear search → returns to tag-filtered view
- [ ] Clear all tags → returns to search-filtered view
- [ ] No matches → "No exercises found" message displays
- [ ] Load sample data → pre-populated CSV works

### Performance Testing

- [ ] 500 exercises → filter updates in <1 second (per SC-002)
- [ ] Search typing feels responsive (no lag)
- [ ] Tag toggle feels instant
- [ ] No console errors/warnings

### Accessibility Testing

- [ ] Keyboard navigation: Tab through filter controls
- [ ] Keyboard activation: Space/Enter toggles tags
- [ ] Screen reader: Announces tag state (pressed/not pressed)
- [ ] Focus indicators: Visible focus rings on interactive elements

---

## Common Tasks

### Adding a New Component

1. Create `ComponentName.jsx` and `ComponentName.css` in `src/components/`
2. Import and use in `App.jsx`
3. Follow existing patterns (controlled components, prop contracts)

### Modifying Filter Logic

Edit the `useMemo` in `App.jsx`:
```javascript
const filteredExercises = useMemo(() => {
  // Your custom logic here
}, [exercises, searchText, selectedTags])
```

### Updating Sample CSV

Edit `public/sample-workouts.csv`:
- Ensure "Muscle Group" column is present
- Use comma-separated tags: "Tag1, Tag2, Tag3"
- Whitespace around tags is fine (auto-trimmed)

---

## Troubleshooting

### "No exercises found" even though CSV loaded

**Cause**: Exercises missing "Muscle Group" values
**Solution**: Add muscle group data to all exercises in CSV

### Tag pills not appearing

**Cause**: No unique tags extracted (all "Muscle Group" values empty)
**Solution**: Populate "Muscle Group" column in CSV

### Search not working

**Check**:
- Search input is controlled (`value={searchText}`)
- `onChange` calls `setSearchText`
- `filteredExercises` useMemo includes searchText in dependencies

### Tags not toggling

**Check**:
- `onTagToggle` handler updates `selectedTags` state
- TagFilter receives updated `selectedTags` prop
- CSS `.active` class is applied when tag is selected

---

## Performance Benchmarks

**Target** (per specification):
- Filter update: <1 second for 500 exercises
- Search typing: Real-time (no noticeable delay)

**Expected** (on modern browsers):
- Filter computation: <50ms for 500 exercises
- React re-render: <100ms
- Total: <150ms (well under 1 second target)

**Monitoring**:
- Use browser DevTools Performance tab
- Check for excessive re-renders (React DevTools Profiler)
- Verify useMemo prevents unnecessary recalculations

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

---

## Support

**Issues**: Report bugs via project issue tracker
**Questions**: Refer to plan.md and research.md for technical details
**Constitution**: See `.specify/memory/constitution.md` for project principles
