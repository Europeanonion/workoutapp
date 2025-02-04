// js/storage.js

// Constants for Storage Keys
const STORAGE_KEYS = {
  SELECTED_PHASE: 'selectedPhase',
  WORKOUT_HISTORY: 'workoutHistory',
  WORKOUT_PREFIX: 'workout-',
  THEME: 'theme'
};

/**
 * Save workout data to localStorage
 * @param {number} index - The index of the workout exercise
 * @param {object} data - The workout data (sets, reps, load)
 */
function saveWorkoutData(index, data) {
  localStorage.setItem(`${STORAGE_KEYS.WORKOUT_PREFIX}${index}`, JSON.stringify(data));
}

/**
 * Retrieve workout data from localStorage
 * @param {number} index - The index of the workout exercise
 * @returns {object|null} - The retrieved data or null if not found
 */
function getWorkoutData(index) {
  const data = localStorage.getItem(`${STORAGE_KEYS.WORKOUT_PREFIX}${index}`);
  return data ? JSON.parse(data) : null;
}

/**
 * Save workout history to localStorage
 * @param {object} entry - The workout history entry
 */
function saveWorkoutHistory(entry) {
  const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY)) || [];
  history.push(entry);
  localStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
}

/**
 * Retrieve workout history from localStorage
 * @returns {Array} - The workout history
 */
function getWorkoutHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY)) || [];
}

/**
 * Save selected workout phase to localStorage
 * @param {string} phase - The selected phase URL
 */
function saveSelectedPhase(phase) {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PHASE, phase);
}

/**
 * Retrieve selected workout phase from localStorage
 * @returns {string|null} - The selected phase URL or null if not set
 */
function getSelectedPhase() {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_PHASE);
}

/**
 * Save theme preference to localStorage
 * @param {string} theme - The selected theme ('dark' or 'light')
 */
function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Retrieve theme preference from localStorage
 * @returns {string|null} - The saved theme or null if not set
 */
function getTheme() {
  return localStorage.getItem(STORAGE_KEYS.THEME);
}

/**
 * Clear all workout-related data from localStorage
 */
function clearWorkoutData() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_KEYS.WORKOUT_PREFIX) || key === STORAGE_KEYS.WORKOUT_HISTORY) {
      localStorage.removeItem(key);
    }
  });
}
