// js/storage.js

// Constants for Storage Keys
const STORAGE_KEYS = {
  SELECTED_PHASE: 'selectedPhase',
  WORKOUT_HISTORY: 'workoutHistory',
  WORKOUT_PREFIX: 'workout-',
  THEME: 'theme'
};

function validateWorkoutData(data) {
  if (!data?.Phase || !Array.isArray(data?.Weeks)) return false;
  return data.Weeks.every(week => 
    week.Week && Array.isArray(week.Workouts)
  );
}

// Ensure showToast function is defined or imported
function showToast(message, type = 'success') {
  console.log(`[Storage] Displaying toast: [${type.toUpperCase()}] ${message}`);
  // Implementation of showToast function
}

/**
 * Save workout data to localStorage
 * @param {number} index - The index of the workout exercise
 * @param {object} data - The workout data (sets, reps, load)
 */
function saveWorkoutData(index, data) {
  try {
    if (!validateWorkoutData(data)) {
      throw new Error('Invalid workout data format');
    }
    localStorage.setItem(`${STORAGE_KEYS.WORKOUT_PREFIX}${index}`, JSON.stringify(data));
    console.log(`[Storage] Workout data saved for index ${index}:`, data);
  } catch (error) {
    console.error(`[Storage] Error saving workout data for index ${index}:`, error);
    showToast("Failed to save workout data.", "danger");
  }
}

/**
 * Retrieve workout data from localStorage
 * @param {number} index - The index of the workout exercise
 * @returns {object|null} - The retrieved data or null if not found
 */
function getWorkoutData(index) {
  try {
    const data = localStorage.getItem(`${STORAGE_KEYS.WORKOUT_PREFIX}${index}`);
    console.log(`[Storage] Retrieved workout data for index ${index}:`, data);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[Storage] Error retrieving workout data for index ${index}:`, error);
    showToast("Failed to retrieve workout data.", "danger");
    return null;
  }
}

/**
 * Retrieves a value from local storage.
 * @param {string} key - The key to look up in local storage.
 * @param {any} defaultValue - The default value to return if the key is not found.
 * @returns {any} The value from local storage or the default value.
 */
function getSavedValue(key, defaultValue = null) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue === null ? defaultValue : JSON.parse(storedValue);
  } catch (error) {
    console.error(`Error getting value for key '${key}' from localStorage:`, error);
    return defaultValue;
  }
}

/**
 * Saves a value to local storage.
 * @param {string} key - The key to store the value under.
 * @param {any} value - The value to store.
 */
function saveValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving value for key '${key}' to localStorage:`, error);
  }
}

/**
 * Save workout history to localStorage
 * @param {object} entry - The workout history entry
 */
function saveWorkoutHistory(entry) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY)) || [];
    history.push(entry);
    localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    cleanupStorage(); // Add this line
    console.log(`[Storage] Workout history updated:`, entry);
  } catch (error) {
    console.error(`[Storage] Error saving workout history:`, error);
    showToast("Failed to save workout history.", "danger");
  }
}

/**
 * Retrieve workout history from localStorage
 * @returns {Array} - The workout history
 */
function getWorkoutHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY)) || [];
    console.log(`[Storage] Retrieved workout history:`, history);
    return history;
  } catch (error) {
    console.error(`[Storage] Error retrieving workout history:`, error);
    showToast("Failed to retrieve workout history.", "danger");
    return [];
  }
}

/**
 * Save selected workout phase to localStorage
 * @param {string} phase - The selected phase URL
 */
function saveSelectedPhase(phase) {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PHASE, phase);
    console.log(`[Storage] Selected phase saved: ${phase}`);
  } catch (error) {
    console.error(`[Storage] Error saving selected phase:`, error);
    showToast("Failed to save selected phase.", "danger");
  }
}

/**
 * Retrieve selected workout phase from localStorage
 * @returns {string|null} - The selected phase URL or null if not set
 */
function getSelectedPhase() {
  try {
    const phase = localStorage.getItem(STORAGE_KEYS.SELECTED_PHASE);
    console.log(`[Storage] Retrieved selected phase: ${phase}`);
    return phase;
  } catch (error) {
    console.error(`[Storage] Error retrieving selected phase:`, error);
    showToast("Failed to retrieve selected phase.", "danger");
    return null;
  }
}

/**
 * Save theme preference to localStorage
 * @param {string} theme - The selected theme ('dark' or 'light')
 */
function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    console.log(`[Storage] Theme preference saved: ${theme}`);
  } catch (error) {
    console.error(`[Storage] Error saving theme preference:`, error);
    showToast("Failed to save theme preference.", "danger");
  }
}

/**
 * Retrieve theme preference from localStorage
 * @returns {string|null} - The saved theme or null if not set
 */
function getTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    console.log(`[Storage] Retrieved theme preference: ${theme}`);
    return theme;
  } catch (error) {
    console.error(`[Storage] Error retrieving theme preference:`, error);
    showToast("Failed to retrieve theme preference.", "danger");
    return null;
  }
}

/**
 * Clear all workout-related data from localStorage
 */
function clearWorkoutData() {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEYS.WORKOUT_PREFIX) || key === STORAGE_KEYS.WORKOUT_HISTORY) {
        localStorage.removeItem(key);
        console.log(`[Storage] Removed key from localStorage: ${key}`);
      }
    });
    console.log("[Storage] All workout-related data cleared.");
  } catch (error) {
    console.error("[Storage] Error clearing workout data:", error);
    showToast("Failed to clear workout data.", "danger");
  }
}

function cleanupStorage() {
  const MAX_HISTORY_ITEMS = 1000;
  try {
    const history = getWorkoutHistory();
    if (history.length > MAX_HISTORY_ITEMS) {
      const trimmedHistory = history.slice(-MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(trimmedHistory));
      console.log(`[Storage] Cleaned up history to ${MAX_HISTORY_ITEMS} items`);
    }
  } catch (error) {
    console.error('[Storage] Cleanup failed:', error);
  }
}

// Expose functions to the global scope if needed
window.saveWorkoutData = saveWorkoutData;
window.getWorkoutData = getWorkoutData;
window.saveWorkoutHistory = saveWorkoutHistory;
window.getWorkoutHistory = getWorkoutHistory;
window.saveSelectedPhase = saveSelectedPhase;
window.getSelectedPhase = getSelectedPhase;
window.saveTheme = saveTheme;
window.getTheme = getTheme;
window.clearWorkoutData = clearWorkoutData;
window.getSavedValue = getSavedValue;
window.saveValue = saveValue;
