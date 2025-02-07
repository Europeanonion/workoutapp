import { initializeServices } from './core/di.js';
import { WorkoutView } from './views/WorkoutView.js';
import { WorkoutHistoryView } from './views/WorkoutHistoryView.js';

class App {
    constructor() {
        const services = initializeServices();
        this.initViews(services.workoutState);
    }

    initViews(state) {
        this.workoutView = new WorkoutView(
            document.querySelector('#workout-container'),
            state
        );

        this.historyView = new WorkoutHistoryView(
            document.querySelector('#history-container'),
            state
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
