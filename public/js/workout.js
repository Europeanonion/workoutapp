import { WorkoutService } from '../../src/services/workout.js';

const workout = new WorkoutService();
window.workout = workout;
export { workout };

// Initialize workout service
const workoutService = new WorkoutService();

// Export functions to global scope
window.loadWorkout = workoutService.loadWorkout.bind(workoutService);
window.displayWorkout = workoutService.displayWorkout.bind(workoutService);
// ...other global exports
