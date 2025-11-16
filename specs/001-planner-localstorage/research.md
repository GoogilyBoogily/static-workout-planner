# Research: Workout Planner with localStorage Persistence

**Feature**: 001-planner-localstorage
**Date**: 2025-11-15
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Areas

### 1. localStorage API Best Practices

**Question**: How to reliably persist and retrieve workout plan data using browser localStorage?

**Decision**: Use localStorage with JSON serialization, comprehensive error handling, and quota management

**Rationale**:
- localStorage is a synchronous, widely-supported browser API (available in all modern browsers)
- JSON format provides human-readable storage and easy debugging
- 5-10MB quota is sufficient for ~1000+ workout plans (estimated ~5KB per plan with 10 exercises)
- No backend required, truly offline-first
- Per-domain isolation provides basic security

**Pattern**:
```javascript
// localStorage utility module
export const PlansStorage = {
  KEY: 'workout-plans',

  // Load all plans from localStorage
  loadPlans() {
    try {
      const data = localStorage.getItem(this.KEY)
      if (!data) return []
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to load plans:', error)
      // Corrupted data - clear and return empty
      localStorage.removeItem(this.KEY)
      return []
    }
  },

  // Save all plans to localStorage
  savePlans(plans) {
    try {
      const json = JSON.stringify(plans)
      localStorage.setItem(this.KEY, json)
      return { success: true }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        return { success: false, error: 'quota' }
      }
      return { success: false, error: 'unknown' }
    }
  },

  // Check if localStorage is available
  isAvailable() {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
}
```

**Best Practices**:
- Always wrap localStorage calls in try-catch (can throw in private browsing)
- Check availability on app startup
- Use single key for all plans (simpler than key-per-plan)
- Handle QuotaExceededError gracefully with user-friendly message
- Clear corrupted data rather than leaving app in broken state
- No sensitive data (all workout data is user-generated, non-sensitive)

**Alternatives Considered**:
- ❌ IndexedDB: Overkill for simple key-value storage, asynchronous API adds complexity
- ❌ sessionStorage: Loses data when tab closes, bad UX for workout planning
- ❌ Cookies: 4KB limit too small, sent with every HTTP request (unnecessary)
- ✅ localStorage: Perfect fit for client-side persistence, simple API, sufficient quota

---

### 2. UUID v4 Generation with crypto.randomUUID()

**Question**: How to generate unique IDs for plans and exercises using UUID v4?

**Decision**: Use native `crypto.randomUUID()` API for all entity IDs

**Rationale**:
- Per clarification #1: UUID v4 chosen over timestamp-based or counter IDs
- `crypto.randomUUID()` is available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+)
- Generates RFC 4122 v4 UUIDs (random, cryptographically strong)
- No external dependencies required
- Zero collision risk in single-user local storage context
- Returns format: "550e8400-e29b-41d4-a716-446655440000"

**Pattern**:
```javascript
// Simple ID generation
const planId = crypto.randomUUID()
const exerciseId = crypto.randomUUID()

// Example plan object
const plan = {
  id: crypto.randomUUID(),
  name: "Monday Chest Day",
  exercises: [
    {
      id: crypto.randomUUID(),
      name: "Bench Press",
      sets: 4,
      reps: "8-10",
      weight: "185 lbs",
      rest: "90 sec"
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now()
}
```

**Browser Compatibility**:
- ✅ Chrome/Edge 92+ (July 2021)
- ✅ Firefox 95+ (Dec 2021)
- ✅ Safari 15.4+ (March 2022)
- Target: "Modern browsers, last 2 versions" - all supported

**Fallback** (if needed for older browsers):
```javascript
// Not needed for target browsers, but could add:
const generateId = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers (pre-2022)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
```

**Alternatives Considered**:
- ❌ Timestamp-based: Risk of collisions if user creates multiple plans/exercises rapidly
- ❌ Incrementing counter: Requires persisting counter state, more complex
- ✅ UUID v4 (crypto.randomUUID): Native API, zero dependencies, zero collision risk

---

### 3. Relative Date Formatting

**Question**: How to display "last modified" timestamps in relative format ("2 hours ago") with absolute on hover?

**Decision**: Implement simple relative date formatter with tooltip for absolute time

