import { useState, useMemo, useEffect } from 'react'
import { validatePlanName } from '../utils/validation'
import { selectRandomExercises, regenerateWorkout } from '../utils/randomGenerator'
import ExerciseForm from './ExerciseForm'
import './PlanForm.css'

// FIXED L1: Extract magic numbers as constants
const REROLL_HISTORY_SIZE = 3 // Remember last 3 rerolled exercises per position

/**
 * Form for creating or editing a workout plan
 * @param {Object} props
 * @param {Object|null} props.plan - Plan to edit (null for new plan)
 * @param {Function} props.onSave - Callback when plan is saved: (planData) => void
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {Object} props.exercisePool - Exercise pool for reroll functionality (Feature 005)
 * @param {boolean} props.isGenerated - Whether this plan was randomly generated (Feature 005)
 */
function PlanForm({ plan, onSave, onCancel, exercisePool = {}, isGenerated = false }) {
  const [planName, setPlanName] = useState(plan?.name || '')
  const [exercises, setExercises] = useState(plan?.exercises || [])
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)
  const [nameError, setNameError] = useState(null)

  // T027: Reroll history state (Feature 005)
  // Track recently shown exercises per exercise position to avoid immediate repeats
  const [rerollHistory, setRerollHistory] = useState({})

  // T037: Pin status state (Feature 005)
  // Track which exercises are pinned (locked during regeneration)
  const [pinStatus, setPinStatus] = useState(plan?.pinStatus || {})

  // FIXED C2: Extract available tags from exercise pool for ExerciseForm
  const availableTags = useMemo(() => {
    return Object.keys(exercisePool).sort()
  }, [exercisePool])

  // FIXED L6: Keyboard shortcuts for power users
  useEffect(() => {
    if (!isGenerated) return // Only for generated plans

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return
      }

      // 'r' or 'R' - Reroll first available exercise
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        const firstRerollableIndex = exercises.findIndex((ex, idx) => {
          const matchingTags = ex.tags || [ex.tag].filter(Boolean)
          const primaryTag = matchingTags[0]
          const pool = exercisePool[primaryTag] || []
          const history = rerollHistory[idx] || []
          return pool.length > history.length + 1
        })
        if (firstRerollableIndex !== -1) {
          handleReroll(firstRerollableIndex)
        }
      }

      // 'p' or 'P' - Toggle pin on first exercise
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        if (exercises.length > 0) {
          handlePinToggle(exercises[0].id)
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

  const handlePlanNameChange = (value) => {
    setPlanName(value)
    if (nameError) {
      setNameError(null)
    }
  }

  const handleAddExerciseClick = () => {
    setIsAddingExercise(true)
    setEditingExercise(null)
  }

  const handleSaveExercise = (exerciseData) => {
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

  const handleRemoveExercise = (index) => {
    setExercises(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleEditExercise = (index) => {
    setEditingExercise(index)
    setIsAddingExercise(true)
  }

  // T047-T048: Exercise reordering functions
  const handleMoveExerciseUp = (index) => {
    if (index === 0) return

    const newExercises = [...exercises]
    const temp = newExercises[index - 1]
    newExercises[index - 1] = newExercises[index]
    newExercises[index] = temp
    setExercises(newExercises)
  }

  const handleMoveExerciseDown = (index) => {
    if (index === exercises.length - 1) return

    const newExercises = [...exercises]
    const temp = newExercises[index + 1]
    newExercises[index + 1] = newExercises[index]
    newExercises[index] = temp
    setExercises(newExercises)
  }

  /**
   * Toggle pin status for an exercise (Feature 005)
   *
   * FIXED Q2: Added JSDoc documentation
   *
   * Pinned exercises are locked and won't be replaced during regeneration.
   * Unpinned exercises will be randomly replaced when regenerate is called.
   *
   * @param {string} exerciseId - UUID of the exercise to pin/unpin
   */
  const handlePinToggle = (exerciseId) => {
    setPinStatus(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }))
  }

  /**
   * Regenerate workout while preserving pinned exercises (Feature 005)
   *
   * FIXED Q2: Added JSDoc documentation
   *
   * Prompts user for confirmation, then replaces all unpinned exercises
   * with new random selections while keeping pinned exercises in place.
   * Cleans up orphaned pin status entries to prevent memory leaks.
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
    const quotas = {}
    exercises.forEach(exercise => {
      const matchingTags = exercise.tags || [exercise.tag].filter(Boolean)
      const primaryTag = matchingTags[0]
      if (primaryTag) {
        quotas[primaryTag] = (quotas[primaryTag] || 0) + 1
      }
    })

    // Convert to array format expected by regenerateWorkout
    const quotaArray = Object.entries(quotas).map(([tag, count]) => ({ tag, count }))

    // Create temporary plan object with current state
    const tempPlan = {
      ...plan,
      exercises,
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
    const cleanedPinStatus = Object.fromEntries(
      Object.entries(regeneratedPlan.pinStatus || pinStatus).filter(([id]) =>
        newExerciseIds.has(id)
      )
    )
    setPinStatus(cleanedPinStatus)
  }

  /**
   * Reroll a single exercise with a new random selection (Feature 005)
   *
   * FIXED Q2: Added JSDoc documentation
   *
   * Replaces the exercise at the given index with a new random exercise
   * from the same muscle group. Maintains reroll history to avoid
   * immediately showing the last 3 rejected exercises.
   *
   * @param {number} index - Index of exercise to reroll in exercises array
   */
  const handleReroll = (index) => {
    const currentExercise = exercises[index]

    // Find exercises with the same tag from the pool
    const matchingTags = currentExercise.tags || [currentExercise.tag].filter(Boolean)
    if (matchingTags.length === 0) {
      alert('Cannot reroll: exercise has no tags')
      return
    }

    // Use first tag for pool lookup (exercises can have multiple tags)
    const primaryTag = matchingTags[0]
    const pool = exercisePool[primaryTag] || []

    if (pool.length === 0) {
      alert(`No exercises available for tag "${primaryTag}"`)
      return
    }

    // Get history for this exercise position
    const history = rerollHistory[index] || []

    // Exclude current exercise and recently shown ones
    const excludeNames = [currentExercise.name, ...history]
    const availablePool = pool.filter(ex => !excludeNames.includes(ex.name))

    if (availablePool.length === 0) {
      alert(`No other "${primaryTag}" exercises available. All options have been shown.`)
      return
    }

    // Select a random replacement
    const [replacement] = selectRandomExercises(availablePool, 1)

    // Inherit sets, reps, weight, rest from current exercise
    const newExercise = {
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

  const handleSubmit = (e) => {
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
          onChange={(e) => handlePlanNameChange(e.target.value)}
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

        {exercises.length > 0 && !isAddingExercise && (
          <div className="exercises-list">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="exercise-item">
                <div className="exercise-reorder">
                  <button
                    type="button"
                    onClick={() => handleMoveExerciseUp(index)}
                    disabled={index === 0}
                    className="button-icon button-reorder"
                    aria-label={`Move ${exercise.name} up`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveExerciseDown(index)}
                    disabled={index === exercises.length - 1}
                    className="button-icon button-reorder"
                    aria-label={`Move ${exercise.name} down`}
                  >
                    ↓
                  </button>
                </div>
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
                  {/* FIXED M1: Enhanced accessibility with role="switch" and descriptive labels */}
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
                    const matchingTags = exercise.tags || [exercise.tag].filter(Boolean)
                    const primaryTag = matchingTags[0]
                    const pool = exercisePool[primaryTag] || []
                    const history = rerollHistory[index] || []
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

        {isAddingExercise && (
          <ExerciseForm
            exercise={editingExercise !== null ? exercises[editingExercise] : null}
            availableTags={availableTags}
            onSave={handleSaveExercise}
            onCancel={handleCancelExercise}
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
