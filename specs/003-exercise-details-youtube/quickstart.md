# Quickstart: Exercise Details with YouTube Embed

**Feature**: 003-exercise-details-youtube
**Branch**: `003-exercise-details-youtube`
**Last Updated**: 2025-11-15
**Depends On**: Feature 002-exercise-list-filters

## Overview

This feature adds clickable exercise detail views with embedded YouTube tutorial videos. Users can click any exercise from the filtered list to open a modal showing full exercise information and a video player for learning proper form. The modal includes next/previous navigation for browsing exercises without closing.

## Prerequisites

- **Feature 002** must be implemented (exercise list with search and tag filters)
- Bun installed (package manager and runtime)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Quick Setup

### 1. Install Dependencies

```bash
# From repository root
bun install
```

**Note**: No new dependencies required. This feature uses existing React and standard web APIs.

### 2. Start Development Server

```bash
bun dev
```

Visit `http://localhost:5173` to see the application.

### 3. Load Sample Data

Click "Load Sample Data" button. The sample CSV will be updated to include example YouTube URLs.

---

## Feature Usage

### End User Flow

1. **View exercise list** with search/tag filters (from feature 002)
2. **Click an exercise** to open detail modal
3. **Watch tutorial video** embedded in modal (if available)
4. **Navigate** between exercises using Previous/Next buttons
5. **Close modal** via close button, ESC key, or clicking backdrop
6. **Browse efficiently** without returning to list repeatedly

### CSV Format Requirements

Your CSV file must include the **"YouTube URL"** column (new in this feature):

**Required Column**: `YouTube URL` (optional, YouTube watch URLs)

**Example CSV**:
```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day,Muscle Group,YouTube URL
Bench Press,4,8-10,185,90,Monday,"Chest, Shoulders, Triceps",https://www.youtube.com/watch?v=rT7DgCr-3pg
Squats,4,8-10,225,120,Monday,"Legs, Glutes",https://www.youtube.com/watch?v=ultWZbUMPL8
Dumbbell Rows,3,10-12,70,60,Monday,"Back, Biceps",
```

**Important**:
- YouTube URLs are **optional** - exercises without URLs still display (video section omitted)
- URLs must be in format: `https://www.youtube.com/watch?v=VIDEO_ID` or `youtube.com/watch?v=VIDEO_ID`
- Short URLs (youtu.be) are **NOT** supported (use full watch URLs)
- Invalid URLs will show an error message in the modal

---

## Development Guide

### Project Structure

```
src/
├── App.jsx              # Main component (MODIFIED - modal state)
├── App.css              # Main styles (MODIFIED - backdrop if needed)
├── components/
│   ├── ExerciseList.jsx # MODIFIED - clickable exercises
│   ├── ExerciseList.css # MODIFIED - hover/click styles
│   ├── ExerciseDetailModal.jsx  # NEW - modal component
│   ├── ExerciseDetailModal.css  # NEW - modal styles
│   └── ... (other components from feature 002)
├── utils/               # NEW DIRECTORY
│   └── youtube.js       # NEW - YouTube URL parsing
└── ...

public/
└── sample-workouts.csv  # MODIFIED - add YouTube URL column
```

### Key Components

**ExerciseDetailModal**: Modal overlay with exercise details and YouTube embed
- Props: `exercise`, `exerciseIndex`, `totalExercises`, `onClose`, `onNext`, `onPrevious`
- Behavior: Conditionally renders video, handles keyboard (ESC), focus trapping

**ExerciseList** (Modified): Now clickable to open detail modal
- New prop: `onExerciseClick(exercise, index)`
- Visual affordances: hover state, cursor pointer

**YouTube Utils**: Video ID extraction and embed URL generation
- `extractVideoId(url)` → returns 11-char video ID or null
- `getEmbedUrl(videoId)` → returns privacy-enhanced embed URL

### State Management

```javascript
// In App.jsx
const [selectedExercise, setSelectedExercise] = useState(null)  // Currently viewed exercise
const [selectedIndex, setSelectedIndex] = useState(null)         // Index for navigation

// Open modal
const handleExerciseClick = (exercise, index) => {
  setSelectedExercise(exercise)
  setSelectedIndex(index)
}

// Close modal
const handleCloseModal = () => {
  setSelectedExercise(null)
  setSelectedIndex(null)
}

// Navigate
const handleNext = () => {
  if (selectedIndex < exercises.length - 1) {
    setSelectedIndex(selectedIndex + 1)
    setSelectedExercise(exercises[selectedIndex + 1])
  }
}
```

