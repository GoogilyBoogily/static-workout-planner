import { useState, useCallback, useMemo } from 'react'
import Papa from 'papaparse'
import './CSVUploader.css'
import DropZone from './DropZone'

import type {
  ParsedExercise,
  CSVExerciseRow,
  UploadPhase,
  ValidationIssue,
  ColumnMapping,
  EXPECTED_CSV_COLUMNS
} from '../../types'

const REQUIRED_COLUMNS = ['Exercise', 'Muscle Group'] as const
const OPTIONAL_COLUMNS = ['Equipment', 'Optional Equipment', 'Description', 'YouTube URL'] as const
const ALL_EXPECTED_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

interface CSVUploaderProps {
  onUploadComplete: (exercises: ParsedExercise[], headers: string[], rawData: Record<string, string>[]) => void
  onError: (message: string) => void
}

/**
 * CSVUploader Component
 *
 * Full-featured CSV upload experience with drag-and-drop, column mapping,
 * preview, and validation. Uses a state machine for clear flow management.
 */
function CSVUploader({ onUploadComplete, onError }: CSVUploaderProps) {
  // State machine
  const [phase, setPhase] = useState<UploadPhase>('idle')
  const [progress, setProgress] = useState(0)

  // File data
  const [fileName, setFileName] = useState<string | null>(null)
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawData, setRawData] = useState<Record<string, string>[]>([])

  // Column mapping
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [needsMapping, setNeedsMapping] = useState(false)

  // Parsed results
  const [parsedExercises, setParsedExercises] = useState<ParsedExercise[]>([])
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Check if headers need mapping (don't match expected format)
  const checkNeedsMapping = useCallback((headers: string[]): boolean => {
    const headerLower = headers.map(h => h.toLowerCase().trim())
    const requiredLower = REQUIRED_COLUMNS.map(c => c.toLowerCase())

    // Check if required columns exist (case-insensitive)
    for (const required of requiredLower) {
      if (!headerLower.includes(required)) {
        return true
      }
    }
    return false
  }, [])

  // Find best match for a header using simple fuzzy matching
  const findBestMatch = useCallback((header: string): string | null => {
    const headerLower = header.toLowerCase().trim()

    // Exact match (case-insensitive)
    for (const expected of ALL_EXPECTED_COLUMNS) {
      if (expected.toLowerCase() === headerLower) {
        return expected
      }
    }

    // Partial match
    for (const expected of ALL_EXPECTED_COLUMNS) {
      const expectedLower = expected.toLowerCase()
      if (headerLower.includes(expectedLower) || expectedLower.includes(headerLower)) {
        return expected
      }
    }

    return null
  }, [])

  // Initialize column mappings from headers
  const initializeColumnMappings = useCallback((headers: string[]): ColumnMapping[] => {
    return headers.map(header => ({
      csvHeader: header,
      mappedTo: findBestMatch(header)
    }))
  }, [findBestMatch])

  // Validate and parse exercises from raw data
  const parseExercises = useCallback((
    data: Record<string, string>[],
    mappings: ColumnMapping[]
  ): { exercises: ParsedExercise[]; issues: ValidationIssue[] } => {
    const exercises: ParsedExercise[] = []
    const issues: ValidationIssue[] = []

    // Create lookup from expected column to CSV header
    const columnLookup: Record<string, string> = {}
    for (const mapping of mappings) {
      if (mapping.mappedTo) {
        columnLookup[mapping.mappedTo] = mapping.csvHeader
      }
    }

    data.forEach((row, rowIndex) => {
      const exerciseHeader = columnLookup['Exercise']
      const muscleHeader = columnLookup['Muscle Group']
      const equipmentHeader = columnLookup['Equipment']
      const optionalEquipHeader = columnLookup['Optional Equipment']
      const descriptionHeader = columnLookup['Description']
      const youtubeHeader = columnLookup['YouTube URL']

      const name = exerciseHeader ? row[exerciseHeader]?.trim() : ''
      const muscleGroup = muscleHeader ? row[muscleHeader]?.trim() : ''

      // Validate required fields
      if (!name) {
        issues.push({
          rowIndex: rowIndex + 2, // +2 for 1-indexed and header row
          field: 'Exercise',
          message: 'Exercise name is empty',
          severity: 'error'
        })
        return
      }

      if (!muscleGroup) {
        issues.push({
          rowIndex: rowIndex + 2,
          field: 'Muscle Group',
          message: 'Muscle group is empty',
          severity: 'error'
        })
        return
      }

      // Parse optional fields
      const equipment = equipmentHeader && row[equipmentHeader]
        ? row[equipmentHeader].split(',').map(e => e.trim()).filter(e => e)
        : []

      const optionalEquipment = optionalEquipHeader && row[optionalEquipHeader]
        ? row[optionalEquipHeader].split(',').map(e => e.trim()).filter(e => e)
        : []

      const description = descriptionHeader ? row[descriptionHeader]?.trim() || '' : ''

      const youtubeUrl = youtubeHeader ? row[youtubeHeader]?.trim() || null : null

      // Validate YouTube URL format if provided
      if (youtubeUrl && !youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        issues.push({
          rowIndex: rowIndex + 2,
          field: 'YouTube URL',
          message: 'Invalid YouTube URL format',
          severity: 'warning'
        })
      }

      exercises.push({
        name,
        tags: muscleGroup.split(',').map(t => t.trim()).filter(t => t),
        description,
        equipment,
        optionalEquipment,
        youtubeUrl
      })
    })

    return { exercises, issues }
  }, [])

  // Handle file selection from DropZone
  const handleFileSelect = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Please upload a CSV file')
      setPhase('error')
      return
    }

    setFileName(file.name)
    setErrorMessage(null)
    setPhase('parsing')
    setProgress(0)

    Papa.parse<CSVExerciseRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setProgress(100)

        if (results.errors.length > 0) {
          setErrorMessage(`Error parsing CSV: ${results.errors[0]?.message}`)
          setPhase('error')
          return
        }

        if (!results.data || results.data.length === 0) {
          setErrorMessage('CSV file is empty')
          setPhase('error')
          return
        }

        const headers = results.meta.fields || []
        const data = results.data.filter(row =>
          Object.values(row).some(v => v && String(v).trim())
        ) as Record<string, string>[]

        setRawHeaders(headers)
        setRawData(data)

        // Check if column mapping is needed
        const mappingsNeeded = checkNeedsMapping(headers)
        const mappings = initializeColumnMappings(headers)
        setColumnMappings(mappings)

        if (mappingsNeeded) {
          // Check if any required columns are completely unmapped
          const hasUnmappedRequired = REQUIRED_COLUMNS.some(required =>
            !mappings.some(m => m.mappedTo === required)
          )

          if (hasUnmappedRequired) {
            setNeedsMapping(true)
            setPhase('mapping')
            return
          }
        }

        // Headers match - proceed to preview
        const { exercises, issues } = parseExercises(data, mappings)
        setParsedExercises(exercises)
        setValidationIssues(issues)
        setPhase('preview')
      },
      error: (parseError) => {
        setErrorMessage(`Error parsing CSV: ${parseError.message}`)
        setPhase('error')
      }
    })
  }, [checkNeedsMapping, initializeColumnMappings, parseExercises])

  // Handle column mapping change
  const handleMappingChange = useCallback((csvHeader: string, mappedTo: string | null) => {
    setColumnMappings(prev =>
      prev.map(m =>
        m.csvHeader === csvHeader ? { ...m, mappedTo } : m
      )
    )
  }, [])

  // Apply column mappings and proceed to preview
  const handleApplyMappings = useCallback(() => {
    // Check required columns are mapped
    const hasAllRequired = REQUIRED_COLUMNS.every(required =>
      columnMappings.some(m => m.mappedTo === required)
    )

    if (!hasAllRequired) {
      setErrorMessage('Please map all required columns (Exercise, Muscle Group)')
      return
    }

    setErrorMessage(null)
    const { exercises, issues } = parseExercises(rawData, columnMappings)
    setParsedExercises(exercises)
    setValidationIssues(issues)
    setPhase('preview')
  }, [columnMappings, rawData, parseExercises])

  // Confirm import
  const handleConfirmImport = useCallback(() => {
    setPhase('success')

    // Notify parent after brief delay for animation
    setTimeout(() => {
      onUploadComplete(parsedExercises, rawHeaders, rawData)
    }, 500)
  }, [parsedExercises, rawHeaders, rawData, onUploadComplete])

  // Cancel and reset
  const handleCancel = useCallback(() => {
    setPhase('idle')
    setFileName(null)
    setRawHeaders([])
    setRawData([])
    setColumnMappings([])
    setNeedsMapping(false)
    setParsedExercises([])
    setValidationIssues([])
    setErrorMessage(null)
    setProgress(0)
  }, [])

  // Retry after error
  const handleRetry = useCallback(() => {
    handleCancel()
  }, [handleCancel])

  // Summary stats
  const errorCount = useMemo(() =>
    validationIssues.filter(i => i.severity === 'error').length,
    [validationIssues]
  )
  const warningCount = useMemo(() =>
    validationIssues.filter(i => i.severity === 'warning').length,
    [validationIssues]
  )

  return (
    <div className="csv-uploader">
      {/* Idle - Show DropZone */}
      {phase === 'idle' && (
        <DropZone
          onFileSelect={handleFileSelect}
          isLoading={false}
          error={null}
        />
      )}

      {/* Parsing - Show progress */}
      {phase === 'parsing' && (
        <div className="csv-uploader-parsing">
          <h3 className="upload-section-header">Processing File</h3>
          <div className="upload-file-name">{fileName}</div>
          <div className="upload-progress">
            <div
              className="upload-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="upload-progress-text">Parsing exercises... ({progress}%)</div>
        </div>
      )}

      {/* Mapping - Column mapping UI */}
      {phase === 'mapping' && (
        <div className="csv-uploader-mapping">
          <h3 className="upload-section-header">Column Mapping</h3>
          <p className="upload-mapping-intro">
            Some columns couldn't be automatically matched. Please map them to the expected fields.
          </p>

          {errorMessage && (
            <div className="upload-error-inline">{errorMessage}</div>
          )}

          <div className="column-mapping-grid">
            {columnMappings.map((mapping) => (
              <div key={mapping.csvHeader} className="column-mapping-row">
                <span className="column-mapping-source">{mapping.csvHeader}</span>
                <span className="column-mapping-arrow">→</span>
                <select
                  className="column-mapping-select"
                  value={mapping.mappedTo || ''}
                  onChange={(e) => handleMappingChange(mapping.csvHeader, e.target.value || null)}
                >
                  <option value="">-- Skip --</option>
                  {ALL_EXPECTED_COLUMNS.map(col => (
                    <option key={col} value={col}>
                      {col}
                      {REQUIRED_COLUMNS.includes(col as typeof REQUIRED_COLUMNS[number]) ? ' *' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <p className="upload-mapping-hint">
            * Required columns
          </p>

          <div className="upload-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={handleApplyMappings}
            >
              Apply & Preview
            </button>
          </div>
        </div>
      )}

      {/* Preview - Show parsed exercises and validation */}
      {phase === 'preview' && (
        <div className="csv-uploader-preview">
          <h3 className="upload-section-header">Preview Import</h3>
          <div className="upload-file-name">{fileName}</div>

          {/* Stats */}
          <div className="upload-stats">
            <div className="upload-stat upload-stat-success">
              <span className="upload-stat-value">{parsedExercises.length}</span>
              <span className="upload-stat-label">exercises ready</span>
            </div>
            {errorCount > 0 && (
              <div className="upload-stat upload-stat-error">
                <span className="upload-stat-value">{errorCount}</span>
                <span className="upload-stat-label">rows skipped</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="upload-stat upload-stat-warning">
                <span className="upload-stat-value">{warningCount}</span>
                <span className="upload-stat-label">warnings</span>
              </div>
            )}
          </div>

          {/* Validation Issues */}
          {validationIssues.length > 0 && (
            <details className="upload-validation-details">
              <summary className="upload-validation-summary">
                {errorCount + warningCount} issues found (click to expand)
              </summary>
              <div className="upload-validation-list">
                {validationIssues.slice(0, 10).map((issue, idx) => (
                  <div
                    key={idx}
                    className={`upload-validation-item validation-${issue.severity}`}
                  >
                    <span className="validation-row">Row {issue.rowIndex}</span>
                    <span className="validation-field">{issue.field}</span>
                    <span className="validation-message">{issue.message}</span>
                  </div>
                ))}
                {validationIssues.length > 10 && (
                  <div className="upload-validation-more">
                    + {validationIssues.length - 10} more issues
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Preview Grid */}
          <div className="upload-preview-grid">
            {parsedExercises.slice(0, 6).map((exercise, idx) => (
              <div key={idx} className="upload-preview-card">
                <div className="preview-card-name">{exercise.name}</div>
                <div className="preview-card-tags">
                  {exercise.tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="preview-tag">{tag}</span>
                  ))}
                </div>
                {exercise.equipment.length > 0 && (
                  <div className="preview-card-equipment">
                    {exercise.equipment.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {parsedExercises.length > 6 && (
            <div className="upload-preview-more">
              + {parsedExercises.length - 6} more exercises
            </div>
          )}

          <div className="upload-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={handleConfirmImport}
              disabled={parsedExercises.length === 0}
            >
              Import {parsedExercises.length} Exercises
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {phase === 'success' && (
        <div className="csv-uploader-success">
          <div className="upload-success-icon">✓</div>
          <div className="upload-success-text">
            Successfully imported {parsedExercises.length} exercises!
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="csv-uploader-error">
          <div className="upload-error-icon">!</div>
          <div className="upload-error-message">{errorMessage}</div>
          <button
            type="button"
            className="button-primary"
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  )
}

export default CSVUploader
