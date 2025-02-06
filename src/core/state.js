export class WorkoutState {
    constructor(storageService) {
        this.storageService = storageService;
        this.currentPhase = null;
        this.workoutData = null;
        this.subscribers = new Set();
        this.loadInitialState();
    }

    loadInitialState() {
        this.currentPhase = this.storageService.getValue('selectedPhase');
        this.workoutData = this.storageService.getValue('currentWorkout');
        this.notify();
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.getState());
        return () => this.subscribers.delete(callback);
    }

    setState(newState) {
        try {
            if (!newState || typeof newState !== 'object') {
                throw new Error('Invalid state update');
            }
            Object.assign(this, newState);
            this.notify();
            return true;
        } catch (error) {
            console.error('[State] Error updating state:', error);
            return false;
        }
    }

    getState() {
        return {
            currentPhase: this.currentPhase,
            workoutData: this.workoutData
        };
    }

    notify() {
        try {
            const state = this.getState();
            this.subscribers.forEach(cb => {
                try {
                    cb(state);
                } catch (error) {
                    console.error('[State] Error in subscriber callback:', error);
                }
            });
        } catch (error) {
            console.error('[State] Error in notify:', error);
        }
    }
}