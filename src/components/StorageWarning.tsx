import './StorageWarning.css'

import type { StorageWarningProps } from '../types/components'

/**
 * Warning component for cross-tab sync and localStorage issues
 */
function StorageWarning({ show, message, onDismiss }: StorageWarningProps) {
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
