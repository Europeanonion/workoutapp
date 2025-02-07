export class ServiceRegistry {
    private static instance: ServiceRegistry;
    private services = new Map<string, any>();

    private constructor() {}

    static getInstance(): ServiceRegistry {
        if (!ServiceRegistry.instance) {
            ServiceRegistry.instance = new ServiceRegistry();
        }
        return ServiceRegistry.instance;
    }

    register<T>(key: string, service: T): void {
        this.services.set(key, service);
    }

    get<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service ${key} not found`);
        }
        return service as T;
    }

    dispose(): void {
        this.services.clear();
    }
}
