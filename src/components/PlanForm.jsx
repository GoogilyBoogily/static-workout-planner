import { useState } from 'react'
import { validatePlanName } from '../utils/validation'
import ExerciseForm from './ExerciseForm'
import './PlanForm.css'

/**
 * Form for creating or editing a workout plan
 * @param {Object} props
 * @param {Object|null} props.plan - Plan to edit (null for new plan)
 * @param {Function} props.onSave - Callback when plan is saved: (planData) => void
 * @param {Function} props.onCancel - Callback when form is cancelled
 */
function PlanForm({ plan, onSave, onCancel }) {
  const [planName, setPlanName] = useState(plan?.name || '')
  const [exercises, setExercises] = useState(plan?.exercises || [])
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)
  const [nameError, setNameError] = useState(null)

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

  const handleSubmit = (e) => {
    e.preventDefault()

    const error = validatePlanName(planName)
    if (error) {
      setNameError(error)
      return
    }

    const planData = {
      name: planName.trim(),
      exercises: exercises
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
            onSave={handleSaveExercise}
            onCancel={handleCancelExercise}
          />
        )}

        {exercises.length === 0 && !isAddingExercise && (
          <div className="empty-exercises">
            No exercises added yet. Click "Add Exercise" to get started.
          </div>
        )}
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
