import { useState, useMemo, useEffect } from 'react'
import type { FormEvent, DragEvent, ChangeEvent } from 'react'
import { validatePlanName } from '../utils/validation'
import { selectRandomExercises, regenerateWorkout } from '../utils/randomGenerator'
import ExerciseForm from './ExerciseForm'
import './PlanForm.css'

import type {
  PlanExercise,
  PinStatus,
  RerollHistory,
  DragPosition,
  TagQuota,
  WorkoutPlan
} from '../types'
import type { PlanFormProps } from '../types/components'

// FIXED L1: Extract magic numbers as constants
const REROLL_HISTORY_SIZE = 3 // Remember last 3 rerolled exercises per position

interface IndexedExercise extends PlanExercise {
  originalIndex: number
}

/**
 * Form for creating or editing a workout plan
 */
function PlanForm({
  plan,
  onSave,
  onCancel,
  exercisePool = {},
  exerciseLibrary = [],
  isGenerated = false
}: PlanFormProps) {
  const [planName, setPlanName] = useState(plan?.name ?? '')
  const [exercises, setExercises] = useState<PlanExercise[]>(() => {
    // Initialize exercises with roundGroup if not present
    const planExercises = plan?.exercises ?? []
    return planExercises.map(ex => ({
      ...ex,
      roundGroup: ex.roundGroup ?? 0
    }))
  })
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [editingExercise, setEditingExercise] = useState<number | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)

  // Circuit mode state
  const [isCircuit, setIsCircuit] = useState(plan?.isCircuit ?? false)
  const [addingToRound, setAddingToRound] = useState<number | null>(null) // Which round group to add to

  // T027: Reroll history state (Feature 005)
  // Track recently shown exercises per exercise position to avoid immediate repeats
  const [rerollHistory, setRerollHistory] = useState<RerollHistory>({})

  // T037: Pin status state (Feature 005)
  // Track which exercises are pinned (locked during regeneration)
  const [pinStatus, setPinStatus] = useState<PinStatus>(plan?.pinStatus ?? {})

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<DragPosition | null>(null)
  const [dragOverRound, setDragOverRound] = useState<number | null>(null) // For empty round highlighting

  // Round count state (for empty rounds support)
  const [roundCount, setRoundCount] = useState(() => {
    // Initialize from existing exercises or default to 1
    if (plan?.exercises && plan.exercises.length > 0) {
      const maxGroup = Math.max(...plan.exercises.map(ex => ex.roundGroup ?? 0))
      return maxGroup + 1
    }
    return 1
  })

  // Extract available tags from exercise pool for reroll functionality
  const availableTags = useMemo(() => {
    return Object.keys(exercisePool).sort()
  }, [exercisePool])

  // Group exercises by roundGroup for circuit mode display
  const exercisesByRound = useMemo((): [number, IndexedExercise[]][] | null => {
    if (!isCircuit) return null
    const groups: Record<number, IndexedExercise[]> = {}
    exercises.forEach((exercise, originalIndex) => {
      const group = exercise.roundGroup ?? 0
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push({ ...exercise, originalIndex })
    })
    // Return sorted array of [groupNumber, exercises[]] pairs
    return Object.entries(groups)
      .map(([group, exs]): [number, IndexedExercise[]] => [parseInt(group, 10), exs])
      .sort((a, b) => a[0] - b[0])
  }, [exercises, isCircuit])


  // FIXED L6: Keyboard shortcuts for power users
  useEffect(() => {
    if (!isGenerated) return // Only for generated plans

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      // 'r' or 'R' - Reroll first available exercise
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        const firstRerollableIndex = exercises.findIndex((ex, idx) => {
          const matchingTags = ex.tags ?? (ex.tag ? [ex.tag] : [])
          const primaryTag = matchingTags[0]
          if (!primaryTag) return false
          const pool = exercisePool[primaryTag] ?? []
          const history = rerollHistory[idx] ?? []
          return pool.length > history.length + 1
        })
        if (firstRerollableIndex !== -1) {
          handleReroll(firstRerollableIndex)
        }
      }

      // 'p' or 'P' - Toggle pin on first exercise
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        const firstExercise = exercises[0]
        if (firstExercise) {
          handlePinToggle(firstExercise.id)
        }
      }

      // 'g' or 'G' - Regenerate workout
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault()
        const pinnedCount = exercises.filter(ex => pinStatus[ex.id]).length
        const allPinned = pinnedCount === exercises.length
        if (!allPinned) {
          handleRegenerate()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isGenerated, exercises, exercisePool, rerollHistory, pinStatus])

  const handlePlanNameChange = (value: string) => {
    setPlanName(value)
    if (nameError) {
      setNameError(null)
    }
  }

  const handleAddExerciseClick = () => {
    setIsAddingExercise(true)
    setEditingExercise(null)
  }

  const handleSaveExercise = (exerciseData: PlanExercise) => {
    if (editingExercise !== null) {
      // Editing existing exercise
      setExercises(prev =>
        prev.map((ex, idx) => idx === editingExercise ? exerciseData : ex)
      )
      setEditingExercise(null)
    } else {
      // Adding new exercise
      setExercises(prev => [...prev, exerciseData])
    }
    setIsAddingExercise(false)
  }

  const handleCancelExercise = () => {
    setIsAddingExercise(false)
    setEditingExercise(null)
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleEditExercise = (index: number) => {
    setEditingExercise(index)
    setIsAddingExercise(true)
  }

  // Circuit mode handlers
  const handleAddRound = () => {
    // Simply increment round count - no need to force adding exercise
    setRoundCount(prev => prev + 1)
  }

  const handleRemoveRound = (roundGroup: number) => {
    // Remove all exercises in this round group and renumber remaining groups
    setExercises(prev => {
      const filtered = prev.filter(ex => ex.roundGroup !== roundGroup)
      // Renumber groups to fill the gap
      return filtered.map(ex => ({
        ...ex,
        roundGroup: (ex.roundGroup ?? 0) > roundGroup ? (ex.roundGroup ?? 0) - 1 : ex.roundGroup
      }))
    })
    // Decrement round count
    setRoundCount(prev => Math.max(1, prev - 1))
  }

  const handleAddExerciseToRound = (roundGroup: number) => {
    setAddingToRound(roundGroup)
    setIsAddingExercise(true)
    setEditingExercise(null)
  }

  const handleMoveExerciseToRound = (exerciseIndex: number, newRoundGroup: number) => {
    setExercises(prev => prev.map((ex, idx) =>
      idx === exerciseIndex ? { ...ex, roundGroup: newRoundGroup } : ex
    ))
  }

  // Override handleSaveExercise to include roundGroup for circuit mode
  const handleSaveExerciseWithRound = (exerciseData: PlanExercise) => {
    if (editingExercise !== null) {
      // Editing existing exercise - preserve its roundGroup
      setExercises(prev =>
        prev.map((ex, idx) => idx === editingExercise ? { ...exerciseData, roundGroup: ex.roundGroup } : ex)
      )
      setEditingExercise(null)
    } else {
      // Adding new exercise
      const roundGroup = isCircuit && addingToRound !== null ? addingToRound : 0
      setExercises(prev => [...prev, { ...exerciseData, roundGroup }])
    }
    setIsAddingExercise(false)
    setAddingToRound(null)
  }

  // T047-T048: Exercise reordering functions
  const handleMoveExerciseUp = (index: number) => {
    if (index === 0) return

    const newExercises = [...exercises]
    const temp = newExercises[index - 1]
    const current = newExercises[index]
    if (temp && current) {
      newExercises[index - 1] = current
      newExercises[index] = temp
    }
    setExercises(newExercises)
  }

  const handleMoveExerciseDown = (index: number) => {
    if (index === exercises.length - 1) return

    const newExercises = [...exercises]
    const temp = newExercises[index + 1]
    const current = newExercises[index]
    if (temp && current) {
      newExercises[index + 1] = current
      newExercises[index] = temp
    }
    setExercises(newExercises)
  }

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging')
    }, 0)
  }

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).classList.remove('dragging')
    setDraggedIndex(null)
    setDragOverIndex(null)
    setDragOverPosition(null)
    setDragOverRound(null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && index !== draggedIndex) {
      // Calculate if mouse is in top or bottom half of element
      const rect = e.currentTarget.getBoundingClientRect()
      const midpoint = rect.top + rect.height / 2
      const position: DragPosition = e.clientY < midpoint ? 'before' : 'after'

      setDragOverIndex(index)
      setDragOverPosition(position)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
    setDragOverPosition(null)
    setDragOverRound(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null) {
      setDragOverIndex(null)
      setDragOverPosition(null)
      return
    }

    // Get target exercise's roundGroup before any modifications
    const targetRoundGroup = exercises[dropIndex]?.roundGroup

    const newExercises = [...exercises]
    const [draggedItem] = newExercises.splice(draggedIndex, 1)

    if (!draggedItem) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      setDragOverPosition(null)
      return
    }

    // Update roundGroup to match target's round (for circuit mode cross-round drag)
    if (targetRoundGroup !== undefined) {
      draggedItem.roundGroup = targetRoundGroup
    }

    // Calculate actual insert position based on before/after
    let insertIndex = dropIndex
    if (draggedIndex < dropIndex) {
      // Dragging from above: adjust for the splice
      insertIndex = dragOverPosition === 'after' ? dropIndex : dropIndex - 1
    } else {
      // Dragging from below: insert at position or after
      insertIndex = dragOverPosition === 'after' ? dropIndex + 1 : dropIndex
    }

    // Clamp to valid range
    insertIndex = Math.max(0, Math.min(insertIndex, newExercises.length))

    newExercises.splice(insertIndex, 0, draggedItem)
    setExercises(newExercises)

    setDraggedIndex(null)
    setDragOverIndex(null)
    setDragOverPosition(null)
  }

  // Empty round drag handlers
  const handleEmptyRoundDragOver = (e: DragEvent<HTMLDivElement>, roundIndex: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverRound(roundIndex)
  }

  const handleEmptyRoundDrop = (e: DragEvent<HTMLDivElement>, roundGroup: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const newExercises = [...exercises]
    const [draggedItem] = newExercises.splice(draggedIndex, 1)
    if (draggedItem) {
      draggedItem.roundGroup = roundGroup
      newExercises.push(draggedItem)
    }
    setExercises(newExercises)

    setDraggedIndex(null)
    setDragOverIndex(null)
    setDragOverPosition(null)
    setDragOverRound(null)
  }

  /**
   * Toggle pin status for an exercise (Feature 005)
   */
  const handlePinToggle = (exerciseId: string) => {
    setPinStatus(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }))
  }

  /**
   * Regenerate workout while preserving pinned exercises (Feature 005)
   */
  const handleRegenerate = () => {
    // T046: Confirmation dialog
    const confirmed = window.confirm(
      'Regenerate workout?\n\nUnpinned exercises will be replaced with new random selections. Pinned exercises will remain unchanged.'
    )

    if (!confirmed) {
      return
    }

    // Build quotas from current exercises
    const quotas: Record<string, number> = {}
    exercises.forEach(exercise => {
      const matchingTags = exercise.tags ?? (exercise.tag ? [exercise.tag] : [])
      const primaryTag = matchingTags[0]
      if (primaryTag) {
        quotas[primaryTag] = (quotas[primaryTag] ?? 0) + 1
      }
    })

    // Convert to array format expected by regenerateWorkout
    const quotaArray: TagQuota[] = Object.entries(quotas).map(([tag, count]) => ({ tag, count }))

    // Create temporary plan object with current state
    const tempPlan: WorkoutPlan = {
      id: plan?.id ?? crypto.randomUUID(),
      name: planName,
      exercises,
      isCircuit,
      createdAt: plan?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      sortOrder: plan?.sortOrder ?? 0,
      pinStatus
    }

    // Regenerate with pinned exercises preserved
    const regeneratedPlan = regenerateWorkout(tempPlan, quotaArray, exercisePool)

    // Update exercises and clear reroll history (new exercises)
    setExercises(regeneratedPlan.exercises)
    setRerollHistory({})

    // FIXED H2: Clean up orphaned pin status entries (memory leak fix)
    // Only keep pin status for exercises that still exist after regeneration
    const newExerciseIds = new Set(regeneratedPlan.exercises.map(ex => ex.id))
    const cleanedPinStatus: PinStatus = Object.fromEntries(
      Object.entries(regeneratedPlan.pinStatus ?? pinStatus).filter(([id]) =>
        newExerciseIds.has(id)
      )
    )
    setPinStatus(cleanedPinStatus)
  }

  /**
   * Reroll a single exercise with a new random selection (Feature 005)
   */
  const handleReroll = (index: number) => {
    const currentExercise = exercises[index]

    if (!currentExercise) {
      return
    }

    // Find exercises with the same tag from the pool
    const matchingTags = currentExercise.tags ?? (currentExercise.tag ? [currentExercise.tag] : [])
    if (matchingTags.length === 0) {
      alert('Cannot reroll: exercise has no tags')
      return
    }

    // Use first tag for pool lookup (exercises can have multiple tags)
    const primaryTag = matchingTags[0]
    if (!primaryTag) {
      alert('Cannot reroll: exercise has no primary tag')
      return
    }
    const pool = exercisePool[primaryTag] ?? []

    if (pool.length === 0) {
      alert(`No exercises available for tag "${primaryTag}"`)
      return
    }

    // Get history for this exercise position
    const history = rerollHistory[index] ?? []

    // Exclude current exercise and recently shown ones
    const excludeNames = [currentExercise.name, ...history]
    const availablePool = pool.filter(ex => !excludeNames.includes(ex.name))

    if (availablePool.length === 0) {
      alert(`No other "${primaryTag}" exercises available. All options have been shown.`)
      return
    }

    // Select a random replacement
    const [replacement] = selectRandomExercises(availablePool, 1)

    if (!replacement) {
      return
    }

    // Inherit sets, reps, weight, rest from current exercise
    const newExercise: PlanExercise = {
      ...replacement,
      sets: currentExercise.sets,
      reps: currentExercise.reps,
      weight: currentExercise.weight,
      rest: currentExercise.rest
    }

    // Update exercises array
    const updatedExercises = [...exercises]
    updatedExercises[index] = newExercise
    setExercises(updatedExercises)

    // FIXED L1: Update reroll history using constant
    const updatedHistory = [currentExercise.name, ...history].slice(0, REROLL_HISTORY_SIZE)
    setRerollHistory(prev => ({
      ...prev,
      [index]: updatedHistory
    }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const error = validatePlanName(planName)
    if (error) {
      setNameError(error)
      return
    }

    // FIXED H4: Clear reroll history on save
    // This ensures fresh state when plan is reopened for editing
    // Prevents immediately seeing rejected exercises after reload
    setRerollHistory({})

    // T048: Include pinStatus in plan data (Feature 005)
    const planData = {
      name: planName.trim(),
      exercises: exercises,
      isCircuit: isCircuit,
      // Include pin status if this is a generated plan
      ...(isGenerated && { pinStatus })
    }

    onSave(planData)
  }

  const characterCount = planName.length
  const characterLimit = 100

  return (
    <form className="plan-form" onSubmit={handleSubmit}>
      <h2>{plan ? 'Edit Workout Plan' : 'Create Workout Plan'}</h2>

      <div className="form-field">
        <label htmlFor="plan-name">
          Plan Name <span className="required">*</span>
        </label>
        <input
          id="plan-name"
          type="text"
          value={planName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handlePlanNameChange(e.target.value)}
          placeholder="e.g., Monday Chest Day"
          maxLength={characterLimit}
          className={nameError ? 'error' : ''}
        />
        <div className="field-info">
          <span className="character-count">
            {characterCount}/{characterLimit}
          </span>
        </div>
        {nameError && <span className="error-text">{nameError}</span>}
      </div>

      {/* Circuit Mode Toggle */}
      <div className="form-field circuit-toggle-field">
        <label className="circuit-toggle-label">
          <input
            type="checkbox"
            checked={isCircuit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setIsCircuit(e.target.checked)}
            className="circuit-checkbox"
          />
          <span className="circuit-toggle-text">Circuit Workout</span>
        </label>
        {isCircuit && (
          <span className="circuit-hint">
            Group exercises into rounds. All exercises in a round are done back-to-back.
          </span>
        )}
      </div>

      <div className="exercises-section">
        <div className="exercises-header">
          <h3>Exercises ({exercises.length})</h3>
          <div className="exercises-header-actions">
            {/* FIXED L5: Add regenerate button to header for better discoverability */}
            {isGenerated && exercises.length > 0 && !isAddingExercise && (() => {
              const pinnedCount = exercises.filter(ex => pinStatus[ex.id]).length
              const allPinned = pinnedCount === exercises.length

              return (
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="button-secondary button-regenerate-compact"
                  disabled={allPinned}
                  title={allPinned ? 'All exercises are pinned. Unpin some to regenerate.' : 'Replace unpinned exercises with new random selections'}
                >
                  🔄 Regenerate
                </button>
              )
            })()}
            {!isAddingExercise && (
              <button
                type="button"
                onClick={handleAddExerciseClick}
                className="button-primary"
              >
                + Add Exercise
              </button>
            )}
          </div>
        </div>

        {/* Flat exercise list (non-circuit mode) */}
        {exercises.length > 0 && !isAddingExercise && !isCircuit && (
          <div className="exercises-list">
            {exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`exercise-item ${draggedIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="exercise-info">
                  <div className="exercise-name">{exercise.name}</div>
                  <div className="exercise-details">
                    {exercise.sets} sets × {exercise.reps} reps
                    {exercise.weight && ` @ ${exercise.weight}`}
                    {exercise.rest && ` • Rest: ${exercise.rest}`}
                  </div>
                </div>
                <div className="exercise-actions">
                  {/* T039: Pin toggle button (Feature 005) - only show for generated plans */}
                  {isGenerated && (
                    <button
                      type="button"
                      onClick={() => handlePinToggle(exercise.id)}
                      className={`button-icon button-pin ${pinStatus[exercise.id] ? 'pinned' : ''}`}
                      role="switch"
                      aria-checked={pinStatus[exercise.id] ? 'true' : 'false'}
                      aria-label={
                        pinStatus[exercise.id]
                          ? `Unpin ${exercise.name} (currently locked, will stay during regeneration)`
                          : `Pin ${exercise.name} (will lock and stay during regeneration)`
                      }
                      title={pinStatus[exercise.id] ? 'Unpin exercise (allow regeneration)' : 'Pin exercise (lock during regeneration)'}
                    >
                      {pinStatus[exercise.id] ? '📌' : '📍'}
                    </button>
                  )}
                  {/* T031: Reroll button (Feature 005) - only show for generated plans */}
                  {isGenerated && (() => {
                    // T032: Check if reroll is available for this exercise
                    const matchingTags = exercise.tags ?? (exercise.tag ? [exercise.tag] : [])
                    const primaryTag = matchingTags[0]
                    const pool = primaryTag ? (exercisePool[primaryTag] ?? []) : []
                    const history = rerollHistory[index] ?? []
                    const excludeNames = [exercise.name, ...history]
                    const availableCount = pool.filter(ex => !excludeNames.includes(ex.name)).length
                    const canReroll = availableCount > 0

                    return (
                      <button
                        type="button"
                        onClick={() => handleReroll(index)}
                        className="button-icon button-reroll"
                        disabled={!canReroll}
                        title={canReroll ? 'Reroll to a different exercise' : 'No other exercises available for this muscle group'}
                        aria-label={`Reroll ${exercise.name}`}
                      >
                        🔄
                      </button>
                    )
                  })()}
                  <button
                    type="button"
                    onClick={() => handleEditExercise(index)}
                    className="button-icon"
                    aria-label={`Edit ${exercise.name}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="button-icon button-danger"
                    aria-label={`Remove ${exercise.name}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped exercise list (circuit mode) */}
        {isCircuit && !isAddingExercise && (
          <div className="circuit-rounds">
            {Array.from({ length: roundCount }, (_, roundIndex) => {
              const roundExercises = exercisesByRound?.find(([g]) => g === roundIndex)?.[1] ?? []
              return (
                <div key={roundIndex} className="round-group">
                  <div className="round-group-header">
                    <h4>Round {roundIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveRound(roundIndex)}
                      className="button-icon button-danger"
                      title="Delete this round and all its exercises"
                      aria-label={`Delete Round ${roundIndex + 1}`}
                    >
                      🗑️
                    </button>
                  </div>
                  <div
                    className={`round-exercises ${roundExercises.length === 0 ? 'empty-round' : ''} ${dragOverRound === roundIndex ? 'drag-over-round' : ''}`}
                    onDragOver={roundExercises.length === 0 ? (e) => handleEmptyRoundDragOver(e, roundIndex) : undefined}
                    onDragLeave={roundExercises.length === 0 ? handleDragLeave : undefined}
                    onDrop={roundExercises.length === 0 ? (e) => handleEmptyRoundDrop(e, roundIndex) : undefined}
                  >
                    {roundExercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className={`exercise-item ${draggedIndex === exercise.originalIndex ? 'dragging' : ''} ${dragOverIndex === exercise.originalIndex ? `drag-over-${dragOverPosition}` : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, exercise.originalIndex)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, exercise.originalIndex)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, exercise.originalIndex)}
                      >
                        <div className="exercise-info">
                          <div className="exercise-name">{exercise.name}</div>
                          <div className="exercise-details">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </div>
                        </div>
                        <div className="exercise-actions">
                          {/* Round selector dropdown */}
                          <select
                            value={exercise.roundGroup}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMoveExerciseToRound(exercise.originalIndex, parseInt(e.target.value, 10))}
                            className="round-selector"
                            title="Move to different round"
                          >
                            {Array.from({ length: roundCount }, (_, i) => (
                              <option key={i} value={i}>Round {i + 1}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleEditExercise(exercise.originalIndex)}
                            className="button-icon"
                            aria-label={`Edit ${exercise.name}`}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(exercise.originalIndex)}
                            className="button-icon button-danger"
                            aria-label={`Remove ${exercise.name}`}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                    {roundExercises.length === 0 && (
                      <div className="empty-round-drop-zone">
                        Drag exercises here
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddExerciseToRound(roundIndex)}
                    className="button-secondary add-to-round-button"
                  >
                    + Add Exercise to Round {roundIndex + 1}
                  </button>
                </div>
              )
            })}

            <button
              type="button"
              onClick={handleAddRound}
              className="button-primary add-round-button"
            >
              + Add New Round
            </button>
          </div>
        )}

        {isAddingExercise && (
          <ExerciseForm
            exercise={editingExercise !== null ? (exercises[editingExercise] ?? null) : null}
            exerciseLibrary={exerciseLibrary}
            onSave={isCircuit ? handleSaveExerciseWithRound : handleSaveExercise}
            onCancel={() => {
              handleCancelExercise()
              setAddingToRound(null)
            }}
          />
        )}

        {exercises.length === 0 && !isAddingExercise && (
          <div className="empty-exercises">
            No exercises added yet. Click "Add Exercise" to get started.
          </div>
        )}

        {/* T044: Regenerate Workout button (Feature 005) - only for generated plans */}
        {isGenerated && exercises.length > 0 && !isAddingExercise && (() => {
          // T045: Check if all exercises are pinned
          const pinnedCount = exercises.filter(ex => pinStatus[ex.id]).length
          const allPinned = pinnedCount === exercises.length

          return (
            <div className="regenerate-section">
              <button
                type="button"
                onClick={handleRegenerate}
                className="button-regenerate"
                disabled={allPinned}
                title={allPinned ? 'All exercises are pinned. Unpin some to regenerate.' : 'Replace unpinned exercises with new random selections'}
              >
                🔄 Regenerate Workout
              </button>
              {pinnedCount > 0 && (
                <span className="regenerate-info">
                  {pinnedCount} of {exercises.length} exercise{pinnedCount !== 1 ? 's' : ''} pinned
                </span>
              )}
            </div>
          )
        })()}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button-secondary">
          Cancel
        </button>
        <button type="submit" className="button-primary">
          {plan ? 'Save Changes' : 'Save Plan'}
        </button>
      </div>
    </form>
  )
}

export default PlanForm
