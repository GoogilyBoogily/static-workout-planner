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
