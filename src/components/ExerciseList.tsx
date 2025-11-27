import './ExerciseList.css'
import AddToPlanDropdown from './AddToPlanDropdown'

import type { ParsedExercise, PlanExercise, WorkoutPlan } from '../types'

interface ExerciseListProps {
  /** Array of exercises to display */
  exercises: ParsedExercise[]
  /** Callback when an exercise is clicked */
  onExerciseClick: (exercise: ParsedExercise, index: number) => void
  /** Callback when an exercise is hovered (passes array of muscle tags or empty array) */
  onExerciseHover?: (tags: string[]) => void
  /** Optional message when no exercises are available */
  emptyMessage?: string
  /** Array of currently hovered muscles from diagram or exercise hover */
  hoveredMuscle?: string[]
  /** Available workout plans for "Add to Plan" feature */
  plans?: WorkoutPlan[]
  /** Callback when exercise is added to a plan */
  onAddToPlan?: (planId: string, exercise: PlanExercise) => void
  /** Callback when creating a new plan with this exercise */
  onCreateNewPlanWithExercise?: (planName: string, exercise: PlanExercise) => void
}

/**
 * ExerciseList Component
 *
 * Displays a list of exercises with clickable items that open the detail modal.
 */
function ExerciseList({
  exercises,
  onExerciseClick,
  onExerciseHover,
  emptyMessage = 'No exercises available',
  hoveredMuscle = [],
  plans,
  onAddToPlan,
  onCreateNewPlanWithExercise
}: ExerciseListProps) {
  if (!exercises || exercises.length === 0) {
    return <div className="exercise-list-empty">{emptyMessage}</div>
  }

  // Handle exercise hover - highlight all muscles in diagram
  const handleExerciseMouseEnter = (exercise: ParsedExercise) => {
    if (onExerciseHover && exercise.tags && exercise.tags.length > 0) {
      // Pass all muscle tags to highlight all muscles for this exercise
      onExerciseHover(exercise.tags)
    }
  }

  const handleExerciseMouseLeave = () => {
    if (onExerciseHover) {
      onExerciseHover([])
    }
  }

  return (
    <div className="exercise-list">
      {exercises.map((exercise, index) => {
        // Check if this exercise matches any of the hovered muscles
        const isHighlighted = hoveredMuscle && hoveredMuscle.length > 0 && exercise.tags &&
          exercise.tags.some(tag =>
            hoveredMuscle.some(hovered => hovered.toLowerCase() === tag.toLowerCase())
          )

        return (
          <button
            key={index}
            className={`exercise-item ${isHighlighted ? 'exercise-item-highlighted' : ''}`}
            onClick={() => onExerciseClick(exercise, index)}
            onMouseEnter={() => handleExerciseMouseEnter(exercise)}
            onMouseLeave={handleExerciseMouseLeave}
            tabIndex={0}
          >
            {/* Add to Plan button - hover reveal */}
            {plans && onAddToPlan && (
              <div
                className="exercise-add-button"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  // Clear any muscle highlighting when interacting with dropdown
                  if (onExerciseHover) onExerciseHover([])
                }}
                onMouseLeave={(e) => e.stopPropagation()}
              >
                <AddToPlanDropdown
                  exercise={exercise}
                  plans={plans}
                  onAddToPlan={onAddToPlan}
                  onCreateNewPlanWithExercise={onCreateNewPlanWithExercise}
                  variant="icon"
                />
              </div>
            )}
            <div className="exercise-name">{exercise.name}</div>
            {exercise.tags && exercise.tags.length > 0 && (
              <div className="exercise-tags">
                {exercise.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="exercise-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {((exercise.equipment && exercise.equipment.length > 0) || (exercise.optionalEquipment && exercise.optionalEquipment.length > 0)) && (
              <div className="exercise-equipment">
                {exercise.equipment && exercise.equipment.map((item, equipIndex) => (
                  <span key={`req-${equipIndex}`} className="equipment-badge">
                    {item}
                  </span>
                ))}
                {exercise.optionalEquipment && exercise.optionalEquipment.map((item, equipIndex) => (
                  <span key={`opt-${equipIndex}`} className="equipment-badge equipment-badge-optional">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ExerciseList
