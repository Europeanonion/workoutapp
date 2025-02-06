import { createExerciseCard } from './ExerciseCard.js';

export function createWorkoutDay(workout) {
    const dayElement = document.createElement('div');
    dayElement.className = 'workout mb-3';
    dayElement.innerHTML = `<h3>${workout.Day}</h3>`;

    const exercisesContainer = document.createElement('div');
    exercisesContainer.className = 'row';

    workout.Exercises.forEach((exercise, index) => {
        const exerciseElement = document.createElement('div');
        exerciseElement.className = 'col-md-6 mb-4';
        exerciseElement.innerHTML = createExerciseCard(exercise, index);
        exercisesContainer.appendChild(exerciseElement);
    });

    dayElement.appendChild(exercisesContainer);
    return dayElement;
}
