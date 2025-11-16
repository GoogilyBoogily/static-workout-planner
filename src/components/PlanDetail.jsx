import { useEffect, useRef } from 'react'
import './PlanDetail.css'

/**
 * Modal for viewing full plan details with all exercises
 * @param {Object} props
 * @param {Object} props.plan - Plan object to display
 * @param {Function} props.onClose - Callback when modal is closed
 */
function PlanDetail({ plan, onClose }) {
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)

  // T067: ESC key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // T069: Focus trapping
  useEffect(() => {
    if (!modalRef.current) return

    // Focus close button when modal opens
    closeButtonRef.current?.focus()

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  // T068: Backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!plan) return null

  return (
    <div
      className="plan-detail-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-detail-title"
    >
      <div className="plan-detail-modal" ref={modalRef}>
        <div className="plan-detail-header">
          <h2 id="plan-detail-title">{plan.name}</h2>
          <button
            ref={closeButtonRef}
            className="plan-detail-close"
            onClick={onClose}
            aria-label="Close plan details"
          >
            ×
          </button>
        </div>

        <div className="plan-detail-body">
          {plan.exercises.length === 0 ? (
            <div className="plan-detail-empty">
              No exercises in this plan yet.
            </div>
          ) : (
            <div className="plan-detail-exercises">
              {plan.exercises.map((exercise, index) => (
                <div key={exercise.id} className="detail-exercise-item">
                  <div className="detail-exercise-number">{index + 1}</div>
                  <div className="detail-exercise-content">
                    <div className="detail-exercise-name">{exercise.name}</div>
                    <div className="detail-exercise-specs">
                      <span className="spec-item">
                        <strong>Sets:</strong> {exercise.sets}
                      </span>
                      <span className="spec-item">
                        <strong>Reps:</strong> {exercise.reps}
                      </span>
                      {exercise.weight && (
                        <span className="spec-item">
                          <strong>Weight:</strong> {exercise.weight}
                        </span>
                      )}
                      {exercise.rest && (
                        <span className="spec-item">
                          <strong>Rest:</strong> {exercise.rest}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="plan-detail-footer">
          <button onClick={onClose} className="button-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlanDetail
