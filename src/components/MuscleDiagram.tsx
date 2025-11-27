import { useState, useMemo } from 'react'
import type { MouseEvent } from 'react'
import Body, { type ExtendedBodyPart, type Slug } from '@mjcdev/react-body-highlighter'
import { convertToLibraryNames, getOurMuscleName, ALL_LIBRARY_SLUGS } from '../assets/muscle-groups'

import type { MuscleSlug } from '../types'

interface BodyPartData {
  slug: string
  intensity: number
}

/**
 * Adapter function to convert our BodyPartData to library's ExtendedBodyPart type.
 * This provides type-safe transformation instead of unsafe type assertions.
 */
function toExtendedBodyParts(data: BodyPartData[]): readonly ExtendedBodyPart[] {
  return data.map(d => ({
    slug: d.slug as Slug,
    intensity: d.intensity
  }))
}

/**
 * Adapter function to handle body part click events from the library.
 * Converts library's ExtendedBodyPart callback signature to our handler.
 */
function createClickHandler(
  handler: (bodyPart: { slug: string }) => void
): (bodyPart: ExtendedBodyPart) => void {
  return (bodyPart: ExtendedBodyPart) => {
    if (bodyPart.slug) {
      handler({ slug: bodyPart.slug })
    }
  }
}

interface BodyPartClick {
  slug: string
}

interface MuscleDiagramProps {
  /** Array of selected muscle names (our naming) */
  selectedMuscles?: string[]
  /** Callback when muscle is clicked */
  onMuscleToggle?: (muscleName: string) => void
  /** Array of currently hovered muscle names */
  hoveredMuscle?: string[]
  /** Callback when muscle is hovered */
  onMuscleHover?: (muscles: string[]) => void
  /** Array of library muscle slugs that have exercises (others are disabled) */
  availableMuscles?: MuscleSlug[]
}

/**
 * MuscleDiagram Component
 *
 * Professional interactive muscle diagram using @mjcdev/react-body-highlighter.
 * Supports male/female body models with front and back views shown simultaneously.
 */
function MuscleDiagram({
  selectedMuscles = [],
  onMuscleToggle,
  hoveredMuscle = [],
  onMuscleHover,
  availableMuscles = []
}: MuscleDiagramProps) {
  // Body type toggle state (male/female)
  const [bodyType, setBodyType] = useState<'male' | 'female'>('female')

  // Compute unavailable muscle slugs and generate CSS to disable them
  const unavailableSlugs = useMemo(() => {
    return ALL_LIBRARY_SLUGS.filter(slug => !availableMuscles.includes(slug))
  }, [availableMuscles])

  const unavailableCSS = useMemo(() => {
    if (unavailableSlugs.length === 0) return ''
    const selectors = unavailableSlugs.map(slug => `.muscle-diagram svg path#${slug}`).join(',\n')
    return `${selectors} {
      fill: #3a3a3a !important;
      cursor: default !important;
      opacity: 0.3;
      pointer-events: none;
    }`
  }, [unavailableSlugs])

  // Convert our muscle names to library format
  const librarySelectedMuscles = convertToLibraryNames(selectedMuscles)

  // Prepare data for Body component
  // Format: array of {slug: string, intensity: number} objects
  // Intensity maps to colors array: 1 = hover color, 2 = selected color
  const bodyData: BodyPartData[] = librarySelectedMuscles.map(muscle => ({
    slug: muscle,
    intensity: 2 // Full intensity for selected muscles (uses second color)
  }))

  // Add hovered muscles to data with lower intensity (if not already selected)
  // This creates synchronized hover effect across both front and back views
  if (hoveredMuscle && Array.isArray(hoveredMuscle) && hoveredMuscle.length > 0) {
    const libraryHoveredMuscles = convertToLibraryNames(hoveredMuscle)
    libraryHoveredMuscles.forEach(muscle => {
      // Only add if not already in selected muscles
      if (!librarySelectedMuscles.includes(muscle)) {
        bodyData.push({
          slug: muscle,
          intensity: 1 // Lower intensity for hover effect (uses first color)
        })
      }
    })
  }

  // Custom colors array: [hover color, selected color]
  // Hover: Soft peachy-beige (#e8c9a3)
  // Selected: Primary purple (#646cff) - matches app theme
  const customColors = ['#e8c9a3', '#646cff']

  // Handle muscle click from library
  const handleBodyPartClick = (bodyPart: BodyPartClick) => {
    // Ignore clicks on unavailable muscles
    if (!availableMuscles.includes(bodyPart.slug as MuscleSlug)) return
    // bodyPart.slug contains the library muscle name
    const ourMuscleName = getOurMuscleName(bodyPart.slug as MuscleSlug)
    if (onMuscleToggle) {
      onMuscleToggle(ourMuscleName)
    }
  }

  // Handle hover events for synchronized highlighting across both views
  const handleMouseOver = (event: MouseEvent<HTMLDivElement>) => {
    // Check if hovering over an SVG path element (muscle part)
    const target = event.target as HTMLElement
    if (target.tagName === 'path' && target.id) {
      // Ignore hover on unavailable muscles
      if (!availableMuscles.includes(target.id as MuscleSlug)) return
      // The library sets id attribute to the muscle slug
      const libraryMuscleName = target.id as MuscleSlug
      const ourMuscleName = getOurMuscleName(libraryMuscleName)

      if (ourMuscleName && onMuscleHover) {
        // Pass as array for consistency with exercise hover
        onMuscleHover([ourMuscleName])
      }
    }
  }

  const handleMouseOut = (event: MouseEvent<HTMLDivElement>) => {
    // Clear hover when mouse leaves muscle parts
    const target = event.target as HTMLElement
    if (target.tagName === 'path') {
      if (onMuscleHover) {
        onMuscleHover([])
      }
    }
  }

  return (
    <div className="muscle-diagram">
      {/* Dynamic CSS to disable unavailable muscles */}
      {unavailableCSS && <style>{unavailableCSS}</style>}

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
            data={toExtendedBodyParts(bodyData)}
            colors={customColors}
            onBodyPartClick={createClickHandler(handleBodyPartClick)}
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
            data={toExtendedBodyParts(bodyData)}
            colors={customColors}
            onBodyPartClick={createClickHandler(handleBodyPartClick)}
            scale={1.5}
          />
        </div>
      </div>
    </div>
  )
}

export default MuscleDiagram
