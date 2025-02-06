export class ExerciseCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadExerciseDetails();
                    observer.disconnect();
                }
            });
        });
        observer.observe(this);
    }

    async loadExerciseDetails() {
        this.shadowRoot.innerHTML = `<div class="loading">Loading...</div>`;
        const exercise = JSON.parse(this.getAttribute('exercise-data'));
        this.render(exercise);
    }

    render(exercise) {
        this.shadowRoot.innerHTML = `
            <style>
                // ...existing code...
            </style>
            <div class="exercise-card">
                <h3>${exercise.Exercise}</h3>
                <div class="exercise-details">
                    // ...existing code...
                </div>
            </div>
        `;
    }
}

customElements.define('exercise-card', ExerciseCard);
