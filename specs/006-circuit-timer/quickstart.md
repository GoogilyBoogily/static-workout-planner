# Quickstart: Circuit Timer

**Feature**: Circuit Timer
**Date**: 2025-11-23

## Prerequisites

- Bun installed (`bun --version`)
- Project dependencies installed (`bun install`)

## Development Setup

```bash
# Start dev server
bun dev

# Open browser to http://localhost:5173
```

## Files to Create/Modify

### New Files

1. **`src/components/CircuitTimer.jsx`** - Main timer component
2. **`src/components/CircuitTimer.css`** - Timer styles
3. **`src/utils/timerAudio.js`** - Web Audio API beep utility

### Modified Files

1. **`src/App.jsx`** - Add timer state, view routing, handlers
2. **`src/components/PlanList.jsx`** - Add timer button to plan cards
3. **`src/components/PlanList.css`** - Style for timer button (if needed)

## Implementation Order

### Step 1: Audio Utility

Create `src/utils/timerAudio.js`:

```javascript
let audioContext = null

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

export function playBeep(frequency = 800, duration = 0.15) {
  const ctx = initAudio()
  if (ctx.state === 'suspended') ctx.resume()

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

### Step 2: CircuitTimer Component

Create basic structure in `src/components/CircuitTimer.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react'
import { playBeep, initAudio } from '../utils/timerAudio'
import './CircuitTimer.css'

function CircuitTimer({ onClose }) {
  // Config state
  const [config, setConfig] = useState({
    exerciseDuration: 30,
    restDuration: 15,
    rounds: 3,
    finisherDuration: 0
  })

  // Timer state
  const [phase, setPhase] = useState('idle') // idle, exercise, rest, finisher, complete
  const [currentRound, setCurrentRound] = useState(1)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // ... implement timer logic, render UI
}

export default CircuitTimer
```

### Step 3: App.jsx Integration

Add to `App.jsx`:

```jsx
// State
const [timerActive, setTimerActive] = useState(false)

// Handler
const handleStartTimer = (plan) => {
  setTimerActive(true)
}

const handleCloseTimer = () => {
  setTimerActive(false)
}

// Render (in view logic)
{timerActive && (
  <CircuitTimer onClose={handleCloseTimer} />
)}
```

### Step 4: PlanList Timer Button

Add to plan card actions in `PlanList.jsx`:

```jsx
<button
  onClick={() => onStartTimer(plan)}
  className="button-secondary"
  aria-label={`Start timer for ${plan.name}`}
>
  ⏱️ Timer
</button>
```

## Testing Checklist

### Manual Tests

- [ ] Timer button appears on each plan card
- [ ] Clicking timer button opens timer view
- [ ] Can configure exercise/rest/rounds/finisher
- [ ] Start button begins countdown
- [ ] Timer transitions exercise → rest → exercise correctly
- [ ] Round counter increments properly
- [ ] Beeps play at 5, 4, 3, 2, 1 seconds
- [ ] Pause freezes countdown, resume continues
- [ ] Stop returns to config with values preserved
- [ ] Finisher activates after final exercise (when configured)
- [ ] Completion screen displays when timer finishes
- [ ] Close button returns to plan list

### Edge Cases

- [ ] Exercise time ≤ 5 seconds (all beeps play)
- [ ] Rest time = 0 (skips rest phase)
- [ ] Rounds = 1 (single round works)
- [ ] Finisher = 0 (no finisher phase)

## Common Issues

### Audio not playing

- **Cause**: AudioContext requires user gesture
- **Fix**: Ensure `initAudio()` is called on start button click

### Timer drift

- **Cause**: Browser throttles inactive tabs
- **Note**: Acceptable per spec; user should keep tab active

### CSS not loading

- **Cause**: Import missing
- **Fix**: Add `import './CircuitTimer.css'` at top of component

## Build Verification

```bash
# Ensure production build succeeds
bun run build

# Check bundle size hasn't increased significantly
ls -la dist/assets/
```
