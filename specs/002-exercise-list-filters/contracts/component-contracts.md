# Component Contracts

**Feature**: 002-exercise-list-filters
**Date**: 2025-11-15
**Purpose**: Define component interfaces and prop contracts

## Component Hierarchy

```
App (modified)
├── (existing) CSV Upload Controls
├── (new) SearchInput
├── (new) TagFilter
├── (new) ExerciseList
└── (existing) Data Table
```

---

## SearchInput Component

**Purpose**: Text input for filtering exercises by name

**Props**:
```typescript
{
  value: string,           // Current search text
  onChange: (text: string) => void,  // Callback when search changes
  placeholder?: string     // Optional placeholder text (default: "Search exercises...")
}
```

**Behavior**:
- Controlled component (value managed by parent)
- Calls `onChange` on every input event (real-time filtering)
- Case-insensitive matching handled by parent filter logic
- Special characters treated as literal text (per FR-003a)

**Accessibility**:
- Label: "Search exercises"
- Input type: "search" or "text"
- Autocomplete: off
- Clear button (optional): Reset search to empty string

**Example Usage**:
```jsx
<SearchInput
  value={searchText}
  onChange={setSearchText}
  placeholder="Search exercises..."
/>
```

---

## TagFilter Component

**Purpose**: Display clickable tag pills for filtering by muscle groups

**Props**:
```typescript
{
  availableTags: string[],           // All unique tags to display
  selectedTags: string[],            // Currently selected tags
  onTagToggle: (tag: string) => void // Callback when tag clicked
}
```

**Behavior**:
- Controlled component (selected state managed by parent)
- Renders one button per tag in `availableTags`
- Calls `onTagToggle(tag)` when tag clicked
- Visual distinction between selected/unselected tags (CSS `.active` class)
- Tags displayed in alphabetical order (sorted by parent)

**Accessibility**:
- Each tag is a `<button>` element
- `aria-pressed` attribute indicates selected state
- Keyboard navigable (tab through tags, space/enter to toggle)
- Screen reader announces: "Chest, button, pressed" or "Chest, button, not pressed"

**Visual States** (per FR-014):
- **Unselected**: Default button style (e.g., light gray background, dark text)
- **Selected**: Active state (e.g., blue background, white text, slight elevation)
- **Hover**: Hover effect (e.g., darker border)
- **Focus**: Keyboard focus ring (browser default or custom)

**Example Usage**:
```jsx
<TagFilter
  availableTags={["Chest", "Legs", "Shoulders", "Back"]}
  selectedTags={["Chest", "Shoulders"]}
  onTagToggle={handleTagToggle}
/>
```

**Toggle Logic** (implemented by parent):
```javascript
const handleTagToggle = (tag) => {
  setSelectedTags(prev =>
    prev.includes(tag)
      ? prev.filter(t => t !== tag)  // Remove if selected
      : [...prev, tag]                // Add if not selected
  )
}
```

---

## ExerciseList Component

**Purpose**: Display filtered list of exercises with name and tags

**Props**:
```typescript
{
  exercises: Exercise[],   // Filtered exercises to display
  emptyMessage?: string    // Optional message when no exercises (default: "No exercises found")
}

// Exercise shape:
type Exercise = {
  name: string,
  tags: string[],
  // ... other fields not displayed in list view
}
```

**Behavior**:
- Displays exercise name and associated tags (per FR-012)
- Shows `emptyMessage` when `exercises` array is empty (per FR-008)
- Renders all exercises in filtered array (no pagination)
- Read-only view (no interaction required)

