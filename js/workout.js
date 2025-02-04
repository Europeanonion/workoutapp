// js/workout.js

// Constants and Configuration
const BASE_URL = "https://europeanonion.github.io/workoutapp";

const PHASE_OPTIONS = [
  { value: `${BASE_URL}/data/workout_plan_phase_1_with_links.json`, label: "Phase 1 - Base Hypertrophy" },
  { value: `${BASE_URL}/data/workout_plan_phase_2_with_links.json`, label: "Phase 2 - Maximum Effort" },
  { value: `${BASE_URL}/data/workout_plan_phase_3_with_links.json`, label: "Phase 3 - Hypertrophy & Endurance" }
];

let currentPage = 1;
const entriesPerPage = 10;
let volumeChart; // To hold the Chart instance

/**
 * Display workout data on the page
 * @param {object} data - The workout data JSON
 */
function displayWorkout(data) {
  const container = document.getElementById("workout-container");
  container.innerHTML = "";

  let exerciseIndex = 0; // To track the index of each exercise

  data.weeks.forEach((weekObj) => {
    // Add week-level heading
    const weekHeader = document.createElement("div");
    weekHeader.classList.add("week", "d-flex", "align-items-center", "mt-4", "mb-2");
    weekHeader.innerHTML = `<i class="fas fa-calendar-alt me-2"></i> Week ${weekObj.week}`;
    container.appendChild(weekHeader);

    weekObj.workouts.forEach((workoutDay) => {
      // Add day-level heading
      const dayHeader = document.createElement("div");
      dayHeader.classList.add("day", "d-flex", "align-items-center", "mb-2");
      dayHeader.innerHTML = `<i class="fas fa-dumbbell me-2"></i> ${workoutDay.day}`;
      container.appendChild(dayHeader);

      workoutDay.exercises.forEach((exercise) => {
        // Render each exercise
        container.appendChild(createExerciseElement(exercise, exerciseIndex));
        exerciseIndex++;
      });
    });
  });
}

/**
 * Create a DOM element for an exercise
 * @param {object} exercise - The exercise data
 * @param {number} index - The index of the exercise
 * @returns {HTMLElement} - The exercise DOM element
 */
function createExerciseElement(exercise, index) {
  const exerciseDiv = document.createElement("div");
  exerciseDiv.classList.add("exercise");

  const setsValue = getWorkoutData(index)?.sets || exercise["Working Sets"] || "";
  const repsValue = getWorkoutData(index)?.reps || exercise.Reps || "";
  const loadValue = getWorkoutData(index)?.load || "";

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

  // Add SAVE button event
  exerciseDiv.querySelector(`#save-btn-${index}`).addEventListener("click", () => {
    saveProgress(index, exercise.Exercise);
  });

  return exerciseDiv;
}

/**
 * Sanitize input to prevent XSS
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitize(str) {
  if (typeof str !== "string") return "";
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Initialize the workout by loading data
 * @param {string} selectedPhase - The URL of the selected workout phase
 */
async function loadWorkout(selectedPhase, retryCount = 3) {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.add("active");

  const url = selectedPhase; // Relative path to JSON file
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid or empty JSON data");
    }
    displayWorkout(data);
    showToast("Workout data loaded successfully!", 'success');
  } catch (error) {
    console.error("Error fetching JSON:", error);
    if (retryCount > 0) {
      console.log(`Retrying... Attempts left: ${retryCount}`);
      loadWorkout(selectedPhase, retryCount - 1);
    } else {
      showToast("Failed to load workout data. Please try again later.", 'danger');
    }
  } finally {
    spinner.classList.remove("active");
  }
}

