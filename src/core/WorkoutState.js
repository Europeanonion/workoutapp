import { debounce, throttle } from './utils.js';

export class WorkoutState {
    constructor(storageService) {
        this.storageService = storageService;
        this.subscribers = new Set();
        this.currentPhase = null;
        this.workoutData = null;
        
        // Debounced and throttled methods
        this.debouncedNotify = debounce(this.notify.bind(this), 250);
        this.throttledSave = throttle(this.saveState.bind(this), 1000);
        
        this.loadInitialState();
    }

    cleanupSubscribers() {
        this.subscribers = new Set([...this.subscribers].filter(sub => !sub.isDestroyed));
    }

    subscribe(callback) {
        const subscription = {
            callback,
            isDestroyed: false
        };
        this.subscribers.add(subscription);
        subscription.callback(this.getState());
        
        return () => {
            subscription.isDestroyed = true;
            this.cleanupSubscribers();
        };
    }

    // ...existing code...

    notify() {
        try {
            const state = this.getState();
            this.subscribers.forEach(sub => {
                if (!sub.isDestroyed) {
                    try {
                        sub.callback(state);
                    } catch (error) {
                        console.error('[State] Error in subscriber callback:', error);
                    }
                }
            });
            this.throttledSave();
        } catch (error) {
            console.error('[State] Error in notify:', error);
        }
    }

    saveState() {
        const state = this.getState();
        this.storageService.setValue('appState', state);
    }
}
