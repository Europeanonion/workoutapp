import { StorageService } from '../../src/services/storage.js';

const storage = new StorageService();
window.storage = storage;
export { storage };

// Export functions to global scope
window.saveWorkoutData = storage.saveWorkoutData.bind(storage);
window.getWorkoutData = storage.getWorkoutData.bind(storage);
window.saveWorkoutHistory = storage.saveWorkoutHistory.bind(storage);
window.getWorkoutHistory = storage.getWorkoutHistory.bind(storage);
// ...other global exports
