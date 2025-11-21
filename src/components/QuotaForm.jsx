import { useState } from 'react';
import { validateQuotas } from '../utils/validation';
import QuotaTemplateManager from './QuotaTemplateManager';
import './QuotaForm.css';

/**
 * QuotaForm Component
 *
 * Modal form for configuring tag quotas to generate random workout plans.
 * Allows users to specify how many exercises of each tag they want.
 *
 * @param {Object} props
 * @param {Array<string>} props.availableTags - Tags from exercise pool
 * @param {Object} props.exercisePool - Exercise pool grouped by tag
 * @param {Array} props.quotaTemplates - Saved quota templates
 * @param {Function} props.onGenerate - Callback when "Generate" clicked: (quotas) => void
 * @param {Function} props.onCancel - Callback when cancelled
 * @param {Function} props.onSaveTemplate - Callback to save template: (name, quotas) => void
 * @param {Function} props.onDeleteTemplate - Callback to delete template: (templateId) => void
 */
export default function QuotaForm({
  availableTags,
  exercisePool,
  quotaTemplates = [],
  onGenerate,
  onCancel,
  onSaveTemplate,
  onDeleteTemplate
}) {
  // Quota state: array of { tag, count } objects
  const [quotas, setQuotas] = useState([]);

  // Selected template (for loading saved configurations)
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // FIXED H5: Separate validation errors and warnings
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationWarnings, setValidationWarnings] = useState([]);

  // Show template save UI
  const [showTemplateSave, setShowTemplateSave] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // T070: Loading state for generation
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Add a new empty quota row
   *
   * FIXED M3: Prevent duplicate tags by selecting first unused tag
   */
  const handleAddQuota = () => {
    // Find tags that are already in use
    const usedTags = new Set(quotas.map(q => q.tag));

    // Find first unused tag
    const unusedTag = availableTags.find(tag => !usedTags.has(tag));

    if (!unusedTag) {
      alert('All available muscle groups have been added to the quota list.');
      return;
    }

    setQuotas([...quotas, { tag: unusedTag, count: 1 }]);
    setValidationErrors([]); // Clear errors when user makes changes
    setValidationWarnings([]); // Clear warnings too
  };

  /**
   * Remove a quota row by index
   */
  const handleRemoveQuota = (index) => {
    const updated = quotas.filter((_, i) => i !== index);
    setQuotas(updated);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  /**
   * Update a quota's tag
   */
  const handleTagChange = (index, newTag) => {
    const updated = [...quotas];
    updated[index].tag = newTag;
    setQuotas(updated);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  /**
   * Update a quota's count
   */
  const handleCountChange = (index, newCount) => {
    const updated = [...quotas];
    updated[index].count = parseInt(newCount, 10) || 1;
    setQuotas(updated);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  /**
   * Validate quotas and generate workout
   *
   * FIXED H1: Use requestAnimationFrame to ensure UI update before heavy computation
   * FIXED H5: Handle both errors and warnings from validation
   */
  const handleGenerate = () => {
    const { valid, errors, warnings } = validateQuotas(quotas, exercisePool);

    // Show errors (blocking) and warnings (non-blocking)
    setValidationErrors(errors || []);
    setValidationWarnings(warnings || []);

    if (!valid) {
      // Errors prevent generation
      return;
    }

    // FIXED H1: Set loading state with proper async handling
    setIsGenerating(true);

    // Use requestAnimationFrame + setTimeout to ensure UI paint happens
    // requestAnimationFrame schedules after current frame
    // setTimeout schedules after next event loop tick
    requestAnimationFrame(() => {
      setTimeout(() => {
        onGenerate(quotas);
        setIsGenerating(false);
      }, 0);
    });
  };

  /**
   * Load a saved quota template (T063)
   */
  const handleLoadTemplate = (template) => {
    setQuotas([...template.quotas]);
    setSelectedTemplate(template);
    setValidationErrors([]);
    setValidationWarnings([]);
  };

  /**
   * Delete a quota template
   */
  const handleDeleteTemplate = (templateId) => {
    onDeleteTemplate(templateId);
    // Clear selected template if it was the one deleted
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  /**
   * Show template save input
   */
  const handleShowTemplateSave = () => {
    setShowTemplateSave(true);
  };

  /**
   * Save current quotas as a template
   */
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Template name is required');
      return;
    }

    if (quotas.length === 0) {
      alert('Add at least one quota before saving template');
      return;
    }

    onSaveTemplate(templateName, quotas);

    // Reset template save UI
    setShowTemplateSave(false);
    setTemplateName('');
  };

  return (
    <div className="quota-form-modal-overlay" onClick={onCancel}>
      <div className="quota-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Generate Random Workout</h2>

        {/* T057: Integrate QuotaTemplateManager */}
        {quotaTemplates.length > 0 && (
          <QuotaTemplateManager
            templates={quotaTemplates}
            onLoad={handleLoadTemplate}
            onDelete={handleDeleteTemplate}
          />
        )}

        {/* Quota inputs */}
        <div className="quota-form-section">
          <h3>Tag Quotas</h3>
          <p className="quota-form-hint">
            Specify how many exercises you want for each muscle group
          </p>

          {quotas.map((quota, index) => (
            <div key={index} className="quota-form-row">
              <select
                value={quota.tag}
                onChange={(e) => handleTagChange(index, e.target.value)}
                className="quota-tag-select"
              >
                {availableTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag} ({exercisePool[tag]?.length || 0} available)
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={quota.count}
                onChange={(e) => handleCountChange(index, e.target.value)}
                className="quota-count-input"
              />

              <button
                type="button"
                onClick={() => handleRemoveQuota(index)}
                className="quota-remove-button"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddQuota}
            className="quota-add-button"
            disabled={availableTags.length === 0}
          >
            Add Tag
          </button>

          {availableTags.length === 0 && (
            <p className="quota-form-warning">
              No exercises in pool. Create workout plans first.
            </p>
          )}
        </div>

        {/* FIXED H5: Display both errors and warnings */}
        {validationErrors.length > 0 && (
          <div className="quota-form-errors">
            {validationErrors.map((error, idx) => (
              <div key={idx} className="quota-form-error">
                ❌ {error}
              </div>
            ))}
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="quota-form-warnings">
            {validationWarnings.map((warning, idx) => (
              <div key={idx} className="quota-form-warning">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}

        {/* Template save UI */}
        {showTemplateSave && (
          <div className="quota-form-section">
            <h3>Save as Template</h3>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="quota-template-name-input"
            />
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="quota-save-template-button"
            >
              Save Template
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="quota-form-actions">
          <button
            type="button"
            onClick={handleGenerate}
            className="quota-generate-button"
            disabled={quotas.length === 0 || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Workout'}
          </button>

          {!showTemplateSave && quotas.length > 0 && (
            <button
              type="button"
              onClick={handleShowTemplateSave}
              className="quota-show-save-button"
            >
              Save as Template
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="quota-cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
