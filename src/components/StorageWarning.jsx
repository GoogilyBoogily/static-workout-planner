import './StorageWarning.css'

/**
 * Warning component for cross-tab sync and localStorage issues
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the warning
 * @param {string} props.message - Warning message to display
 * @param {Function} props.onDismiss - Optional callback when warning is dismissed
 */
function StorageWarning({ show, message, onDismiss }) {
  if (!show) {
    return null
  }

  return (
    <div className="storage-warning" role="status">
      <span className="warning-icon">ℹ️</span>
      <span className="warning-text">{message}</span>
      {onDismiss && (
        <button
          className="warning-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss warning"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default StorageWarning
