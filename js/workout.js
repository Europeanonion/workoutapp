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
    console.log(`[Workout] Fetching workout data from: ${phaseUrl}`);

    try {
        const response = await fetch(phaseUrl);
        console.log("[Workout] Response Status:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("[Workout] Workout Data:", data);

        return data;
    } catch (error) {
        console.error("[Workout] JSON Load Error:", error);
        showToast("Error loading workout data. Please try again later.", "danger");
        throw error; // Re-throw to allow further handling if needed
    }
  }

   /**
   * Display Workout Data
   * @param {object} data - The workout data
   */
  function displayWorkout(data) {
    console.log("[Workout] JSON Data Received:", data);
    const container = document.getElementById('workout-container');
    
    try {
      if (!data || !data.weeks) {
        throw new Error("Invalid workout data format");
      }
  
      // Clear existing content
      container.innerHTML = '';
  
      data.weeks.forEach((weekObj) => {
        console.log(`[Workout] Processing Week ${weekObj.week}`);
        weekObj.workouts.forEach((workoutDay) => {
          console.log(`[Workout] Processing Workout Day: ${workoutDay.day}`);
  
          workoutDay.exercises.forEach((exercise, index) => {
            console.log(`[Workout] Loading Exercise ${index + 1}:`, exercise);
  
            if (!exercise.Exercise) {
              console.warn(`[WARNING] Exercise ${index + 1} is missing a name!`);
            }
            if (!exercise.Reps) {
              console.warn(`[WARNING] Exercise "${exercise.Exercise}" is missing Reps!`);
            }
            if (!exercise.Load) {
              console.warn(`[WARNING] Exercise "${exercise.Exercise}" is missing Load!`);
            }
  
            const exerciseElement = createExerciseElement(exercise, index);
            container.appendChild(exerciseElement);
          });
        });
      });
    } catch (error) {
      console.error("[Workout] Display error:", error);
      container.innerHTML = '<div class="alert alert-danger">Failed to display workout data</div>';
      showToast("Error displaying workout data", "danger");
    }
  }

 /**
   * Create Exercise Element
   * @param {object} exercise - The exercise data
   * @param {number} index - The index of the exercise
   * @returns {HTMLElement} - The created exercise element
   */
 function createExerciseElement(exercise, index) {
  console.log(`[Workout] Creating Exercise: ${exercise.Exercise || "Untitled"}`);

  // Ensure correct property mapping
  const exerciseName = exercise.Exercise || exercise.name || "Unnamed Exercise";
  const exerciseLink = exercise.ExerciseLink || exercise.link || "#";
  const setsValue = getSavedValue(`sets_${index}`, exercise["Working Sets"] || exercise.WorkingSets || exercise.working_sets || 3);
  const repsValue = getSavedValue(`reps_${index}`, exercise.Reps || exercise.reps || 10);
  const loadValue = getSavedValue(`load_${index}`, exercise.Load || exercise.load || 0);

  console.log(`[Workout] Exercise: ${exerciseName}, Sets: ${setsValue}, Reps: ${repsValue}, Load: ${loadValue}`);

  // Create Exercise Card
  const exerciseDiv = document.createElement("div");
  exerciseDiv.classList.add("exercise", "col-md-6", "mb-4");

  exerciseDiv.innerHTML = `
    <div class="card shadow-sm p-3">
      <h2>
        <a href="${sanitize(exerciseLink)}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-external-link-alt me-2"></i> ${sanitize(exerciseName)}
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
      <button class="btn btn-primary mt-2" id="save-btn-${index}">
        <i class="fas fa-save me-2"></i> Save
      </button>
    </div>
  `;

  return exerciseDiv;
}

  // Expose functions globally if needed
  window.createExerciseElement = createExerciseElement;
  window.displayWorkout = displayWorkout;

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

  // Add property normalization
  function normalizeExerciseData(exercise) {
    return {
      name: exercise.Exercise || exercise.name || "Unnamed Exercise",
      link: exercise.ExerciseLink || exercise.link || "#",
      workingSets: exercise["Working Sets"] || exercise.WorkingSets || 3,
      reps: exercise.Reps || exercise.reps || "10-12",
      rest: exercise.Rest || "~2-3 min",
      notes: exercise.Notes || "No notes available"
    };
  }

})();
