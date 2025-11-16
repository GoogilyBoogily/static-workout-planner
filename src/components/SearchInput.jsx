import './SearchInput.css'

/**
 * SearchInput Component
 *
 * Text search input for filtering exercises by name.
 * Supports real-time filtering with case-insensitive matching.
 *
 * @param {Object} props
 * @param {string} props.value - Current search text value
 * @param {Function} props.onChange - Callback when search text changes
 * @param {string} props.placeholder - Placeholder text for the input
 */
function SearchInput({ value, onChange, placeholder = 'Search exercises...' }) {
  const handleChange = (event) => {
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
