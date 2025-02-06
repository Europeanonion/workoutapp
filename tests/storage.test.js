import { StorageService } from '../src/services/storage.js';

describe('StorageService', () => {
    let storage;
    
    beforeEach(() => {
        storage = new StorageService();
        localStorage.clear();
    });

    test('setValue should store data correctly', () => {
        const testData = { name: 'test' };
        storage.setValue('test-key', testData);
        
        const stored = JSON.parse(localStorage.getItem('test-key'));
        expect(stored).toEqual(testData);
    });

    test('getValue should retrieve data correctly', () => {
        const testData = { name: 'test' };
        localStorage.setItem('test-key', JSON.stringify(testData));
        
        const retrieved = storage.getValue('test-key');
        expect(retrieved).toEqual(testData);
    });
});
