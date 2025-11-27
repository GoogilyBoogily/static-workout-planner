import { useState } from 'react'
import type { KeyboardEvent, DragEvent } from 'react'
import { formatRelativeTime, formatAbsoluteTime } from '../utils/dateFormat'
import './PlanList.css'

import type { WorkoutPlan } from '../types'

interface PlanListProps {
  /** Array of plan objects sorted by sortOrder */
  plans: WorkoutPlan[]
  /** Callback when "Create New Plan" is clicked */
  onCreate: () => void
  /** Callback when editing a plan */
  onEdit: (plan: WorkoutPlan) => void
  /** Callback when deleting a plan */
  onDelete: (plan: WorkoutPlan) => void
  /** Callback when viewing plan details */
  onView: (plan: WorkoutPlan) => void
  /** Callback when "Generate Random Workout" is clicked */
  onGenerateRandom: () => void
  /** True if no exercises available for generation */
  exercisePoolEmpty?: boolean
  /** Callback when starting circuit timer */
  onStartTimer: (plan: WorkoutPlan) => void
  /** Callback when plans are reordered via drag-drop */
  onReorder?: (sourceId: string, targetId: string) => void
}

/**
 * Display list of all saved workout plans
 */
function PlanList({
  plans,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onGenerateRandom,
  exercisePoolEmpty = false,
  onStartTimer,
  onReorder
}: PlanListProps) {
  // Drag-and-drop state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Drag-and-drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, planId: string) => {
    setDraggedId(planId)
    e.dataTransfer.effectAllowed = 'move'
    // Add dragging class after a brief delay for visual feedback
    setTimeout(() => {
      (e.target as HTMLElement).classList.add('dragging')
    }, 0)
  }

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).classList.remove('dragging')
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, planId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedId !== null && planId !== draggedId) {
      setDragOverId(planId)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault()
    if (draggedId === null || draggedId === targetId) {
      setDragOverId(null)
      return
    }

    onReorder?.(draggedId, targetId)
    setDraggedId(null)
    setDragOverId(null)
  }

  if (plans.length === 0) {
    return (
      <div className="plan-list-empty">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No workout plans yet</h2>
          <p>Create your first plan to get started!</p>
          <button onClick={onCreate} className="button-primary">
            Create New Plan
          </button>
        </div>
      </div>
    )
  }

  const handlePlanNameKeyDown = (e: KeyboardEvent<HTMLHeadingElement>, plan: WorkoutPlan) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onView(plan)
    }
  }

  return (
    <div className="plan-list">
      <div className="plan-list-header">
        <h2>My Workout Plans</h2>
        <div className="plan-list-actions">
          <button
            onClick={onGenerateRandom}
            className="button-secondary generate-random-button"
            disabled={exercisePoolEmpty}
            title={exercisePoolEmpty ? 'Create workout plans first to enable random generation' : 'Generate a random workout from your existing exercises'}
          >
            🎲 Generate Random
          </button>
          <button onClick={onCreate} className="button-primary">
            + Create New Plan
          </button>
        </div>
      </div>

      <div className="plan-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card${draggedId === plan.id ? ' dragging' : ''}${dragOverId === plan.id ? ' drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, plan.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, plan.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, plan.id)}
          >
            <div className="plan-card-header">
              <h3
                className="plan-name"
                onClick={() => onView(plan)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => handlePlanNameKeyDown(e, plan)}
              >
                {plan.name}
              </h3>
              {/* T071: Visual indicator for generated plans */}
              {plan.isGenerated && (
                <span className="plan-generated-badge" title="Randomly generated workout">
                  🎲 Generated
                </span>
              )}
            </div>

            <div className="plan-card-body">
              <div className="plan-stat">
                <span className="stat-label">Exercises:</span>
                <span className="stat-value">{plan.exercises.length}</span>
              </div>
              <div
                className="plan-timestamp"
                title={formatAbsoluteTime(plan.updatedAt)}
              >
                Last modified {formatRelativeTime(plan.updatedAt)}
              </div>
            </div>

            <div className="plan-card-actions">
              <button
                onClick={() => onStartTimer(plan)}
                className="button-secondary timer-button"
                aria-label={`Start timer for ${plan.name}`}
              >
                ⏱️ Timer
              </button>
              <button
                onClick={() => onEdit(plan)}
                className="button-secondary"
                aria-label={`Edit ${plan.name}`}
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(plan)}
                className="button-danger"
                aria-label={`Delete ${plan.name}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlanList
