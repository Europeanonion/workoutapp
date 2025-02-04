// js/workout.js

// Constants and Configuration

const PHASE_OPTIONS = [
  { value: "data/workout_plan_phase_1_with_links.json", label: "Phase 1 - Base Hypertrophy" },
  { value: "data/workout_plan_phase_2_with_links.json", label: "Phase 2 - Maximum Effort" },
  { value: "data/workout_plan_phase_3_with_links.json", label: "Phase 3 - Hypertrophy & Endurance" }
];

/**
 * Fetch Workout Data Based on Selected Phase
 * @param {string} phaseUrl - The URL of the selected workout phase JSON file
 * @returns {Promise<Object>} - The workout data JSON
 */
async function fetchWorkoutData(phaseUrl) {
  try {
    const response = await fetch(phaseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    showToast("Error loading workout data. Please try again later.", "danger");
    throw error; // Re-throw to allow further handling if needed
  }
}

/**
 * Display Workout Data on the Page
 * @param {Object} data - The workout data JSON
 */
function displayWorkout(data) {
  const container = document.getElementById("workout-container");
  container.innerHTML = ""; // Clear existing content

  let exerciseIndex = 0; // To uniquely identify exercises

  data.weeks.forEach((weekObj) => {
    // Create Week Header
    const weekHeader = document.createElement("div");
    weekHeader.classList.add("week", "d-flex", "align-items-center", "mt-4", "mb-2");
    weekHeader.innerHTML = `<i class="fas fa-calendar-alt me-2"></i> Week ${weekObj.week}`;
    container.appendChild(weekHeader);

    // Iterate through each workout day
    weekObj.workouts.forEach((workoutDay) => {
      // Create Day Header
      const dayHeader = document.createElement("div");
      dayHeader.classList.add("day", "d-flex", "align-items-center", "mb-2");
      dayHeader.innerHTML = `<i class="fas fa-dumbbell me-2"></i> ${workoutDay.day}`;
      container.appendChild(dayHeader);

      // Iterate through each exercise
      workoutDay.exercises.forEach((exercise) => {
        const exerciseElement = createExerciseElement(exercise, exerciseIndex);
        container.appendChild(exerciseElement);
        exerciseIndex++;
      });
    });
  });
}

/**
 * Create a DOM Element for an Exercise
 * @param {Object} exercise - The exercise data
 * @param {number} index - The unique index of the exercise
 * @returns {HTMLElement} - The exercise DOM element
 */
function createExerciseElement(exercise, index) {
  const exerciseDiv = document.createElement("div");
  exerciseDiv.classList.add("exercise");

  // Retrieve saved data if available
  const savedData = getWorkoutData(index);
  const setsValue = savedData?.sets || exercise["Working Sets"] || "";
  const repsValue = savedData?.reps || exercise.Reps || "";
  const loadValue = savedData?.load || "";

  exerciseDiv.innerHTML = `
    <h2>
      <a href="${sanitize(exercise.ExerciseLink || '#')}" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-external-link-alt me-2"></i> ${sanitize(exercise.Exercise || 'Untitled Exercise')}
      </a>
    </h2>
    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="sets-${index}" class="form-label">Sets</label>
        <input type="number" min="0" class="form-control" aria-label="Sets for ${sanitize(exercise.Exercise)}"
               id="sets-${index}" value="${setsValue}" placeholder="e.g., 3" required />
      </div>
      <div class="col-md-4 mb-3">
        <label for="reps-${index}" class="form-label">Reps</label>
        <input type="number" min="0" class="form-control" aria-label="Reps for ${sanitize(exercise.Exercise)}"
               id="reps-${index}" value="${repsValue}" placeholder="e.g., 10" required />
      </div>
      <div class="col-md-4 mb-3">
        <label for="load-${index}" class="form-label">Load (kg)</label>
        <input type="number" min="0" class="form-control" aria-label="Load for ${sanitize(exercise.Exercise)}"
               id="load-${index}" placeholder="Weight" value="${loadValue}" required />
      </div>
    </div>
    <p class="mb-2"><strong>Rest:</strong> ${sanitize(exercise.Rest || 'N/A')}</p>
    <p class="mb-2"><strong>Notes:</strong> ${sanitize(exercise.Notes || 'No notes available')}</p>
    <p class="mb-2"><strong>Substitution 1:</strong>
      <a href="${sanitize(exercise["Substitution Option 1 Link"] || '#')}" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-external-link-alt me-2"></i> ${sanitize(exercise["Substitution Option 1"] || 'N/A')}
      </a>
    </p>
    <p class="mb-2"><strong>Substitution 2:</strong>
      <a href="${sanitize(exercise["Substitution Option 2 Link"] || '#')}" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-external-link-alt me-2"></i> ${sanitize(exercise["Substitution Option 2"] || 'N/A')}
      </a>
    </p>
    <button class="btn btn-primary mt-2" aria-label="Save workout data for ${sanitize(exercise.Exercise)}"
            id="save-btn-${index}">
      <i class="fas fa-save me-2"></i> Save
    </button>
  `;

  // Add SAVE button event listener
  exerciseDiv.querySelector(`#save-btn-${index}`).addEventListener("click", () => {
    saveProgress(index, exercise.Exercise);
  });

  return exerciseDiv;
}

/**
 * Sanitize Input to Prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitize(str) {
  if (typeof str !== "string") return "";
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}
