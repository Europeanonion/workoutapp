export class BaseWorkoutView {
    constructor(container) {
        this.container = container;
        this.pageSize = 20;
        this.currentPage = 0;
    }

    createExerciseElement(exercise) {
        const exerciseCard = document.createElement('exercise-card');
        exerciseCard.setAttribute('exercise-data', JSON.stringify(exercise));
        return exerciseCard;
    }

    createLoadingState() {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 3; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-loader exercise';
            skeleton.innerHTML = `
                <div class="skeleton-title"></div>
                <div class="skeleton-inputs"></div>
                <div class="skeleton-text"></div>
            `;
            fragment.appendChild(skeleton);
        }
        return fragment;
    }
}
