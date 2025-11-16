# Data Model: Exercise List with Search and Tag Filters

**Feature**: 002-exercise-list-filters
**Date**: 2025-11-15
**Source**: Derived from spec.md functional requirements

## Entities

### Exercise

Represents a single workout exercise with associated metadata for filtering and display.

**Fields**:
- `name` (string, required): Exercise name (e.g., "Bench Press", "Squats")
- `tags` (array of string, required): Muscle groups/categories (e.g., ["Chest", "Shoulders"])
- `sets` (string, optional): Number of sets
- `reps` (string, optional): Repetition range
- `weight` (string, optional): Weight value with unit
- `rest` (string, optional): Rest period in seconds
- `day` (string, optional): Workout day

**Validation Rules** (from FR-013):
- Exercise MUST have at least one non-empty tag to be included in the list
- Empty or missing "Muscle Group" values cause the exercise to be excluded entirely

**Source**: Parsed from CSV file with "Muscle Group" column

**Example**:
```javascript
{
  name: "Bench Press",
  tags: ["Chest", "Shoulders", "Triceps"],
  sets: "4",
  reps: "8-10",
  weight: "185 lbs",
  rest: "90 sec",
  day: "Monday"
}
```

---

### Tag (Muscle Group)

Represents a categorical label used for filtering exercises.

**Fields**:
- `name` (string, required): Tag display name (e.g., "Chest", "Legs", "Cardio")

**Derivation**:
- Extracted from "Muscle Group" column in CSV
- Parsed by splitting on comma delimiter
- Whitespace trimmed from each tag (per clarification #4)
- Deduplicated across all exercises using Set

**Validation Rules** (from FR-011):
- Leading/trailing whitespace MUST be trimmed
- Empty strings after trimming MUST be filtered out
- Tag names are case-sensitive as entered in CSV

**Example**:
```javascript
// From CSV: "Chest, Shoulders, Triceps"
// Results in: ["Chest", "Shoulders", "Triceps"]
```

---

## State Model

### Application State

**Filter State** (user-controlled):
- `searchText` (string): Current search input value (default: "")
- `selectedTags` (array of string): Currently active tag filters (default: [])

**Data State** (derived from CSV):
- `exercises` (array of Exercise): All valid exercises from CSV
- `availableTags` (array of string): All unique tags sorted alphabetically

**Derived State** (computed):
- `filteredExercises` (array of Exercise): Exercises matching current filters

### State Transitions

```
Initial State:
  searchText = ""
  selectedTags = []
  exercises = []
  availableTags = []
  → User sees "Upload a CSV file" message

CSV Upload:
  → Parse CSV with PapaParse
  → Extract exercises with tags
  → Filter out exercises with empty "Muscle Group"
  → Extract unique tags
  → Set exercises and availableTags
  → User sees all exercises + all tag options

Search Input Changed:
  searchText = newValue
  → filteredExercises recomputed via useMemo
  → ExerciseList re-renders with new results

Tag Toggled:
  if tag in selectedTags:
    selectedTags = selectedTags.filter(t => t !== tag)
  else:
    selectedTags = [...selectedTags, tag]
  → filteredExercises recomputed via useMemo
  → Tag pill visual state updates (active/inactive)
  → ExerciseList re-renders with new results

Clear Filters:
  searchText = ""
  selectedTags = []
  → All exercises shown
```

---

## Filtering Logic

### Filter Algorithm

**Pseudocode**:
```
function filterExercises(exercises, searchText, selectedTags):
  result = exercises

  // Step 1: Apply search filter
  if searchText is not empty:
    searchLower = searchText.toLowerCase()
    result = result.filter(exercise =>
      exercise.name.toLowerCase().includes(searchLower)
    )

  // Step 2: Apply tag filter (OR logic)
  if selectedTags.length > 0:
    result = result.filter(exercise =>
      exercise.tags.some(tag => selectedTags.includes(tag))
    )

  return result
```

**Filter Relationship** (from clarification #1, User Story 4):
- Search AND Tags: Both must match (intersection)
- Multiple Tags: ANY match (union/OR logic per assumption)

**Examples**:
```
exercises = [
  { name: "Bench Press", tags: ["Chest", "Shoulders"] },
  { name: "Squats", tags: ["Legs"] },
  { name: "Shoulder Press", tags: ["Shoulders"] }
]

// Search only
searchText = "press"
selectedTags = []
→ Result: ["Bench Press", "Shoulder Press"]

// Tags only
searchText = ""
selectedTags = ["Shoulders"]
→ Result: ["Bench Press", "Shoulder Press"]

// Combined (AND relationship)
searchText = "press"
selectedTags = ["Shoulders"]
→ Result: ["Bench Press", "Shoulder Press"]

// No matches
searchText = "curl"
selectedTags = ["Legs"]
→ Result: [] (show "No exercises match" message per FR-008)
```

---

## Data Flow

```
CSV File Upload
    ↓
PapaParse.parse({ header: true })
    ↓
Extract rows with non-empty "Muscle Group"
    ↓
For each row:
  - Split "Muscle Group" by comma
  - Trim whitespace from each tag
  - Filter empty tags
  - Create Exercise object
    ↓
Deduplicate tags across all exercises
    ↓
Sort tags alphabetically
    ↓
Store: exercises[], availableTags[]
    ↓
Render: SearchInput, TagFilter, ExerciseList
    ↓
User Input (search/tag selection)
    ↓
useMemo: compute filteredExercises
    ↓
Re-render ExerciseList with filtered results
```

---

## Validation Rules Summary

| Validation | Rule | Source |
|------------|------|--------|
| **Muscle Group Required** | Exercises without "Muscle Group" excluded entirely | FR-013, Clarification #1 |
| **Tag Whitespace** | Leading/trailing whitespace trimmed from each tag | FR-011, Clarification #4 |
| **Search Case-Insensitive** | Convert both search and exercise name to lowercase | FR-003 |
| **Search Literal** | Treat special characters as literal text (use .includes) | FR-003a, Clarification #3 |
| **Tag OR Logic** | Multiple selected tags use OR (match ANY) | Assumption, User Story 3 |
| **Combined AND Logic** | Search AND tags both must match | User Story 4 |

---

## Performance Considerations

**Data Volume**: Up to 500 exercises (per SC-003)

**Filter Complexity**:
- Search: O(n) string comparison
- Tag filter: O(n × m) where m = avg tags per exercise (~3)
- Combined: O(n × m)
- Expected: <50ms for 500 exercises

**Optimization**:
- Use `useMemo` to prevent unnecessary recalculation
- No debouncing needed (real-time updates per spec)
- No virtualization needed (500 items manageable)

**Memory**:
- ~500 exercises × ~200 bytes = ~100KB in memory (negligible)
- No persistence, state cleared on page reload
