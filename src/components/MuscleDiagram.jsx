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
  // Intensity maps to colors array: 1 = hover color, 2 = selected color
  const bodyData = librarySelectedMuscles.map(muscle => ({
    slug: muscle,
    intensity: 2 // Full intensity for selected muscles (uses second color)
  }))

  // Add hovered muscle to data with lower intensity (if not already selected)
  // This creates synchronized hover effect across both front and back views
  if (hoveredMuscle) {
    const libraryHoveredMuscle = convertToLibraryNames([hoveredMuscle])[0]
    // Only add if not already in selected muscles
    if (!librarySelectedMuscles.includes(libraryHoveredMuscle)) {
      bodyData.push({
        slug: libraryHoveredMuscle,
        intensity: 1 // Lower intensity for hover effect (uses first color)
      })
    }
  }

  // Custom colors array: [hover color, selected color]
  // Hover: Soft peachy-beige (#e8c9a3)
  // Selected: Warm red (#c44545)
  const customColors = ['#e8c9a3', '#c44545']

  // Handle muscle click from library
  const handleBodyPartClick = (bodyPart, side) => {
    // bodyPart.slug contains the library muscle name
    const ourMuscleName = getOurMuscleName(bodyPart.slug)
    if (onMuscleToggle) {
      onMuscleToggle(ourMuscleName)
    }
  }

  // Handle hover events for synchronized highlighting across both views
  const handleMouseOver = (event) => {
    // Check if hovering over an SVG path element (muscle part)
    const target = event.target
    if (target.tagName === 'path' && target.id) {
      // The library sets id attribute to the muscle slug
      const libraryMuscleName = target.id
      const ourMuscleName = getOurMuscleName(libraryMuscleName)

      if (ourMuscleName && onMuscleHover) {
        onMuscleHover(ourMuscleName)
      }
    }
  }

  const handleMouseOut = (event) => {
    // Clear hover when mouse leaves muscle parts
    if (event.target.tagName === 'path') {
      if (onMuscleHover) {
        onMuscleHover(null)
      }
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
        <div
          className="muscle-view"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h3>Front View</h3>
          <Body
            gender={bodyType}
            side="front"
            data={bodyData}
            colors={customColors}
            onBodyPartClick={handleBodyPartClick}
            scale={1.5}
          />
        </div>

        <div
          className="muscle-view"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h3>Back View</h3>
          <Body
            gender={bodyType}
            side="back"
            data={bodyData}
            colors={customColors}
            onBodyPartClick={handleBodyPartClick}
            scale={1.5}
          />
        </div>
      </div>
    </div>
  )
}

export default MuscleDiagram
