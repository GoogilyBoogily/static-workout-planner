import { useState } from 'react'
import Body from '@mjcdev/react-body-highlighter'
import { convertToLibraryNames, getOurMuscleName } from '../assets/muscle-groups'

/**
 * MuscleDiagram Component
 *
 * Professional interactive muscle diagram using @mjcdev/react-body-highlighter.
 * Supports male/female body models with front and back views shown simultaneously.
 *
 * @param {Object} props
 * @param {string[]} props.selectedMuscles - Array of selected muscle names (our naming)
 * @param {Function} props.onMuscleToggle - Callback when muscle is clicked
 * @param {string|null} props.hoveredMuscle - Currently hovered muscle name
 * @param {Function} props.onMuscleHover - Callback when muscle is hovered
 */
function MuscleDiagram({ selectedMuscles = [], onMuscleToggle, hoveredMuscle, onMuscleHover }) {
  // Body type toggle state (male/female)
  const [bodyType, setBodyType] = useState('male')

  // Convert our muscle names to library format
  const librarySelectedMuscles = convertToLibraryNames(selectedMuscles)

  // Prepare data for Body component
  // Format: array of {slug: string, intensity: number} objects
  const bodyData = librarySelectedMuscles.map(muscle => ({
    slug: muscle,
    intensity: 1 // Full intensity for selected muscles
  }))

  // Handle muscle click from library
  const handleBodyPartClick = (bodyPart, side) => {
    // bodyPart.slug contains the library muscle name
    const ourMuscleName = getOurMuscleName(bodyPart.slug)
    if (onMuscleToggle) {
      onMuscleToggle(ourMuscleName)
    }
  }

  return (
    <div className="muscle-diagram">
      {/* Body type toggle buttons (Male/Female) */}
      <div className="body-type-toggle">
        <button
          className={`body-button ${bodyType === 'male' ? 'active' : ''}`}
          onClick={() => setBodyType('male')}
          aria-pressed={bodyType === 'male'}
        >
          Male
        </button>
        <button
          className={`body-button ${bodyType === 'female' ? 'active' : ''}`}
          onClick={() => setBodyType('female')}
          aria-pressed={bodyType === 'female'}
        >
          Female
        </button>
      </div>

      {/* Dual view: Front and Back side-by-side */}
      <div className="muscle-diagram-dual-view">
        <div className="muscle-view">
          <h3>Front View</h3>
          <Body
            gender={bodyType}
            side="front"
            data={bodyData}
            onBodyPartClick={handleBodyPartClick}
            scale={1.5}
          />
        </div>

        <div className="muscle-view">
          <h3>Back View</h3>
          <Body
            gender={bodyType}
            side="back"
            data={bodyData}
            onBodyPartClick={handleBodyPartClick}
            scale={1.5}
          />
        </div>
      </div>
    </div>
  )
}

export default MuscleDiagram
