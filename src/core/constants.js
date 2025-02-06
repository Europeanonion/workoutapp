export const STORAGE_KEYS = {
    SELECTED_PHASE: 'selectedPhase',
    WORKOUT_HISTORY: 'workoutHistory',
    WORKOUT_PREFIX: 'workout-',
    CURRENT_WORKOUT: 'currentWorkout',  // Add this key
    THEME: 'theme'
};

export const PHASE_OPTIONS = [
    { value: "data/workout_plan_phase_1_with_links.json", label: "Phase 1 - Base Hypertrophy" },
    { value: "data/workout_plan_phase_2_with_links.json", label: "Phase 2 - Maximum Effort" },
    { value: "data/workout_plan_phase_3_with_links.json", label: "Phase 3 - Hypertrophy & Endurance" }
];

export const CONFIG = {
    entriesPerPage: 10,
    maxHistoryItems: 1000,
    debounceDelay: 250
};