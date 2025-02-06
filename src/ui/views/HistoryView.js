import { state } from '../../core/state.js';
import { showLoadingSpinner, hideLoadingSpinner } from '../components/LoadingSpinner.js';

export class HistoryView {
    constructor(container) {
        this.container = container;
        this.state = state;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.delete-entry')) {
                const entryId = e.target.dataset.entryId;
                this.deleteHistoryEntry(entryId);
            }
        });
    }

    render() {
        showLoadingSpinner();
        const history = this.state.getWorkoutHistory();

        if (!history.length) {
            this.container.innerHTML = '<div class="alert alert-info">No workout history available</div>';
            hideLoadingSpinner();
            return;
        }

        const fragment = document.createDocumentFragment();
        history.forEach((entry, index) => {
            const entryElement = this.createHistoryEntry(entry, index);
            fragment.appendChild(entryElement);
        });

        this.container.replaceChildren(fragment);
        hideLoadingSpinner();
    }

    createHistoryEntry(entry, index) {
        const div = document.createElement('div');
        div.className = 'history-entry card shadow-sm p-3 mb-3';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h3>Workout on ${new Date(entry.date).toLocaleDateString()}</h3>
                <button class="btn btn-danger delete-entry" data-entry-id="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="workout-details mt-2">
                <strong>Phase:</strong> ${entry.phase}<br>
                <strong>Exercises:</strong> ${entry.exercises.length}
            </div>
        `;
        return div;
    }

    deleteHistoryEntry(entryId) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.state.deleteHistoryEntry(entryId);
            this.render();
        }
    }
}
