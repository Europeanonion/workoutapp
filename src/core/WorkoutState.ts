import { StorageService } from './StorageService';

export class WorkoutState {
    private subscribers = new Set<(state: any) => void>();
    private updateTimeout: number | null = null;
    private saveTimeout: number | null = null;

    constructor(private storageService: StorageService) {}

    subscribe(callback: (state: any) => void): () => void {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    setState(newState: any): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = window.setTimeout(() => {
            this.notifySubscribers(newState);
        }, 250);

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = window.setTimeout(() => {
            this.storageService.save('workoutState', newState);
        }, 1000);
    }

    private notifySubscribers(state: any): void {
        this.subscribers.forEach(callback => callback(state));
    }
}
