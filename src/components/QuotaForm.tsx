import { useState, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { validateMuscleQuotas } from '../utils/validation'
import { getAvailableMuscleGroups, getMuscleGroupStats } from '../utils/randomGenerator'
import QuotaTemplateManager from './QuotaTemplateManager'
import './QuotaForm.css'

import type { ParsedExercise, MuscleQuota, MuscleQuotaTemplate, GenerationConfig } from '../types'

interface QuotaFormProps {
  /** Exercises from CSV library */
  exercises: ParsedExercise[]
  /** Saved quota templates */
  quotaTemplates?: MuscleQuotaTemplate[]
  /** Callback when "Generate" clicked */
  onGenerate: (config: GenerationConfig) => void
  /** Callback when cancelled */
  onCancel: () => void
  /** Callback to save template */
  onSaveTemplate: (name: string, quotas: MuscleQuota[], isCircuit: boolean, roundCount?: number) => void
  /** Callback to delete template */
  onDeleteTemplate: (templateId: string) => void
}

/**
 * QuotaForm Component
 *
 * Modal form for configuring muscle group quotas to generate random workout plans.
 * Allows users to specify how many exercises of each muscle group they want.
 */
export default function QuotaForm({
  exercises,
  quotaTemplates = [],
  onGenerate,
  onCancel,
  onSaveTemplate,
  onDeleteTemplate
}: QuotaFormProps) {
  // Quota state: array of { muscleGroup, count } objects
  const [quotas, setQuotas] = useState<MuscleQuota[]>([])

  // Circuit mode toggle
  const [isCircuit, setIsCircuit] = useState(false)

  // Round count for circuit mode (optional - auto-calculates if not set)
  const [roundCount, setRoundCount] = useState<number | undefined>(undefined)

  // Selected template (for loading saved configurations)
  const [selectedTemplate, setSelectedTemplate] = useState<MuscleQuotaTemplate | null>(null)

  // FIXED H5: Separate validation errors and warnings
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])

  // Show template save UI
  const [showTemplateSave, setShowTemplateSave] = useState(false)
  const [templateName, setTemplateName] = useState('')

  // T070: Loading state for generation
  const [isGenerating, setIsGenerating] = useState(false)

  // Derive available muscle groups and stats from exercises
  const availableMuscleGroups = useMemo(
    () => getAvailableMuscleGroups(exercises),
    [exercises]
  )
  const muscleGroupStats = useMemo(
    () => getMuscleGroupStats(exercises),
    [exercises]
  )

  /**
   * Add a new empty quota row
   *
   * FIXED M3: Prevent duplicate muscle groups by selecting first unused
   */
  const handleAddQuota = () => {
    // Find muscle groups that are already in use
    const usedGroups = new Set(quotas.map(q => q.muscleGroup))

    // Find first unused muscle group
    const unusedGroup = availableMuscleGroups.find(group => !usedGroups.has(group))

    if (!unusedGroup) {
      alert('All available muscle groups have been added to the quota list.')
      return
    }

    setQuotas([...quotas, { muscleGroup: unusedGroup, count: 1 }])
    setValidationErrors([]) // Clear errors when user makes changes
    setValidationWarnings([]) // Clear warnings too
  }

  /**
   * Remove a quota row by index
   */
  const handleRemoveQuota = (index: number) => {
    const updated = quotas.filter((_, i) => i !== index)
    setQuotas(updated)
    setValidationErrors([])
    setValidationWarnings([])
  }

  /**
   * Update a quota's muscle group
   */
  const handleMuscleGroupChange = (index: number, newMuscleGroup: string) => {
    const updated = [...quotas]
    const quota = updated[index]
    if (quota) {
      quota.muscleGroup = newMuscleGroup
    }
    setQuotas(updated)
    setValidationErrors([])
    setValidationWarnings([])
  }

  /**
   * Update a quota's count
   */
  const handleCountChange = (index: number, newCount: string) => {
    const updated = [...quotas]
    const quota = updated[index]
    if (quota) {
      quota.count = parseInt(newCount, 10) || 1
    }
    setQuotas(updated)
    setValidationErrors([])
    setValidationWarnings([])
  }

  /**
   * Validate quotas and generate workout
   *
   * FIXED H1: Use requestAnimationFrame to ensure UI update before heavy computation
   * FIXED H5: Handle both errors and warnings from validation
   */
  const handleGenerate = () => {
    const { valid, errors, warnings } = validateMuscleQuotas(quotas, exercises)

    // Show errors (blocking) and warnings (non-blocking)
    setValidationErrors(errors)
    setValidationWarnings(warnings)

    if (!valid) {
      // Errors prevent generation
      return
    }

    // FIXED H1: Set loading state with proper async handling
    setIsGenerating(true)

    // Use requestAnimationFrame + setTimeout to ensure UI paint happens
    // requestAnimationFrame schedules after current frame
    // setTimeout schedules after next event loop tick
    requestAnimationFrame(() => {
      setTimeout(() => {
        const config: GenerationConfig = {
          quotas,
          isCircuit,
          roundCount: isCircuit ? roundCount : undefined
        }
        onGenerate(config)
        setIsGenerating(false)
      }, 0)
    })
  }

  /**
   * Load a saved quota template (T063)
   */
  const handleLoadTemplate = (template: MuscleQuotaTemplate) => {
    setQuotas([...template.quotas])
    setIsCircuit(template.isCircuit)
    setRoundCount(template.roundCount)
    setSelectedTemplate(template)
    setValidationErrors([])
    setValidationWarnings([])
  }

  /**
   * Delete a quota template
   */
  const handleDeleteTemplate = (templateId: string) => {
    onDeleteTemplate(templateId)
    // Clear selected template if it was the one deleted
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null)
    }
  }

  /**
   * Show template save input
   */
  const handleShowTemplateSave = () => {
    setShowTemplateSave(true)
  }

  /**
   * Save current quotas as a template
   */
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Template name is required')
      return
    }

    if (quotas.length === 0) {
      alert('Add at least one quota before saving template')
      return
    }

    onSaveTemplate(templateName, quotas, isCircuit, isCircuit ? roundCount : undefined)

    // Reset template save UI
    setShowTemplateSave(false)
    setTemplateName('')
  }

  // C1 FIX: Show prominent empty state when no exercises in library
  if (exercises.length === 0) {
    return (
      <div className="quota-form-modal-overlay" onClick={onCancel}>
        <div className="quota-form-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Generate Random Workout</h2>
          <div className="quota-form-empty-state">
            <div className="quota-form-empty-icon">📋</div>
            <h3>No Exercises Loaded</h3>
            <p>
              Upload a CSV file with your exercise library to generate workouts.
              The CSV should include exercise names and muscle groups.
            </p>
            <p className="quota-form-empty-hint">
              You can also use the default exercise library by refreshing the page
              if no custom CSV has been uploaded.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="quota-cancel-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="quota-form-modal-overlay" onClick={onCancel}>
      <div className="quota-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Generate Random Workout</h2>

        {/* T057: Integrate QuotaTemplateManager */}
        {quotaTemplates.length > 0 && (
          <QuotaTemplateManager
            templates={quotaTemplates}
            onLoad={handleLoadTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}

        {/* Quota inputs */}
        <div className="quota-form-section">
          <h3>Muscle Group Quotas</h3>
          <p className="quota-form-hint">
            Specify how many exercises you want for each muscle group
          </p>

          {quotas.map((quota, index) => (
            <div key={index} className="quota-form-row">
              <select
                value={quota.muscleGroup}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleMuscleGroupChange(index, e.target.value)}
                className="quota-tag-select"
              >
                {availableMuscleGroups.map(group => (
                  <option key={group} value={group}>
                    {group} ({muscleGroupStats[group] ?? 0} available)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={quota.count}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCountChange(index, e.target.value)}
                className="quota-count-input"
              />

              <button
                type="button"
                onClick={() => handleRemoveQuota(index)}
                className="quota-remove-button"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuota}
            className="quota-add-button"
            disabled={availableMuscleGroups.length === 0}
          >
            Add Muscle Group
          </button>

          {availableMuscleGroups.length === 0 && (
            <p className="quota-form-warning">
              No exercises in library. Upload a CSV or check the default exercises.
            </p>
          )}
        </div>

        {/* Circuit mode toggle */}
        <div className="quota-form-section circuit-mode-section">
          <label className="circuit-mode-toggle">
            <input
              type="checkbox"
              checked={isCircuit}
              onChange={(e) => setIsCircuit(e.target.checked)}
            />
            <span>Circuit Mode</span>
          </label>
          <p className="quota-form-hint">
            When enabled, exercises alternate between muscle groups so consecutive exercises target different muscles.
          </p>
        </div>

        {/* Round count input (only shown when circuit mode is enabled) */}
        {isCircuit && (
          <div className="quota-form-section round-count-section">
            <label className="round-count-label">
              <span>Number of Rounds</span>
              <input
                type="number"
                min={1}
                max={10}
                value={roundCount ?? ''}
                placeholder="Auto"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value
                  setRoundCount(val ? parseInt(val, 10) || undefined : undefined)
                }}
                className="round-count-input"
              />
            </label>
            <p className="quota-form-hint">
              Leave empty to auto-calculate from muscle groups, or specify how many rounds to distribute exercises across.
            </p>
          </div>
        )}

        {/* FIXED H5: Display both errors and warnings */}
        {validationErrors.length > 0 && (
          <div className="quota-form-errors">
            {validationErrors.map((error, idx) => (
              <div key={idx} className="quota-form-error">
                ❌ {error}
              </div>
            ))}
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="quota-form-warnings">
            {validationWarnings.map((warning, idx) => (
              <div key={idx} className="quota-form-warning">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}

        {/* Template save UI */}
        {showTemplateSave && (
          <div className="quota-form-section">
            <h3>Save as Template</h3>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTemplateName(e.target.value)}
              className="quota-template-name-input"
            />
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="quota-save-template-button"
            >
              Save Template
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="quota-form-actions">
          <button
            type="button"
            onClick={handleGenerate}
            className="quota-generate-button"
            disabled={quotas.length === 0 || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Workout'}
          </button>

          {!showTemplateSave && quotas.length > 0 && (
            <button
              type="button"
              onClick={handleShowTemplateSave}
              className="quota-show-save-button"
            >
              Save as Template
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="quota-cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
