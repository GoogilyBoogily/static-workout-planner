/**
 * Form validation utilities for workout plans and exercises
 */

import type {
  PlanExercise,
  TagQuota,
  ExercisePool,
  ValidationErrors,
  QuotaValidationResult,
  TemplateValidationResult,
  MuscleQuota,
  ParsedExercise
} from '../types'

/**
 * Validate plan name
 * @param name - Plan name to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePlanName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Plan name is required'
  }

  if (name.length > 100) {
    return 'Plan name must be 100 characters or less'
  }

  return null
}

/**
 * Partial exercise data for validation
 */
interface ExerciseInput {
  name?: string
  tag?: string
  sets?: number | string
  reps?: string
  weight?: string
  rest?: string
}

/**
 * Validate exercise data
 * @param exercise - Exercise object to validate
 * @returns Object with field-specific error messages, or empty object if valid
 */
export function validateExercise(exercise: ExerciseInput): ValidationErrors {
  const errors: ValidationErrors = {}

  // Validate name
  if (!exercise.name || exercise.name.trim().length === 0) {
    errors.name = 'Exercise name is required'
  } else if (exercise.name.length > 100) {
    errors.name = 'Exercise name must be 100 characters or less'
  }

  // Validate sets
  const sets = typeof exercise.sets === 'string'
    ? parseInt(exercise.sets, 10)
    : exercise.sets
  if (sets === undefined || isNaN(sets)) {
    errors.sets = 'Sets must be a number'
  } else if (sets < 1) {
    errors.sets = 'Sets must be at least 1'
  } else if (sets > 20) {
    errors.sets = 'Sets must be 20 or less'
  }

  // Validate reps (just check it's not empty - allow flexible formats)
  if (!exercise.reps || exercise.reps.trim().length === 0) {
    errors.reps = 'Reps is required'
  }

  // Weight and rest are optional, no validation needed

  return errors
}

/**
 * Check if an object has any validation errors
 * @param errors - Errors object from validation functions
 * @returns True if there are errors, false if empty
 */
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Validate a single tag quota object.
 * @param quota - Tag quota object { tag, count }
 * @param availableTags - Array of available tag names from exercise pool
 * @returns Array of error messages (empty if valid)
 */
export function validateTagQuota(quota: TagQuota, availableTags: string[]): string[] {
  const errors: string[] = []

  if (!quota.tag || quota.tag.trim() === '') {
    errors.push('Tag is required')
  } else if (!availableTags.includes(quota.tag)) {
    errors.push(`Tag "${quota.tag}" does not exist in exercise pool`)
  }

  if (!Number.isInteger(quota.count) || quota.count < 1) {
    errors.push('Count must be a positive integer')
  }

  return errors
}

/**
 * Validate an array of tag quotas against exercise pool.
 *
 * FIXED H5: Distinguish critical errors from warnings
 *
 * @param quotas - Array of quota objects
 * @param exercisePool - Exercise pool grouped by tag
 * @returns Result with { valid: boolean, errors: Array<string>, warnings: Array<string> }
 */
export function validateQuotas(
  quotas: TagQuota[],
  exercisePool: ExercisePool
): QuotaValidationResult {
  const errors: string[] = []    // Critical issues that block generation
  const warnings: string[] = []  // Non-critical issues (user should know but can proceed)

  if (!quotas || quotas.length === 0) {
    errors.push('At least one quota is required')
    return { valid: false, errors, warnings }
  }

  quotas.forEach(({ tag, count }) => {
    // CRITICAL: Tag doesn't exist in pool at all
    if (!exercisePool[tag]) {
      errors.push(`Tag "${tag}" has no exercises in pool. Create workout plans with ${tag} exercises first.`)
      return
    }

    // WARNING: Not enough exercises (will generate what's available)
    if (exercisePool[tag].length < count) {
      warnings.push(
        `Only ${exercisePool[tag].length} "${tag}" exercise${exercisePool[tag].length !== 1 ? 's' : ''} available (requested ${count}). Will use what's available.`
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate muscle quotas against CSV exercise library.
 *
 * @param quotas - Array of muscle quota objects
 * @param exercises - Parsed exercises from CSV library
 * @returns Result with { valid: boolean, errors: Array<string>, warnings: Array<string> }
 */
export function validateMuscleQuotas(
  quotas: MuscleQuota[],
  exercises: ParsedExercise[]
): QuotaValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!quotas || quotas.length === 0) {
    errors.push('At least one muscle group quota is required')
    return { valid: false, errors, warnings }
  }

  // Build muscle group counts from exercises
  const muscleCounts: Record<string, number> = {}
  exercises.forEach(ex => {
    ex.tags?.forEach(tag => {
      const normalized = tag.trim()
      if (normalized) {
        muscleCounts[normalized] = (muscleCounts[normalized] ?? 0) + 1
      }
    })
  })

  quotas.forEach(({ muscleGroup, count }) => {
    // Validate muscleGroup is provided
    if (!muscleGroup || muscleGroup.trim() === '') {
      errors.push('Muscle group is required')
      return
    }

    // Validate count is positive integer within reasonable bounds
    const MAX_EXERCISES_PER_MUSCLE = 50
    if (!Number.isInteger(count) || count < 1) {
      errors.push(`Count for "${muscleGroup}" must be a positive integer`)
      return
    }
    if (count > MAX_EXERCISES_PER_MUSCLE) {
      errors.push(`Count for "${muscleGroup}" cannot exceed ${MAX_EXERCISES_PER_MUSCLE}`)
      return
    }

    const available = muscleCounts[muscleGroup] ?? 0

    // CRITICAL: Muscle group doesn't exist in library
    if (available === 0) {
      errors.push(`No exercises found for muscle group "${muscleGroup}"`)
      return
    }

    // WARNING: Not enough exercises (will generate what's available)
    if (available < count) {
      warnings.push(
        `Only ${available} "${muscleGroup}" exercise${available !== 1 ? 's' : ''} available (requested ${count}). Will use what's available.`
      )
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate a quota template object.
 * @param template - Template object with { name, quotas }
 * @returns Result with { valid: boolean, errors: Array<string> }
 */
export function validateQuotaTemplate(template: {
  name?: string
  quotas?: TagQuota[]
}): TemplateValidationResult {
  const errors: string[] = []

  // Validate name
  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required')
  } else if (template.name.length > 50) {
    errors.push('Template name must be 50 characters or less')
  }

  // Validate quotas array
  if (!template.quotas || template.quotas.length === 0) {
    errors.push('Template must have at least one quota')
  } else {
    // Validate each quota
    template.quotas.forEach((quota, idx) => {
      if (!quota.tag || quota.tag.trim() === '') {
        errors.push(`Quota ${idx + 1}: Tag is required`)
      }
      if (!Number.isInteger(quota.count) || quota.count < 1) {
        errors.push(`Quota ${idx + 1}: Count must be a positive integer`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
