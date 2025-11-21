/**
 * Quota Template Storage Utilities
 *
 * Manages localStorage persistence for workout quota templates.
 * Templates allow users to save and reuse tag quota configurations.
 *
 * @module quotaTemplates
 */

const STORAGE_KEY = 'workout-quota-templates';

/**
 * QuotaTemplateStorage object for CRUD operations on quota templates.
 *
 * @typedef {Object} QuotaTemplate
 * @property {string} id - UUID v4 identifier
 * @property {string} name - User-provided template name (1-50 chars)
 * @property {Array<{tag: string, count: number}>} quotas - Tag quota configuration
 * @property {number} createdAt - Unix timestamp (milliseconds)
 */

export const QuotaTemplateStorage = {
  /**
   * Load all quota templates from localStorage.
   * Returns empty array if no templates exist or on parse error.
   *
   * @returns {Array<QuotaTemplate>} Array of quota template objects
   *
   * @example
   * const templates = QuotaTemplateStorage.loadTemplates();
   * // Returns: [{ id: '...', name: 'Full Body', quotas: [...], createdAt: 1234567890 }]
   */
  loadTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const templates = JSON.parse(data);

      // Validate structure (defensive)
      if (!Array.isArray(templates)) {
        console.error('Invalid quota templates format: expected array');
        return [];
      }

      return templates;
    } catch (error) {
      console.error('Failed to load quota templates:', error);
      return [];
    }
  },

  /**
   * Save quota templates to localStorage.
   * Handles QuotaExceededError and JSON serialization errors.
   *
   * @param {Array<QuotaTemplate>} templates - Array of template objects to save
   * @returns {Object} Result object with { success: boolean, error?: string, message?: string }
   *
   * @example
   * const result = QuotaTemplateStorage.saveTemplates(updatedTemplates);
   * if (!result.success) {
   *   alert(result.message);
   * }
   */
  saveTemplates(templates) {
    try {
      const data = JSON.stringify(templates);
      localStorage.setItem(STORAGE_KEY, data);
      return { success: true };
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'quota',
          message: 'Storage limit reached. Delete old templates or plans to free space.'
        };
      }

      console.error('Failed to save quota templates:', error);
      return {
        success: false,
        error: 'unknown',
        message: 'Failed to save quota templates. Please try again.'
      };
    }
  },

  /**
   * Check if localStorage is available.
   * Returns false in private browsing mode or when localStorage is disabled.
   *
   * @returns {boolean} True if localStorage is available
   *
   * @example
   * if (!QuotaTemplateStorage.isAvailable()) {
   *   alert('Quota templates will not be saved (private browsing mode)');
   * }
   */
  isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Add a new quota template.
   * Generates UUID and timestamp automatically.
   *
   * @param {string} name - Template name (1-50 chars)
   * @param {Array<{tag: string, count: number}>} quotas - Tag quota array
   * @returns {Object} Result with { success: boolean, template?: QuotaTemplate, error?: string, message?: string }
   *
   * @example
   * const result = QuotaTemplateStorage.addTemplate('Upper Body', [
   *   { tag: 'Chest', count: 4 },
   *   { tag: 'Shoulders', count: 3 }
   * ]);
   */
  addTemplate(name, quotas) {
    const templates = this.loadTemplates();

    const newTemplate = {
      id: crypto.randomUUID(),
      name,
      quotas,
      createdAt: Date.now()
    };

    templates.push(newTemplate);

    const result = this.saveTemplates(templates);

    if (result.success) {
      return {
        success: true,
        template: newTemplate
      };
    }

    return result;
  },

  /**
   * Delete a quota template by ID.
   *
   * @param {string} templateId - UUID of template to delete
   * @returns {Object} Result with { success: boolean, error?: string, message?: string }
   *
   * @example
   * const result = QuotaTemplateStorage.deleteTemplate('template-id-123');
   */
  deleteTemplate(templateId) {
    const templates = this.loadTemplates();
    const filtered = templates.filter(t => t.id !== templateId);

    if (filtered.length === templates.length) {
      return {
        success: false,
        error: 'not_found',
        message: 'Template not found'
      };
    }

    return this.saveTemplates(filtered);
  }
};
