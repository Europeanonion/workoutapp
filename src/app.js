import { StorageService } from './services/storage.js';
import { WorkoutService } from './services/workout.js';
import { WorkoutState } from './core/state.js';
import { WorkoutView } from './views/WorkoutView.js';
import { WorkoutHistoryView } from './views/WorkoutHistoryView.js';

class App {
    constructor() {
        this.initServices();
        this.initState();
        this.initViews();
    }

    initServices() {
        this.storageService = new StorageService();
        this.workoutService = new WorkoutService(this.storageService);
    }

    initState() {
        this.state = new WorkoutState(this.storageService);
    }

    initViews() {
        this.workoutView = new WorkoutView(
            document.querySelector('#workout-container'),
            this.state
        );

        this.historyView = new WorkoutHistoryView(
            document.querySelector('#history-container'),
            this.state
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
