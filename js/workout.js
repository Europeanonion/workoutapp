// js/workout.js

(function() {
  // Constants and Configuration
  const PHASE_OPTIONS = [
    { value: "data/workout_plan_phase_1_with_links.json", label: "Phase 1 - Base Hypertrophy" },
    { value: "data/workout_plan_phase_2_with_links.json", label: "Phase 2 - Maximum Effort" },
    { value: "data/workout_plan_phase_3_with_links.json", label: "Phase 3 - Hypertrophy & Endurance" }
  ];

  // Expose PHASE_OPTIONS to the global scope
  window.PHASE_OPTIONS = PHASE_OPTIONS;

  /**
   * Fetch Workout Data Based on Selected Phase
   * @param {string} phaseUrl - The URL of the selected workout phase JSON file
   * @returns {Promise<Object>} - The workout data JSON
   */
  async function fetchWorkoutData(phaseUrl) {
    console.log(`Fetching workout data from: ${phaseUrl}`);
    try {
      const response = await fetch(phaseUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Workout data fetched successfully.");
      return data;
    } catch (error) {
      console.error("Error in fetchWorkoutData:", error);
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
    container.innerHTML = ""; // Clear previous data
  
    let exerciseIndex = 0; // To track the index of each exercise
  
    data.weeks.forEach((weekObj) => {
      // Add week-level heading
      const weekHeader = document.createElement("div");
      weekHeader.classList.add("week", "d-flex", "align-items-center", "mt-4", "mb-2", "p-2");
      weekHeader.innerHTML = `<i class="fas fa-calendar-alt me-2"></i> Week ${weekObj.week}`;
      container.appendChild(weekHeader);
  
      weekObj.workouts.forEach((workoutDay) => {
        // Add day-level heading
        const dayHeader = document.createElement("div");
        dayHeader.classList.add("day", "d-flex", "align-items-center", "mb-3", "p-2", "bg-dark", "text-white");
        dayHeader.innerHTML = `<i class="fas fa-dumbbell me-2"></i> ${workoutDay.day}`;
        container.appendChild(dayHeader);
  
        // Create a row for exercises
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row", "gx-3"); // Bootstrap grid row
  
        workoutDay.exercises.forEach((exercise) => {
          rowDiv.appendChild(createExerciseElement(exercise, exerciseIndex));
          exerciseIndex++;
        });
  
        container.appendChild(rowDiv);
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
    exerciseDiv.classList.add("exercise", "col-md-6", "mb-4"); // Uses Bootstrap grid system
  
    const setsValue = getSavedValue(index, "sets") || exercise["Working Sets"] || "";
    const repsValue = getSavedValue(index, "reps") || exercise.Reps || "";
    const loadValue = getSavedValue(index, "load") || "";
  
    exerciseDiv.innerHTML = `
      <div class="card shadow-sm p-3">
        <h2>
          <a href="${sanitize(exercise.ExerciseLink || '#')}" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-external-link-alt me-2"></i> ${sanitize(exercise.Exercise || 'Untitled Exercise')}
          </a>
        </h2>
        <div class="row">
          <div class="col-md-4 mb-3">
            <label for="sets-${index}" class="form-label">Sets</label>
            <input type="number" min="0" class="form-control" id="sets-${index}" value="${setsValue}" placeholder="e.g., 3" required />
          </div>
          <div class="col-md-4 mb-3">
            <label for="reps-${index}" class="form-label">Reps</label>
            <input type="number" min="0" class="form-control" id="reps-${index}" value="${repsValue}" placeholder="e.g., 10" required />
          </div>
          <div class="col-md-4 mb-3">
            <label for="load-${index}" class="form-label">Load (kg)</label>
            <input type="number" min="0" class="form-control" id="load-${index}" value="${loadValue}" placeholder="Weight" required />
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
        <button class="btn btn-primary mt-2" id="save-btn-${index}">
          <i class="fas fa-save me-2"></i> Save
        </button>
      </div>
    `;
  
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

  /**
   * Expose necessary functions and variables to the global scope
   */
  window.loadWorkout = loadWorkout;

  /**
   * Define the loadWorkout function and attach it to the window object
   * (Assuming it was missing in the previous implementation)
   */
  async function loadWorkout(phaseUrl) {
    console.log(`loadWorkout called with URL: ${phaseUrl}`);
    try {
      const data = await fetchWorkoutData(phaseUrl);
      displayWorkout(data);
      console.log("Workout data displayed successfully.");
    } catch (error) {
      console.error("Error in loadWorkout:", error);
      showToast("Failed to load workout data.", "danger");
    }
  }
})();
