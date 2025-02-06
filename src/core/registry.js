export class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }

    /**
     * @template T
     * @param {string} key - Service identifier
     * @param {T} service - Service instance
     */
    register(key, service) {
        this.services.set(key, service);
    }

    /**
     * @template T
     * @param {string} key - Service identifier
     * @returns {T} Service instance
     */
    get(key) {
        if (!this.services.has(key)) {
            throw new Error(`Service '${key}' not found in registry`);
        }
        return this.services.get(key);
    }
}
