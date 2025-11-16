# Research: Exercise Details with YouTube Embed

**Feature**: 003-exercise-details-youtube
**Date**: 2025-11-15
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Areas

### 1. YouTube Privacy-Enhanced Embed API

**Question**: How to implement YouTube's privacy-enhanced iframe embed to comply with privacy requirements?

**Decision**: Use `youtube-nocookie.com` domain with iframe embed

**Rationale**:
- Per clarification #5: Privacy-enhanced mode required
- YouTube provides `youtube-nocookie.com` domain specifically for this purpose
- No tracking cookies set until user actively plays the video
- GDPR/privacy-compliant without reducing functionality
- Standard iframe embedding with different domain

**Pattern**:
```javascript
// Extract video ID from youtube.com/watch?v=VIDEO_ID
const videoId = extractVideoId(youtubeUrl)

// Use privacy-enhanced domain
const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`

// Render iframe
<iframe
  src={embedUrl}
  title="Exercise tutorial video"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

**Best Practices**:
- Use `youtube-nocookie.com` instead of `youtube.com` for embeds
- Set appropriate iframe attributes (allow, allowFullScreen)
- Include descriptive title for accessibility
- Responsive sizing with CSS (aspect ratio 16:9 for videos)

**Alternatives Considered**:
- ❌ Standard YouTube embed: Violates privacy requirement (clarification #5)
- ❌ Third-party privacy wrappers: Unnecessary complexity
- ✅ youtube-nocookie.com: Official YouTube solution, zero dependencies

---

### 2. YouTube URL Parsing

**Question**: How to extract video ID from YouTube watch URLs?

**Decision**: Parse URL query parameter 'v' using URLSearchParams

**Rationale**:
- Per clarification #1: Only support `youtube.com/watch?v=VIDEO_ID` format
- URLSearchParams is a standard web API (no dependencies)
- Safe, reliable parsing of query parameters
- Handles edge cases (multiple parameters, URL encoding)

**Pattern**:
```javascript
/**
 * Extract YouTube video ID from watch URL
 * @param {string} url - YouTube watch URL (youtube.com/watch?v=VIDEO_ID)
 * @returns {string|null} - Video ID or null if invalid
 */
function extractVideoId(url) {
  try {
    // Handle URLs with or without protocol
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)

    // Check if it's a YouTube watch URL
    if (!urlObj.hostname.includes('youtube.com') || !urlObj.pathname.includes('/watch')) {
      return null
    }

    // Extract 'v' parameter
    const videoId = urlObj.searchParams.get('v')
    return videoId && videoId.length === 11 ? videoId : null
  } catch (error) {
    // Invalid URL format
    return null
  }
}
```

**Validation**:
- YouTube video IDs are exactly 11 characters
- URL must contain `youtube.com` domain
- Path must contain `/watch`
- Must have 'v' query parameter

**Alternatives Considered**:
- ❌ Regex extraction: More fragile, harder to maintain
- ❌ String splitting: Doesn't handle edge cases well
- ✅ URL + URLSearchParams: Standard API, robust, handles edge cases

---

### 3. React Modal Implementation

**Question**: How to implement an accessible modal overlay with focus management?

**Decision**: Controlled component with focus trapping and keyboard event handlers

**Rationale**:
- Per clarification #2: Modal overlay pattern specified
- Must trap focus within modal (FR-003a)
- Must support ESC to close (Edge Cases)
- Must restore focus to trigger element when closed
- Pure React implementation (no external modal library per constitution)

**Pattern**:
```javascript
// Modal state in App.jsx
const [selectedExercise, setSelectedExercise] = useState(null)
const [selectedIndex, setSelectedIndex] = useState(null)

// Open modal
const handleExerciseClick = (exercise, index) => {
  setSelectedExercise(exercise)
  setSelectedIndex(index)
}

// Close modal
const handleCloseModal = () => {
  setSelectedExercise(null)
  setSelectedIndex(null)
  // Focus will return to clicked element via ref
}

// Navigation
const handleNext = () => {
  if (selectedIndex < exercises.length - 1) {
    const nextIndex = selectedIndex + 1
    setSelectedIndex(nextIndex)
    setSelectedExercise(exercises[nextIndex])
  }
}

const handlePrevious = () => {
  if (selectedIndex > 0) {
    const prevIndex = selectedIndex - 1
    setSelectedIndex(prevIndex)
    setSelectedExercise(exercises[prevIndex])
  }
}
```

**Focus Management**:
```javascript
useEffect(() => {
  if (selectedExercise) {
    // Trap focus in modal
    const modal = modalRef.current
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    firstElement?.focus()

    // Tab trap handler
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => modal.removeEventListener('keydown', handleTab)
  }
}, [selectedExercise])
```

**Keyboard Support**:
- ESC key closes modal
- Tab/Shift+Tab cycles through focusable elements (trapped)
- Previous/Next buttons accessible via tab navigation
- No arrow key navigation (per clarification #6)

**Best Practices**:
- Use semantic HTML (`<dialog>` element or role="dialog")
- Add `aria-modal="true"` and `aria-labelledby` attributes
- Backdrop click closes modal (onclick handler on backdrop)
- Prevent body scroll when modal is open
- Restore focus to trigger element on close

**Alternatives Considered**:
- ❌ External modal library (react-modal, etc.): Violates component simplicity
- ❌ Dialog polyfill library: Unnecessary for modern browsers
- ✅ Custom React component: Full control, no dependencies, follows constitution

---

### 4. Modal State Management

**Question**: How to manage selected exercise and navigation state?

**Decision**: Lift state to App.jsx, pass callbacks to components

**Rationale**:
- Per constitution: Use React built-in hooks, no state management library
- Exercise data already in App.jsx (from feature 002)
- Modal needs access to full exercises array for navigation
- Simple state: selectedExercise, selectedIndex

**State Structure**:
```javascript
// App.jsx state
const [selectedExercise, setSelectedExercise] = useState(null) // Currently viewed exercise
const [selectedIndex, setSelectedIndex] = useState(null)       // Index in exercises array
```

**Benefits**:
- Single source of truth (exercises array from feature 002)
- Easy navigation (index-based previous/next)
- Simple open/close logic (null = closed)
- No prop drilling (direct children of App)

**Alternatives Considered**:
- ❌ Context API: Overkill for localized modal state
- ❌ Component-local state: Can't access exercises array for navigation
- ✅ Lift to parent: Simple, follows React patterns

---

### 5. CSV YouTube URL Column Integration

**Question**: How to extend existing CSV parsing to include YouTube URLs?

**Decision**: Add YouTube URL column to CSV, parse in existing PapaParse flow

**Rationale**:
- Feature 002 already uses PapaParse with header mode
- Simply extend exercise object with `youtubeUrl` field
- Graceful handling of missing URLs (conditionally render video section)

**Pattern**:
```javascript
// In App.jsx CSV parsing (extends feature 002)
Papa.parse(file, {
  header: true,
  complete: (results) => {
    const parsedExercises = results.data
      .filter(row => row['Muscle Group'] && row['Muscle Group'].trim())
      .map(row => ({
        name: row.Exercise,
        tags: row['Muscle Group'].split(',').map(tag => tag.trim()).filter(tag => tag),
        sets: row.Sets,
        reps: row.Reps,
        weight: row['Weight (lbs)'],
        rest: row['Rest (sec)'],
        day: row.Day,
        youtubeUrl: row['YouTube URL'] || null  // NEW: Optional YouTube URL
      }))

    setExercises(parsedExercises)
  }
})
```

**CSV Format**:
```csv
Exercise,Sets,Reps,Weight (lbs),Rest (sec),Day,Muscle Group,YouTube URL
Bench Press,4,8-10,185,90,Monday,"Chest, Shoulders",https://www.youtube.com/watch?v=example123
Squats,4,8-10,225,120,Monday,Legs,https://www.youtube.com/watch?v=example456
```

**Validation**:
- URL is optional (null if missing or empty)
- Validate URL format before embedding (use extractVideoId utility)
- Show error message if URL is present but invalid

**Best Practices**:
- Default to null for missing URLs
- Validate URL before rendering iframe
- Graceful degradation (show exercise info even if video fails)

---

### 6. Responsive Modal Design

**Question**: How to ensure modal works on mobile and desktop?

**Decision**: CSS flexbox with responsive sizing and max-width

**Rationale**:
- Per FR-012: Must work on mobile devices
- Modal should be fullscreen on mobile, centered overlay on desktop
- YouTube iframe must maintain 16:9 aspect ratio
- Touch-friendly buttons and close affordances

**Pattern**:
```css
/* Modal backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Modal content */
.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 90vw;
  max-height: 90vh;
  width: 800px; /* Desktop preferred width */
  overflow-y: auto;
  position: relative;
}

/* YouTube iframe container (16:9 aspect ratio) */
.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 ratio */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95vw;
    max-height: 95vh;
    border-radius: 0; /* Fullscreen effect */
  }
}
```

**Best Practices**:
- Use viewport units for mobile
- Aspect ratio container for YouTube embeds
- Touch-friendly button sizes (min 44x44px)
- Prevent body scroll on mobile when modal open

---

## Summary

All technical unknowns resolved. Implementation will use:

1. **YouTube Embed**: Privacy-enhanced mode (youtube-nocookie.com), iframe API, no dependencies
2. **URL Parsing**: URLSearchParams API for extracting video ID from watch URLs
3. **Modal Component**: Custom React component with focus trapping, keyboard support, no external library
4. **State Management**: React useState in App.jsx, simple selected exercise tracking
5. **CSV Integration**: Extend existing PapaParse flow with optional YouTube URL column
6. **Responsive Design**: Flexbox layout, 16:9 video aspect ratio, mobile-friendly

All decisions align with constitutional principles and clarified requirements. Ready for Phase 1 (Design & Contracts).
