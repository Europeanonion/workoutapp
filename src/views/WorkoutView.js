import { BaseWorkoutView } from './BaseWorkoutView.js';
import { showLoadingSpinner, hideLoadingSpinner } from '../ui/components/LoadingSpinner.js';
import { createWorkoutDay } from '../ui/components/WorkoutDay.js';

export class WorkoutView extends BaseWorkoutView {
    constructor(container, state) {
        super(container);
        this.state = state;
        this.observer = new IntersectionObserver(this.loadMoreEntries.bind(this));
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
        const workoutData = newState?.workoutData;
        
        requestAnimationFrame(() => {
            if (!workoutData?.Weeks) {
                this.container.appendChild(this.createLoadingState());
                hideLoadingSpinner();
                return;
            }

            const fragment = document.createDocumentFragment();
            workoutData.Weeks.forEach(week => {
                const weekElement = this.createWeekElement(week);
                fragment.appendChild(weekElement);
            });
            
            this.container.replaceChildren(fragment);
            
            const lastItem = this.container.lastElementChild;
            if (lastItem) this.observer.observe(lastItem);
            
            hideLoadingSpinner();
        });
    }

    createWeekElement(week) {
        const weekElement = document.createElement('div');
        weekElement.className = 'week mb-4';
        weekElement.innerHTML = `<h2>Week ${week.Week}</h2>`;
        
        week.Workouts.forEach(workout => {
            weekElement.appendChild(createWorkoutDay(workout));
        });
        
        return weekElement;
    }

    loadMoreEntries(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.currentPage++;
                // Implementation for pagination if needed
            }
        });
    }
}
