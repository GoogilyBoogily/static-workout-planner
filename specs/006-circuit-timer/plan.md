# Implementation Plan: Circuit Timer

**Branch**: `006-circuit-timer` | **Date**: 2025-11-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-circuit-timer/spec.md`

## Summary

Add a circuit timer feature to workout plans that allows users to run timed exercise/rest intervals. Users configure exercise duration, rest duration, number of rounds, and optional finisher period. Timer automatically cycles through phases with audio beep alerts during final 5 seconds of each phase. Accessed via a button on each workout plan card.

## Technical Context

**Language/Version**: JavaScript (ES2020+) with JSX
**Primary Dependencies**: React 18, Vite 6 (existing stack - no new dependencies needed)
**Storage**: N/A (timer config resets on page load per spec)
**Testing**: Manual testing only (per constitution)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single React application (Vite-based)
**Performance Goals**: Timer transitions within 100ms, accurate 1-second countdown intervals
**Constraints**: No external timer libraries, audio via Web Audio API
**Scale/Scope**: Single-user local application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Compliance Notes |
|-----------|--------|------------------|
| I. Bun-First Development | ✅ PASS | Using Bun for all commands |
| II. Performance by Default | ✅ PASS | No new dependencies, minimal re-renders via state management |
| III. Component Simplicity | ✅ PASS | Single CircuitTimer component + co-located CSS, React hooks only |
| IV. Vite-Optimized Build | ✅ PASS | Standard Vite build, no custom config needed |
| V. Type Safety & Quality | ✅ PASS | JSDoc comments for component props |

**Gate Status**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/006-circuit-timer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CircuitTimer.jsx      # NEW: Main timer component (config + display + controls)
│   ├── CircuitTimer.css      # NEW: Timer styles
│   └── PlanList.jsx          # MODIFIED: Add timer button to plan cards
├── utils/
│   └── timerAudio.js         # NEW: Web Audio API beep generation
└── App.jsx                   # MODIFIED: Timer state management, view routing
```

**Structure Decision**: Follows existing pattern of co-located component + CSS files. Single component approach (not split into TimerConfig, TimerDisplay, TimerControls) per Component Simplicity principle. Audio utility extracted to utils/ for reusability and separation of concerns.

## Complexity Tracking

> No violations to justify - all implementations follow constitutional principles.

## Design Decisions

### Audio Implementation

**Decision**: Use Web Audio API to generate beep tones programmatically
**Rationale**: No external audio file dependencies, instant playback, small bundle size
**Alternative Rejected**: MP3/WAV file - adds asset management, potential loading delays

### Timer Accuracy

**Decision**: Use `setInterval` with 1000ms intervals, drift-corrected via timestamp comparison
**Rationale**: Simple implementation, sufficient accuracy for workout timing (±50ms acceptable)
**Alternative Rejected**: Web Workers - adds complexity for minimal benefit in this use case

### Component Architecture

**Decision**: Single `CircuitTimer` component handles all states (config, running, paused, complete)
**Rationale**: Timer states are tightly coupled, splitting adds prop drilling without benefit
**Alternative Rejected**: Separate TimerConfig/TimerDisplay components - violates Component Simplicity for this scope

### State Management

**Decision**: Timer state lifted to App.jsx, passed down as props
**Rationale**: Consistent with existing pattern (plans, exercises lifted to App), enables future timer-in-modal if needed
**Alternative Rejected**: Local component state - works but inconsistent with codebase patterns

## Implementation Approach

### Phase Flow

1. **P1 (Core Timer)**: CircuitTimer component with exercise/rest cycling
2. **P2 (Audio)**: Web Audio API beep alerts integration
3. **P3 (Finisher)**: Optional finisher period support
4. **P4 (Pause/Resume)**: Timer control functionality
5. **P5 (Stop/Reset)**: Reset to configuration state
6. **Integration**: Timer button on PlanList cards, App.jsx routing

### Key Technical Patterns

```jsx
// Timer state shape (managed in App.jsx)
const [timerState, setTimerState] = useState({
  isActive: false,
  phase: 'idle', // 'idle' | 'exercise' | 'rest' | 'finisher' | 'complete'
  currentRound: 1,
  remainingSeconds: 0,
  isPaused: false,
  config: { exerciseDuration: 30, restDuration: 15, rounds: 3, finisherDuration: 0 }
})

// Audio beep (utils/timerAudio.js)
const audioContext = new (window.AudioContext || window.webkitAudioContext)()
function playBeep(frequency = 800, duration = 0.1) {
  const oscillator = audioContext.createOscillator()
  // ... setup and play
}
```

## Dependencies

### Existing (no changes)
- React 18.3.1
- Vite 6.0.3
- @vitejs/plugin-react

### New
- None (Web Audio API is browser-native)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Browser tab inactive pauses timer | Medium | Low | Document in UI that timer requires active tab |
| Audio not playing (user gesture requirement) | Medium | Medium | Start button triggers audio context; show warning if blocked |
| Mobile browser audio restrictions | Low | Medium | Use standard Web Audio patterns; degrade gracefully |