**Rationale**:
- Per clarification #2: Show relative with absolute on hover tooltip
- JavaScript Date API provides all necessary primitives
- No external library needed (Intl.RelativeTimeFormat available but overcomplicated)
- Custom implementation is ~30 lines, no dependencies
- Can update relative times on interval if needed (not required for MVP)

**Pattern**:
```javascript
// dateFormat.js utility
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
}

export function formatAbsoluteTime(timestamp) {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
  // Returns: "Nov 15, 2:30 PM"
}
```

**Component Usage**:
```jsx
<span title={formatAbsoluteTime(plan.updatedAt)}>
  {formatRelativeTime(plan.updatedAt)}
</span>
// Displays: "2 hours ago" with tooltip "Nov 15, 2:30 PM"
```

**Best Practices**:
- Use native Intl.DateTimeFormat for locale-aware absolute dates
- Keep relative formatting simple (no complex pluralization rules)
- Title attribute for tooltip (works on hover and mobile long-press)
- No auto-updating needed for MVP (timestamps update on page load only)

**Alternatives Considered**:
- ❌ date-fns library: 67KB minified, overkill for simple relative time
- ❌ Intl.RelativeTimeFormat: Requires manual unit calculation, no clearer than custom
- ✅ Custom formatter: ~30 lines, zero dependencies, full control

---

### 4. Form Validation Approach

**Question**: How to validate plan and exercise form inputs before saving?

**Decision**: Use controlled React components with inline validation state

**Rationale**:
- React controlled components provide immediate validation feedback
- Inline error messages (near input fields) improve UX per spec requirement
- No validation library needed for simple rules (required fields, number ranges)
- Disable submit button until validation passes (prevents invalid submissions)
- Validation rules from FR-008: plan name required, exercise name required, sets 1-20, reps required

**Pattern**:
```javascript
// Plan form validation
const [planName, setPlanName] = useState('')
const [errors, setErrors] = useState({})

const validatePlanName = (name) => {
  if (!name || !name.trim()) {
    return 'Plan name required'
  }
  if (name.length > 100) {
    return 'Plan name must be 100 characters or less'
  }
  return null
}

const handleSubmit = (e) => {
  e.preventDefault()
  const nameError = validatePlanName(planName)
  if (nameError) {
    setErrors({ planName: nameError })
    return
  }
  // Save plan...
}

// Exercise validation
const validateExercise = (exercise) => {
  const errors = {}
  if (!exercise.name || !exercise.name.trim()) {
    errors.name = 'Exercise name required'
  }
  if (!exercise.sets || exercise.sets < 1 || exercise.sets > 20) {
    errors.sets = 'Sets must be between 1 and 20'
  }
  if (!exercise.reps || !exercise.reps.trim()) {
    errors.reps = 'Reps required'
  }
  return Object.keys(errors).length > 0 ? errors : null
}
```

**Component Example**:
```jsx
<div className="form-field">
  <label htmlFor="plan-name">Plan Name *</label>
  <input
    id="plan-name"
    type="text"
    value={planName}
    onChange={(e) => setPlanName(e.target.value)}
    maxLength={100}
    aria-invalid={!!errors.planName}
    aria-describedby={errors.planName ? "plan-name-error" : undefined}
  />
  {errors.planName && (
    <div id="plan-name-error" className="error-message" role="alert">
      {errors.planName}
    </div>
  )}
</div>
```

**Best Practices**:
- Validate on submit (not on every keystroke for better UX)
- Show errors inline near inputs (ARIA role="alert" for screen readers)
- Use maxLength attribute to prevent typing beyond limit
- Disable submit button when form invalid
- aria-invalid and aria-describedby for accessibility
- Clear errors when user starts typing again

**Alternatives Considered**:
- ❌ Formik/React Hook Form: Adds dependency for simple validation
- ❌ HTML5 validation: Less flexible, harder to style consistently
- ✅ Controlled components with state: Simple, flexible, zero dependencies

---

### 5. Exercise Reordering with Up/Down Buttons

**Question**: How to implement exercise reordering within a plan using up/down buttons?

**Decision**: Array manipulation in React state with swap logic for adjacent items

**Rationale**:
- Per clarification #3: Up/down buttons chosen over drag-and-drop
- Simple implementation: swap array items at index i with i-1 (up) or i+1 (down)
- Works on mobile and desktop (touch-friendly buttons)
- No drag-and-drop library required (avoids dependency)
- Accessible via keyboard (button elements are focusable)
- Preserves order in localStorage on save

