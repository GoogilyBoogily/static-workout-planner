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
  GenerationResult,
  ParsedExercise,
  MuscleExercisePool,
  MuscleQuota,
  MuscleGenerationResult
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

// ============================================
// Muscle-Based Generation Functions
// ============================================

/**
 * Build exercise pool from CSV library, grouped by muscle group.
 *
 * @param exercises - Parsed exercises from CSV library
 * @returns Pool indexed by muscle group name
 *
 * @example
 * const pool = buildMuscleExercisePool(csvExercises);
 * // Returns: { "Chest": [...], "Shoulders": [...], ... }
 */
export function buildMuscleExercisePool(exercises: ParsedExercise[]): MuscleExercisePool {
  const pool: MuscleExercisePool = {}

  exercises.forEach(exercise => {
    if (!exercise.name || !exercise.tags || exercise.tags.length === 0) {
      return
    }

    // Add exercise to pool under each of its muscle tags
    exercise.tags.forEach(tag => {
      const normalizedTag = tag.trim()
      if (!normalizedTag) return

      if (!pool[normalizedTag]) {
        pool[normalizedTag] = []
      }
      pool[normalizedTag].push(exercise)
    })
  })

  return pool
}

/**
 * Get available muscle groups from CSV exercise library.
 * Returns sorted array of unique muscle group names.
 *
 * @param exercises - Parsed exercises from CSV library
 * @returns Sorted array of muscle group names
 *
 * @example
 * const muscleGroups = getAvailableMuscleGroups(exercises);
 * // Returns: ["Abdominals", "Back", "Biceps", "Chest", ...]
 */
export function getAvailableMuscleGroups(exercises: ParsedExercise[]): string[] {
  const groups = new Set<string>()

  exercises.forEach(exercise => {
    exercise.tags?.forEach(tag => {
      const normalized = tag.trim()
      if (normalized) groups.add(normalized)
    })
  })

  return Array.from(groups).sort()
}

/**
 * Get muscle group statistics - count of exercises per muscle group.
 *
 * @param exercises - Parsed exercises from CSV library
 * @returns Map of muscle group name to exercise count
 *
 * @example
 * const stats = getMuscleGroupStats(exercises);
 * // Returns: { "Chest": 15, "Back": 20, ... }
 */
export function getMuscleGroupStats(exercises: ParsedExercise[]): Record<string, number> {
  const stats: Record<string, number> = {}

  exercises.forEach(exercise => {
    exercise.tags?.forEach(tag => {
      const normalized = tag.trim()
      if (normalized) {
        stats[normalized] = (stats[normalized] ?? 0) + 1
      }
    })
  })

  return stats
}

/**
 * Convert a ParsedExercise from CSV to a PlanExercise with default workout params.
 *
 * @param exercise - Parsed exercise from CSV
 * @param muscleGroup - Primary muscle group for this selection
 * @returns PlanExercise with default sets/reps/rest
 */
export function toPlanExercise(exercise: ParsedExercise, muscleGroup: string): PlanExercise {
  return {
    id: crypto.randomUUID(),
    name: exercise.name,
    tag: muscleGroup,
    tags: exercise.tags,
    description: exercise.description,
    equipment: exercise.equipment,
    optionalEquipment: exercise.optionalEquipment,
    youtubeUrl: exercise.youtubeUrl,
    sets: 3,
    reps: '8-12',
    weight: '',
    rest: '60s',
    roundGroup: 0
  }
}

/**
 * Generate workout from muscle group quotas using CSV library.
 *
 * @param quotas - Array of { muscleGroup, count } objects
 * @param pool - Exercise pool from buildMuscleExercisePool
 * @returns Result with exercises, errors, and warnings
 *
 * @example
 * const quotas = [{ muscleGroup: 'Chest', count: 3 }, { muscleGroup: 'Back', count: 2 }];
 * const result = generateFromMuscleQuotas(quotas, pool);
 */
export function generateFromMuscleQuotas(
  quotas: MuscleQuota[],
  pool: MuscleExercisePool
): MuscleGenerationResult {
  const exercises: PlanExercise[] = []
  const errors: string[] = []
  const warnings: string[] = []
  const usedExerciseNames = new Set<string>()

  quotas.forEach(({ muscleGroup, count }) => {
    const musclePool = pool[muscleGroup] ?? []

    if (musclePool.length === 0) {
      errors.push(`No exercises found for muscle group "${muscleGroup}"`)
      return
    }

    // Filter out already-used exercises to prevent duplicates across quotas
    const availablePool = musclePool.filter(ex => !usedExerciseNames.has(ex.name))

    if (availablePool.length === 0) {
      warnings.push(`All "${muscleGroup}" exercises already used`)
      return
    }

    if (availablePool.length < count) {
      warnings.push(
        `Only ${availablePool.length} "${muscleGroup}" exercises available (requested ${count})`
      )
    }

    // Shuffle and select
    const shuffled = [...availablePool]
    shuffleArray(shuffled)
    const selected = shuffled.slice(0, Math.min(count, availablePool.length))

    // Convert to PlanExercise and track used names
    selected.forEach(parsed => {
      usedExerciseNames.add(parsed.name)
      exercises.push(toPlanExercise(parsed, muscleGroup))
    })
  })

  return { exercises, errors, warnings }
}

