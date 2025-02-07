export class StorageService {
    private static readonly RETRY_ATTEMPTS = 3;
    private static readonly RETRY_DELAY = 1000;

    async save(key: string, data: any): Promise<void> {
        let attempts = 0;
        while (attempts < StorageService.RETRY_ATTEMPTS) {
            try {
                const serialized = JSON.stringify(data);
                localStorage.setItem(key, serialized);
                return;
            } catch (error) {
                attempts++;
                if (attempts === StorageService.RETRY_ATTEMPTS) {
                    throw new Error(`Storage operation failed: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, StorageService.RETRY_DELAY));
            }
        }
    }

    load<T>(key: string): T | null {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading data: ${error.message}`);
            return null;
        }
    }
}
