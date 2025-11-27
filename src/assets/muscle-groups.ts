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

import type { MuscleSlug, MuscleGroupName, MuscleNameMap, ReverseMuscleNameMap } from '../types'

/**
 * Mapping from our muscle names to library muscle names
 */
export const muscleNameMap: MuscleNameMap = {
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
 */
export const reverseMuscleNameMap: ReverseMuscleNameMap = Object.fromEntries(
  Object.entries(muscleNameMap).map(([ourName, libName]) => [libName, ourName as MuscleGroupName])
) as ReverseMuscleNameMap

/**
 * Get library muscle name from our name
 * @param ourName - Our muscle group name
 * @returns Library muscle name
 */
export function getLibraryMuscleName(ourName: string): MuscleSlug {
  return (muscleNameMap as Record<string, MuscleSlug>)[ourName] ?? (ourName.toLowerCase() as MuscleSlug)
}

/**
 * Get our muscle name from library name
 * @param libName - Library muscle name
 * @returns Our muscle group name
 */
export function getOurMuscleName(libName: MuscleSlug): string {
  return reverseMuscleNameMap[libName] ?? libName
}

/**
 * Convert array of our muscle names to library names
 * @param ourNames - Array of our muscle names
 * @returns Array of library muscle names
 */
export function convertToLibraryNames(ourNames: string[]): MuscleSlug[] {
  return ourNames.map(name => getLibraryMuscleName(name))
}

/**
 * All supported muscle groups in our application
 */
export const allMuscleGroups: MuscleGroupName[] = Object.keys(muscleNameMap) as MuscleGroupName[]

/**
 * All muscle slugs supported by @mjcdev/react-body-highlighter library
 * Used to determine which muscles to disable when not available in exercise data
 */
export const ALL_LIBRARY_SLUGS: readonly MuscleSlug[] = [
  // Upper body
  'chest', 'trapezius', 'upper-back', 'lower-back', 'biceps', 'triceps', 'forearm', 'deltoids',
  // Core
  'abs', 'obliques',
  // Lower body
  'adductors', 'hamstring', 'quadriceps', 'calves', 'gluteal', 'tibialis',
  // Other
  'head', 'neck', 'hands', 'feet', 'ankles', 'knees', 'hair'
] as const
