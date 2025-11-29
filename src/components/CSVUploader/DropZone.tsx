import { useState, useRef, useCallback } from 'react'

interface DropZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
  error?: string | null
  disabled?: boolean
}

/**
 * DropZone Component
 *
 * Drag-and-drop zone for CSV file upload with visual feedback states.
 * Also includes template download link and file picker fallback.
 */
function DropZone({ onFileSelect, isLoading = false, error = null, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !isLoading) {
      setIsDragOver(true)
    }
  }, [disabled, isLoading])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled || isLoading) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file && file.name.endsWith('.csv')) {
        onFileSelect(file)
      }
    }
  }, [disabled, isLoading, onFileSelect])

  const handleClick = () => {
    if (!disabled && !isLoading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.stopPropagation()

    const templateContent =
`Exercise,Muscle Group,Equipment,Optional Equipment,Description,YouTube URL
Bench Press,Chest,Barbell,Bench,Classic chest exercise for building strength,https://youtube.com/watch?v=example
Bicep Curl,Biceps,Dumbbells,,Isolation exercise for biceps,`

    const blob = new Blob([templateContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'workout-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const zoneClass = [
    'drop-zone',
    isDragOver && 'dragover',
    isLoading && 'loading',
    error && 'error',
    disabled && 'disabled'
  ].filter(Boolean).join(' ')

  return (
    <div
      className={zoneClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload CSV file"
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="drop-zone-input"
        aria-hidden="true"
        tabIndex={-1}
      />

      {isLoading ? (
        <div className="drop-zone-loading">
          <div className="drop-zone-spinner" />
          <span>Processing...</span>
        </div>
      ) : (
        <>
          <div className="drop-zone-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div className="drop-zone-text">
            {isDragOver ? (
              <span className="drop-zone-prompt">Drop to upload</span>
            ) : (
              <>
                <span className="drop-zone-prompt">Drag CSV file here or click to browse</span>
                <span className="drop-zone-hint">Accepts .csv files only</span>
              </>
            )}
          </div>

          {error && (
            <div className="drop-zone-error">
              {error}
            </div>
          )}

          <button
            type="button"
            className="drop-zone-template-link"
            onClick={handleDownloadTemplate}
          >
            Download CSV Template
          </button>
        </>
      )}
    </div>
  )
}

export default DropZone
