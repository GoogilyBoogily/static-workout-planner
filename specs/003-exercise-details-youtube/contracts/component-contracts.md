# Component Contracts

**Feature**: 003-exercise-details-youtube
**Date**: 2025-11-15
**Purpose**: Define component interfaces and prop contracts

## Component Hierarchy

```
App (modified from feature 002)
├── (existing) CSV Upload Controls
├── (existing) SearchInput
├── (existing) TagFilter
├── (modified) ExerciseList → now clickable
└── (new) ExerciseDetailModal → appears when exercise selected
```

---

## ExerciseList Component (Modified from Feature 002)

**Purpose**: Display filtered list of exercises with **clickable** items that open detail modal

**Props** (Extended):
```typescript
{
  exercises: Exercise[],        // Filtered exercises to display (existing)
  emptyMessage?: string,         // Optional message when no exercises (existing)
  onExerciseClick: (exercise: Exercise, index: number) => void  // NEW: Callback when exercise clicked
}

type Exercise = {
  name: string,
  tags: string[],
  sets?: string,
  reps?: string,
  weight?: string,
  rest?: string,
  day?: string,
  youtubeUrl?: string | null  // NEW: Optional YouTube URL
}
```

**Behavior Changes**:
- **NEW**: Each exercise in the list is now clickable (button or clickable div)
- **NEW**: Calls `onExerciseClick(exercise, index)` when exercise is clicked
- **NEW**: Visual affordances for clickability (hover state, cursor pointer)
- Existing: Shows exercise name and tags (from feature 002)
- Existing: Shows empty message when exercises array is empty

**Accessibility**:
- **NEW**: Use `<button>` elements or add `role="button"` to clickable items
- **NEW**: Add `tabindex="0"` for keyboard navigation
- **NEW**: Support Enter/Space key to activate (click)
- **NEW**: Visual focus indicator for keyboard users

**Example Usage**:
```jsx
<ExerciseList
  exercises={filteredExercises}
  onExerciseClick={handleExerciseClick}  // NEW
  emptyMessage="No exercises match your current filters."
/>
```

---

## ExerciseDetailModal Component (NEW)

**Purpose**: Display exercise details in a modal overlay with optional YouTube video embed

**Props**:
```typescript
{
  exercise: Exercise | null,     // Exercise to display (null = modal closed)
  exerciseIndex: number | null,  // Index in full exercises array
  totalExercises: number,         // Total number of exercises (for boundary checks)
  onClose: () => void,            // Callback to close modal
  onNext: () => void,             // Callback to navigate to next exercise
  onPrevious: () => void          // Callback to navigate to previous exercise
}

type Exercise = {
  name: string,
  tags: string[],
  sets?: string,
  reps?: string,
  weight?: string,
  rest?: string,
  day?: string,
  youtubeUrl?: string | null
}
```

