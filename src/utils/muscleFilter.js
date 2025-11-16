/**
 * Muscle Group Filtering Utilities
 *
 * Provides functions to filter exercises by targeted muscle groups
 * using OR logic for comma-separated muscle matching.
 */

/**
 * Known muscle groups from the diagram
 * Maps to our application's muscle naming (case-insensitive)
 * @type {string[]}
 */
const KNOWN_MUSCLES = [
  'chest', 'shoulders', 'biceps', 'forearms', 'abdominals', 'quadriceps',
  'back', 'trapezius', 'triceps', 'glutes', 'hamstrings', 'calves',
  // Also accept library names for flexibility
  'deltoids', 'abs', 'upper-back', 'gluteal', 'hamstring', 'forearm'
]

/**
 * Filter exercises by selected muscle groups
 *
 * @param {Array} exercises - Array of exercise objects from CSV
 * @param {string[]} selectedMuscles - Array of selected muscle names
 * @returns {Array} Filtered exercises that target any of the selected muscles
 *
 * @example
 * filterExercisesByMuscles(exercises, ['Chest', 'Shoulders'])
 * // Returns exercises that target Chest OR Shoulders
 */
export function filterExercisesByMuscles(exercises, selectedMuscles) {
  // If no muscles selected, return all exercises
  if (!selectedMuscles || selectedMuscles.length === 0) {
    return exercises
  }

  // Normalize selected muscles for case-insensitive comparison
  const normalizedSelected = selectedMuscles.map(m => m.toLowerCase().trim())

  return exercises.filter(exercise => {
    // Skip exercises without muscle data (FR-013: handle missing data)
    if (!exercise['Muscle Group'] && !exercise.Muscles) {
      console.warn(`Exercise "${exercise.Exercise}" has no muscle group data`)
      return false
    }

    // Support both "Muscle Group" and "Muscles" column names
    const muscleData = exercise['Muscle Group'] || exercise.Muscles || ''

    // Parse comma-separated muscle groups
    const targetedMuscles = muscleData
      .split(',')
      .map(m => m.trim().toLowerCase())
      .filter(m => m.length > 0)

    // T035: Warn for unknown muscle names
    targetedMuscles.forEach(muscle => {
      if (!KNOWN_MUSCLES.includes(muscle)) {
        console.warn(`Unknown muscle "${muscle}" in exercise "${exercise.Exercise || exercise.name}"`)
      }
    })

    // OR logic: match if ANY selected muscle is targeted
    return normalizedSelected.some(selected =>
      targetedMuscles.includes(selected)
    )
  })
}
