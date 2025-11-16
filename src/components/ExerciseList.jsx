import './ExerciseList.css'

/**
 * ExerciseList Component
 *
 * Displays a list of exercises with clickable items that open the detail modal.
 *
 * @param {Object} props
 * @param {Array} props.exercises - Array of exercise objects to display
 * @param {Function} props.onExerciseClick - Callback when an exercise is clicked
 * @param {Function} props.onExerciseHover - Callback when an exercise is hovered (passes array of muscle tags or empty array)
 * @param {string} props.emptyMessage - Optional message when no exercises are available
 * @param {string[]} props.hoveredMuscle - Array of currently hovered muscles from diagram or exercise hover
 */
function ExerciseList({ exercises, onExerciseClick, onExerciseHover, emptyMessage = 'No exercises available', hoveredMuscle = [] }) {
  if (!exercises || exercises.length === 0) {
    return <div className="exercise-list-empty">{emptyMessage}</div>
  }

  // Handle exercise hover - highlight all muscles in diagram
  const handleExerciseMouseEnter = (exercise) => {
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