**Display Format** (per clarification #3):
- Exercise name: Prominent text (e.g., heading or bold)
- Tags: Inline pills/badges (visual grouping, not clickable)
- Layout: List or card format

**Example Display**:
```
┌─────────────────────────────┐
│ Bench Press                 │
│ [Chest] [Shoulders] [Triceps] │
├─────────────────────────────┤
│ Squats                      │
│ [Legs] [Glutes]             │
└─────────────────────────────┘
```

**Empty State**:
```
┌─────────────────────────────┐
│ No exercises match your     │
│ current filters.            │
└─────────────────────────────┘
```

**Example Usage**:
```jsx
<ExerciseList
  exercises={filteredExercises}
  emptyMessage="No exercises match your current filters."
/>
```

---

## App Component (Modified)

**New State**:
```javascript
// Filter state
const [searchText, setSearchText] = useState('')
const [selectedTags, setSelectedTags] = useState([])

// Parsed data (existing data/headers replaced with structured exercises)
const [exercises, setExercises] = useState([])
const [availableTags, setAvailableTags] = useState([])
```

**Derived State**:
```javascript
const filteredExercises = useMemo(() => {
  let result = exercises

  // Apply search filter
  if (searchText) {
    const searchLower = searchText.toLowerCase()
    result = result.filter(ex =>
      ex.name.toLowerCase().includes(searchLower)
    )
  }

  // Apply tag filter (OR logic)
  if (selectedTags.length > 0) {
    result = result.filter(ex =>
      ex.tags.some(tag => selectedTags.includes(tag))
    )
  }

  return result
}, [exercises, searchText, selectedTags])
```

**CSV Parsing** (Modified):
```javascript
Papa.parse(file, {
  header: true,  // Use header row mode
  complete: (results) => {
    // Extract exercises with muscle groups
    const parsedExercises = results.data
      .filter(row => row['Muscle Group'] && row['Muscle Group'].trim())
      .map(row => ({
        name: row.Exercise,
        tags: row['Muscle Group']
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        sets: row.Sets,
        reps: row.Reps,
        weight: row['Weight (lbs)'],
        rest: row['Rest (sec)'],
        day: row.Day
      }))

    // Extract unique tags
    const tagsSet = new Set()
    parsedExercises.forEach(ex =>
      ex.tags.forEach(tag => tagsSet.add(tag))
    )
    const uniqueTags = Array.from(tagsSet).sort()

    setExercises(parsedExercises)
    setAvailableTags(uniqueTags)
  }
})
```

**Render Structure** (per FR-015, Clarification #5):
```jsx
<div className="App">
  <h1>Workout Planner</h1>

  {/* Existing CSV upload controls */}
  <div className="csv-loader">
    <input type="file" accept=".csv" onChange={handleFileUpload} />
    <button onClick={loadSampleData}>Load Sample Data</button>
  </div>

  {error && <div className="error">{error}</div>}

  {/* New filter section - ABOVE exercise list */}
  {exercises.length > 0 && (
    <div className="filter-section">
      <SearchInput
        value={searchText}
        onChange={setSearchText}
      />
      <TagFilter
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />
    </div>
  )}

  {/* New exercise list view */}
  {exercises.length > 0 && (
    <ExerciseList exercises={filteredExercises} />
  )}

  {/* Existing data table (unchanged) */}
  {data.length > 0 && (
    <div className="data-table">
      <table>
        {/* ... existing table markup ... */}
      </table>
    </div>
  )}
</div>
```

---

## Data Flow Contract

```
1. User uploads CSV
   ↓
2. App.handleFileUpload()
   - Parse CSV with PapaParse (header: true)
   - Extract exercises with non-empty "Muscle Group"
   - Parse tags (split, trim, filter)
   - Extract unique tags
   - setExercises(), setAvailableTags()
   ↓
3. App renders SearchInput + TagFilter + ExerciseList
   - SearchInput receives: value={searchText}, onChange={setSearchText}
   - TagFilter receives: availableTags, selectedTags, onTagToggle
   - ExerciseList receives: filteredExercises (useMemo computed)
   ↓
4. User types in SearchInput
   - SearchInput calls onChange(newText)
   - App updates searchText state
   - useMemo recomputes filteredExercises
   - ExerciseList re-renders with new filtered array
   ↓
5. User clicks tag pill in TagFilter
   - TagFilter calls onTagToggle(tag)
   - App updates selectedTags state (add/remove tag)
   - useMemo recomputes filteredExercises
   - TagFilter re-renders (pill visual state changes)
   - ExerciseList re-renders with new filtered array
```

---

## Error Handling

**Missing "Muscle Group" Column**:
```javascript
if (!results.data[0].hasOwnProperty('Muscle Group')) {
  setError('CSV must include a "Muscle Group" column')
  return
}
```

**No Exercises After Filtering**:
- ExerciseList shows empty message (per FR-008)
- User can clear filters to see all exercises again

**Invalid CSV Format**:
- Existing error handling from PapaParse (unchanged)
- Shows error message to user

---

## Performance Contract

**Filter Update Time** (per SC-002):
- Target: <1 second for 500 exercises
- Expected: <50ms on modern browsers
- Measured: Via manual testing with sample data

**Re-render Optimization**:
- Use `useMemo` for filteredExercises (prevent recalc on unrelated state changes)
- Components are small and focused (minimal render cost)
- No virtualization needed for 500 items
