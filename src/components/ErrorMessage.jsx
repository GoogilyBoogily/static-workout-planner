import './ErrorMessage.css'

/**
 * Error message component for displaying localStorage and other errors
 * @param {Object} props
 * @param {string|null} props.message - Error message to display (null hides component)
 * @param {Function} props.onDismiss - Optional callback when error is dismissed
 */
function ErrorMessage({ message, onDismiss }) {
  if (!message) {
    return null
  }

  return (
    <div className="error-message" role="alert">
      <span className="error-icon">⚠️</span>
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
