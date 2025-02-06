import { state } from '../../core/state.js';
import { createWorkoutDay } from '../components/WorkoutDay.js';
import { showLoadingSpinner, hideLoadingSpinner } from '../components/LoadingSpinner.js';

export class WorkoutView {
    constructor(container) {
        this.container = container;
        this.state = state;
        this.init();
    }

    init() {
        this.state.subscribe(this.render.bind(this));
        this.bindEvents();
    }

    bindEvents() {
        this.container.addEventListener('exercise-save', (e) => {
            const { exerciseId, data } = e.detail;
            this.state.saveExerciseData(exerciseId, data);
        });
    }

    render(newState) {
        showLoadingSpinner();
        const workoutData = newState.workoutData;
        
        if (!workoutData?.Weeks) {
            this.container.innerHTML = '<div class="alert alert-info">No workout data available</div>';
            hideLoadingSpinner();
            return;
        }

        const fragment = document.createDocumentFragment();
        workoutData.Weeks.forEach(week => {
            const weekElement = document.createElement('div');
            weekElement.className = 'week mb-4';
            weekElement.innerHTML = `<h2>Week ${week.Week}</h2>`;
            
            week.Workouts.forEach(workout => {
                weekElement.appendChild(createWorkoutDay(workout));
            });
            
            fragment.appendChild(weekElement);
        });

        this.container.replaceChildren(fragment);
        hideLoadingSpinner();
    }
}
