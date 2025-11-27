import { useState } from 'react'
import { formatAbsoluteTime } from '../utils/dateFormat'
import './QuotaTemplateManager.css'

import type { QuotaTemplate } from '../types'

interface QuotaTemplateManagerProps {
  /** Array of saved quota templates */
  templates: QuotaTemplate[]
  /** Callback when template loaded */
  onLoad: (template: QuotaTemplate) => void
  /** Callback when template deleted */
  onDelete: (templateId: string) => void
}

/**
 * QuotaTemplateManager Component
 *
 * Manages saved quota templates - display, load, and delete.
 */
export default function QuotaTemplateManager({ templates, onLoad, onDelete }: QuotaTemplateManagerProps) {
  // T056: Track which template is pending deletion for confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // T054: Handle load template
  const handleLoadTemplate = (template: QuotaTemplate) => {
    onLoad(template)
  }

  // T055: Handle delete template with confirmation
  const handleDeleteClick = (templateId: string) => {
    setShowDeleteConfirm(templateId)
  }

  const handleConfirmDelete = (templateId: string) => {
    onDelete(templateId)
    setShowDeleteConfirm(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  // T053: Template list UI
  if (templates.length === 0) {
    return (
      <div className="template-manager">
        <h3>Saved Templates</h3>
        <div className="template-empty">
          No saved templates yet. Create quotas and click "Save as Template" to save them for quick reuse.
        </div>
      </div>
    )
  }

  return (
    <div className="template-manager">
      <h3>Saved Templates ({templates.length})</h3>
      <div className="template-list">
        {templates.map(template => (
          <div key={template.id} className="template-item">
            <div className="template-info">
              <div className="template-name">{template.name}</div>
              <div className="template-quotas">
                {template.quotas.map((q, idx) => (
                  <span key={idx} className="template-quota-badge">
                    {q.tag}: {q.count}
                  </span>
                ))}
              </div>
              <div className="template-date">
                Created: {formatAbsoluteTime(template.createdAt)}
              </div>
            </div>
            <div className="template-actions">
              <button
                type="button"
                onClick={() => handleLoadTemplate(template)}
                className="template-load-button"
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(template.id)}
                className="template-delete-button"
              >
                Delete
              </button>
            </div>

            {/* T055: Delete confirmation dialog */}
            {showDeleteConfirm === template.id && (
              <div className="template-delete-confirm">
                <p>Delete template "{template.name}"?</p>
                <div className="template-confirm-actions">
                  <button
                    type="button"
                    onClick={() => handleConfirmDelete(template.id)}
                    className="confirm-delete-button"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="confirm-cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
