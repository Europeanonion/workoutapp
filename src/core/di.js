import { StorageService } from '../services/storage.js';
import { WorkoutState } from './WorkoutState.js';

export function initializeServices() {
    const storageService = new StorageService();
    const workoutState = new WorkoutState(storageService);
    
    return {
        storageService,
        workoutState
    };
}
