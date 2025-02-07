import { describe, it, expect, vi } from 'vitest';
import { WorkoutService } from '../services/workout';

describe('WorkoutService', () => {
  it('should fetch workout plan successfully', async () => {
    const mockPlan = {
      id: '1',
      phase: 1,
      exercises: [],
      duration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPlan,
    });

    const service = new WorkoutService();
    const result = await service.getWorkoutPlan('1');

    expect(result).toEqual(mockPlan);
    expect(fetch).toHaveBeenCalledWith('/api/workouts/1');
  });

  it('should handle errors when fetching fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const service = new WorkoutService();
    await expect(service.getWorkoutPlan('1')).rejects.toThrow('Failed to fetch workout plan');
  });
});
