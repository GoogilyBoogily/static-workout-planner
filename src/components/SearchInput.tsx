import type { ChangeEvent } from 'react'
import './SearchInput.css'

import type { SearchInputProps } from '../types/components'

/**
 * SearchInput Component
 *
 * Text search input for filtering exercises by name.
 * Supports real-time filtering with case-insensitive matching.
 */
function SearchInput({ value, onChange, placeholder = 'Search exercises...' }: SearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="search-input-container">
      <input
        type="search"
        className="search-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search exercises by name"
      />
      {value && (
        <button
          className="search-clear-button"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchInput
