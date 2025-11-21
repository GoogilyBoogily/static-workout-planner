/**
 * localStorage utilities for workout plans persistence
 * Handles all localStorage read/write operations with error handling
 */

/** localStorage key for workout plans */
const KEY = 'workout-plans';

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available and working
 */
export function isAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Load all workout plans from localStorage
 * Ensures backward compatibility by adding default values for new properties.
 * @returns {Array} Array of workout plan objects, or empty array if none exist or error occurs
 */
export function loadPlans() {
  try {
    const data = localStorage.getItem(KEY);
    if (!data) {
      return [];
    }

    const plans = JSON.parse(data);

    // Validate that we got an array
    if (!Array.isArray(plans)) {
      console.error('localStorage data is corrupted (not an array), returning empty array');
      return [];
    }

    // Backward compatibility: ensure new properties exist
    // Feature 005 adds: pinStatus, isGenerated, generationTimestamp
    return plans.map(plan => ({
      ...plan,
      // Set defaults for feature 005 properties if not present
      pinStatus: plan.pinStatus || {},
      isGenerated: plan.isGenerated || false,
      generationTimestamp: plan.generationTimestamp || null
    }));
  } catch (error) {
    console.error('Failed to load plans from localStorage:', error);
    return [];
  }
}

/**
 * Save workout plans to localStorage
 * @param {Array} plans - Array of workout plan objects
 * @throws {Error} If localStorage quota is exceeded or storage is unavailable
 */
export function savePlans(plans) {
  try {
    const data = JSON.stringify(plans);
    localStorage.setItem(KEY, data);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage limit reached. Delete old plans to free space.');
    } else if (!isAvailable()) {
      throw new Error('localStorage is not available. Are you in private browsing mode?');
    } else {
      throw new Error('Failed to save plans: ' + error.message);
    }
  }
}

/**
 * Clear all workout plans from localStorage
 * Useful for testing or data reset
 */
export function clearPlans() {
  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    console.error('Failed to clear plans from localStorage:', error);
  }
}

export const PlansStorage = {
  KEY,
  isAvailable,
  loadPlans,
  savePlans,
  clearPlans
};

export default PlansStorage;
