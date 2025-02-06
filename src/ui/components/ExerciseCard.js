export class ExerciseCard extends HTMLElement {
    static get observedAttributes() {
        return ['exercise-data'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'exercise-data') {
            this.render();
        }
    }

    validateExerciseData(data) {
        const required = ['name', 'link', 'index'];
        const isValid = required.every(prop => prop in data);
        
        if (!isValid) {
            console.error('Invalid exercise data:', data);
            this.renderError('Invalid exercise data');
            return false;
        }
        return true;
    }

    renderError(message) {
        this.shadowRoot.innerHTML = `
            <div class="exercise-error alert alert-danger">
                <p>${message}</p>
            </div>
        `;
    }

    render() {
        try {
            const exercise = JSON.parse(this.getAttribute('exercise-data'));
            
            if (!this.validateExerciseData(exercise)) {
                return;
            }

            this.shadowRoot.innerHTML = `
                <div class="exercise card shadow-sm p-3" data-exercise-id="${exercise.index}">
                    <h2>
                        <a href="${exercise.link}" target="_blank" rel="noopener noreferrer">
                            ${exercise.name}
                        </a>
                    </h2>
                    <div class="exercise-inputs row">
                        <!-- Exercise inputs will be generated here -->
                    </div>
                    <div class="exercise-details mt-3">
                        <!-- Exercise details will be generated here -->
                    </div>
                </div>
            `;
        } catch (error) {
            this.renderError('Failed to render exercise');
            console.error('ExerciseCard render error:', error);
        }
    }
}

customElements.define('exercise-card', ExerciseCard);