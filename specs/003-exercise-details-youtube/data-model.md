# Data Model: Exercise Details with YouTube Embed

**Feature**: 003-exercise-details-youtube
**Date**: 2025-11-15
**Source**: Derived from spec.md functional requirements and feature 002 exercise entity

## Entities

### Exercise (Extended from Feature 002)

Represents a single workout exercise with associated metadata, now including optional YouTube tutorial URL.

**Fields**:
- `name` (string, required): Exercise name (e.g., "Bench Press", "Squats")
- `tags` (array of string, required): Muscle groups/categories (e.g., ["Chest", "Shoulders"])
- `sets` (string, optional): Number of sets
- `reps` (string, optional): Repetition range
- `weight` (string, optional): Weight value with unit
- `rest` (string, optional): Rest period in seconds
- `day` (string, optional): Workout day
- **`youtubeUrl` (string, optional)**: YouTube watch URL for tutorial video (NEW in this feature)

**Validation Rules**:
- Exercise MUST have at least one non-empty tag (from feature 002, FR-013)
- `youtubeUrl` MUST be in format `youtube.com/watch?v=VIDEO_ID` if present (FR-008)
- `youtubeUrl` can be null or empty string (videos are optional per FR-006)

**Source**: Parsed from CSV file with "YouTube URL" column

**Example**:
```javascript
{
  name: "Bench Press",
  tags: ["Chest", "Shoulders", "Triceps"],
  sets: "4",
  reps: "8-10",
  weight: "185 lbs",
  rest: "90 sec",
  day: "Monday",
  youtubeUrl: "https://www.youtube.com/watch?v=gRVjAtPip0Y"
}
```

**Example (No Video)**:
```javascript
{
  name: "Squats",
  tags: ["Legs", "Glutes"],
  sets: "4",
  reps: "8-10",
  weight: "225 lbs",
  rest: "120 sec",
  day: "Monday",
  youtubeUrl: null  // No video available
}
```

---

## State Model

### Application State

**Modal State** (user-controlled):
- `selectedExercise` (Exercise | null): Currently displayed exercise in modal (default: null)
- `selectedIndex` (number | null): Index of selected exercise in exercises array (default: null)

**Derived State** (computed):
- `isFirstExercise` (boolean): `selectedIndex === 0` (Previous button disabled)
- `isLastExercise` (boolean): `selectedIndex === exercises.length - 1` (Next button disabled)
- `videoId` (string | null): Extracted from `selectedExercise.youtubeUrl` if valid

**Existing State** (from feature 002 - no changes):
- `exercises` (array of Exercise): All valid exercises from CSV
- `availableTags` (array of string): All unique muscle group tags
- `searchText` (string): Current search input value
- `selectedTags` (array of string): Currently active tag filters
- `filteredExercises` (array of Exercise): Exercises matching current filters

### State Transitions

```
Initial State:
  selectedExercise = null
  selectedIndex = null
  → User sees exercise list, no modal displayed

Exercise Clicked:
  selectedExercise = clickedExercise
  selectedIndex = indexInExercisesArray
  → Modal opens with exercise details
  → If youtubeUrl exists: Video player renders
  → If youtubeUrl is null: Video section omitted (per FR-006, clarification #4)
  → Previous button disabled if first exercise (FR-011)
  → Next button disabled if last exercise (FR-011a)

Next Clicked (in modal):
  if selectedIndex < exercises.length - 1:
    selectedIndex = selectedIndex + 1
    selectedExercise = exercises[selectedIndex + 1]
    → Modal updates to show next exercise
    → Previous button enabled
    → Next button disabled if now last exercise

Previous Clicked (in modal):
  if selectedIndex > 0:
    selectedIndex = selectedIndex - 1
    selectedExercise = exercises[selectedIndex - 1]
    → Modal updates to show previous exercise
    → Next button enabled
    → Previous button disabled if now first exercise

Close Modal (ESC key, close button, backdrop click):
  selectedExercise = null
  selectedIndex = null
  → Modal closes
  → Focus returns to exercise list
  → User back to browsing list
```

---

## YouTube Video ID Extraction

### Video ID Entity

**Type**: Derived string (11 characters)

**Extraction Logic**:
```
Input: youtubeUrl (e.g., "https://www.youtube.com/watch?v=gRVjAtPip0Y")

Process:
1. Parse URL using URL API
2. Verify hostname contains "youtube.com"
3. Verify pathname contains "/watch"
4. Extract 'v' query parameter using URLSearchParams
5. Validate video ID is exactly 11 characters

Output: videoId (e.g., "gRVjAtPip0Y") or null if invalid
```

**Validation Rules**:
- Video ID MUST be exactly 11 characters
- URL MUST contain `youtube.com` domain
- URL MUST have `/watch` path
- URL MUST have 'v' query parameter

**Embed URL Construction**:
```
videoId → `https://www.youtube-nocookie.com/embed/${videoId}`

Example:
  Input videoId: "gRVjAtPip0Y"
  Output embed URL: "https://www.youtube-nocookie.com/embed/gRVjAtPip0Y"
```

---

## Modal Display Logic

### Display Rules

```
if selectedExercise is null:
  → Render nothing (modal closed)

if selectedExercise is not null:
  → Render modal backdrop
  → Render modal content with:
    - Close button (top right)
    - Exercise name (heading)
    - Muscle groups (tag pills, read-only display)
    - Exercise parameters (sets, reps, weight, rest, day)
    - [CONDITIONAL] Video player section:
        if youtubeUrl exists and videoId extraction succeeds:
          → Render YouTube iframe with privacy-enhanced embed
        else:
          → Omit video section entirely (no placeholder, no empty space)
    - Navigation controls:
        - Previous button (disabled if isFirstExercise)
        - Next button (disabled if isLastExercise)
```

### Error Handling

```
if youtubeUrl exists but videoId extraction fails:
  → Show error message: "Invalid video URL"
  → Do NOT render iframe
  → Rest of exercise info still displays

if YouTube iframe fails to load (video removed, restricted, etc.):
  → YouTube's default error message displays in iframe
  → User can still navigate or close modal
  → FR-007: Appropriate error message displayed by YouTube player
```

---

## Data Flow

```
CSV File Upload (Extended from Feature 002)
    ↓
PapaParse.parse({ header: true })
    ↓
Extract rows with non-empty "Muscle Group" (existing filter)
    ↓
For each row:
  - Parse exercise fields (existing)
  - Parse tags (existing)
  - Parse youtubeUrl from "YouTube URL" column (NEW)
  - Create Exercise object with youtubeUrl field
    ↓
Store: exercises[]
    ↓
Render: ExerciseList (clickable items)
    ↓
User Clicks Exercise
    ↓
App.handleExerciseClick(exercise, index)
    ↓
Set: selectedExercise, selectedIndex
    ↓
Render: ExerciseDetailModal
    ↓
If youtubeUrl present:
  Extract videoId → utils/youtube.js
  If valid: Render iframe with youtube-nocookie.com embed
  If invalid: Show error message
If youtubeUrl null/empty:
  Omit video section entirely
    ↓
User Navigates (Next/Previous)
    ↓
Update: selectedExercise, selectedIndex
    ↓
Modal re-renders with new exercise
    ↓
User Closes Modal (ESC/button/backdrop)
    ↓
Set: selectedExercise = null, selectedIndex = null
    ↓
Modal unmounts, focus returns to list
```

---

## Validation Rules Summary

| Validation | Rule | Source |
|------------|------|--------|
| **YouTube URL Format** | Must be youtube.com/watch?v=VIDEO_ID if present | FR-008, Clarification #1 |
| **Video ID Length** | Exactly 11 characters after extraction | YouTube API standard |
| **URL Optional** | youtubeUrl can be null/empty, video section omitted | FR-006, Clarification #4 |
| **Modal State** | selectedExercise null = closed, non-null = open | State model |
| **Navigation Boundaries** | Previous disabled at index 0, Next disabled at last index | FR-011, FR-011a, Clarification #3 |
| **Privacy Mode** | Use youtube-nocookie.com domain for embeds | FR-013, Clarification #5 |
| **Focus Trapping** | Modal must trap focus while open | FR-003a |

---

## Performance Considerations

**Modal Rendering**: Lightweight component, renders only when selectedExercise is not null

**Video Loading**: YouTube iframe loads on-demand when modal opens (not preloaded)

**Navigation**: State updates only (no re-parsing, no API calls), expected <50ms

**Memory**: Single additional state variable (selectedExercise + selectedIndex), negligible impact

**YouTube Embed**: Privacy-enhanced mode delays cookie/tracking until video plays (reduces initial load)