**Pattern**:
```javascript
// In PlanForm component
const [exercises, setExercises] = useState(plan.exercises || [])

const moveExerciseUp = (index) => {
  if (index === 0) return // Already at top
  const updated = [...exercises]
  // Swap with previous item
  [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
  setExercises(updated)
}

const moveExerciseDown = (index) => {
  if (index === exercises.length - 1) return // Already at bottom
  const updated = [...exercises]
  // Swap with next item
  [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
  setExercises(updated)
}
```

**Component Example**:
```jsx
{exercises.map((exercise, index) => (
  <div key={exercise.id} className="exercise-item">
    <div className="exercise-details">
      {exercise.name} - {exercise.sets} sets × {exercise.reps} reps
    </div>
    <div className="exercise-controls">
      <button
        type="button"
        onClick={() => moveExerciseUp(index)}
        disabled={index === 0}
        aria-label={`Move ${exercise.name} up`}
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => moveExerciseDown(index)}
        disabled={index === exercises.length - 1}
        aria-label={`Move ${exercise.name} down`}
      >
        ↓
      </button>
      <button
        type="button"
        onClick={() => removeExercise(index)}
        aria-label={`Remove ${exercise.name}`}
      >
        ✕
      </button>
    </div>
  </div>
))}
```

**Best Practices**:
- Disable up button on first item, down button on last item
- Use aria-label with exercise name for screen readers
- Use button type="button" to prevent form submission
- Spread array before swapping (preserve immutability)
- Keep exercises in array order for localStorage persistence

**Alternatives Considered**:
- ❌ Drag-and-drop library (react-beautiful-dnd): 45KB, complex API, overkill for simple reordering
- ❌ Native HTML5 drag-and-drop: Complex API, poor mobile support
- ✅ Up/down buttons with array swap: Simple, accessible, works everywhere

---

### 6. Cross-Tab Synchronization

**Question**: How to handle concurrent edits when user has multiple browser tabs open?

**Decision**: Use storage event listener to detect cross-tab changes with notification

**Rationale**:
- Per edge case in spec: Handle concurrent tab edits
- Browser fires `storage` event on window when localStorage changes in another tab
- Cannot auto-merge changes (conflict resolution too complex for MVP)
- Notify user and offer reload button (simple, prevents data loss)
- Last-write-wins if user ignores warning (acceptable for single-user local app)

**Pattern**:
```javascript
// In App.jsx
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === PlansStorage.KEY && e.newValue !== e.oldValue) {
      // localStorage changed in another tab
      setShowSyncWarning(true)
    }
  }

  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [])

// Warning banner component
{showSyncWarning && (
  <div className="sync-warning" role="alert">
    Plans updated in another tab.
    <button onClick={() => window.location.reload()}>Reload</button>
    <button onClick={() => setShowSyncWarning(false)}>Dismiss</button>
  </div>
)}
```

**Best Practices**:
- Only listen for specific key (PlansStorage.KEY), ignore other localStorage changes
- Show non-intrusive banner (not blocking modal)
- Offer reload button (refreshes to latest data)
- Allow dismiss (user may want to finish current edit first)
- Use role="alert" for screen reader announcement

**Limitations**:
- No real-time sync (only notification after save in other tab)
- No conflict resolution (user must manually choose)
- Acceptable for MVP (single-user local storage, rare scenario)

**Alternatives Considered**:
- ❌ Operational Transform / CRDT: Massively overcomplicated for local-only app
- ❌ Lock mechanism: localStorage has no atomic operations, can't implement reliably
- ✅ Detect + notify: Simple, prevents silent data loss, good enough for rare case

---

## Summary

All technical unknowns resolved. Implementation will use:

1. **localStorage API**: JSON serialization, comprehensive error handling, quota management
2. **UUID v4 via crypto.randomUUID()**: Native browser API, zero dependencies, zero collision risk
3. **Relative date formatting**: Custom ~30 line utility, no dependencies, Intl.DateTimeFormat for absolute
4. **Form validation**: Controlled React components, inline error messages, submit button disabled until valid
5. **Exercise reordering**: Array swap with up/down buttons, accessible, works on mobile and desktop
6. **Cross-tab sync**: Storage event listener with reload notification, no complex conflict resolution

All decisions align with constitutional principles (no new dependencies, simple implementations, performant) and meet specification requirements. Ready for Phase 1 (Design & Contracts).
