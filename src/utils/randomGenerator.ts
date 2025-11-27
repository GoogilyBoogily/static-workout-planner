/**
 * Random Workout Generation Utilities
 *
 * Provides functions for generating random workouts with tag quotas,
 * managing exercise pools, and implementing Fisher-Yates shuffle algorithm.
 *
 * @module randomGenerator
 */

import type {
  PlanExercise,
  WorkoutPlan,
  ExercisePool,
  TagQuota,
  GenerationResult
} from '../types'

/**
 * Fisher-Yates shuffle algorithm for randomizing arrays in-place.
 * Runs in O(n) time with uniform distribution.
 *
 * @param array - Array to shuffle (modified in-place)
 * @returns The shuffled array (same reference)
 *
 * @example
 * const cards = [1, 2, 3, 4, 5];
 * shuffleArray(cards); // cards is now randomly shuffled
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j] as T
    array[j] = temp as T
  }
  return array
}

/**
 * Select N random exercises from a pool without duplicates.
 * Uses Fisher-Yates shuffle for uniform random selection.
 *
 * @param pool - Array of exercise objects to select from
 * @param count - Number of exercises to select
 * @param excludeIds - Exercise IDs to exclude from selection (e.g., recently shown)
 * @returns Array of selected exercises (deep copies with new IDs)
 *
 * @example
 * const chestExercises = [{ id: '1', name: 'Bench Press', ... }, ...];
 * const selected = selectRandomExercises(chestExercises, 3);
 * // Returns 3 random chest exercises with new UUIDs
 */
export function selectRandomExercises(
  pool: PlanExercise[],
  count: number,
  excludeIds: string[] = []
): PlanExercise[] {
  // Filter out excluded IDs
  const availablePool = pool.filter(exercise => !excludeIds.includes(exercise.id))

  if (availablePool.length < count) {
    // Return what we have if pool is too small
    return availablePool.map(exercise => ({
      ...exercise,
      id: crypto.randomUUID() // Generate new ID for each selected exercise
    }))
  }

  // Create a copy of the pool and shuffle
  const shuffled = [...availablePool]
  shuffleArray(shuffled)

  // Take the first 'count' exercises and assign new IDs
  return shuffled.slice(0, count).map(exercise => ({
    ...exercise,
    id: crypto.randomUUID()
  }))
}

/**
 * Build exercise pool from all saved workout plans.
 * Groups exercises by tag and deduplicates by name|tag key.
 *
 * FIXED C1: Handles both CSV exercises (tags: string[]) and plan exercises (tag: string)
 *
 * @param plans - Array of WorkoutPlan objects from localStorage
 * @returns Map of tag -> exercise array
 *
 * @example
 * const plans = PlansStorage.loadPlans();
 * const pool = buildExercisePool(plans);
 * // Returns: { "Chest": [...], "Legs": [...], "Back": [...] }
 */
export function buildExercisePool(plans: WorkoutPlan[]): ExercisePool {
  const pool: ExercisePool = {}
  const seen = new Set<string>() // Track unique exercises by "name|tag"

  plans.forEach(plan => {
    if (!plan.exercises || !Array.isArray(plan.exercises)) {
      return
    }

    plan.exercises.forEach(exercise => {
      if (!exercise.name) {
        return
      }

      // FIXED C1: Handle both tags (array) and tag (string) formats
      // CSV exercises have tags: ["Chest", "Shoulders"]
      // Manual/generated exercises have tag: "Chest"
      const exerciseTags = exercise.tags ?? (exercise.tag ? [exercise.tag] : [])

      if (exerciseTags.length === 0) {
        return // Skip exercises without any tags
      }

      // Add exercise to pool under each of its tags
      exerciseTags.forEach(tag => {
        const key = `${exercise.name}|${tag}`

        // Skip if we've already seen this exercise-tag combination
        if (seen.has(key)) {
          return
        }

        seen.add(key)

        // Initialize tag array if not exists
        if (!pool[tag]) {
          pool[tag] = []
        }

        // Add exercise to pool with primary tag set for compatibility
        // This ensures reroll logic works correctly
        pool[tag].push({
          ...exercise,
          tag // Set single tag for this pool entry
        })
      })
    })
  })

  return pool
}

