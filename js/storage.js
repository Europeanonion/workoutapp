const BASE_URL = "data";

const PHASE_OPTIONS = [
  { value: `${BASE_URL}/workout_plan_phase_1_with_links.json`, label: "Phase 1 - Base Hypertrophy" },
  { value: `${BASE_URL}/workout_plan_phase_2_with_links.json`, label: "Phase 2 - Maximum Effort" },
  { value: `${BASE_URL}/workout_plan_phase_3_with_links.json`, label: "Phase 3 - Hypertrophy & Endurance" }
];

const STORAGE_KEYS = {
  SELECTED_PHASE: 'selectedPhase',
  WORKOUT_HISTORY: 'workoutHistory',
  WORKOUT_PREFIX: 'workout-',
  THEME: 'theme'
};

let currentPage = 1;
const entriesPerPage = 10;
let volumeChart; // To hold the Chart instance

// Fetch and Display Workout
async function loadWorkout(selectedPhase, retryCount = 3) {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.add("active");

  const url = selectedPhase; // Relative path to JSON file
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (!data.weeks || !Array.isArray(data.weeks) || data.weeks.length === 0) {
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

// Display Workout
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

// Create Exercise Element
function createExerciseElement(exercise, index) {
  const exerciseDiv = document.createElement("div");
  exerciseDiv.classList.add("exercise");

  const setsValue = getSavedValue(index, "sets") || exercise["Working Sets"] || "";
  const repsValue = getSavedValue(index, "reps") || exercise.Reps || "";
  const loadValue = getSavedValue(index, "load") || "";

  exerciseDiv.innerHTML = `
    <h2>
      <a href="${sanitize(exercise.ExerciseLink || '#')}" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-external-link-alt me-2"></i> ${sanitize(exercise.Exercise || 'Untitled Exercise')}
      </a>
    </h2>
    <div class="row">
      ${createInputField('sets', index, 'Sets', setsValue, 'e.g., 3')}
      ${createInputField('reps', index, 'Reps', repsValue, 'e.g., 10')}
      ${createInputField('load', index, 'Load (kg)', loadValue, 'Weight')}
    </div>
    <p class="mb-2"><strong>Rest:</strong> ${sanitize(exercise.Rest || 'N/A')}</p>
    <p class="mb-2"><strong>Notes:</strong> ${sanitize(exercise.Notes || 'No notes available')}</p>
    ${createSubstitutionLink('Substitution 1', exercise["Substitution Option 1"], exercise["Substitution Option 1 Link"])}
    ${createSubstitutionLink('Substitution 2", exercise["Substitution Option 2"], exercise["Substitution Option 2 Link"])}
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

// Create Input Field
function createInputField(type, index, label, value, placeholder) {
  return `
    <div class="col-md-4 mb-3">
      <label for="${type}-${index}" class="form-label">${label}</label>
      <input type="number" min="0" class="form-control" aria-label="${label} for ${sanitize(exercise.Exercise)}"
             id="${type}-${index}" value="${value}" placeholder="${placeholder}" required />
    </div>
  `;
}

// Create Substitution Link
function createSubstitutionLink(label, option, link) {
  return `
    <p class="mb-2"><strong>${label}:</strong>
      <a href="${sanitize(link || '#')}" target="_blank" rel="noopener noreferrer">
        <i class="fas fa-external-link-alt me-2"></i> ${sanitize(option || 'N/A')}
      </a>
    </p>
  `;
}

// Sanitize Input to Prevent XSS
function sanitize(str) {
  if (typeof str !== "string") return "";
  const temp = document.createElement("div");
  temp.textContent = str;
  return temp.innerHTML;
}
