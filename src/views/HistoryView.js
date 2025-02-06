import { BaseWorkoutView } from './BaseWorkoutView.js';
import { showLoadingSpinner, hideLoadingSpinner } from '../ui/components/LoadingSpinner.js';

export class HistoryView extends BaseWorkoutView {
    constructor(container, state) {
        super(container);
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

    render(historyData = this.state.getWorkoutHistory()) {
        showLoadingSpinner();

        if (!Array.isArray(historyData) || !historyData.length) {
            this.container.innerHTML = '<div class="alert alert-info">No workout history available</div>';
            hideLoadingSpinner();
            return;
        }

        const fragment = document.createDocumentFragment();
        this.renderPage(0, historyData, fragment);
        
        this.container.replaceChildren(fragment);
        
        const lastItem = this.container.lastElementChild;
        if (lastItem) this.observer.observe(lastItem);
        
        hideLoadingSpinner();
    }

    // ...existing code from WorkoutHistoryView.js...
}
