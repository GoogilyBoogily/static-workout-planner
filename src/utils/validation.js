/**
 * Form validation utilities for workout plans and exercises
 */

/**
 * Validate plan name
 * @param {string} name - Plan name to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validatePlanName(name) {
  if (!name || name.trim().length === 0) {
    return 'Plan name is required';
  }

  if (name.length > 100) {
    return 'Plan name must be 100 characters or less';
  }

  return null;
}

/**
 * Validate exercise data
 * @param {Object} exercise - Exercise object to validate
 * @param {string} exercise.name - Exercise name
 * @param {number|string} exercise.sets - Number of sets
 * @param {string} exercise.reps - Repetitions (flexible format)
 * @param {string} [exercise.weight] - Weight (optional)
 * @param {string} [exercise.rest] - Rest period (optional)
 * @returns {Object} Object with field-specific error messages, or empty object if valid
 */
export function validateExercise(exercise) {
  const errors = {};

  // Validate name
  if (!exercise.name || exercise.name.trim().length === 0) {
    errors.name = 'Exercise name is required';
  } else if (exercise.name.length > 100) {
    errors.name = 'Exercise name must be 100 characters or less';
  }

  // Validate sets
  const sets = parseInt(exercise.sets, 10);
  if (isNaN(sets)) {
    errors.sets = 'Sets must be a number';
  } else if (sets < 1) {
    errors.sets = 'Sets must be at least 1';
  } else if (sets > 20) {
    errors.sets = 'Sets must be 20 or less';
  }

  // Validate reps (just check it's not empty - allow flexible formats)
  if (!exercise.reps || exercise.reps.trim().length === 0) {
    errors.reps = 'Reps is required';
  }

  // Weight and rest are optional, no validation needed

  return errors;
}

/**
 * Check if an object has any validation errors
 * @param {Object} errors - Errors object from validation functions
 * @returns {boolean} True if there are errors, false if empty
 */
export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

/**
 * Validate a single tag quota object.
 * @param {Object} quota - Tag quota object { tag, count }
 * @param {Array<string>} availableTags - Array of available tag names from exercise pool
 * @returns {Array<string>} Array of error messages (empty if valid)
 */
export function validateTagQuota(quota, availableTags) {
  const errors = [];

  if (!quota.tag || quota.tag.trim() === '') {
    errors.push('Tag is required');
  } else if (!availableTags.includes(quota.tag)) {
    errors.push(`Tag "${quota.tag}" does not exist in exercise pool`);
  }

  if (!Number.isInteger(quota.count) || quota.count < 1) {
    errors.push('Count must be a positive integer');
  }

  return errors;
}

/**
 * Validate an array of tag quotas against exercise pool.
 *
 * FIXED H5: Distinguish critical errors from warnings
 *
 * @param {Array<{tag: string, count: number}>} quotas - Array of quota objects
 * @param {Object<string, Array>} exercisePool - Exercise pool grouped by tag
 * @returns {Object} Result with { valid: boolean, errors: Array<string>, warnings: Array<string> }
 */
export function validateQuotas(quotas, exercisePool) {
  const errors = [];    // Critical issues that block generation
  const warnings = [];  // Non-critical issues (user should know but can proceed)

  if (!quotas || quotas.length === 0) {
    errors.push('At least one quota is required');
    return { valid: false, errors, warnings };
  }

  const availableTags = Object.keys(exercisePool);

  quotas.forEach(({ tag, count }) => {
    // CRITICAL: Tag doesn't exist in pool at all
    if (!exercisePool[tag]) {
      errors.push(`Tag "${tag}" has no exercises in pool. Create workout plans with ${tag} exercises first.`);
      return;
    }

    // WARNING: Not enough exercises (will generate what's available)
    if (exercisePool[tag].length < count) {
      warnings.push(
        `Only ${exercisePool[tag].length} "${tag}" exercise${exercisePool[tag].length !== 1 ? 's' : ''} available (requested ${count}). Will use what's available.`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a quota template object.
 * @param {Object} template - Template object with { name, quotas }
 * @returns {Object} Result with { valid: boolean, errors: Array<string> }
 */
export function validateQuotaTemplate(template) {
  const errors = [];

  // Validate name
  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is required');
  } else if (template.name.length > 50) {
    errors.push('Template name must be 50 characters or less');
  }

  // Validate quotas array
  if (!template.quotas || template.quotas.length === 0) {
    errors.push('Template must have at least one quota');
  } else {
    // Validate each quota
    template.quotas.forEach((quota, idx) => {
      if (!quota.tag || quota.tag.trim() === '') {
        errors.push(`Quota ${idx + 1}: Tag is required`);
      }
      if (!Number.isInteger(quota.count) || quota.count < 1) {
        errors.push(`Quota ${idx + 1}: Count must be a positive integer`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
