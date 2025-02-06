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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(phaseUrl, {
            signal: controller.signal,
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        clearTimeout(timeoutId);
        console.log("[Workout] Response Status:", response.status);

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!validateWorkoutData(data)) {
            throw new Error('Invalid workout data structure');
        }

        console.log("[Workout] Workout Data:", data);
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("[Workout] Request timeout");
            showToast("Request timeout. Please check your connection.", "danger");
        } else {
            console.error("[Workout] JSON Load Error:", error);
            showToast("Error loading workout data. Please try again later.", "danger");
        }
        throw error;
    }
  }

  function validateWorkoutData(data) {
    return data?.Phase && 
           Array.isArray(data?.Weeks) && 
           data.Weeks.every(week => 
               week.Week && 
               Array.isArray(week.Workouts)
           );
  }

   /**
   * Display Workout Data
   * @param {object} data - The workout data
   */
  function displayWorkout(data) {
    const container = document.getElementById('workout-container');
    const fragment = document.createDocumentFragment();
    
    try {
        document.getElementById('loading-spinner').classList.remove('d-none');
        
        const normalizedData = {
            weeks: (data.Weeks || data.weeks || []).map(week => ({
                week: week.Week || week.week,
                workouts: (week.Workouts || week.workouts || []).map(workout => ({
                    day: workout.Day || workout.day,
                    exercises: (workout.Exercises || workout.exercises || [])
                }))
            }))
        };

        normalizedData.weeks.forEach(week => {
            const weekElement = document.createElement('div');
            weekElement.className = 'week mb-4';
            weekElement.innerHTML = `<h2>Week ${week.week}</h2>`;
            
            week.workouts.forEach(workout => {
                const workoutElement = document.createElement('div');
                workoutElement.className = 'workout mb-3';
                workoutElement.innerHTML = `<h3>${workout.day}</h3>`;
                
                workout.exercises.forEach((exercise, index) => {
                    const placeholder = createExercisePlaceholder(exercise, index);
                    workoutElement.appendChild(placeholder);
                    lazyLoadExercises(placeholder, exercise, index);
                });
                
                weekElement.appendChild(workoutElement);
            });
            
            fragment.appendChild(weekElement);
        });
        
        container.replaceChildren(fragment);
        
    } catch (error) {
        console.error("[Workout] Display error:", error);
        container.innerHTML = '<div class="alert alert-danger">Failed to display workout data</div>';
        showToast("Error displaying workout data", "danger");
    } finally {
        document.getElementById('loading-spinner').classList.add('d-none');
    }
}

 /**
   * Create Exercise Element
   * @param {object} exercise - The exercise data
   * @param {number} index - The index of the exercise
   * @returns {HTMLElement} - The created exercise element
   */
 function createExerciseElement(exercise, index) {
  const normalized = normalizeExerciseData(exercise);
  console.log(`[Workout] Creating Exercise: ${normalized.name}`);

  const exerciseDiv = document.createElement("div");
  exerciseDiv.classList.add("exercise", "col-md-6", "mb-4");

  exerciseDiv.innerHTML = `
    <div class="card shadow-sm p-3">
      <h2>
        <a href="${sanitize(normalized.link)}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-external-link-alt me-2"></i> ${sanitize(normalized.name)}
        </a>
      </h2>
      <div class="row">
        <div class="col-md-3 mb-3">
          <label for="warmup-sets-${index}" class="form-label">Warmup Sets</label>
          <input type="number" min="0" class="form-control" id="warmup-sets-${index}" value="${normalized.warmupSets}" placeholder="e.g., 2" required />
        </div>
        <div class="col-md-3 mb-3">
          <label for="sets-${index}" class="form-label">Working Sets</label>
          <input type="number" min="0" class="form-control" id="sets-${index}" value="${normalized.workingSets}" placeholder="e.g., 3" required />
        </div>
        <div class="col-md-3 mb-3">
          <label for="reps-${index}" class="form-label">Reps Range</label>
          <div class="input-group">
            <input type="number" min="0" class="form-control" id="min-reps-${index}" value="${normalized.minReps}" required />
            <span class="input-group-text">-</span>
            <input type="number" min="0" class="form-control" id="max-reps-${index}" value="${normalized.maxReps}" required />
          </div>
        </div>
        <div class="col-md-3 mb-3">
          <label for="load-${index}" class="form-label">Load (kg)</label>
          <input type="number" min="0" class="form-control" id="load-${index}" value="${normalized.load}" placeholder="Weight" required />
        </div>
      </div>
      <p class="mb-2"><strong>Rest:</strong> ${sanitize(normalized.rest)}</p>
      <p class="mb-2"><strong>Notes:</strong> ${sanitize(normalized.notes)}</p>
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
      warmupSets: exercise["Warmup Sets"] || exercise.WarmupSets || 2,
      reps: exercise.Reps || exercise.reps || "10-12",
      minReps: exercise.MinReps || parseInt(exercise.Reps) || 10,
      maxReps: exercise.MaxReps || parseInt(exercise.Reps) || 12,
      load: exercise.Load || exercise.load || 0,
      rest: exercise.Rest || exercise.rest || "~2-3 min",
      notes: exercise.Notes || exercise.notes || "No notes available"
    };
  }

  function createExercisePlaceholder(exercise, index) {
    const div = document.createElement('div');
    div.classList.add('exercise', 'col-md-6', 'mb-4', 'exercise-placeholder');
    div.dataset.exerciseIndex = index;
    div.innerHTML = `
        <div class="card shadow-sm p-3">
            <div class="skeleton-loader">
                <div class="skeleton-title"></div>
                <div class="skeleton-inputs"></div>
                <div class="skeleton-text"></div>
                <div class="loading-text">Loading ${exercise.Exercise || 'exercise'}...</div>
            </div>
        </div>`;
    return div;
}

function lazyLoadExercises(placeholder, exercise, index) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const exerciseElement = createExerciseElement(exercise, index);
                    placeholder.replaceWith(exerciseElement);
                    observer.disconnect();
                }
            });
        },
        { rootMargin: '100px', threshold: 0.1 }
    );
    
    observer.observe(placeholder);
}

})();
