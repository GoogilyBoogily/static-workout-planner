# Feature Specification: Circuit Timer

**Feature Branch**: `006-circuit-timer`
**Created**: 2025-11-23
**Status**: Draft
**Input**: User description: "The workout plans should have a timer feature that allows you to do workout circuits for the exercises. Meaning I should be able to specify a time to exercise, a time to rest, and it will countdown the time to exercise, then move into the rest phase, count that down, and then repeat a user specified number of times. The countdown will also have a beep noise the final 5 seconds of both the workout and rest phases. The user should also be able to specify a finisher period of the workout, which is a user specified amount of time at the end of the workout phase."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start and Run a Basic Circuit Timer (Priority: P1)

As a user performing a workout circuit, I want to start a timer that automatically cycles between exercise and rest periods so I can focus on my workout without manually tracking time.

**Why this priority**: This is the core functionality that delivers the primary value - automated timed intervals for circuit training. Without this, the feature has no purpose.

**Independent Test**: Can be fully tested by configuring exercise time (e.g., 30 seconds), rest time (e.g., 15 seconds), and rounds (e.g., 3), then pressing start and observing the timer cycle through all phases correctly.

**Acceptance Scenarios**:

1. **Given** I have set exercise time to 30 seconds, rest time to 15 seconds, and rounds to 3, **When** I start the timer, **Then** the timer begins counting down from 30 seconds in the "Exercise" phase
2. **Given** the timer is in "Exercise" phase and reaches 0, **When** the countdown completes, **Then** the timer automatically transitions to "Rest" phase and begins counting down from 15 seconds
3. **Given** the timer is in "Rest" phase and reaches 0, **When** more rounds remain, **Then** the timer transitions back to "Exercise" phase and increments the round counter
4. **Given** the timer has completed all rounds, **When** the final rest period ends, **Then** the timer displays a completion state and stops

---

### User Story 2 - Audio Countdown Alerts (Priority: P2)

As a user focused on exercising, I want to hear beep sounds during the final 5 seconds of each phase so I know when transitions are about to happen without watching the screen.

**Why this priority**: Audio alerts are critical for the hands-free workout experience. Users can't always see the screen during exercise, making audio feedback essential for practical use.

**Independent Test**: Can be tested by starting a timer and listening for beep sounds at 5, 4, 3, 2, 1 seconds remaining in both exercise and rest phases.

**Acceptance Scenarios**:

1. **Given** the timer is in "Exercise" phase with 5 seconds remaining, **When** each second ticks, **Then** a beep sound plays at 5, 4, 3, 2, and 1 seconds
2. **Given** the timer is in "Rest" phase with 5 seconds remaining, **When** each second ticks, **Then** a beep sound plays at 5, 4, 3, 2, and 1 seconds
3. **Given** a phase has more than 5 seconds remaining, **When** the timer is counting down, **Then** no beep sounds play

---

### User Story 3 - Finisher Period (Priority: P3)

As a user who wants to push harder at the end of a workout, I want to add an optional finisher period after my regular circuits so I can end with an extended exercise burst.

**Why this priority**: The finisher is an enhancement to the core timer functionality. It adds value but isn't required for basic circuit timing to work.

**Independent Test**: Can be tested by configuring a finisher duration (e.g., 60 seconds), running through all circuit rounds, and verifying the timer enters a "Finisher" phase after the final rest period.

**Acceptance Scenarios**:

1. **Given** I have configured a finisher period of 60 seconds, **When** all circuit rounds complete, **Then** the timer transitions to a "Finisher" phase counting down from 60 seconds
2. **Given** I have not configured a finisher period (0 or empty), **When** all circuit rounds complete, **Then** the timer displays completion without a finisher phase
3. **Given** the timer is in "Finisher" phase, **When** the final 5 seconds count down, **Then** beep sounds play at 5, 4, 3, 2, and 1 seconds

---

### User Story 4 - Pause and Resume Timer (Priority: P4)

As a user who may need to take an unexpected break, I want to pause and resume the timer so I don't lose my workout progress.

**Why this priority**: Pause/resume is important for real-world usability but the core timer can function without it. Users can restart if needed.

**Independent Test**: Can be tested by starting a timer, pausing it mid-countdown, verifying time freezes, then resuming and confirming countdown continues from where it stopped.

**Acceptance Scenarios**:

1. **Given** the timer is running, **When** I press pause, **Then** the countdown stops and the display shows the paused state
2. **Given** the timer is paused, **When** I press resume, **Then** the countdown continues from where it was paused
3. **Given** the timer is paused, **When** the timer remains paused, **Then** no beep sounds play regardless of remaining time

---

### User Story 5 - Stop and Reset Timer (Priority: P5)

As a user who wants to start over or end early, I want to stop the timer and reset it to its initial configuration.

**Why this priority**: A safety valve feature that allows users to abort and restart. Important for usability but not core functionality.

**Independent Test**: Can be tested by starting a timer, pressing stop mid-workout, and verifying all values reset to initial configuration.

**Acceptance Scenarios**:

1. **Given** the timer is running or paused, **When** I press stop/reset, **Then** the timer returns to the initial configuration screen with all previously entered values preserved
2. **Given** I have stopped the timer, **When** I press start again, **Then** the timer begins a fresh workout from round 1

---

### Edge Cases

- What happens when exercise time is set to 5 seconds or less? (All seconds would have beeps - this is acceptable)
- What happens when rest time is set to 0? (Skip rest phase entirely, go directly to next exercise round or finisher)
- What happens when rounds is set to 1? (Single round, then finisher if configured or completion)
- How does the timer behave if the browser tab is inactive or device sleeps? (Timer may drift - acceptable for workout use)
- What happens if the user sets finisher to a value less than 5 seconds? (Beeps play for all available seconds)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to configure exercise duration in seconds (minimum 1 second)
- **FR-002**: System MUST allow users to configure rest duration in seconds (minimum 0 seconds)
- **FR-003**: System MUST allow users to configure the number of rounds (minimum 1 round)
- **FR-004**: System MUST allow users to configure an optional finisher duration in seconds (0 means no finisher)
- **FR-005**: System MUST display the current phase (Exercise, Rest, or Finisher) prominently
- **FR-006**: System MUST display the remaining time in the current phase
- **FR-007**: System MUST display the current round number and total rounds
- **FR-008**: System MUST automatically transition between phases without user intervention
- **FR-009**: System MUST play an audible beep sound at 5, 4, 3, 2, and 1 seconds remaining in Exercise, Rest, and Finisher phases
- **FR-010**: System MUST provide a start button to begin the timer
- **FR-011**: System MUST provide a pause/resume button during timer operation
- **FR-012**: System MUST provide a stop/reset button that returns to configuration
- **FR-013**: System MUST preserve timer configuration values after stop/reset for easy restart
- **FR-014**: System MUST display a clear completion state when all phases finish
- **FR-015**: System MUST skip the rest phase after the final round if a finisher is configured (exercise → finisher, not exercise → rest → finisher)
- **FR-016**: System MUST provide a timer button on each workout plan card to launch the circuit timer

### Key Entities

- **Timer Configuration**: Exercise duration, rest duration, number of rounds, finisher duration
- **Timer State**: Current phase (idle, exercise, rest, finisher, complete), remaining time, current round, running/paused status
- **Audio Alert**: Beep sound triggered at specific countdown points

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can configure and start a circuit timer in under 30 seconds
- **SC-002**: Timer phase transitions occur within 100ms of countdown reaching zero (perceived as instant)
- **SC-003**: Audio beeps play at the correct countdown intervals (5, 4, 3, 2, 1 seconds) with no missed or duplicate beeps
- **SC-004**: Users can complete a full circuit workout without needing to manually advance phases
- **SC-005**: Timer display remains visible and updating even when other parts of the app are interacted with
- **SC-006**: Users can pause, resume, and reset the timer without losing their configuration

## Clarifications

### Session 2025-11-23

- Q: Where do users access the circuit timer? → A: Button on workout plan card (timer is contextual to selected plan)

## Assumptions

- **Default values**: Exercise time defaults to 30 seconds, rest time defaults to 15 seconds, rounds defaults to 3, finisher defaults to 0 (disabled)
- **Audio format**: A simple beep tone is sufficient; no need for voice countdown or multiple sound options
- **Browser support**: Audio playback is supported in modern browsers; graceful degradation if audio fails
- **Timer accuracy**: JavaScript-based timing with 1-second precision is acceptable for workout use
- **Persistence**: Timer configuration does not need to be saved between sessions (can be reset to defaults on page load)
- **Integration**: Timer is accessed via a button on each workout plan card; the timer operates independently of the plan's specific exercises (generic interval timer, not exercise-specific)
