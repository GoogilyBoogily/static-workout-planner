import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ChangeEvent, KeyboardEvent, DragEvent } from 'react'
import { playSound, initAudio, SOUND_PRESETS } from '../utils/timerAudio'
import './CircuitTimer.css'

import type {
  WorkoutPlan,
  PlanExercise,
  TimerConfig,
  TimerPhase,
  SoundPresetKey,
  ExerciseGroup
} from '../types'

interface CircuitTimerProps {
  /** Callback to close timer and return to plan list */
  onClose: () => void
  /** The workout plan to use with the timer */
  plan: WorkoutPlan | null
  /** Callback to update plan when exercises are reordered */
  onUpdatePlan?: (plan: WorkoutPlan) => void
}

/**
 * Circuit Timer Component
 * Provides configurable interval timer for workout circuits
 */
function CircuitTimer({ onClose, plan, onUpdatePlan }: CircuitTimerProps) {
  // Configuration state (user inputs)
  const [config, setConfig] = useState<TimerConfig>({
    exerciseDuration: 30,
    restDuration: 15,
    rounds: 3,
    finisherDuration: 0,
    volume: 0.5,
    warningTime: 10,
    sounds: {
      exercise: 'classic',
      rest: 'soft',
      finisher: 'alert',
      warning: 'funky',
      complete: 'double'
    }
  })

  // Timer runtime state
  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [currentRound, setCurrentRound] = useState(1) // Current rep of the full circuit
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0) // For non-circuit mode
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0) // For circuit mode: which round group

  // Drag-and-drop state (only active during idle/config phase)
  // Uses flat array indices for exercises (mirrors PlanForm pattern)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Get exercises and circuit status from plan
  const exercises = plan?.exercises ?? []
  const isCircuit = plan?.isCircuit ?? false

  // Group exercises by roundGroup for circuit mode
  const exerciseGroups = useMemo((): ExerciseGroup[] | null => {
    if (!isCircuit || exercises.length === 0) return null
    const groups: Record<number, PlanExercise[]> = {}
    exercises.forEach(exercise => {
      const group = exercise.roundGroup ?? 0
      if (!groups[group]) groups[group] = []
      groups[group]?.push(exercise)
    })
    // Return sorted array of exercise arrays
    return Object.entries(groups)
      .map(([group, exs]) => ({ groupIndex: parseInt(group, 10), exercises: exs }))
      .sort((a, b) => a.groupIndex - b.groupIndex)
  }, [exercises, isCircuit])

  const numGroups = exerciseGroups ? exerciseGroups.length : 0

  // Interval ref for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Derived state: is timer actively running
  const isRunning = phase !== 'idle' && phase !== 'complete' && !isPaused

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Play completion sound when workout finishes
  useEffect(() => {
    if (phase === 'complete') {
      playSound(config.sounds.complete, config.volume)
    }
  }, [phase, config.sounds.complete, config.volume])

  // Countdown effect
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        // Play warning sound at warningTime during exercise phase (once)
        if (phase === 'exercise' && prev === config.warningTime && config.warningTime > 5 && !isPaused) {
          playSound(config.sounds.warning, config.volume)
        }

        // Play finisher sound when entering finisher portion of exercise
        if (phase === 'exercise' && prev === config.finisherDuration && config.finisherDuration > 0 && !isPaused) {
          playSound(config.sounds.finisher, config.volume)
        }

        // Play beep for final 5 seconds (but not at 0)
        if (prev <= 5 && prev > 0 && !isPaused) {
          // Use phase-specific sound (use finisher sound during finisher portion of exercise)
          let soundKey: SoundPresetKey = config.sounds[phase as keyof typeof config.sounds] ?? 'classic'
          if (phase === 'exercise' && config.finisherDuration > 0 && prev <= config.finisherDuration) {
            soundKey = config.sounds.finisher
          }
          playSound(soundKey, config.volume)
        }

        if (prev <= 1) {
          // Time's up, handle phase transition
          handlePhaseTransition()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, phase, currentRound, config, isPaused])

  // Handle phase transitions
  const handlePhaseTransition = useCallback(() => {
    if (phase === 'exercise') {
      if (isCircuit && numGroups > 0) {
        // Circuit mode: check if more groups in this rep
        const isLastGroup = currentGroupIndex >= numGroups - 1
        const isLastRep = currentRound >= config.rounds

        if (isLastGroup && isLastRep) {
          // All groups of all reps done
          if (config.finisherDuration > 0) {
            setPhase('finisher')
            setRemainingSeconds(config.finisherDuration)
          } else if (config.restDuration > 0) {
            setPhase('rest')
            setRemainingSeconds(config.restDuration)
          } else {
            setPhase('complete')
          }
        } else if (isLastGroup) {
          // Last group of this rep, but more reps to go
          if (config.restDuration > 0) {
            setPhase('rest')
            setRemainingSeconds(config.restDuration)
          } else {
            // No rest, start next rep at group 0
            setCurrentRound(prev => prev + 1)
            setCurrentGroupIndex(0)
            setRemainingSeconds(config.exerciseDuration)
          }
        } else {
          // More groups in this rep
          if (config.restDuration > 0) {
            setPhase('rest')
            setRemainingSeconds(config.restDuration)
          } else {
            // No rest, go to next group
            setCurrentGroupIndex(prev => prev + 1)
            setRemainingSeconds(config.exerciseDuration)
          }
        }
      } else {
        // Non-circuit mode (original behavior)
        if (currentRound >= config.rounds) {
          if (config.finisherDuration > 0) {
            setPhase('finisher')
            setRemainingSeconds(config.finisherDuration)
          } else if (config.restDuration > 0) {
            setPhase('rest')
            setRemainingSeconds(config.restDuration)
          } else {
            setPhase('complete')
          }
        } else {
          if (config.restDuration > 0) {
            setPhase('rest')
            setRemainingSeconds(config.restDuration)
          } else {
            setCurrentRound(prev => prev + 1)
            setCurrentExerciseIndex(prev => exercises.length > 0 ? (prev + 1) % exercises.length : 0)
            setRemainingSeconds(config.exerciseDuration)
          }
        }
      }
    } else if (phase === 'rest') {
      if (isCircuit && numGroups > 0) {
        // Circuit mode rest completed
        const isLastGroup = currentGroupIndex >= numGroups - 1
        const isLastRep = currentRound >= config.rounds

        if (isLastGroup && isLastRep) {
          // Final rest completed
          if (config.finisherDuration > 0) {
            setPhase('finisher')
            setRemainingSeconds(config.finisherDuration)
          } else {
            setPhase('complete')
          }
        } else if (isLastGroup) {
          // Start next rep at group 0
          setCurrentRound(prev => prev + 1)
          setCurrentGroupIndex(0)
          setPhase('exercise')
          setRemainingSeconds(config.exerciseDuration)
        } else {
          // Continue to next group in same rep
          setCurrentGroupIndex(prev => prev + 1)
          setPhase('exercise')
          setRemainingSeconds(config.exerciseDuration)
        }
      } else {
        // Non-circuit mode (original behavior)
        if (currentRound >= config.rounds) {
          if (config.finisherDuration > 0) {
            setPhase('finisher')
            setRemainingSeconds(config.finisherDuration)
          } else {
            setPhase('complete')
          }
        } else {
          setCurrentRound(prev => prev + 1)
          setCurrentExerciseIndex(prev => exercises.length > 0 ? (prev + 1) % exercises.length : 0)
          setPhase('exercise')
          setRemainingSeconds(config.exerciseDuration)
        }
      }
    } else if (phase === 'finisher') {
      setPhase('complete')
    }
  }, [phase, currentRound, currentGroupIndex, config, isCircuit, numGroups, exercises.length])

  // Start timer
  const handleStart = () => {
    // Initialize audio context on user gesture
    initAudio()

    setPhase('exercise')
    setCurrentRound(1)
    setCurrentExerciseIndex(0)
    setCurrentGroupIndex(0)
    setRemainingSeconds(config.exerciseDuration)
    setIsPaused(false)
  }

  // Pause/Resume toggle
  const handlePauseResume = () => {
    setIsPaused(prev => !prev)
  }

  // Stop and reset to configuration
  const handleStop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPhase('idle')
    setCurrentRound(1)
    setCurrentExerciseIndex(0)
    setCurrentGroupIndex(0)
    setRemainingSeconds(0)
    setIsPaused(false)
  }

  // Restart from completion
  const handleRestart = () => {
    handleStart()
  }

  // Config input change handler
  const handleConfigChange = (field: keyof Omit<TimerConfig, 'sounds' | 'volume'>, value: string) => {
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      setConfig(prev => ({
        ...prev,
        [field]: numValue
      }))
    }
  }

  // Volume slider change handler
  const handleVolumeChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      setConfig(prev => ({
        ...prev,
        volume: numValue
      }))
    }
  }

  // Sound selection change handler
  type SoundPhaseKey = keyof typeof config.sounds
  const handleSoundChange = (soundPhase: SoundPhaseKey, soundKey: SoundPresetKey) => {
    setConfig(prev => ({
      ...prev,
      sounds: {
        ...prev.sounds,
        [soundPhase]: soundKey
      }
    }))
  }

  // Test sound for a specific phase
  const handleTestSound = (soundPhase: SoundPhaseKey) => {
    initAudio()
    playSound(config.sounds[soundPhase], config.volume)
  }

  // Drag-and-drop handlers for exercises (mirrors PlanForm pattern)
  // Each exercise is both a drag source AND drop target
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    if (phase !== 'idle') {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    setDraggedIndex(index)
    // Use setTimeout to prevent drag image issues in some browsers
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging')
    }, 0)
  }

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).classList.remove('dragging')
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && index !== draggedIndex) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()
    if (phase !== 'idle' || draggedIndex === null || draggedIndex === dropIndex || !onUpdatePlan || !plan) {
      setDragOverIndex(null)
      return
    }

    const newExercises = [...exercises]
    const draggedItem = newExercises[draggedIndex]
    if (!draggedItem) {
      setDragOverIndex(null)
      return
    }
    newExercises.splice(draggedIndex, 1)

    // Get the target exercise's roundGroup (before splice changes indices)
    const targetExercise = exercises[dropIndex]
    const targetRoundGroup = targetExercise?.roundGroup ?? 0
    draggedItem.roundGroup = targetRoundGroup

    // Adjust dropIndex if dragging from before to after
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newExercises.splice(adjustedDropIndex, 0, draggedItem)

    // Save changes
    onUpdatePlan({
      ...plan,
      exercises: newExercises,
      updatedAt: Date.now()
    })

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Format seconds as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get phase display name
  const getPhaseDisplay = (): string => {
    switch (phase) {
      case 'exercise':
        // Show "Finisher" during last X seconds of exercise if finisherDuration is set
        if (config.finisherDuration > 0 && remainingSeconds <= config.finisherDuration) {
          return 'Finisher'
        }
        return 'Exercise'
      case 'rest': return 'Rest'
      case 'finisher': return 'Finisher'
      case 'complete': return 'Complete!'
      default: return ''
    }
  }

  // Keyboard accessibility
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (phase === 'idle') {
      if (e.key === 'Enter') {
        handleStart()
      }
    } else if (phase !== 'complete') {
      if (e.key === ' ') {
        e.preventDefault()
        handlePauseResume()
      } else if (e.key === 'Escape') {
        handleStop()
      }
    } else if (phase === 'complete') {
      if (e.key === 'Enter') {
        handleRestart()
      }
    }
  }

  return (
    <div
      className="circuit-timer"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="circuit-timer-header">
        <div className="timer-title">
          <h2>Circuit Timer</h2>
          {plan && <span className="plan-name-subtitle">{plan.name}</span>}
        </div>
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close timer"
        >
          &times;
        </button>
      </div>

      {/* Configuration Form (idle state) */}
      {phase === 'idle' && (
        <div className="timer-config">
          <div className="config-field">
            <label htmlFor="exerciseDuration">Exercise (seconds)</label>
            <input
              type="number"
              id="exerciseDuration"
              min="1"
              value={config.exerciseDuration}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleConfigChange('exerciseDuration', e.target.value)}
            />
          </div>

          <div className="config-field">
            <label htmlFor="restDuration">Rest (seconds)</label>
            <input
              type="number"
              id="restDuration"
              min="0"
              value={config.restDuration}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleConfigChange('restDuration', e.target.value)}
            />
          </div>

          <div className="config-field">
            <label htmlFor="rounds">Rounds</label>
            <input
              type="number"
              id="rounds"
              min="1"
              value={config.rounds}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleConfigChange('rounds', e.target.value)}
            />
          </div>

          <div className="config-field">
            <label htmlFor="finisherDuration">Finisher (seconds, 0 = none)</label>
            <input
              type="number"
              id="finisherDuration"
              min="0"
              value={config.finisherDuration}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleConfigChange('finisherDuration', e.target.value)}
            />
          </div>

          <div className="config-field">
            <label htmlFor="warningTime">Warning at (seconds remaining, 0 = off)</label>
            <input
              type="number"
              id="warningTime"
              min="0"
              value={config.warningTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleConfigChange('warningTime', e.target.value)}
            />
          </div>

          {/* Sound Settings Section */}
          <div className="sound-settings">
            <div className="sound-settings-header">Sound Settings</div>

            <div className="sound-selector-row">
              <span className="sound-selector-label phase-exercise-label">Exercise</span>
              <select
                value={config.sounds.exercise}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSoundChange('exercise', e.target.value as SoundPresetKey)}
                className="sound-select"
              >
                {Object.entries(SOUND_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleTestSound('exercise')}
                className="button-secondary test-sound-button"
                aria-label="Test exercise sound"
              >
                🔊
              </button>
            </div>

            <div className="sound-selector-row">
              <span className="sound-selector-label phase-rest-label">Rest</span>
              <select
                value={config.sounds.rest}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSoundChange('rest', e.target.value as SoundPresetKey)}
                className="sound-select"
              >
                {Object.entries(SOUND_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleTestSound('rest')}
                className="button-secondary test-sound-button"
                aria-label="Test rest sound"
              >
                🔊
              </button>
            </div>

            <div className="sound-selector-row">
              <span className="sound-selector-label phase-finisher-label">Finisher</span>
              <select
                value={config.sounds.finisher}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSoundChange('finisher', e.target.value as SoundPresetKey)}
                className="sound-select"
              >
                {Object.entries(SOUND_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleTestSound('finisher')}
                className="button-secondary test-sound-button"
                aria-label="Test finisher sound"
              >
                🔊
              </button>
            </div>

            <div className="sound-selector-row">
              <span className="sound-selector-label phase-warning-label">Warning</span>
              <select
                value={config.sounds.warning}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSoundChange('warning', e.target.value as SoundPresetKey)}
                className="sound-select"
              >
                {Object.entries(SOUND_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleTestSound('warning')}
                className="button-secondary test-sound-button"
                aria-label="Test warning sound"
              >
                🔊
              </button>
            </div>

            <div className="sound-selector-row">
              <span className="sound-selector-label phase-complete-label">Complete</span>
              <select
                value={config.sounds.complete}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSoundChange('complete', e.target.value as SoundPresetKey)}
                className="sound-select"
              >
                {Object.entries(SOUND_PRESETS).map(([key, preset]) => (
                  <option key={key} value={key}>{preset.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleTestSound('complete')}
                className="button-secondary test-sound-button"
                aria-label="Test complete sound"
              >
                🔊
              </button>
            </div>
          </div>

          {/* Volume Control */}
          <div className="config-field volume-field">
            <label htmlFor="volume">
              Volume ({Math.round(config.volume * 100)}%)
            </label>
            <div className="volume-control">
              <input
                type="range"
                id="volume"
                min="0"
                max="1"
                step="0.1"
                value={config.volume}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleVolumeChange(e.target.value)}
                className="volume-slider"
              />
            </div>
          </div>

          {/* Exercise Preview with Drag-and-Drop (Circuit Mode Only) */}
          {isCircuit && exerciseGroups && exerciseGroups.length > 0 && (
            <div className="config-exercise-preview">
              <div className="config-exercise-header">
                Exercises by Round
                <span className="drag-hint">Drag to reorder or move between rounds</span>
              </div>
              <div className="config-circuit-groups">
                {exerciseGroups.map((group) => (
                  <div
                    key={group.groupIndex}
                    className="config-circuit-group"
                  >
                    <div className="config-group-header">
                      Round {group.groupIndex + 1}
                    </div>
                    <div className="config-exercise-list">
                      {group.exercises.map((exercise) => {
                        // Get flat index in exercises array for drag tracking
                        const flatIndex = exercises.findIndex(ex => ex.id === exercise.id)
                        return (
                          <div
                            key={exercise.id}
                            className={`config-exercise-item ${draggedIndex === flatIndex ? 'dragging' : ''} ${dragOverIndex === flatIndex ? 'drag-over' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, flatIndex)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOver(e, flatIndex)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, flatIndex)}
                          >
                            <div className="exercise-name">{exercise.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleStart}
            className="button-primary start-button"
          >
            Start Timer
          </button>
        </div>
      )}

      {/* Timer Display (running/paused states) */}
      {(phase === 'exercise' || phase === 'rest' || phase === 'finisher') && (
        <div className="timer-layout">
          {/* Exercise Panel */}
          {exercises.length > 0 && (
            <div className="exercise-panel">
              <div className="exercise-panel-header">
                {isCircuit ? `Round ${currentGroupIndex + 1} of ${numGroups}` : 'Exercises'}
              </div>

              {/* Circuit mode: grouped exercises */}
              {isCircuit && exerciseGroups && (
                <div className="circuit-groups">
                  {exerciseGroups.map((group, gIdx) => {
                    const isCurrentGroup = gIdx === currentGroupIndex
                    const isCompletedGroup = gIdx < currentGroupIndex
                    const isUpcomingGroup = gIdx > currentGroupIndex

                    return (
                      <div
                        key={group.groupIndex}
                        className={`circuit-group ${isCurrentGroup ? 'current' : ''} ${isCompletedGroup ? 'completed' : ''} ${isUpcomingGroup ? 'upcoming' : ''}`}
                      >
                        <div className="circuit-group-header">
                          Round {group.groupIndex + 1}
                          {isCurrentGroup && <span className="current-badge">NOW</span>}
                        </div>
                        <ul className="exercise-list">
                          {group.exercises.map((exercise, idx) => (
                            <li key={exercise.id || idx} className="exercise-item">
                              <div className="exercise-info">
                                <span className="exercise-name">{exercise.name}</span>
                                {(exercise.sets || exercise.reps) && (
                                  <span className="exercise-details">
                                    {exercise.sets && `${exercise.sets} sets`}
                                    {exercise.sets && exercise.reps && ' × '}
                                    {exercise.reps && `${exercise.reps} reps`}
                                    {exercise.weight && ` @ ${exercise.weight}`}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Non-circuit mode: flat list */}
              {!isCircuit && (
                <ul className="exercise-list">
                  {exercises.map((exercise, index) => {
                    const isCompleted = index < currentExerciseIndex
                    const isCurrent = index === currentExerciseIndex
                    const isUpcoming = index > currentExerciseIndex

                    return (
                      <li
                        key={exercise.id || index}
                        className={`exercise-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''} ${isUpcoming ? 'upcoming' : ''}`}
                      >
                        <div className="exercise-status">
                          {isCompleted && <span className="check-mark">✓</span>}
                          {isCurrent && <span className="current-marker">▶</span>}
                        </div>
                        <div className="exercise-info">
                          <span className="exercise-name">{exercise.name}</span>
                          {(exercise.sets || exercise.reps) && (
                            <span className="exercise-details">
                              {exercise.sets && `${exercise.sets} sets`}
                              {exercise.sets && exercise.reps && ' × '}
                              {exercise.reps && `${exercise.reps} reps`}
                              {exercise.weight && ` @ ${exercise.weight}`}
                            </span>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Timer Display */}
          <div className={`timer-display phase-${phase === 'exercise' && config.finisherDuration > 0 && remainingSeconds <= config.finisherDuration ? 'finisher' : phase} ${isPaused ? 'paused' : ''}`}>
            <div className="phase-indicator">{getPhaseDisplay()}</div>

            <div className="countdown">
              {formatTime(remainingSeconds)}
            </div>

            <div className="round-counter">
              {isCircuit && numGroups > 0
                ? `Rep ${currentRound} of ${config.rounds} • Round ${currentGroupIndex + 1} of ${numGroups}`
                : `Round ${currentRound} of ${config.rounds}`
              }
            </div>

            {isPaused && (
              <div className="paused-indicator">PAUSED</div>
            )}

            <div className="timer-controls">
              <button
                onClick={handlePauseResume}
                className="button-secondary"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                className="button-danger"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Display */}
      {phase === 'complete' && (
        <div className="timer-complete">
          <div className="complete-icon">🎉</div>
          <div className="complete-message">Workout Complete!</div>

          <div className="complete-actions">
            <button
              onClick={handleRestart}
              className="button-primary"
            >
              Restart
            </button>
            <button
              onClick={handleStop}
              className="button-secondary"
            >
              New Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CircuitTimer