**Behavior**:
- Renders modal overlay only when `exercise` is not null
- Displays semi-transparent backdrop over exercise list
- Shows exercise name, muscle group tags, and workout parameters
- **Conditionally** renders YouTube video player:
  - If `youtubeUrl` exists and is valid → embed iframe
  - If `youtubeUrl` is null/empty → omit video section entirely (per clarification #4)
  - If `youtubeUrl` is invalid → show error message
- Provides Previous and Next navigation buttons
- Previous button disabled when `exerciseIndex === 0`
- Next button disabled when `exerciseIndex === totalExercises - 1`
- Close button, backdrop click, and ESC key all call `onClose()`

**Keyboard Support**:
- ESC key closes modal (calls `onClose`)
- Tab/Shift+Tab trapped within modal (focus cycling)
- Space/Enter on Next/Previous buttons triggers navigation
- **No** arrow key navigation (per clarification #6)

**Focus Management**:
- On mount: Focus first interactive element (close button or previous/next)
- On unmount: Return focus to clicked exercise in list
- Tab trapping: Focus stays within modal while open

**YouTube Embed** (when `youtubeUrl` is valid):
```jsx
<iframe
  src={`https://www.youtube-nocookie.com/embed/${videoId}`}
  title={`${exercise.name} tutorial video`}
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  loading="lazy"
/>
```

**Example Usage**:
```jsx
<ExerciseDetailModal
  exercise={selectedExercise}
  exerciseIndex={selectedIndex}
  totalExercises={exercises.length}
  onClose={handleCloseModal}
  onNext={handleNext}
  onPrevious={handlePrevious}
/>
```

**Error Handling**:
- Invalid `youtubeUrl` format → Display "Invalid video URL" message
- YouTube video unavailable → YouTube player's default error shown in iframe
- No internet connection → YouTube player's "No connection" error

---

## YouTube Utility Module (NEW)

**File**: `src/utils/youtube.js`

**Purpose**: Extract and validate YouTube video IDs from URLs

**Exports**:

### `extractVideoId(url)`

```javascript
/**
 * Extract YouTube video ID from watch URL
 * @param {string} url - YouTube watch URL (youtube.com/watch?v=VIDEO_ID)
 * @returns {string|null} - 11-character video ID or null if invalid
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    // Handle URLs with or without protocol
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)

    // Verify it's a YouTube watch URL
    if (!urlObj.hostname.includes('youtube.com') || !urlObj.pathname.includes('/watch')) {
      return null
    }

    // Extract 'v' parameter
    const videoId = urlObj.searchParams.get('v')

    // Validate video ID length (YouTube video IDs are exactly 11 characters)
    return videoId && videoId.length === 11 ? videoId : null
  } catch (error) {
    // Invalid URL format
    return null
  }
}
```

### `getEmbedUrl(videoId)`

```javascript
/**
 * Generate privacy-enhanced YouTube embed URL from video ID
 * @param {string} videoId - 11-character YouTube video ID
 * @returns {string} - Privacy-enhanced embed URL (youtube-nocookie.com)
 */
export function getEmbedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}`
}
```

**Usage Example**:
```javascript
import { extractVideoId, getEmbedUrl } from './utils/youtube'

const videoId = extractVideoId(exercise.youtubeUrl)
if (videoId) {
  const embedUrl = getEmbedUrl(videoId)
  // Render iframe with embedUrl
} else {
  // Show error or omit video section
}
```

---

## App Component (Modified)

**New State**:
```javascript
// Modal state (NEW)
const [selectedExercise, setSelectedExercise] = useState(null)
const [selectedIndex, setSelectedIndex] = useState(null)

// Existing state from feature 002 (unchanged)
const [searchText, setSearchText] = useState('')
const [selectedTags, setSelectedTags] = useState([])
const [exercises, setExercises] = useState([])
const [availableTags, setAvailableTags] = useState([])
```

**New Handlers**:
```javascript
// Open modal with selected exercise
const handleExerciseClick = (exercise, index) => {
  setSelectedExercise(exercise)
  setSelectedIndex(index)
}

// Close modal
const handleCloseModal = () => {
  setSelectedExercise(null)
  setSelectedIndex(null)
}

// Navigate to next exercise in modal
const handleNext = () => {
  if (selectedIndex < exercises.length - 1) {
    const nextIndex = selectedIndex + 1
    setSelectedIndex(nextIndex)
    setSelectedExercise(exercises[nextIndex])
  }
}

// Navigate to previous exercise in modal
const handlePrevious = () => {
  if (selectedIndex > 0) {
    const prevIndex = selectedIndex - 1
    setSelectedIndex(prevIndex)
    setSelectedExercise(exercises[prevIndex])
  }
}
```

**CSV Parsing** (Modified to include YouTube URL):
```javascript
Papa.parse(file, {
  header: true,
  complete: (results) => {
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
        day: row.Day,
        youtubeUrl: row['YouTube URL'] || null  // NEW: Parse YouTube URL column
      }))

    // Extract unique tags (existing logic)
    const tagsSet = new Set()
    parsedExercises.forEach(ex => ex.tags.forEach(tag => tagsSet.add(tag)))
    const uniqueTags = Array.from(tagsSet).sort()

    setExercises(parsedExercises)
    setAvailableTags(uniqueTags)
  }
})
```

**Render Structure** (with new modal):
```jsx
<div className="App">
  <h1>Workout Planner</h1>

  {/* Existing CSV upload controls */}
  <div className="csv-loader">
    <input type="file" accept=".csv" onChange={handleFileUpload} />
    <button onClick={loadSampleData}>Load Sample Data</button>
  </div>

  {error && <div className="error">{error}</div>}

  {/* Existing filter section from feature 002 */}
  {exercises.length > 0 && (
    <div className="filter-section">
      <SearchInput value={searchText} onChange={setSearchText} />
      <TagFilter
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />
    </div>
  )}

  {/* Existing exercise list - NOW CLICKABLE */}
  {exercises.length > 0 && (
    <ExerciseList
      exercises={filteredExercises}
      onExerciseClick={handleExerciseClick}  // NEW
    />
  )}

  {/* NEW: Exercise detail modal */}
  <ExerciseDetailModal
    exercise={selectedExercise}
    exerciseIndex={selectedIndex}
    totalExercises={exercises.length}
    onClose={handleCloseModal}
    onNext={handleNext}
    onPrevious={handlePrevious}
  />

  {/* Existing data table (unchanged from feature 002) */}
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
1. User uploads CSV (extended with "YouTube URL" column)
   ↓
2. App.handleFileUpload()
   - Parse CSV with PapaParse (header: true)
   - Extract exercises with non-empty "Muscle Group"
   - NEW: Parse youtubeUrl from "YouTube URL" column
   - setExercises(), setAvailableTags()
   ↓
3. App renders ExerciseList (from feature 002, now clickable)
   - ExerciseList receives: exercises, onExerciseClick callback
   ↓
4. User clicks an exercise in the list
   - ExerciseList calls onExerciseClick(exercise, index)
   - App.handleExerciseClick() updates state
   - setSelectedExercise(exercise), setSelectedIndex(index)
   ↓
5. ExerciseDetailModal renders (controlled by selectedExercise state)
   - Receives: exercise, exerciseIndex, totalExercises, callbacks
   - Renders modal backdrop + content
   - If youtubeUrl exists: Extract videoId, render iframe
   - If youtubeUrl is null: Omit video section
   - Render navigation buttons (disabled based on index)
   ↓
6. User navigates in modal (Next button clicked)
   - ExerciseDetailModal calls onNext()
   - App.handleNext() increments selectedIndex
   - App updates selectedExercise to exercises[newIndex]
   - ExerciseDetailModal re-renders with new exercise
   ↓
7. User closes modal (ESC key / close button / backdrop click)
   - ExerciseDetailModal calls onClose()
   - App.handleCloseModal() clears state
   - setSelectedExercise(null), setSelectedIndex(null)
   - Modal unmounts, focus returns to exercise list
```

---

## Performance Contract

**Modal Rendering** (per SC-001):
- Target: <2 seconds to open modal
- Expected: <100ms (simple state update + React render)
- Measured: Via manual testing with browser DevTools

**YouTube Video Loading** (per SC-002):
- Target: <5 seconds on standard broadband
- Expected: 2-4 seconds (YouTube's CDN performance)
- Measured: Via Network tab in browser DevTools
- Note: Privacy-enhanced mode may add ~100-200ms vs standard embed

**Navigation Updates** (per SC-005):
- Target: <1 second for Next/Previous
- Expected: <50ms (state update only, no network calls)
- Measured: Via React DevTools Profiler

**Re-render Optimization**:
- Modal component only renders when selectedExercise is not null
- YouTube iframe lazy-loaded (loading="lazy" attribute)
- No unnecessary re-renders of exercise list when modal opens
