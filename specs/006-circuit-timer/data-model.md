# Data Model: Circuit Timer

**Feature**: Circuit Timer
**Date**: 2025-11-23

## Overview

The circuit timer is a stateful, ephemeral feature - it does not persist data to localStorage. All state is managed in React component state and resets when the page reloads.

---

## Entities

### TimerConfig

Configuration set by user before starting the timer.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| exerciseDuration | number | >= 1 | 30 | Exercise phase duration in seconds |
| restDuration | number | >= 0 | 15 | Rest phase duration in seconds (0 = skip rest) |
| rounds | number | >= 1 | 3 | Number of exercise/rest cycles |
| finisherDuration | number | >= 0 | 0 | Optional finisher phase duration (0 = no finisher) |

### TimerState

Runtime state during timer operation.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| phase | enum | 'idle' \| 'exercise' \| 'rest' \| 'finisher' \| 'complete' | 'idle' | Current timer phase |
| currentRound | number | 1 to config.rounds | 1 | Current round number |
| remainingSeconds | number | >= 0 | 0 | Seconds remaining in current phase |
| isPaused | boolean | - | false | Whether timer is paused |
| isRunning | boolean | - | false | Whether timer is actively counting |

### TimerViewState

App-level state for timer view management.

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| isActive | boolean | - | false | Whether timer view is displayed |
| activePlanId | string \| null | Valid plan UUID or null | null | ID of plan timer was launched from (for context) |

---

## State Transitions

### Phase State Machine

```
                    ┌─────────────┐
                    │    idle     │
                    └──────┬──────┘
                           │ START
                           ▼
              ┌────────────────────────┐
              │       exercise         │◄────────┐
              └───────────┬────────────┘         │
                          │ countdown=0          │
                          ▼                      │
              ┌────────────────────────┐         │
              │   rest (if duration>0) │         │
              └───────────┬────────────┘         │
                          │ countdown=0          │
                          │                      │
              ┌───────────┴───────────┐          │
              │                       │          │
    rounds < total             rounds = total    │
              │                       │          │
              │                       ▼          │
              │         ┌─────────────────────┐  │
              │         │ finisher (if dur>0) │  │
              │         └──────────┬──────────┘  │
              │                    │ countdown=0 │
              │                    ▼             │
              │         ┌─────────────────────┐  │
              │         │      complete       │  │
              │         └─────────────────────┘  │
              │                                  │
              └──────────────────────────────────┘
                     (increment round)
```

### Control Actions

| Action | From State | To State | Effect |
|--------|------------|----------|--------|
| START | idle | exercise | Begin countdown with config.exerciseDuration |
| PAUSE | exercise/rest/finisher (isRunning=true) | same (isPaused=true) | Freeze countdown |
| RESUME | any (isPaused=true) | same (isPaused=false) | Continue countdown |
| STOP | any | idle | Reset all runtime state, preserve config |
| RESET | complete | idle | Return to configuration screen |

---

## Derived Values

These values are computed, not stored:

| Value | Derivation | Usage |
|-------|------------|-------|
| totalWorkoutTime | (exerciseDuration + restDuration) * rounds + finisherDuration - restDuration (last round) | Display estimated workout duration |
| progressPercent | elapsed / totalWorkoutTime * 100 | Optional progress bar |
| shouldBeep | remainingSeconds <= 5 && remainingSeconds > 0 | Trigger audio alert |

---

## Validation Rules

### Configuration Validation

```javascript
function validateConfig(config) {
  const errors = []

  if (config.exerciseDuration < 1) {
    errors.push('Exercise duration must be at least 1 second')
  }
  if (config.restDuration < 0) {
    errors.push('Rest duration cannot be negative')
  }
  if (config.rounds < 1) {
    errors.push('Must have at least 1 round')
  }
  if (config.finisherDuration < 0) {
    errors.push('Finisher duration cannot be negative')
  }

  return { isValid: errors.length === 0, errors }
}
```

### Runtime Constraints

- `remainingSeconds` is always >= 0
- `currentRound` is always between 1 and `config.rounds` (inclusive)
- `phase` transitions follow state machine rules
- `isPaused` only relevant when `phase` is 'exercise', 'rest', or 'finisher'

---

## No Persistence

Per spec requirements:
- Timer configuration resets to defaults on page reload
- No localStorage keys are used by this feature
- Timer state is purely in-memory (React useState)

This is intentional: workout timers are used in-the-moment and don't need history or saved configurations.
