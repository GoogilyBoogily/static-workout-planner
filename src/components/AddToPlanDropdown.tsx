import { useState, useRef, useEffect, useMemo } from 'react'
import './AddToPlanDropdown.css'

import type { ParsedExercise, PlanExercise, WorkoutPlan } from '../types'

interface AddToPlanDropdownProps {
  /** The exercise to add (from CSV library) */
  exercise: ParsedExercise
  /** Available workout plans */
  plans: WorkoutPlan[]
  /** Callback when exercise is added to a plan */
  onAddToPlan: (planId: string, exercise: PlanExercise) => void
  /** Callback when creating a new plan with this exercise */
  onCreateNewPlanWithExercise?: (planName: string, exercise: PlanExercise) => void
  /** Button variant: 'icon' for card, 'full' for modal */
  variant?: 'icon' | 'full'
}

/** Duration for success feedback animation (ms) */
const SUCCESS_FEEDBACK_DURATION = 2500

/**
 * AddToPlanDropdown Component
 *
 * Dropdown for quickly adding an exercise from the library to a workout plan.
 * Supports two variants:
 * - 'icon': Small "+" button for exercise cards (hover-reveal)
 * - 'full': "Add to Plan" text button for detail modal
 */
function AddToPlanDropdown({
  exercise,
  plans,
  onAddToPlan,
  onCreateNewPlanWithExercise,
  variant = 'icon'
}: AddToPlanDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [addedToPlanName, setAddedToPlanName] = useState('')
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [formData, setFormData] = useState({
    sets: '3',
    reps: '8-12',
    weight: '',
    rest: ''
  })

  const dropdownRef = useRef<HTMLDivElement>(null)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sort plans by updatedAt (most recent first) - memoized to avoid sorting on every render
  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => b.updatedAt - a.updatedAt),
    [plans]
  )

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        resetForm()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        resetForm()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Reset form when dropdown closes
  const resetForm = () => {
    setSelectedPlanId('')
    setIsCustomizing(false)
    setIsCreatingNew(false)
    setNewPlanName('')
    setAddedToPlanName('')
    setFormData({ sets: '3', reps: '8-12', weight: '', rest: '' })
  }

  // Convert ParsedExercise to PlanExercise
  const createPlanExercise = (sets: number, reps: string, weight?: string, rest?: string): PlanExercise => ({
    id: crypto.randomUUID(),
    name: exercise.name,
    tag: exercise.tags[0] ?? '',
    tags: exercise.tags,
    description: exercise.description,
    equipment: exercise.equipment,
    optionalEquipment: exercise.optionalEquipment,
    youtubeUrl: exercise.youtubeUrl,
    sets,
    reps,
    weight: weight || undefined,
    rest: rest || undefined
  })

  // Show success feedback and close dropdown after delay
  const showSuccessFeedback = () => {
    setShowSuccess(true)
    // Clear any existing timeout before setting a new one
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false)
      setIsOpen(false)
      resetForm()
      successTimeoutRef.current = null
    }, SUCCESS_FEEDBACK_DURATION)
  }

  // Shared handler for adding exercise to plan (DRY: extracted from handleQuickAdd and handleCustomAdd)
  const addExerciseToPlan = (planExercise: PlanExercise) => {
    if (isCreatingNew) {
      if (!newPlanName.trim() || !onCreateNewPlanWithExercise) return
      setAddedToPlanName(newPlanName.trim())
      onCreateNewPlanWithExercise(newPlanName.trim(), planExercise)
    } else {
      if (!selectedPlanId) return
      const plan = sortedPlans.find(p => p.id === selectedPlanId)
      setAddedToPlanName(plan?.name || 'plan')
      onAddToPlan(selectedPlanId, planExercise)
    }
    showSuccessFeedback()
  }

  // Handle quick add with defaults
  const handleQuickAdd = () => {
    const planExercise = createPlanExercise(3, '8-12')
    addExerciseToPlan(planExercise)
  }

  // Handle customized add
  const handleCustomAdd = () => {
    const sets = parseInt(formData.sets, 10) || 3
    const planExercise = createPlanExercise(
      sets,
      formData.reps || '8-12',
      formData.weight || undefined,
      formData.rest || undefined
    )
    addExerciseToPlan(planExercise)
  }

  // Handle toggle dropdown
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOpen) {
      setIsOpen(false)
      resetForm()
    } else {
      setIsOpen(true)
    }
  }

  // Handle plan selection change
  const handlePlanSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === '__new__') {
      setIsCreatingNew(true)
      setSelectedPlanId('')
    } else {
      setSelectedPlanId(value)
    }
  }

  // Handle canceling new plan creation
  const handleCancelNew = () => {
    setIsCreatingNew(false)
    setNewPlanName('')
  }

  // Check if add button should be disabled
  const isAddDisabled = isCreatingNew ? !newPlanName.trim() : !selectedPlanId

  // No plans available - show create new option if callback provided
  if (plans.length === 0 && !onCreateNewPlanWithExercise) {
    return (
      <div className="add-to-plan-dropdown" ref={dropdownRef}>
        <button
          className={`add-to-plan-trigger add-to-plan-trigger-${variant}`}
          onClick={handleToggle}
          aria-label="Add to plan"
          title="Add to plan"
        >
          {variant === 'icon' ? '+' : 'Add to Plan'}
        </button>

        {isOpen && (
          <div className="add-to-plan-panel">
            <p className="no-plans-message">
              No workout plans yet. Create one first.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="add-to-plan-dropdown" ref={dropdownRef}>
      <button
        className={`add-to-plan-trigger add-to-plan-trigger-${variant}`}
        onClick={handleToggle}
        aria-label="Add to plan"
        title="Add to plan"
        aria-expanded={isOpen}
      >
        {variant === 'icon' ? '+' : 'Add to Plan'}
      </button>

      {isOpen && (
        <div className="add-to-plan-panel">
          {showSuccess ? (
            <div className="add-success">
              <span className="success-icon">✓</span>
              <div className="success-text">
                <span className="success-title">Added!</span>
                <span className="success-subtitle">to "{addedToPlanName}"</span>
              </div>
            </div>
          ) : (
            <>
              {/* Plan selector or new plan name input */}
              {isCreatingNew ? (
                <div className="new-plan-input-container">
                  <label htmlFor="new-plan-name" className="plan-selector-label">
                    New Plan Name
                  </label>
                  <div className="new-plan-input-row">
                    <input
                      id="new-plan-name"
                      type="text"
                      className="new-plan-input"
                      placeholder="Enter plan name..."
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPlanName.trim()) {
                          handleQuickAdd()
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="new-plan-cancel"
                      onClick={handleCancelNew}
                      title="Cancel"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div className="plan-selector-container">
                  <label htmlFor="plan-select" className="plan-selector-label">
                    Select Plan
                  </label>
                  <select
                    id="plan-select"
                    className="plan-selector"
                    value={selectedPlanId}
                    onChange={handlePlanSelectChange}
                  >
                    <option value="">Choose a plan...</option>
                    {onCreateNewPlanWithExercise && (
                      <option value="__new__">+ New Workout</option>
                    )}
                    {sortedPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quick add button */}
              <button
                className="quick-add-button"
                onClick={handleQuickAdd}
                disabled={isAddDisabled}
              >
                Add (3 sets × 8-12 reps)
              </button>

              {/* Customize toggle */}
              <button
                className="customize-toggle"
                onClick={() => setIsCustomizing(!isCustomizing)}
                type="button"
              >
                {isCustomizing ? 'Hide options' : 'Customize...'}
              </button>

              {/* Customize form */}
              {isCustomizing && (
                <div className="customize-form">
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="custom-sets">Sets</label>
                      <input
                        id="custom-sets"
                        type="number"
                        min="1"
                        max="20"
                        value={formData.sets}
                        onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="custom-reps">Reps</label>
                      <input
                        id="custom-reps"
                        type="text"
                        placeholder="8-12"
                        value={formData.reps}
                        onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="custom-weight">Weight</label>
                      <input
                        id="custom-weight"
                        type="text"
                        placeholder="Optional"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="custom-rest">Rest</label>
                      <input
                        id="custom-rest"
                        type="text"
                        placeholder="Optional"
                        value={formData.rest}
                        onChange={(e) => setFormData({ ...formData, rest: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    className="custom-add-button"
                    onClick={handleCustomAdd}
                    disabled={isAddDisabled}
                  >
                    Add with Custom Values
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AddToPlanDropdown
