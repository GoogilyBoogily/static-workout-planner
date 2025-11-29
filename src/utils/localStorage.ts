/**
 * localStorage utilities for workout plans persistence
 * Handles all localStorage read/write operations with error handling
 */

import type { WorkoutPlan } from '../types'

/** localStorage key for workout plans */
const KEY = 'workout-plans'

/**
 * H2 FIX: Get estimated localStorage usage for our app
 * @returns Object with used bytes, total estimate, and percentage
 */
export function getStorageUsage(): { usedBytes: number; usedKB: number; percentUsed: number } {
  try {
    let usedBytes = 0
    // Count our app's keys
    const plansData = localStorage.getItem(KEY)
    if (plansData) usedBytes += plansData.length * 2 // UTF-16 encoding
    const templatesData = localStorage.getItem('workout-quota-templates')
    if (templatesData) usedBytes += templatesData.length * 2

    // localStorage is typically 5-10MB, estimate 5MB
    const estimatedTotal = 5 * 1024 * 1024
    const percentUsed = Math.round((usedBytes / estimatedTotal) * 100)

    return {
      usedBytes,
      usedKB: Math.round(usedBytes / 1024),
      percentUsed: Math.min(percentUsed, 100)
    }
  } catch {
    return { usedBytes: 0, usedKB: 0, percentUsed: 0 }
  }
}

/**
 * H2 FIX: Get the largest plans for storage recommendations
 * @param plans Array of workout plans
 * @param limit Number of largest plans to return
 * @returns Array of plans sorted by size (largest first) with size info
 */
export function getLargestPlans(plans: WorkoutPlan[], limit = 3): Array<{ name: string; exerciseCount: number; sizeKB: number }> {
  return plans
    .map(plan => ({
      name: plan.name,
      exerciseCount: plan.exercises.length,
      sizeKB: Math.round(JSON.stringify(plan).length * 2 / 1024)
    }))
    .sort((a, b) => b.sizeKB - a.sizeKB)
    .slice(0, limit)
}

/**
 * Check if localStorage is available
 * @returns True if localStorage is available and working
 */
export function isAvailable(): boolean {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Load all workout plans from localStorage
 * Ensures backward compatibility by adding default values for new properties.
 * @returns Array of workout plan objects, or empty array if none exist or error occurs
 */
export function loadPlans(): WorkoutPlan[] {
  try {
    const data = localStorage.getItem(KEY)
    if (!data) {
      return []
    }

    const plans = JSON.parse(data) as unknown

    // Validate that we got an array
    if (!Array.isArray(plans)) {
      console.error('localStorage data is corrupted (not an array), returning empty array')
      return []
    }

    // Backward compatibility: ensure new properties exist
    // Feature 005 adds: pinStatus, isGenerated, generationTimestamp
    // Drag-drop feature adds: sortOrder
    return plans.map((plan: Record<string, unknown>, index: number) => ({
      ...plan,
      // Set defaults for feature 005 properties if not present
      pinStatus: (plan.pinStatus as Record<string, boolean> | undefined) ?? {},
      isGenerated: (plan.isGenerated as boolean | undefined) ?? false,
      generationTimestamp: (plan.generationTimestamp as number | null | undefined) ?? null,
      // C3 FIX: Use negative createdAt as fallback for consistent ordering across sessions
      // Negative because lower sortOrder = shown first, and newer plans (higher createdAt) should be first
      // Falls back to index only if createdAt is also missing (very old data)
      sortOrder: (plan.sortOrder as number | undefined) ??
        (plan.createdAt ? -(plan.createdAt as number) : index)
    })) as WorkoutPlan[]
  } catch (error) {
    console.error('Failed to load plans from localStorage:', error)
    return []
  }
}

/**
 * Save workout plans to localStorage
 * @param plans - Array of workout plan objects
 * @throws Error if localStorage quota is exceeded or storage is unavailable
 */
export function savePlans(plans: WorkoutPlan[]): void {
  try {
    const data = JSON.stringify(plans)
    localStorage.setItem(KEY, data)
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage limit reached. Delete old plans to free space.')
    } else if (!isAvailable()) {
      throw new Error('localStorage is not available. Are you in private browsing mode?')
    } else {
      throw new Error('Failed to save plans: ' + (error instanceof Error ? error.message : String(error)))
    }
  }
}

/**
 * Clear all workout plans from localStorage
 * Useful for testing or data reset
 */
export function clearPlans(): void {
  try {
    localStorage.removeItem(KEY)
  } catch (error) {
    console.error('Failed to clear plans from localStorage:', error)
  }
}

export const PlansStorage = {
  KEY,
  isAvailable,
  loadPlans,
  savePlans,
  clearPlans,
  getStorageUsage,
  getLargestPlans
}

export default PlansStorage
