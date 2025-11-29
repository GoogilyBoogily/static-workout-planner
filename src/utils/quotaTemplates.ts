/**
 * Quota Template Storage Utilities
 *
 * Manages localStorage persistence for workout quota templates.
 * Templates allow users to save and reuse muscle group quota configurations.
 *
 * @module quotaTemplates
 */

import type {
  QuotaTemplate,
  TagQuota,
  StorageResult,
  AddTemplateResult,
  MuscleQuotaTemplate,
  MuscleQuota
} from '../types'

const STORAGE_KEY = 'workout-quota-templates'

/**
 * Result type for muscle template operations
 */
interface AddMuscleTemplateResult extends StorageResult {
  template?: MuscleQuotaTemplate
}

/**
 * Migrate old TagQuota templates to MuscleQuota format.
 * Converts `tag` to `muscleGroup` and adds `isCircuit: false`.
 *
 * @param templates - Array of potentially old-format templates
 * @returns Array of migrated MuscleQuotaTemplate objects
 */
function migrateTemplates(templates: unknown[]): MuscleQuotaTemplate[] {
  return templates.map(template => {
    const t = template as Record<string, unknown>

    // Handle quotas - convert tag to muscleGroup if needed
    const rawQuotas = t.quotas as Array<{
      tag?: string
      muscleGroup?: string
      count: number
    }> ?? []

    const migratedQuotas: MuscleQuota[] = rawQuotas.map(q => ({
      muscleGroup: q.muscleGroup ?? q.tag ?? '',
      count: q.count
    }))

    const result: MuscleQuotaTemplate = {
      id: (t.id as string) ?? crypto.randomUUID(),
      name: (t.name as string) ?? 'Unnamed Template',
      quotas: migratedQuotas,
      isCircuit: (t.isCircuit as boolean) ?? false,
      createdAt: (t.createdAt as number) ?? Date.now()
    }

    // Preserve roundCount if it exists
    if (typeof t.roundCount === 'number') {
      result.roundCount = t.roundCount
    }

    return result
  })
}

export const QuotaTemplateStorage = {
  /**
   * Load all quota templates from localStorage.
   * Automatically migrates old tag-based templates to muscle group format.
   * Returns empty array if no templates exist or on parse error.
   *
   * @returns Array of muscle quota template objects
   *
   * @example
   * const templates = QuotaTemplateStorage.loadTemplates();
   * // Returns: [{ id: '...', name: 'Full Body', quotas: [...], isCircuit: false, createdAt: 1234567890 }]
   */
  loadTemplates(): MuscleQuotaTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) {
        return []
      }

      const templates = JSON.parse(data) as unknown

      // Validate structure (defensive)
      if (!Array.isArray(templates)) {
        console.error('Invalid quota templates format: expected array')
        return []
      }

      // Migrate old format to new format
      return migrateTemplates(templates)
    } catch (error) {
      console.error('Failed to load quota templates:', error)
      return []
    }
  },

  /**
   * Save quota templates to localStorage.
   * Handles QuotaExceededError and JSON serialization errors.
   *
   * @param templates - Array of template objects to save
   * @returns Result object with { success: boolean, error?: string, message?: string }
   *
   * @example
   * const result = QuotaTemplateStorage.saveTemplates(updatedTemplates);
   * if (!result.success) {
   *   alert(result.message);
   * }
   */
  saveTemplates(templates: MuscleQuotaTemplate[]): StorageResult {
    try {
      const data = JSON.stringify(templates)
      localStorage.setItem(STORAGE_KEY, data)
      return { success: true }
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        return {
          success: false,
          error: 'quota',
          message: 'Storage limit reached. Delete old templates or plans to free space.'
        }
      }

      console.error('Failed to save quota templates:', error)
      return {
        success: false,
        error: 'unknown',
        message: 'Failed to save quota templates. Please try again.'
      }
    }
  },

  /**
   * Check if localStorage is available.
   * Returns false in private browsing mode or when localStorage is disabled.
   *
   * @returns True if localStorage is available
   *
   * @example
   * if (!QuotaTemplateStorage.isAvailable()) {
   *   alert('Quota templates will not be saved (private browsing mode)');
   * }
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  /**
   * Add a new muscle quota template.
   * Generates UUID and timestamp automatically.
   *
   * @param name - Template name (1-50 chars)
   * @param quotas - Muscle quota array
   * @param isCircuit - Whether this is a circuit workout template
   * @param roundCount - Optional number of rounds for circuit mode
   * @returns Result with { success: boolean, template?: MuscleQuotaTemplate, error?: string, message?: string }
   *
   * @example
   * const result = QuotaTemplateStorage.addTemplate('Upper Body', [
   *   { muscleGroup: 'Chest', count: 4 },
   *   { muscleGroup: 'Shoulders', count: 3 }
   * ], false);
   */
  addTemplate(name: string, quotas: MuscleQuota[], isCircuit: boolean = false, roundCount?: number): AddMuscleTemplateResult {
    const templates = this.loadTemplates()

    const newTemplate: MuscleQuotaTemplate = {
      id: crypto.randomUUID(),
      name,
      quotas,
      isCircuit,
      roundCount,
      createdAt: Date.now()
    }

    templates.push(newTemplate)

    const result = this.saveTemplates(templates)

    if (result.success) {
      return {
        success: true,
        template: newTemplate
      }
    }

    return result
  },

  /**
   * Delete a quota template by ID.
   *
   * @param templateId - UUID of template to delete
   * @returns Result with { success: boolean, error?: string, message?: string }
   *
   * @example
   * const result = QuotaTemplateStorage.deleteTemplate('template-id-123');
   */
  deleteTemplate(templateId: string): StorageResult {
    const templates = this.loadTemplates()
    const filtered = templates.filter(t => t.id !== templateId)

    if (filtered.length === templates.length) {
      return {
        success: false,
        error: 'not_found',
        message: 'Template not found'
      }
    }

    return this.saveTemplates(filtered)
  }
}
