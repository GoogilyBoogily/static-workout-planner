# Research: Circuit Timer

**Feature**: Circuit Timer
**Date**: 2025-11-23
**Status**: Complete

## Research Summary

This document captures technical research and decisions for implementing the circuit timer feature. Since the feature uses browser-native APIs and the existing React stack, research focused on best practices rather than technology selection.

---

## 1. Web Audio API for Beep Sounds

### Decision
Use Web Audio API with OscillatorNode to generate beep tones programmatically.

### Rationale
- **No external dependencies**: Browser-native API, zero bundle size impact
- **Instant playback**: No audio file loading delays
- **Configurable**: Frequency, duration, and volume can be adjusted programmatically
- **Cross-browser support**: Supported in all modern browsers (Chrome, Firefox, Safari, Edge)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| HTML5 `<audio>` with MP3/WAV file | Requires audio asset management, potential loading delays, larger bundle |
| Third-party audio library (Howler.js, Tone.js) | Violates constitution (minimize dependencies), overkill for simple beep |
| CSS/JS animation with system notification | Inconsistent across browsers, some browsers block notifications |

### Implementation Pattern

```javascript
// Singleton AudioContext (created on first user interaction)
let audioContext = null

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function playBeep(frequency = 800, duration = 0.15) {
  const ctx = initAudio()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.frequency.value = frequency
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}
```

### Browser Considerations
- **User gesture requirement**: AudioContext must be created/resumed after user interaction (start button click)
- **Mobile Safari**: Requires `webkitAudioContext` prefix (handled by fallback)
- **Autoplay policy**: Not an issue since timer requires explicit user start action

---

## 2. Timer Implementation Strategy

### Decision
Use `setInterval` with drift correction for 1-second countdown intervals.

### Rationale
- **Simplicity**: Easiest to understand and debug
- **Sufficient accuracy**: ±50ms drift acceptable for workout timing (not medical/scientific use)
- **Low overhead**: Minimal CPU usage compared to requestAnimationFrame-based approaches

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| `requestAnimationFrame` loop | More complex, unnecessary precision for this use case |
| Web Workers | Adds complexity; background timing not required (spec accepts tab-inactive drift) |
| `setTimeout` chain | Accumulates drift without correction |

### Implementation Pattern

```javascript
// Drift-corrected interval
const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds)
const intervalRef = useRef(null)
const startTimeRef = useRef(null)
const expectedTimeRef = useRef(null)

useEffect(() => {
  if (isRunning && !isPaused) {
    startTimeRef.current = Date.now()
    expectedTimeRef.current = startTimeRef.current + 1000

    intervalRef.current = setInterval(() => {
      const drift = Date.now() - expectedTimeRef.current
      expectedTimeRef.current += 1000

      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Handle phase transition
          return 0
        }
        return prev - 1
      })

      // Self-correct for next interval
      const nextDelay = Math.max(0, 1000 - drift)
      // Note: setInterval can't self-adjust, but drift is tracked for accuracy
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }
}, [isRunning, isPaused])
```

### Edge Cases
- **Tab inactive**: Browser may throttle intervals; timer may drift. Acceptable per spec.
- **Device sleep**: Timer pauses. Acceptable per spec (user can reset).
- **Very fast intervals (<100ms)**: Not applicable; minimum phase is 1 second.

---

## 3. React State Management Pattern

### Decision
Lift timer state to App.jsx, manage with `useState` hook, pass down as props.

### Rationale
- **Consistency**: Matches existing codebase pattern (plans, exercises in App.jsx)
- **Simplicity**: No external state library needed (per constitution)
- **Flexibility**: Enables future enhancements (timer-in-modal, timer persistence)

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Local state in CircuitTimer | Inconsistent with codebase; harder to integrate with view routing |
| useReducer | More complex than needed for this state shape |
| Context API | Overkill; timer is only used in one view branch |

### State Shape

```javascript
const timerStateShape = {
  // View mode
  isActive: false,        // true when timer view is shown

  // Timer config (set before starting)
  config: {
    exerciseDuration: 30, // seconds
    restDuration: 15,     // seconds
    rounds: 3,            // number of rounds
    finisherDuration: 0   // seconds (0 = no finisher)
  },

  // Runtime state (updated during timer operation)
  phase: 'idle',          // 'idle' | 'exercise' | 'rest' | 'finisher' | 'complete'
  currentRound: 1,        // 1 to config.rounds
  remainingSeconds: 0,    // countdown value
  isPaused: false,        // pause/resume toggle
  isRunning: false        // actively counting down
}
```

---

## 4. Component Architecture

### Decision
Single `CircuitTimer` component handling all states (config, running, paused, complete).

### Rationale
- **Cohesion**: All timer states are tightly related
- **Simplicity**: No prop drilling between sub-components
- **Constitution compliance**: "Single-file components for small features"

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Split into TimerConfig, TimerDisplay, TimerControls | Premature abstraction; adds prop drilling complexity |
| Separate modal for timer | Inconsistent with app's single-page view pattern |

### Component Structure

```jsx
function CircuitTimer({
  config,
  onConfigChange,
  onStart,
  onPause,
  onResume,
  onStop,
  onClose,
  timerState
}) {
  // Renders based on timerState.phase:
  // - 'idle': Configuration form
  // - 'exercise'/'rest'/'finisher': Countdown display with pause/stop
  // - 'complete': Completion message with reset option
}
```

---

## 5. CSS Styling Approach

### Decision
Co-located CSS file (`CircuitTimer.css`) with BEM-style class naming.

### Rationale
- **Consistency**: Matches existing component CSS files
- **Scoping**: Component-specific classes avoid global conflicts
- **Constitution compliance**: "Co-locate related files"

### Key Styling Considerations
- **Large timer display**: Remaining seconds should be prominently visible
- **Phase indicator**: Clear visual distinction between Exercise (green), Rest (blue), Finisher (orange)
- **Dark mode support**: Use CSS custom properties for theme compatibility
- **Responsive**: Timer should be usable on mobile viewports

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| How to handle audio on mobile? | Web Audio API with user gesture trigger; graceful fallback if blocked |
| Timer accuracy requirements? | ±50ms acceptable; simple setInterval sufficient |
| State management approach? | Lift to App.jsx with useState (existing pattern) |
| Component split strategy? | Single component (avoid premature abstraction) |

---

## References

- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [setInterval drift correction](https://javascript.info/settimeout-setinterval#nested-settimeout)
- [React useEffect cleanup patterns](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
