import './ErrorMessage.css'

import type { ErrorMessageProps } from '../types/components'

/**
 * Error message component for displaying localStorage and other errors
 */
function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
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
