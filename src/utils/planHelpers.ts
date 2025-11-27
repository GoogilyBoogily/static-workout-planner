/**
 * Plan Helper Utilities
 *
 * Centralized functions for workout plan creation and manipulation.
 * Eliminates duplication across App.tsx handlers.
 */

import type { WorkoutPlan, PlanExercise, PinStatus, DragPosition } from '../types'

/**
 * Options for creating a new workout plan
 */
export interface CreatePlanOptions {
  name: string
  exercises: PlanExercise[]
  isCircuit?: boolean
  isGenerated?: boolean
  pinStatus?: PinStatus
}

/**
 * Result of creating a new plan
 */
export interface CreatePlanResult {
  /** The newly created plan */
  newPlan: WorkoutPlan
  /** All plans with updated sortOrder values */
  updatedPlans: WorkoutPlan[]
}

/**
 * Create a new workout plan and insert it at the top of the list.
 * Automatically handles sortOrder management for all existing plans.
 *
 * @param existingPlans - Current array of workout plans
 * @param options - Plan creation options
 * @returns The new plan and updated plans array
 *
 * @example
 * const { newPlan, updatedPlans } = createWorkoutPlan(plans, {
 *   name: 'My Workout',
 *   exercises: [exercise1, exercise2],
 *   isCircuit: false
 * })
 * PlansStorage.savePlans(updatedPlans)
 * setPlans(updatedPlans)
 */
export function createWorkoutPlan(
  existingPlans: WorkoutPlan[],
  options: CreatePlanOptions
): CreatePlanResult {
  const now = Date.now()

  // Increment all existing plans' sortOrder to make room at the top
  const shiftedPlans = existingPlans.map(p => ({
    ...p,
    sortOrder: p.sortOrder + 1
  }))

  const newPlan: WorkoutPlan = {
    id: crypto.randomUUID(),
    name: options.name,
    exercises: options.exercises,
    isCircuit: options.isCircuit ?? false,
    createdAt: now,
    updatedAt: now,
    sortOrder: 0,
    ...(options.isGenerated && {
      isGenerated: true,
      generationTimestamp: now,
      pinStatus: options.pinStatus ?? {}
    })
  }

  return {
    newPlan,
    updatedPlans: [newPlan, ...shiftedPlans]
  }
}

/**
 * Reorder plans after drag-drop operation.
 * Recalculates sortOrder for all plans based on new positions.
 *
 * @param sortedPlans - Plans array already sorted by sortOrder
 * @param sourceId - ID of the plan being moved
 * @param targetId - ID of the plan being dropped onto
 * @param position - Drop position relative to target ('before' or 'after')
 * @returns Updated plans array with new sortOrder values, or null if invalid
 */
export function reorderPlans(
  sortedPlans: WorkoutPlan[],
  sourceId: string,
  targetId: string,
  position: DragPosition = 'before'
): WorkoutPlan[] | null {
  const sourceIndex = sortedPlans.findIndex(p => p.id === sourceId)
  const targetIndex = sortedPlans.findIndex(p => p.id === targetId)

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return null
  }

  // Create reordered array
  const reordered = [...sortedPlans]
  const [moved] = reordered.splice(sourceIndex, 1)
  if (!moved) return null

  // Calculate insert position based on before/after
  let insertIndex = targetIndex
  if (sourceIndex < targetIndex) {
    // Dragging from above: adjust for the splice
    insertIndex = position === 'after' ? targetIndex : targetIndex - 1
  } else {
    // Dragging from below: insert at position or after
    insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
  }

  // Clamp to valid range
  insertIndex = Math.max(0, Math.min(insertIndex, reordered.length))

  reordered.splice(insertIndex, 0, moved)

  // Reassign sortOrder to all plans (0, 1, 2, ...)
  return reordered.map((plan, index) => ({
    ...plan,
    sortOrder: index
  }))
}

/**
 * Sort plans by sortOrder ascending (lower = first in list)
 *
 * @param plans - Unsorted plans array
 * @returns New array sorted by sortOrder
 */
export function sortPlansByOrder(plans: WorkoutPlan[]): WorkoutPlan[] {
  return [...plans].sort((a, b) => a.sortOrder - b.sortOrder)
}
