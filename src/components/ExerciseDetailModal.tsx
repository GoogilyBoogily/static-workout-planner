import { useEffect, useRef } from 'react'
import './ExerciseDetailModal.css'
import { extractVideoId, getEmbedUrl } from '../utils/youtube'
import AddToPlanDropdown from './AddToPlanDropdown'

import type { ParsedExercise, PlanExercise, WorkoutPlan } from '../types'

type ExerciseType = ParsedExercise | PlanExercise

interface ExerciseDetailModalProps {
  /** Exercise object to display (null = modal closed) */
  exercise: ExerciseType | null
  /** Index in exercises array */
  exerciseIndex: number | null
  /** Total number of exercises */
  totalExercises: number
  /** Callback to close modal */
  onClose: () => void
  /** Callback to navigate to next exercise */
  onNext: () => void
  /** Callback to navigate to previous exercise */
  onPrevious: () => void
  /** Available workout plans for "Add to Plan" feature */
  plans?: WorkoutPlan[]
  /** Callback when exercise is added to a plan */
  onAddToPlan?: (planId: string, exercise: PlanExercise) => void
  /** Callback when creating a new plan with this exercise */
  onCreateNewPlanWithExercise?: (planName: string, exercise: PlanExercise) => void
}

/**
 * ExerciseDetailModal Component
 *
 * Displays exercise details in a modal overlay.
 * Supports keyboard navigation (ESC to close), focus trapping,
 * and accessible modal patterns.
 */
function ExerciseDetailModal({
  exercise,
  exerciseIndex,
  totalExercises,
  onClose,
  onNext,
  onPrevious,
  plans,
  onAddToPlan,
  onCreateNewPlanWithExercise
}: ExerciseDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // ESC key handler (T011), Focus trapping (T013), and Body scroll prevention (T030)
  useEffect(() => {
    if (!exercise) return

    // Prevent body scroll when modal is open (T030)
    document.body.style.overflow = 'hidden'

    // Handle ESC key to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Focus trapping
    const modal = modalRef.current
    if (!modal) return

    // Get all focusable elements within the modal
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element when modal opens
    firstElement?.focus()

    // Tab trap handler
    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    modal.addEventListener('keydown', handleTab)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      modal.removeEventListener('keydown', handleTab)
      // Restore body scroll
      document.body.style.overflow = ''
    }
  }, [exercise, onClose])

  // Return null if no exercise selected (modal closed)
  if (!exercise) {
    return null
  }

  // Determine if we're at boundaries
  const isFirstExercise = exerciseIndex === 0
  const isLastExercise = exerciseIndex === totalExercises - 1

  // Extract video ID from YouTube URL (T017, T019, T020)
  const videoId = exercise.youtubeUrl ? extractVideoId(exercise.youtubeUrl) : null
  const hasValidVideo = videoId !== null
  const hasInvalidUrl = exercise.youtubeUrl && !hasValidVideo

  // Get tags (handle both ParsedExercise and PlanExercise)
  const tags = exercise.tags ?? ('tag' in exercise && exercise.tag ? [exercise.tag] : [])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 id="modal-title">{exercise.name}</h2>

        {/* Add to Plan button - only for ParsedExercise (library), not PlanExercise (already in plan) */}
        {plans && onAddToPlan && !('sets' in exercise) && (
          <div className="modal-add-to-plan">
            <AddToPlanDropdown
              exercise={exercise as ParsedExercise}
              plans={plans}
              onAddToPlan={onAddToPlan}
              onCreateNewPlanWithExercise={onCreateNewPlanWithExercise}
              variant="full"
            />
          </div>
        )}

        <div className="exercise-details">
          {/* Muscle Groups */}
          {tags && tags.length > 0 && (
            <div className="detail-section">
              <h3>Muscle Groups</h3>
              <div className="tag-list">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Equipment */}
          {exercise.equipment && exercise.equipment.length > 0 && (
            <div className="detail-section">
              <h3>Required Equipment</h3>
              <div className="tag-list">
                {exercise.equipment.map((item, index) => (
                  <span key={index} className="equipment-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Optional Equipment */}
          {exercise.optionalEquipment && exercise.optionalEquipment.length > 0 && (
            <div className="detail-section">
              <h3>Optional Equipment</h3>
              <div className="tag-list">
                {exercise.optionalEquipment.map((item, index) => (
                  <span key={index} className="equipment-tag-optional">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {exercise.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p className="description-text">{exercise.description}</p>
            </div>
          )}

          {/* Exercise Parameters (only for PlanExercise) */}
          {'sets' in exercise && (
            <div className="detail-section">
              <h3>Exercise Parameters</h3>
              <div className="parameters">
                {exercise.sets && (
                  <div className="parameter">
                    <span className="parameter-label">Sets:</span>
                    <span className="parameter-value">{exercise.sets}</span>
                  </div>
                )}
                {exercise.reps && (
                  <div className="parameter">
                    <span className="parameter-label">Reps:</span>
                    <span className="parameter-value">{exercise.reps}</span>
                  </div>
                )}
                {exercise.weight && (
                  <div className="parameter">
                    <span className="parameter-label">Weight:</span>
                    <span className="parameter-value">{exercise.weight}</span>
                  </div>
                )}
                {exercise.rest && (
                  <div className="parameter">
                    <span className="parameter-label">Rest:</span>
                    <span className="parameter-value">{exercise.rest}</span>
                  </div>
                )}
                {exercise.day && (
                  <div className="parameter">
                    <span className="parameter-label">Day:</span>
                    <span className="parameter-value">{exercise.day}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* YouTube Video Section (T017, T019, T020) */}
          {hasValidVideo && videoId && (
            <div className="detail-section">
              <h3>Tutorial Video</h3>
              <div className="video-container">
                <iframe
                  src={getEmbedUrl(videoId)}
                  title={`${exercise.name} tutorial video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Error message for invalid URLs (T020) */}
          {hasInvalidUrl && (
            <div className="detail-section">
              <div className="video-error">
                Invalid video URL. Please check the YouTube URL format.
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls (T025, T026, T027, T029) */}
        <div className="modal-navigation">
          <button
            className="nav-button nav-previous"
            onClick={onPrevious}
            disabled={isFirstExercise}
            aria-label="Previous exercise"
          >
            ← Previous
          </button>
          <button
            className="nav-button nav-next"
            onClick={onNext}
            disabled={isLastExercise}
            aria-label="Next exercise"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExerciseDetailModal
