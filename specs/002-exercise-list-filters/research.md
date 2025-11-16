# Research: Exercise List with Search and Tag Filters

**Feature**: 002-exercise-list-filters
**Date**: 2025-11-15
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Areas

### 1. React State Management for Filtering

**Question**: How to efficiently manage multiple filter states (search text + selected tags) without external state management library?

**Decision**: Use React `useState` hooks with derived state pattern

**Rationale**:
- Aligns with Constitution Principle III (Component Simplicity) - use React built-in hooks
- Filter state is localized to the App component, no need for global state
- Derived state pattern: compute filtered exercises from raw data + filter criteria on each render
- React's reconciliation handles re-renders efficiently for this data volume (500 exercises max)

**Pattern**:
```javascript
// State
const [searchText, setSearchText] = useState('')
const [selectedTags, setSelectedTags] = useState([])

// Derived state (computed each render)
const filteredExercises = useMemo(() => {
  return exercises.filter(exercise => {
    // Search filter
    if (searchText && !exercise.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false
    }
    // Tag filter
    if (selectedTags.length > 0 && !exercise.tags.some(tag => selectedTags.includes(tag))) {
      return false
    }
    return true
  })
}, [exercises, searchText, selectedTags])
```

**Alternatives Considered**:
- ❌ Redux/Zustand: Overkill for localized filter state, violates Component Simplicity
- ❌ useReducer: More complex than needed for this use case
- ✅ useMemo for derived state: Prevents unnecessary recalculations

---

### 2. CSV Parsing with New "Muscle Group" Column

**Question**: How to parse comma-separated muscle groups from CSV column and extract unique tags?

**Decision**: Extend existing PapaParse usage with tag extraction utility

**Rationale**:
- PapaParse already integrated and handles CSV parsing
- Tag extraction is simple string manipulation (split, trim, deduplicate)
- No additional dependencies needed

**Pattern**:
```javascript
// Parse CSV with PapaParse (existing)
Papa.parse(file, {
  header: true, // Use header row mode for easier column access
  complete: (results) => {
    const exercises = results.data
      .filter(row => row['Muscle Group'] && row['Muscle Group'].trim()) // Exclude empty
      .map(row => ({
        name: row.Exercise,
        tags: row['Muscle Group']
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag), // Remove empty strings
        // ... other fields
      }))

    // Extract unique tags
    const allTags = new Set()
    exercises.forEach(ex => ex.tags.forEach(tag => allTags.add(tag)))
    const uniqueTags = Array.from(allTags).sort()
  }
})
```

**Alternatives Considered**:
- ❌ Custom CSV parser: PapaParse is battle-tested, no need to reinvent
- ❌ Server-side parsing: Violates client-only constraint
- ✅ PapaParse with header mode: Cleaner column access by name

