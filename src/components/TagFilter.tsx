import type { KeyboardEvent } from 'react'
import './TagFilter.css'

import type { TagFilterProps } from '../types/components'

/**
 * TagFilter Component
 *
 * Clickable tag pills for filtering exercises by muscle groups/tags.
 * Syncs with MuscleDiagram component via shared selectedMuscles state.
 */
function TagFilter({ availableTags = [], selectedTags = [], onTagToggle }: TagFilterProps) {
  if (availableTags.length === 0) {
    return null
  }

  const handleTagClick = (tag: string) => {
    if (onTagToggle) {
      onTagToggle(tag)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tag: string) => {
    // Support keyboard activation (Enter or Space)
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleTagClick(tag)
    }
  }

  return (
    <div className="tag-filter">
      <div className="tag-filter-label">Filter by muscle group:</div>
      <div className="tag-filter-pills">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              className={`tag-pill ${isSelected ? 'tag-pill-active' : ''}`}
              onClick={() => handleTagClick(tag)}
              onKeyDown={(e) => handleKeyDown(e, tag)}
              aria-pressed={isSelected}
              aria-label={`Filter by ${tag}`}
              type="button"
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TagFilter
