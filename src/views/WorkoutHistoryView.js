import { BaseWorkoutView } from './BaseWorkoutView.js';
import { showLoadingSpinner, hideLoadingSpinner } from '../ui/components/LoadingSpinner.js';

export class WorkoutHistoryView extends BaseWorkoutView {
    constructor(container, state) {
        super(container);
        this.state = state;
        this.observer = new IntersectionObserver(this.loadMoreEntries.bind(this));
        this.init();
    }

    // ...existing code...

    renderPage(page, history, fragment) {
        const start = page * this.pageSize;
        const end = start + this.pageSize;
        const entries = history.slice(start, end);
        
        entries.forEach(entry => {
            fragment.appendChild(this.createHistoryEntry(entry));
        });
    }

    // ...existing code...
}
