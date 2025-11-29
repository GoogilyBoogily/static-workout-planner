import './ExerciseCountBadge.css'

interface ExerciseCountBadgeProps {
  filteredCount: number
  totalCount: number
}

/**
 * ExerciseCountBadge Component
 *
 * Displays exercise count in a pill-shaped badge.
 * Shows "X exercises" when no filters, "X of Y exercises" when filtered.
 */
function ExerciseCountBadge({ filteredCount, totalCount }: ExerciseCountBadgeProps) {
  const isFiltered = filteredCount !== totalCount

  return (
    <div className="exercise-count-badge" aria-live="polite" aria-atomic="true">
      {isFiltered ? (
        <>
          <span className="count-filtered">{filteredCount}</span>
          <span className="count-separator">of</span>
          <span className="count-total">{totalCount}</span>
          <span className="count-label">exercises</span>
        </>
      ) : (
        <>
          <span className="count-total">{totalCount}</span>
          <span className="count-label">exercises</span>
        </>
      )}
    </div>
  )
}

export default ExerciseCountBadge
