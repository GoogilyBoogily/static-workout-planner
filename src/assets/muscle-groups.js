/**
 * Muscle Group Mapping
 *
 * Maps our application's muscle group names to @mjcdev/react-body-highlighter muscle names.
 * The library supports both male and female anatomical models.
 *
 * Supported muscles by @mjcdev/react-body-highlighter:
 * - Upper body: chest, trapezius, upper-back, lower-back, biceps, triceps,
 *   forearm, deltoids
 * - Core: abs, obliques
 * - Lower body: adductors, hamstring, quadriceps, calves, gluteal, tibialis
 * - Other: head, neck, hands, feet, ankles, knees, hair
 */

/**
 * Mapping from our muscle names to library muscle names
 * @type {Object.<string, string>}
 */
export const muscleNameMap = {
  // Our name → Library name
  'Chest': 'chest',
  'Shoulders': 'deltoids',  // Library uses unified 'deltoids' for all deltoid muscles
  'Biceps': 'biceps',
  'Forearms': 'forearm',
  'Abdominals': 'abs',
  'Quadriceps': 'quadriceps',
  'Back': 'upper-back',  // Combines upper and lower back
  'Trapezius': 'trapezius',
  'Triceps': 'triceps',
  'Glutes': 'gluteal',
  'Hamstrings': 'hamstring',
  'Calves': 'calves'
}

/**
 * Reverse mapping: library name → our name
 * Used when library returns muscle names
 * @type {Object.<string, string>}
 */
export const reverseMuscleNameMap = Object.fromEntries(
  Object.entries(muscleNameMap).map(([ourName, libName]) => [libName, ourName])
)

/**
 * Get library muscle name from our name
 * @param {string} ourName - Our muscle group name
 * @returns {string} Library muscle name
 */
export function getLibraryMuscleName(ourName) {
  return muscleNameMap[ourName] || ourName.toLowerCase()
}

/**
 * Get our muscle name from library name
 * @param {string} libName - Library muscle name
 * @returns {string} Our muscle group name
 */
export function getOurMuscleName(libName) {
  return reverseMuscleNameMap[libName] || libName
}

/**
 * Convert array of our muscle names to library names
 * @param {string[]} ourNames - Array of our muscle names
 * @returns {string[]} Array of library muscle names
 */
export function convertToLibraryNames(ourNames) {
  return ourNames.map(name => getLibraryMuscleName(name))
}

/**
 * All supported muscle groups in our application
 * @type {string[]}
 */
export const allMuscleGroups = Object.keys(muscleNameMap)
