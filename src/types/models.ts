export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  videoLink?: string;
  instructions?: string;
}

export interface WorkoutPlan {
  id: string;
  phase: number;
  exercises: Exercise[];
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  isLoading: boolean;
  error: Error | null;
}
