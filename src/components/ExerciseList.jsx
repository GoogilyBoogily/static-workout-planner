import './ExerciseList.css'

/**
 * ExerciseList Component
 *
 * Displays a list of exercises with clickable items that open the detail modal.
 *
 * @param {Object} props
 * @param {Array} props.exercises - Array of exercise objects to display
 * @param {Function} props.onExerciseClick - Callback when an exercise is clicked
 * @param {string} props.emptyMessage - Optional message when no exercises are available
 */
function ExerciseList({ exercises, onExerciseClick, emptyMessage = 'No exercises available' }) {
  if (!exercises || exercises.length === 0) {
    return <div className="exercise-list-empty">{emptyMessage}</div>
  }

  return (
    <div className="exercise-list">
      {exercises.map((exercise, index) => (
        <button
          key={index}
          className="exercise-item"
          onClick={() => onExerciseClick(exercise, index)}
          tabIndex={0}
        >
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
        </button>
      ))}
    </div>
  )
}

export default ExerciseList