### YouTube Privacy-Enhanced Embed

Uses `youtube-nocookie.com` domain (GDPR-compliant, no tracking until video plays):

```jsx
{videoId && (
  <iframe
    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
    title={`${exercise.name} tutorial video`}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    loading="lazy"
  />
)}
```

---

## Testing Checklist

### Manual Testing

- [ ] Click exercise from list → modal opens with details
- [ ] Modal shows exercise name, muscle groups, workout parameters
- [ ] If YouTube URL present → video player loads and is playable
- [ ] If no YouTube URL → video section omitted (no empty space)
- [ ] Invalid YouTube URL → error message displays
- [ ] Click Next → navigates to next exercise
- [ ] Click Previous → navigates to previous exercise
- [ ] First exercise → Previous button disabled
- [ ] Last exercise → Next button disabled
- [ ] ESC key closes modal
- [ ] Click backdrop closes modal
- [ ] Click close button closes modal
- [ ] Focus traps within modal while open
- [ ] Focus returns to list when modal closes
- [ ] Tab navigation works (Next/Previous buttons accessible)
- [ ] Modal responsive on mobile and desktop

### Performance Testing

- [ ] Modal opens in <2 seconds (per SC-001)
- [ ] YouTube videos load in <5 seconds on broadband (per SC-002)
- [ ] Next/Previous updates in <1 second (per SC-005)
- [ ] No console errors/warnings

### Accessibility Testing

- [ ] Keyboard: Tab through modal controls
- [ ] Keyboard: ESC closes modal
- [ ] Keyboard: Space/Enter activates buttons
- [ ] Focus indicator visible on all interactive elements
- [ ] Screen reader announces modal open/close
- [ ] Modal has `aria-modal="true"` and `aria-labelledby`

---

## Common Tasks

### Adding a New Exercise with Video

Edit `public/sample-workouts.csv`:
```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day,Muscle Group,YouTube URL
New Exercise,3,10-12,100,60,Friday,"Chest, Arms",https://www.youtube.com/watch?v=YOUR_VIDEO_ID
```

### Styling the Modal

Edit `src/components/ExerciseDetailModal.css`:
- `.modal-backdrop`: Backdrop overlay styles
- `.modal-content`: Modal container styles
- `.video-container`: YouTube iframe container (16:9 aspect ratio)
- `.modal-navigation`: Previous/Next button styles

### Customizing Video Embed

Edit `src/utils/youtube.js`:
- Modify `getEmbedUrl()` to add YouTube iframe parameters
- Example: `?autoplay=1&rel=0` (autoplay, hide related videos)

---

## Troubleshooting

### Video not loading

**Cause**: Invalid YouTube URL format or video ID
**Solution**:
- Verify URL is in format: `youtube.com/watch?v=VIDEO_ID`
- Check video ID is exactly 11 characters
- Ensure video is public (not age-restricted or removed)

### Modal not opening

**Check**:
- `selectedExercise` state is being set in `handleExerciseClick`
- `onExerciseClick` prop passed to ExerciseList
- ExerciseList items have click handlers

### Navigation buttons not working

**Check**:
- `selectedIndex` state is being set correctly
- `onNext`/`onPrevious` callbacks passed to modal
- Boundary conditions (first/last exercise) handled

### Focus not trapped in modal

**Check**:
- `useEffect` hook for focus management is running
- Focusable elements detected correctly in modal
- Tab event listeners attached

---

## Performance Benchmarks

**Target** (per specification):
- Modal open: <2 seconds
- Video load: <5 seconds
- Navigation: <1 second

**Expected** (on modern browsers):
- Modal open: <100ms (React state update)
- Video load: 2-4 seconds (YouTube CDN)
- Navigation: <50ms (state update only)

**Monitoring**:
- Use browser DevTools Performance tab
- Check React DevTools Profiler for unnecessary re-renders
- Network tab to verify YouTube iframe loads

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
- **Feature 002**: Exercise list with search and tag filters (dependency)

---

## Support

**Issues**: Report bugs via project issue tracker
**Questions**: Refer to plan.md and research.md for technical details
**Constitution**: See `.specify/memory/constitution.md` for project principles
