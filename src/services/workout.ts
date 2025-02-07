import { Exercise, WorkoutPlan } from '../types/models';
import { logger } from '../utils/ErrorLogger';

export class WorkoutService {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/workouts/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logger.log('high', `Failed to fetch workout plan: ${error instanceof Error ? error.message : 'Unknown error'}`, 'WorkoutService', error);
      throw new Error(`Failed to fetch workout plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveExercise(exercise: Exercise): Promise<Exercise> {
    try {
      const response = await fetch(`${this.baseUrl}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exercise),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      logger.log('high', `Failed to save exercise: ${error instanceof Error ? error.message : 'Unknown error'}`, 'WorkoutService', error);
      throw new Error(`Failed to save exercise: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export async function loadWorkoutPlan(phase: number): Promise<WorkoutPlan | null> {
  try {
    const response = await fetch(`/data/workout_plan_phase_${phase}_with_links.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.log('high', `Failed to load workout plan for phase ${phase}`, 'WorkoutService', error);
    return null;
  }
}

export async function saveWorkoutProgress(progress: WorkoutProgress): Promise<boolean> {
  try {
    // Implementation for saving workout progress
    return true;
  } catch (error) {
    logger.log('high', 'Failed to save workout progress', 'WorkoutService', error);
    return false;
  }
}
