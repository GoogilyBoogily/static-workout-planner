import { useState } from 'react'
import { validateExercise, hasErrors } from '../utils/validation'
import './ExerciseForm.css'

/**
 * Form for adding or editing an exercise within a workout plan
 * @param {Object} props
 * @param {Object|null} props.exercise - Exercise to edit (null for new exercise)
 * @param {Function} props.onSave - Callback when exercise is saved: (exercise) => void
 * @param {Function} props.onCancel - Callback when form is cancelled
 */
function ExerciseForm({ exercise, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    sets: exercise?.sets || '',
    reps: exercise?.reps || '',
    weight: exercise?.weight || '',
    rest: exercise?.rest || ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationErrors = validateExercise(formData)

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    // Generate UUID for new exercise, keep existing ID for edits
    const exerciseData = {
      id: exercise?.id || crypto.randomUUID(),
      name: formData.name.trim(),
      sets: parseInt(formData.sets, 10),
      reps: formData.reps.trim(),
      weight: formData.weight.trim() || undefined,
      rest: formData.rest.trim() || undefined
    }

    // Remove undefined fields to keep data clean
    Object.keys(exerciseData).forEach(key =>
      exerciseData[key] === undefined && delete exerciseData[key]
    )

    onSave(exerciseData)
  }

  return (
    <form className="exercise-form" onSubmit={handleSubmit}>
      <h3>{exercise ? 'Edit Exercise' : 'Add Exercise'}</h3>

      <div className="form-field">
        <label htmlFor="exercise-name">
          Exercise Name <span className="required">*</span>
        </label>
        <input
          id="exercise-name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Bench Press"
          maxLength={100}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="exercise-sets">
            Sets <span className="required">*</span>
          </label>
          <input
            id="exercise-sets"
            type="number"
            min="1"
            max="20"
            value={formData.sets}
            onChange={(e) => handleChange('sets', e.target.value)}
            placeholder="e.g., 4"
            className={errors.sets ? 'error' : ''}
          />
          {errors.sets && <span className="error-text">{errors.sets}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="exercise-reps">
            Reps <span className="required">*</span>
          </label>
          <input
            id="exercise-reps"
            type="text"
            value={formData.reps}
            onChange={(e) => handleChange('reps', e.target.value)}
            placeholder="e.g., 8-10, 12, AMRAP"
            className={errors.reps ? 'error' : ''}
          />
          {errors.reps && <span className="error-text">{errors.reps}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="exercise-weight">Weight (optional)</label>
          <input
            id="exercise-weight"
            type="text"
            value={formData.weight}
            onChange={(e) => handleChange('weight', e.target.value)}
            placeholder="e.g., 185 lbs, 80 kg"
          />
        </div>

        <div className="form-field">
          <label htmlFor="exercise-rest">Rest (optional)</label>
          <input
            id="exercise-rest"
            type="text"
            value={formData.rest}
            onChange={(e) => handleChange('rest', e.target.value)}
            placeholder="e.g., 90 sec, 2 min"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="button-secondary">
          Cancel
        </button>
        <button type="submit" className="button-primary">
          {exercise ? 'Save Changes' : 'Add Exercise'}
        </button>
      </div>
    </form>
  )
}

export default ExerciseForm