**Best Practices**:
- Use `header: true` mode for column name access
- Trim whitespace from tags (per clarification #4)
- Filter out exercises with empty Muscle Group (per clarification #1)
- Use Set for tag deduplication (O(1) lookup)

---

### 3. Search Input Special Character Handling

**Question**: How to implement literal text search that escapes regex metacharacters?

**Decision**: Use string `.includes()` method instead of regex

**Rationale**:
- Per clarification #3: treat special characters as literal text
- String `.includes()` naturally handles all characters literally (no escaping needed)
- Case-insensitive via `.toLowerCase()` on both search and target
- Simpler and safer than regex escaping

**Pattern**:
```javascript
// Safe literal search
const searchLower = searchText.toLowerCase()
const matchesSearch = exercise.name.toLowerCase().includes(searchLower)

// NOT this (regex metacharacters cause issues):
// const regex = new RegExp(searchText, 'i')
// const matchesSearch = regex.test(exercise.name)
```

**Alternatives Considered**:
- ❌ Regex with escaping: More complex, potential for escape bugs
- ❌ Strip special chars: Loses user intent (per clarification)
- ✅ String .includes(): Simple, safe, handles all characters literally

---

### 4. Tag Pill UI Component Pattern

**Question**: How to implement clickable tag pills with toggle behavior and visual state?

**Decision**: Controlled component with CSS classes for state indication

**Rationale**:
- Per clarification #2: clickable pills/badges that toggle on/off
- Controlled component pattern: parent manages selected state
- CSS classes for active/inactive visual differentiation
- Accessibility: use `<button>` elements for keyboard support

**Pattern**:
```javascript
// TagFilter.jsx
function TagFilter({ availableTags, selectedTags, onTagToggle }) {
  return (
    <div className="tag-filter">
      {availableTags.map(tag => (
        <button
          key={tag}
          className={`tag-pill ${selectedTags.includes(tag) ? 'active' : ''}`}
          onClick={() => onTagToggle(tag)}
          aria-pressed={selectedTags.includes(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}

// Parent toggle handler
const handleTagToggle = (tag) => {
  setSelectedTags(prev =>
    prev.includes(tag)
      ? prev.filter(t => t !== tag)  // Remove if selected
      : [...prev, tag]                // Add if not selected
  )
}
```

**Best Practices**:
- Use `<button>` for accessibility (keyboard navigation, screen readers)
- Use `aria-pressed` attribute for assistive technology
- CSS `.active` class for visual state
- Controlled component: parent owns state, child renders UI

**Alternatives Considered**:
- ❌ Checkboxes: Not requested (clarification #2 chose pills)
- ❌ Uncontrolled component: Makes parent coordination harder
- ✅ Button elements with ARIA: Best accessibility

---

### 5. Filter Layout and Positioning

**Question**: How to structure the layout with filters above the list?

**Decision**: Flexbox column layout with filters in header section

**Rationale**:
- Per clarification #5: filters above list (top-to-bottom)
- Flexbox provides responsive layout without complex positioning
- Logical DOM order matches visual order (good for accessibility)

**Pattern**:
```jsx
<div className="app-container">
  {/* Existing CSV upload controls */}

  <div className="filter-section">
    <SearchInput value={searchText} onChange={setSearchText} />
    <TagFilter
      availableTags={uniqueTags}
      selectedTags={selectedTags}
      onTagToggle={handleTagToggle}
    />
  </div>

  <ExerciseList exercises={filteredExercises} />

  {/* Existing data table (separate view) */}
</div>
```

**CSS**:
```css
.app-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
```

**Best Practices**:
- Use semantic HTML structure
- Flexbox gap for consistent spacing
- Mobile-first responsive design
- Clear visual hierarchy

---

### 6. Performance Optimization for Filtering

**Question**: How to ensure <1 second filter updates with 500 exercises?

**Decision**: Use `useMemo` for derived state, avoid unnecessary re-renders

**Rationale**:
- Filtering 500 exercises is computationally trivial (microseconds)
- Bottleneck is React re-rendering, not filter logic
- `useMemo` prevents recalculating filtered list on unrelated state changes
- No need for debouncing (updates are instant per spec)

**Pattern**:
```javascript
const filteredExercises = useMemo(() => {
  let result = exercises

  // Filter by search
  if (searchText) {
    const searchLower = searchText.toLowerCase()
    result = result.filter(ex =>
      ex.name.toLowerCase().includes(searchLower)
    )
  }

  // Filter by tags
  if (selectedTags.length > 0) {
    result = result.filter(ex =>
      ex.tags.some(tag => selectedTags.includes(tag))
    )
  }

  return result
}, [exercises, searchText, selectedTags])
```

**Measurement**:
- Will verify <1 sec requirement via manual testing
- Expected: <50ms for 500 exercises on modern browsers
- Success Criteria SC-002: Filter updates in <1 second ✅

**Alternatives Considered**:
- ❌ Debouncing search: Spec requires real-time updates
- ❌ Virtual scrolling: Unnecessary for 500 items
- ✅ useMemo: Right tool for derived state

---

## Summary

All technical unknowns resolved. Implementation will use:

1. **State Management**: React useState + useMemo (no external library)
2. **CSV Parsing**: PapaParse with header mode + tag extraction utility
3. **Search**: String .includes() for literal text matching
4. **Tag Pills**: Controlled button components with CSS state classes
5. **Layout**: Flexbox column with filters above list
6. **Performance**: useMemo for derived filtering state

All decisions align with constitutional principles and clarified requirements. Ready for Phase 1 (Design & Contracts).
