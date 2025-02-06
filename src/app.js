import { StorageService } from './services/storage.js';
import { WorkoutService } from './services/workout.js';
import { WorkoutState } from './core/state.js';
import { WorkoutView } from './views/WorkoutView.js';
import { HistoryView } from './views/HistoryView.js';

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
            this.workoutService,
            this.storageService
        );

        this.historyView = new HistoryView(
            document.querySelector('#history-container'),
            this.workoutService,
            this.storageService
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
