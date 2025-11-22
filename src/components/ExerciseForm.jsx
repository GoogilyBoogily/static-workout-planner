import { useState, useMemo, useRef, useEffect } from 'react'
import { validateExercise, hasErrors } from '../utils/validation'
import './ExerciseForm.css'

/**
 * Form for adding or editing an exercise within a workout plan
 *
 * Uses autocomplete to select exercises from the loaded CSV library.
 * When an exercise is selected, the muscle group tag is auto-filled.
 *
 * @param {Object} props
 * @param {Object|null} props.exercise - Exercise to edit (null for new exercise)
 * @param {Array} props.exerciseLibrary - Array of exercises from loaded CSV data
 * @param {Function} props.onSave - Callback when exercise is saved: (exercise) => void
 * @param {Function} props.onCancel - Callback when form is cancelled
 */
function ExerciseForm({ exercise, exerciseLibrary = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    tag: exercise?.tag || '',
    sets: exercise?.sets || '',
    reps: exercise?.reps || '',
    weight: exercise?.weight || '',
    rest: exercise?.rest || ''
  })

  const [errors, setErrors] = useState({})

  // Autocomplete state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Filter exercises based on input
  const filteredExercises = useMemo(() => {
    if (!formData.name.trim()) {
      return exerciseLibrary.slice(0, 10) // Show first 10 when empty
    }

    const searchLower = formData.name.toLowerCase()
    return exerciseLibrary
      .filter(ex => ex.name.toLowerCase().includes(searchLower))
      .slice(0, 10) // Limit to 10 suggestions
  }, [formData.name, exerciseLibrary])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }))
    setSelectedExercise(null) // Clear selection when typing
    setShowSuggestions(true)
    setHighlightedIndex(-1)

    // Clear error for this field when user types
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.name
        return newErrors
      })
    }
  }

  const handleSelectExercise = (libraryExercise) => {
    setFormData(prev => ({
      ...prev,
      name: libraryExercise.name,
      tag: libraryExercise.tags[0] || '' // Auto-fill primary muscle group
    }))
    setSelectedExercise(libraryExercise)
    setShowSuggestions(false)
    setHighlightedIndex(-1)

    // Clear name error since we selected a valid exercise
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.name
        return newErrors
      })
    }
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredExercises.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredExercises.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredExercises.length) {
          handleSelectExercise(filteredExercises[highlightedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        break
    }
  }

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

  const handleSubmit = () => {
    // Validate that an exercise from the library is selected
    const matchingExercise = exerciseLibrary.find(
      ex => ex.name.toLowerCase() === formData.name.trim().toLowerCase()
    )

    if (!matchingExercise) {
      setErrors(prev => ({
        ...prev,
        name: 'Please select an exercise from the library'
      }))
      return
    }

    const validationErrors = validateExercise({
      ...formData,
      tag: matchingExercise.tags[0] || '' // Use the library exercise's tag
    })

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    // Generate UUID for new exercise, keep existing ID for edits
    const exerciseData = {
      id: exercise?.id || crypto.randomUUID(),
      name: matchingExercise.name, // Use exact name from library
      tag: matchingExercise.tags[0] || '', // Primary muscle group from library
      tags: matchingExercise.tags, // Include all tags for compatibility
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
    <div className="exercise-form">
      <h3>{exercise ? 'Edit Exercise' : 'Add Exercise'}</h3>

      <div className="form-field">
        <label htmlFor="exercise-name">
          Exercise Name <span className="required">*</span>
        </label>
        <div className="autocomplete-container">
          <input
            ref={inputRef}
            id="exercise-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing to search exercises..."
            autoComplete="off"
            className={errors.name ? 'error' : ''}
          />
          {showSuggestions && filteredExercises.length > 0 && (
            <ul ref={suggestionsRef} className="autocomplete-suggestions">
              {filteredExercises.map((ex, index) => (
                <li
                  key={ex.name}
                  className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSelectExercise(ex)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="autocomplete-name">{ex.name}</span>
                  <span className="autocomplete-tag">{ex.tags[0]}</span>
                </li>
              ))}
            </ul>
          )}
          {showSuggestions && filteredExercises.length === 0 && formData.name.trim() && (
            <div className="autocomplete-no-results">
              No exercises found matching "{formData.name}"
            </div>
          )}
        </div>
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      {/* Display selected muscle group (read-only, auto-filled) */}
      {formData.tag && (
        <div className="form-field">
          <label>Muscle Group</label>
          <div className="selected-tag">
            {formData.tag}
          </div>
        </div>
      )}

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
        <button type="button" onClick={handleSubmit} className="button-primary">
          {exercise ? 'Save Changes' : 'Add Exercise'}
        </button>
      </div>
    </div>
  )
}

export default ExerciseForm
