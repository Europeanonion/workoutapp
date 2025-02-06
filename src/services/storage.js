import { STORAGE_KEYS } from '../core/constants.js';
import { showToast } from '../core/utils.js';

export class StorageService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * @typedef {Object} WorkoutData
     * @property {string} Phase - The workout phase name
     * @property {Array<Week>} Weeks - Array of workout weeks
     */

    /**
     * @typedef {Object} Week
     * @property {number} Week - Week number
     * @property {Array<Workout>} Workouts - Array of workouts
     */

    /**
     * @typedef {Object} Exercise
     * @property {string} name - Exercise name
     * @property {string} link - Exercise video link
     * @property {number} index - Exercise position
     * @property {number} sets - Number of sets
     * @property {number} reps - Number of reps
     * @property {number} load - Weight/resistance used
     */

    setValue(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Storage error: ${error.message}`);
            return false;
        }
    }

    getValue(key, defaultValue = null) {
        // Check memory cache first
        if (this.cache.has(key)) {
            const {value, timestamp} = this.cache.get(key);
            if (Date.now() - timestamp < this.cacheTimeout) {
                return value;
            }
            this.cache.delete(key);
        }

        try {
            const value = localStorage.getItem(key);
            if (value) {
                const parsed = JSON.parse(value);
                this.cache.set(key, {
                    value: parsed,
                    timestamp: Date.now()
                });
                return parsed;
            }
        } catch {
            return defaultValue;
        }
    }

    removeValue(key) {
        localStorage.removeItem(key);
    }
    
    validateWorkoutData(data) {
        if (!data?.Phase || !Array.isArray(data?.Weeks)) return false;
        return data.Weeks.every(week => 
            week.Week && Array.isArray(week.Workouts)
        );
    }

    saveWorkoutData(index, data) {
        try {
            if (!this.validateWorkoutData(data)) {
                throw new Error('Invalid workout data format');
            }
            this.setValue(`${STORAGE_KEYS.WORKOUT_PREFIX}${index}`, data);
            console.log(`[Storage] Workout data saved for index ${index}:`, data);
            return true;
        } catch (error) {
            console.error(`[Storage] Error saving workout data for index ${index}:`, error);
            showToast("Failed to save workout data", "danger");
            return false;
        }
    }

    getWorkoutData(index) {
        try {
            const data = this.getValue(`${STORAGE_KEYS.WORKOUT_PREFIX}${index}`);
            console.log(`[Storage] Retrieved workout data for index ${index}:`, data);
            return data;
        } catch (error) {
            console.error(`[Storage] Error retrieving workout data for index ${index}:`, error);
            showToast("Failed to retrieve workout data.", "danger");
            return null;
        }
    }

    saveWorkoutHistory(entry) {
        try {
            const history = this.getValue(STORAGE_KEYS.WORKOUT_HISTORY, []);
            history.push(entry);
            this.setValue(STORAGE_KEYS.WORKOUT_HISTORY, history);
            this.cleanupStorage();
            console.log(`[Storage] Workout history updated:`, entry);
        } catch (error) {
            console.error(`[Storage] Error saving workout history:`, error);
            showToast("Failed to save workout history.", "danger");
        }
    }

    getWorkoutHistory() {
        try {
            const history = this.getValue(STORAGE_KEYS.WORKOUT_HISTORY, []);
            console.log(`[Storage] Retrieved workout history:`, history);
            return history;
        } catch (error) {
            console.error(`[Storage] Error retrieving workout history:`, error);
            showToast("Failed to retrieve workout history.", "danger");
            return [];
        }
    }

    saveSelectedPhase(phase) {
        try {
            this.setValue(STORAGE_KEYS.SELECTED_PHASE, phase);
            console.log(`[Storage] Selected phase saved: ${phase}`);
        } catch (error) {
            console.error(`[Storage] Error saving selected phase:`, error);
            showToast("Failed to save selected phase.", "danger");
        }
    }

    getSelectedPhase() {
        try {
            const phase = this.getValue(STORAGE_KEYS.SELECTED_PHASE);
            console.log(`[Storage] Retrieved selected phase: ${phase}`);
            return phase;
        } catch (error) {
            console.error(`[Storage] Error retrieving selected phase:`, error);
            showToast("Failed to retrieve selected phase.", "danger");
            return null;
        }
    }

    saveTheme(theme) {
        try {
            this.setValue(STORAGE_KEYS.THEME, theme);
            console.log(`[Storage] Theme preference saved: ${theme}`);
        } catch (error) {
            console.error(`[Storage] Error saving theme preference:`, error);
            showToast("Failed to save theme preference.", "danger");
        }
    }

    getTheme() {
        try {
            const theme = this.getValue(STORAGE_KEYS.THEME);
            console.log(`[Storage] Retrieved theme preference: ${theme}`);
            return theme;
        } catch (error) {
            console.error(`[Storage] Error retrieving theme preference:`, error);
            showToast("Failed to retrieve theme preference.", "danger");
            return null;
        }
    }

    clearWorkoutData() {
        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(STORAGE_KEYS.WORKOUT_PREFIX) || key === STORAGE_KEYS.WORKOUT_HISTORY) {
                    this.removeValue(key);
                    console.log(`[Storage] Removed key from localStorage: ${key}`);
                }
            });
            console.log("[Storage] All workout-related data cleared.");
        } catch (error) {
            console.error("[Storage] Error clearing workout data:", error);
            showToast("Failed to clear workout data.", "danger");
        }
    }

    cleanupStorage() {
        const MAX_HISTORY_ITEMS = 1000;
        try {
            const history = this.getWorkoutHistory();
            if (history.length > MAX_HISTORY_ITEMS) {
                const trimmedHistory = history.slice(-MAX_HISTORY_ITEMS);
                this.setValue(STORAGE_KEYS.WORKOUT_HISTORY, trimmedHistory);
                console.log(`[Storage] Cleaned up history to ${MAX_HISTORY_ITEMS} items`);
            }
            
            // Clear old cache entries
            for (const [key, {timestamp}] of this.cache) {
                if (Date.now() - timestamp > this.cacheTimeout) {
                    this.cache.delete(key);
                }
            }
        } catch (error) {
            console.error('[Storage] Cleanup failed:', error);
        }
    }

    batchSaveWorkoutData(exercises) {
        const operations = exercises.map(({index, data}) =>
            this.saveWorkoutData(index, data)
        );
        return Promise.all(operations);
    }

    async saveWorkoutSession(sessionData) {
        try {
            const { exercises, date, phase } = sessionData;
            if (!exercises?.length || !date || !phase) {
                throw new Error('Invalid session data format');
            }
            const operations = [];

            operations.push(this.batchSaveWorkoutData(exercises));

            const historyEntry = {
                date,
                phase,
                exercises: exercises.map(({ exercise, sets, reps, load }) => ({
                    exercise, sets, reps, load,
                    volume: sets * reps * load
                }))
            };
            operations.push(this.saveWorkoutHistory(historyEntry));

            await Promise.all(operations);
            console.log('[Storage] Workout session saved successfully');
            return true;
        } catch (error) {
            console.error('[Storage] Failed to save workout session:', error);
            showToast("Failed to save workout session", "danger");
            return false;
        }
    }

    optimizeStorage() {
        try {
            this.cleanupStorage();
            
            const currentPhase = this.getSelectedPhase();
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('cached_') && !key.includes(currentPhase)) {
                    this.removeValue(key);
                }
            });
            
            console.log('[Storage] Storage optimization complete');
        } catch (error) {
            console.error('[Storage] Storage optimization failed:', error);
        }
    }
}

const storageService = new StorageService();

window.saveWorkoutData = storageService.saveWorkoutData.bind(storageService);
window.getWorkoutData = storageService.getWorkoutData.bind(storageService);
window.saveWorkoutHistory = storageService.saveWorkoutHistory.bind(storageService);
window.getWorkoutHistory = storageService.getWorkoutHistory.bind(storageService);
window.saveSelectedPhase = storageService.saveSelectedPhase.bind(storageService);
window.getSelectedPhase = storageService.getSelectedPhase.bind(storageService);
window.saveTheme = storageService.saveTheme.bind(storageService);
window.getTheme = storageService.getTheme.bind(storageService);
window.clearWorkoutData = storageService.clearWorkoutData.bind(storageService);
window.getSavedValue = storageService.getValue.bind(storageService);
window.saveValue = storageService.setValue.bind(storageService);
window.batchSaveWorkoutData = storageService.batchSaveWorkoutData.bind(storageService);
window.saveWorkoutSession = storageService.saveWorkoutSession.bind(storageService);
window.optimizeStorage = storageService.optimizeStorage.bind(storageService);