/**
 * Extract unique tags from exercise pool.
 * Returns sorted array of tag names.
 *
 * @param exercisePool - Exercise pool from buildExercisePool
 * @returns Sorted array of unique tag names
 *
 * @example
 * const tags = getAvailableTags(pool);
 * // Returns: ["Back", "Biceps", "Chest", "Legs", "Shoulders", "Triceps"]
 */
export function getAvailableTags(exercisePool: ExercisePool): string[] {
  return Object.keys(exercisePool).sort()
}

/**
 * Generate a random workout plan based on tag quotas.
 * Selects random exercises matching specified tag quotas.
 *
 * @param quotas - Array of { tag, count } objects
 * @param exercisePool - Exercise pool grouped by tag
 * @returns Result object with { exercises: Array, errors: Array }
 *
 * @example
 * const quotas = [{ tag: 'Chest', count: 3 }, { tag: 'Legs', count: 2 }];
 * const result = generateWorkoutPlan(quotas, pool);
 * // Returns: { exercises: [...5 exercises...], errors: [] }
 */
export function generateWorkoutPlan(
  quotas: TagQuota[],
  exercisePool: ExercisePool
): GenerationResult {
  const exercises: PlanExercise[] = []
  const errors: string[] = []

  quotas.forEach(({ tag, count }) => {
    const pool = exercisePool[tag] ?? []

    if (pool.length === 0) {
      errors.push(`No exercises found for tag "${tag}"`)
      return
    }

    if (pool.length < count) {
      errors.push(
        `Not enough "${tag}" exercises. Need ${count}, have ${pool.length}.`
      )
      // Add what we have
      const selected = selectRandomExercises(pool, pool.length)
      exercises.push(...selected)
      return
    }

    // Select random exercises for this tag
    const selected = selectRandomExercises(pool, count)
    exercises.push(...selected)
  })

  return { exercises, errors }
}

/**
 * Generate auto-name for random workout plans.
 * Format: "Random Workout - MMM DD, YYYY"
 *
 * @param date - Date to use for name (defaults to now)
 * @returns Generated plan name
 *
 * @example
 * const name = generatePlanName();
 * // Returns: "Random Workout - Nov 15, 2025"
 */
export function generatePlanName(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  const dateStr = date.toLocaleDateString('en-US', options)
  return `Random Workout - ${dateStr}`
}

/**
 * Regenerate workout while preserving pinned exercises.
 * Replaces only unpinned exercises based on original quotas.
 *
 * @param plan - Current WorkoutPlan with exercises and pinStatus
 * @param quotas - Original quotas used to generate plan
 * @param exercisePool - Exercise pool grouped by tag
 * @returns Updated plan with regenerated exercises
 *
 * @example
 * const regenerated = regenerateWorkout(currentPlan, originalQuotas, pool);
 * // Pinned exercises remain, unpinned are replaced
 */
export function regenerateWorkout(
  plan: WorkoutPlan,
  quotas: TagQuota[],
  exercisePool: ExercisePool
): WorkoutPlan {
  const pinStatus = plan.pinStatus ?? {}
  const pinnedExercises = plan.exercises.filter(ex => pinStatus[ex.id])

  // Calculate remaining quotas after accounting for pinned exercises
  const remainingQuotas = quotas.map(({ tag, count }) => {
    const pinnedOfTag = pinnedExercises.filter(ex => ex.tag === tag).length
    const remaining = Math.max(0, count - pinnedOfTag)
    return { tag, count: remaining }
  }).filter(q => q.count > 0)

  // Generate new exercises for remaining quotas
  const { exercises: newExercises } = generateWorkoutPlan(remainingQuotas, exercisePool)

  // Combine pinned + new exercises
  const allExercises = [...pinnedExercises, ...newExercises]

  return {
    ...plan,
    exercises: allExercises,
    updatedAt: Date.now(),
    generationTimestamp: Date.now()
  }
}