/**
 * Alternate exercises by muscle group for circuit training.
 * Uses round-robin interleaving so consecutive exercises target different muscles.
 * Also assigns roundGroup property based on which "pass" of the round-robin.
 *
 * @param exercises - Array of exercises to reorder
 * @param roundCount - Optional number of rounds to distribute exercises across.
 *                     If provided, exercises are distributed evenly across specified rounds.
 *                     If not provided, rounds are auto-calculated from muscle groups.
 * @returns Reordered array with muscle groups alternated and roundGroup assigned
 *
 * @example
 * // Auto-calculated rounds (roundCount not provided):
 * // Input: [Chest1, Chest2, Back1, Back2, Shoulders1]
 * // Output with roundGroup:
 * //   Round 0: Chest1, Back1, Shoulders1
 * //   Round 1: Chest2, Back2
 *
 * @example
 * // User-specified rounds (roundCount = 3):
 * // Input: [Chest1, Chest2, Back1, Back2, Shoulders1], roundCount = 3
 * // Output: ~2 per round
 * //   Round 0: Chest1, Chest2
 * //   Round 1: Back1, Back2
 * //   Round 2: Shoulders1
 */
export function alternateByMuscleGroup(
  exercises: PlanExercise[],
  roundCount?: number
): PlanExercise[] {
  if (exercises.length <= 1) {
    return exercises.map(ex => ({ ...ex, roundGroup: 0 }))
  }

  // If user specified a round count, distribute exercises evenly across rounds
  if (roundCount && roundCount > 0) {
    const exercisesPerRound = Math.ceil(exercises.length / roundCount)
    return exercises.map((ex, idx) => ({
      ...ex,
      roundGroup: Math.floor(idx / exercisesPerRound)
    }))
  }

  // Auto-calculate rounds: Group exercises by their primary muscle tag
  const byMuscle: Record<string, PlanExercise[]> = {}

  exercises.forEach(ex => {
    const muscle = ex.tag || ex.tags?.[0] || 'Other'
    if (!byMuscle[muscle]) byMuscle[muscle] = []
    byMuscle[muscle].push(ex)
  })

  const muscleKeys = Object.keys(byMuscle)

  if (muscleKeys.length <= 1) {
    // Single muscle group - each exercise becomes its own round
    console.warn('Circuit mode: Only one muscle group selected, each exercise becomes its own round')
    return exercises.map((ex, idx) => ({ ...ex, roundGroup: idx }))
  }

  // Round-robin: take one from each group in turn, tracking round number
  const result: PlanExercise[] = []
  let roundNumber = 0

  while (result.length < exercises.length) {
    let addedThisRound = false

    for (const muscle of muscleKeys) {
      const group = byMuscle[muscle]
      if (group && group.length > 0) {
        const ex = group.shift()!
        result.push({ ...ex, roundGroup: roundNumber })
        addedThisRound = true
      }
      if (result.length >= exercises.length) break
    }

    if (addedThisRound) {
      roundNumber++
    }
  }

  return result
}

/**
 * Regenerate workout while preserving pinned exercises (muscle-based version).
 * Replaces only unpinned exercises based on original muscle quotas.
 *
 * @param plan - Current WorkoutPlan with exercises and pinStatus
 * @param quotas - Original muscle quotas used to generate plan
 * @param pool - Muscle exercise pool from buildMuscleExercisePool
 * @param isCircuit - Whether to apply circuit alternation
 * @param roundCount - Optional number of rounds for circuit mode
 * @returns Updated plan with regenerated exercises
 */
export function regenerateWorkoutFromMuscles(
  plan: WorkoutPlan,
  quotas: MuscleQuota[],
  pool: MuscleExercisePool,
  isCircuit: boolean,
  roundCount?: number
): WorkoutPlan {
  const pinStatus = plan.pinStatus ?? {}
  const pinnedExercises = plan.exercises.filter(ex => pinStatus[ex.id])
  const pinnedNames = new Set(pinnedExercises.map(ex => ex.name))

  // Calculate remaining quotas after accounting for pinned exercises
  const remainingQuotas = quotas.map(({ muscleGroup, count }) => {
    const pinnedOfMuscle = pinnedExercises.filter(ex => ex.tag === muscleGroup).length
    const remaining = Math.max(0, count - pinnedOfMuscle)
    return { muscleGroup, count: remaining }
  }).filter(q => q.count > 0)

  // Generate new exercises for remaining quotas, excluding pinned exercise names
  const filteredPool: MuscleExercisePool = {}
  for (const [key, exercises] of Object.entries(pool)) {
    filteredPool[key] = exercises.filter(ex => !pinnedNames.has(ex.name))
  }

  const { exercises: newExercises } = generateFromMuscleQuotas(remainingQuotas, filteredPool)

  // Build result array preserving pinned positions
  const result: (PlanExercise | undefined)[] = new Array(plan.exercises.length)
  let newExerciseIndex = 0

  // First pass: place pinned exercises at their original indices
  plan.exercises.forEach((ex, idx) => {
    if (pinStatus[ex.id]) {
      result[idx] = ex
    }
  })

  // Second pass: fill unpinned slots with new exercises
  plan.exercises.forEach((ex, idx) => {
    if (!pinStatus[ex.id] && newExercises[newExerciseIndex]) {
      result[idx] = newExercises[newExerciseIndex]
      newExerciseIndex++
    }
  })

  // Filter out any undefined slots (if fewer new exercises than unpinned)
  let allExercises = result.filter((ex): ex is PlanExercise => ex !== undefined)

  // Apply circuit alternation if enabled
  if (isCircuit && allExercises.length > 1) {
    allExercises = alternateByMuscleGroup(allExercises, roundCount)
  }

  return {
    ...plan,
    exercises: allExercises,
    updatedAt: Date.now(),
    generationTimestamp: Date.now()
  }
}
