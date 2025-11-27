/**
 * Muscle Group Filtering Utilities
 *
 * Provides functions to filter exercises by targeted muscle groups
 * using OR logic for comma-separated muscle matching.
 */

import type { ParsedExercise } from '../types'

/**
 * Known muscle groups from the diagram
 * Maps to our application's muscle naming (case-insensitive)
 */
const KNOWN_MUSCLES: string[] = [
  'chest', 'shoulders', 'biceps', 'forearms', 'abdominals', 'quadriceps',
  'back', 'trapezius', 'triceps', 'glutes', 'hamstrings', 'calves',
  // Also accept library names for flexibility
  'deltoids', 'abs', 'upper-back', 'gluteal', 'hamstring', 'forearm'
]

/**
 * Filter exercises by selected muscle groups
 *
 * @param exercises - Array of exercise objects from CSV
 * @param selectedMuscles - Array of selected muscle names
 * @returns Filtered exercises that target any of the selected muscles
 *
 * @example
 * filterExercisesByMuscles(exercises, ['Chest', 'Shoulders'])
 * // Returns exercises that target Chest OR Shoulders
 */
export function filterExercisesByMuscles(
  exercises: ParsedExercise[],
  selectedMuscles: string[]
): ParsedExercise[] {
  // If no muscles selected, return all exercises
  if (!selectedMuscles || selectedMuscles.length === 0) {
    return exercises
  }

  // Normalize selected muscles for case-insensitive comparison
  const normalizedSelected = selectedMuscles.map(m => m.toLowerCase().trim())

  return exercises.filter(exercise => {
    // Skip exercises without muscle data (FR-013: handle missing data)
    if (!exercise.tags || !Array.isArray(exercise.tags) || exercise.tags.length === 0) {
      console.warn(`Exercise "${exercise.name}" has no muscle group data`)
      return false
    }

    // Normalize exercise tags for case-insensitive comparison
    const targetedMuscles = exercise.tags
      .map(m => m.trim().toLowerCase())
      .filter(m => m.length > 0)

    // T035: Warn for unknown muscle names
    targetedMuscles.forEach(muscle => {
      if (!KNOWN_MUSCLES.includes(muscle)) {
        console.warn(`Unknown muscle "${muscle}" in exercise "${exercise.name}"`)
      }
    })

    // OR logic: match if ANY selected muscle is targeted
    return normalizedSelected.some(selected =>
      targetedMuscles.includes(selected)
    )
  })
}
