(() => {
  let entriesPerPage = 10;
  let currentPage = 1;

  // Constants and Configuration
  const PHASE_OPTIONS = [
    { value: "data/workout_plan_phase_1_with_links.json", label: "Phase 1 - Base Hypertrophy" },
    { value: "data/workout_plan_phase_2_with_links.json", label: "Phase 2 - Maximum Effort" },
    { value: "data/workout_plan_phase_3_with_links.json", label: "Phase 3 - Hypertrophy & Endurance" }
  ];

  // Expose PHASE_OPTIONS to the global scope
  window.PHASE_OPTIONS = PHASE_OPTIONS;

  /**
   * Initialize the Application
   */
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeComponents();
        });
    } else {
        initializeComponents();
    }
  }

  /**
   * Initialize all components
   */
  function initializeComponents() {
    try {
        populatePhaseSelector();
        bindUIEvents();
        loadSavedTheme();
        loadSavedPhase();
        initializeTooltips();
        initializeGestures();
        
        // Show ready state
        document.getElementById('loading-spinner').style.display = 'none';
        showToast('App initialized successfully', 'success');
    } catch (error) {
        handleError(error, 'Initialization');
    }
  }

  /**
   * Populate Phase Selector Dropdown
   */
  function populatePhaseSelector() {
    const phaseSelector = document.getElementById("phase-selector");
    if (!phaseSelector) {
      console.error("[Main] Phase selector element not found.");
      return;
    }
    if (!window.PHASE_OPTIONS) {
      console.error("[Main] PHASE_OPTIONS is not defined.");
      showToast("Failed to load workout phases.", "danger");
      return;
    }
    window.PHASE_OPTIONS.forEach(opt => {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      phaseSelector.appendChild(optionEl);
      console.log(`[Main] Phase option added: ${opt.label}`);
    });
  }

  /**
   * Bind UI Events
   */
  function bindUIEvents() {
    // Phase selector
    const phaseSelector = document.getElementById('phase-selector');
    if (phaseSelector) {
        phaseSelector.addEventListener('change', handlePhaseChange);
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-switch');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Export button
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCSV);
    }

    // Reset button
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllData);
    }

    // Filter and sort
    const filterInput = document.getElementById('filter-exercise');
    if (filterInput) {
        filterInput.addEventListener('input', debounce(updateHistoryTable, 300));
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', updateHistoryTable);
    }

    // Pagination
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateHistoryTable();
            }
        });
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(getFilteredData().length / entriesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateHistoryTable();
            }
        });
    }

    // History modal
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.addEventListener('show.bs.modal', updateHistoryTable);
    }
  }

  /**
   * Initialize Bootstrap Tooltips
   */
  function initializeTooltips() {
    console.log("[Main] Initializing Bootstrap tooltips.");
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    console.log("[Main] Bootstrap tooltips initialized.");
  }

  /**
   * Load Saved Theme from localStorage
   */
  function loadSavedTheme() {
    const savedTheme = getTheme();
    const themeSwitch = document.getElementById('theme-switch');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      themeSwitch.checked = true;
      console.log("[Main] Dark theme loaded from localStorage.");
    } else {
      console.log("[Main] Light theme loaded from localStorage or default.");
    }
  }

  /**
   * Toggle Theme Between Dark and Light
   */
  function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch.checked) {
      document.documentElement.classList.add('dark');
      saveTheme('dark');
      console.log("[Main] Dark theme activated.");
    } else {
      document.documentElement.classList.remove('dark');
      saveTheme('light');
      console.log("[Main] Light theme activated.");
    }
  }

  /**
   * Load Saved Workout Phase from localStorage
   */
  function loadSavedPhase() {
    const savedPhase = getSelectedPhase() || window.PHASE_OPTIONS[0].value;
    const phaseSelector = document.getElementById("phase-selector");
    phaseSelector.value = savedPhase;
    console.log(`[Main] Loading saved phase: ${savedPhase}`);
    window.loadWorkout(savedPhase);
  }

  /**
   * Handle Phase Selection Change
   */
  function handlePhaseChange() {
    const selectedPhase = document.getElementById("phase-selector").value;
    saveSelectedPhase(selectedPhase);
    console.log(`[Main] Phase changed to: ${selectedPhase}`);
    window.loadWorkout(selectedPhase);
  }

  /**
   * Save Progress Handler
   * @param {number} index - The index of the exercise
   * @param {string} exerciseName - The name of the exercise
   */
  function saveProgress(index, exerciseName) {
    // Add validation for reps range
    function validateReps(value, exercise) {
      const min = exercise.MinReps || parseInt(exercise.Reps) || 0;
      const max = exercise.MaxReps || parseInt(exercise.Reps) || 999;
      const reps = parseInt(value);
      return reps >= min && reps <= max;
    }
    console.log(`[Main] Saving progress for exercise '${exerciseName}' at index ${index}.`);
    const setsInput = document.getElementById(`sets-${index}`);
    const repsInput = document.getElementById(`reps-${index}`);
    const loadInput = document.getElementById(`load-${index}`);

    const sets = setsInput.value.trim();
    const reps = repsInput.value.trim();
    const load = loadInput.value.trim();

    let isValid = true;

    if (!validateNumber(sets)) {
      validateInput(setsInput, false);
      isValid = false;
      console.warn(`[Main] Invalid sets input for exercise '${exerciseName}': ${sets}`);
    } else {
      validateInput(setsInput, true);
    }

    if (!validateNumber(reps)) {
      validateInput(repsInput, false);
      isValid = false;
      console.warn(`[Main] Invalid reps input for exercise '${exerciseName}': ${reps}`);
    } else {
      validateInput(repsInput, true);
    }

    if (!validateNumber(load)) {
      validateInput(loadInput, false);
      isValid = false;
      console.warn(`[Main] Invalid load input for exercise '${exerciseName}': ${load}`);
    } else {
      validateInput(loadInput, true);
    }

    if (!isValid) {
      showToast(`Please ensure all fields are correctly filled for ${exerciseName}.`, 'danger');
      return;
    }

    // Save to localStorage
    saveWorkoutData(index, { sets, reps, load });
    console.log(`[Main] Workout data saved for exercise '${exerciseName}': Sets=${sets}, Reps=${reps}, Load=${load}`);

    // Log to history
    saveWorkoutHistory({
      date: new Date().toISOString(),
      exercise: exerciseName,
      sets: Number(sets),
      reps: Number(reps),
      load: Number(load)
    });
    console.log(`[Main] Workout history updated for exercise '${exerciseName}'.`);

    // Provide feedback
    showToast("Workout data saved successfully!", 'success');
  }

  /**
   * Validate Number Input
   * @param {string} value - The value to validate
   * @returns {boolean} - True if valid, else false
   */
  function validateNumber(value) {
    return /^[0-9]+$/.test(value);
  }

  /**
   * Validate and Style Input Fields
   * @param {HTMLElement} inputElement - The input element
   * @param {boolean} isValid - Whether the input is valid
   */
  function validateInput(inputElement, isValid) {
    if (isValid) {
      inputElement.classList.remove('input-error');
      inputElement.classList.add('input-success');
      console.log(`[Main] Input validation passed for element ID: ${inputElement.id}`);
    } else {
      inputElement.classList.remove('input-success');
      inputElement.classList.add('input-error');
      console.warn(`[Main] Input validation failed for element ID: ${inputElement.id}`);
    }
  }

  /**
   * Export Workout History as CSV
   */
  function exportCSV() {
    console.log("[Main] Exporting workout history as CSV.");
    const historyData = getWorkoutHistory();
    if (!historyData.length) {
      showToast("No history data to export.", 'warning');
      console.warn("[Main] No workout history data available for export.");
      return;
    }

    let csvContent = "Date,Exercise,Sets,Reps,Load,Volume\n";
    historyData.forEach(entry => {
      const volume = entry.sets * entry.reps * entry.load;
      csvContent += `"${formatDate(entry.date)}","${sanitize(entry.exercise)}",${entry.sets},${entry.reps},${entry.load},${volume}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "workout_history.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Workout history exported as CSV.", 'success');
    console.log("[Main] Workout history exported successfully.");
  }

  /**
   * Reset All Workout Data
   */
  function resetAllData() {
    console.log("[Main] Resetting all workout data.");
    if (!confirm("Are you sure you want to clear ALL workout data?")) return;

    clearWorkoutData();
    showToast("All saved workout data has been cleared.", 'success');
    console.log("[Main] All workout data cleared.");

    // Reload current phase
    const currentPhase = document.getElementById("phase-selector").value;
    window.loadWorkout(currentPhase);
    console.log(`[Main] Reloaded workout data for phase: ${currentPhase}`);
  }

  /**
   * Show Toast Notifications
   * @param {string} message - The message to display
   * @param {string} type - The type of toast ('success', 'danger', 'warning')
   */
  function showToast(message, type = 'success') {
    console.log(`[Main] Displaying toast: [${type.toUpperCase()}] ${message}`);

    // Ensure toast container exists
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.classList.add('position-fixed', 'bottom-0', 'end-0', 'p-3');
        toastContainer.style.zIndex = "1100"; // Ensure it's always visible
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.classList.add('toast', `text-bg-${type}`, 'border-0', 'show');
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    // Append toast to container
    toastContainer.appendChild(toastEl);

    // Ensure Bootstrap toast initializes correctly
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Auto-remove toast after display
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => {
            toastEl.remove();
            console.log("[Main] Toast removed from DOM.");
        }, 500); // Allow fade-out effect
    }, 3000);
}

  /**
   * Format Date String
   * @param {string} dateString - The ISO date string
   * @returns {string} - Formatted date string
   */
  function formatDate(dateString) {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day} ${hours}:${mins}`;
    console.log(`[Main] Formatted date: ${formattedDate}`);
    return formattedDate;
  }

  /**
   * Update History Table with Sorting and Filtering
   */
  function updateHistoryTable() {
    console.log("[Main] Updating workout history table.");
    const historyData = getFilteredData();
  
    if (!historyData || !historyData.length) {
      console.log("[Main] No workout history data available");
      document.querySelector("#history-table tbody").innerHTML = 
        '<tr><td colspan="6" class="text-center">No workout history available</td></tr>';
      
      // Update stats to show zero entries
      const statsEl = document.getElementById("history-stats");
      if (statsEl) {
        statsEl.textContent = "Showing 0 Entries | Cumulative Volume: 0";
      }
      return;
    }
  
    const sortedData = historyData.sort(getSortFunction());
  
    // Calculate Pagination
    const totalPages = Math.ceil(sortedData.length / entriesPerPage);
    currentPage = Math.min(currentPage, totalPages) || 1;
    console.log(`[Main] Total pages: ${totalPages}, Current page: ${currentPage}`);
  
    // Slice Data for Current Page
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = sortedData.slice(start, end);
    console.log(`[Main] Displaying records ${start + 1} to ${end} of ${sortedData.length}.`);
  
    // Render Table
    const tableBody = document.querySelector("#history-table tbody");
    if (!tableBody) {
      console.error("[Main] History table body element not found.");
      return;
    }
    tableBody.innerHTML = "";
  
    let totalVolume = 0;
    const volumeByDate = {};
  
    paginatedData.forEach(entry => {
      const row = document.createElement("tr");
      const volume = entry.sets * entry.reps * entry.load;
      totalVolume += volume;
  
      const dateKey = formatDate(entry.date).split(' ')[0];
      volumeByDate[dateKey] = (volumeByDate[dateKey] || 0) + volume;
  
      row.innerHTML = `
        <td>${formatDate(entry.date)}</td>
        <td>${sanitize(entry.exercise)}</td>
        <td>${entry.sets}</td>
        <td>${entry.reps}</td>
        <td>${entry.load}</td>
        <td>${volume}</td>
      `;
      tableBody.appendChild(row);
      console.log(`[Main] History entry added: ${entry.exercise}, Volume: ${volume}`);
    });
  
    // Update stats
    const statsEl = document.getElementById("history-stats");
    if (statsEl) {
      statsEl.textContent = `Showing ${paginatedData.length} of ${sortedData.length} Entries | Cumulative Volume: ${totalVolume}`;
      console.log(`[Main] History stats updated: ${paginatedData.length} entries, Total Volume: ${totalVolume}`);
    } else {
      console.error("[Main] History stats element not found.");
    }
  
    // Update Pagination Controls
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    if (prevPageBtn && nextPageBtn) {
      prevPageBtn.classList.toggle('disabled', currentPage === 1);
      nextPageBtn.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
      console.log("[Main] Pagination controls updated.");
    } else {
      console.error("[Main] Pagination control elements not found.");
    }
  
    // Update Chart
    updateChart(sortedData);
    console.log("[Main] Volume chart updated.");
  }

  /**
   * Get Filtered Data Based on Exercise Name
   * @returns {Array} - Filtered workout history
   */
  function getFilteredData() {
    let historyData = getWorkoutHistory();
    const filterValue = document.getElementById('filter-exercise').value.trim().toLowerCase();
    if (filterValue) {
      historyData = historyData.filter(entry => entry.exercise.toLowerCase().includes(filterValue));
      console.log(`[Main] History data filtered with keyword: ${filterValue}`);
    } else {
      console.log("[Main] No filter applied to history data.");
    }
    return historyData;
  }

  /**
   * Get Sort Function Based on Selection
   * @returns {Function} - Sorting comparator function
   */
  function getSortFunction() {
    const sortValue = document.getElementById('sort-select').value;
    console.log(`[Main] Sorting history data by: ${sortValue}`);
    switch(sortValue) {
      case 'date_desc':
        return (a, b) => new Date(b.date) - new Date(a.date);
      case 'date_asc':
        return (a, b) => new Date(a.date) - new Date(b.date);
      case 'volume_desc':
        return (a, b) => (b.sets * b.reps * b.load) - (a.sets * a.reps * a.load);
      case 'volume_asc':
        return (a, b) => (a.sets * a.reps * a.load) - (b.sets * b.reps * b.load);
      default:
        console.warn(`[Main] Unknown sort option selected: ${sortValue}`);
        return () => 0;
    }
  }

  /**
   * Update Volume Chart
   * @param {Array} historyData - The workout history data
   */
  function updateChart(historyData) {
    try {
      if (!historyData?.length) {
        throw new Error('No history data available');
      }
      const ctx = document.getElementById('volume-chart').getContext('2d');
      const chartData = prepareChartData(historyData);
      
      if (window.volumeChart) {
        window.volumeChart.destroy();
      }
      
      window.volumeChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Volume (weight × reps)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('[Chart] Initialization failed:', error);
      showToast('Failed to display workout history chart', 'danger');
    }
  }

  function prepareChartData(historyData) {
    // Group data by date
    const volumeByDate = {};
    historyData.forEach(entry => {
      const dateKey = formatDate(entry.date).split(' ')[0];
      volumeByDate[dateKey] = (volumeByDate[dateKey] || 0) + (entry.sets * entry.reps * entry.load);
    });

    // Sort dates and prepare chart data
    const labels = Object.keys(volumeByDate).sort();
    const volumes = labels.map(date => volumeByDate[date]);

    return {
      labels,
      datasets: [{
        label: 'Daily Volume',
        data: volumes,
        borderColor: 'rgb(40, 167, 69)',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }

  /**
   * Debounce Function to Limit Function Execution Rate
   * @param {Function} func - The function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function}
   */
  function debounce(func, delay) {
    let debounceTimer;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

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

    // Add validation attributes to inputs
    const inputs = exerciseDiv.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
      input.addEventListener('input', (event) => {
        const result = validateWorkoutInput(event.target);
        if (!result.isValid) {
          event.target.classList.add('is-invalid');
          showToast(result.message, 'warning');
        } else {
          event.target.classList.remove('is-invalid');
        }
      });
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

  /**
   * Expose necessary functions and variables to the global scope
   */
  window.loadWorkout = loadWorkout;

  /**
   * Define the loadWorkout function and attach it to the window object
   * (Assuming it was missing in the previous implementation)
   */
  async function loadWorkout(phaseUrl) {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = "block";
    
    try {
      const response = await fetch(phaseUrl);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      if (!validateWorkoutData(data)) {
        throw new Error('Invalid workout data structure');
      }
      await displayWorkout(data);
    } catch (error) {
      handleError(error, 'Workout Loading');
    } finally {
      spinner.style.display = "none";
    }
  }

  /**
   * Validate Workout Input
   * @param {HTMLInputElement} input - The input element to validate
   * @returns {Object} - Validation result with isValid and message properties
   */
  function validateWorkoutInput(input) {
    const value = parseInt(input.value);
    const min = parseInt(input.getAttribute('min')) || 0;
    const max = parseInt(input.getAttribute('max')) || 999;
    
    return {
      isValid: value >= min && value <= max,
      message: `Value must be between ${min} and ${max}`
    };
  }

  /**
   * Handle Errors with Context
   * @param {Error} error - The error object
   * @param {string} context - The context where the error occurred
   */
  function handleError(error, context) {
    console.error(`[${context}] Error:`, error);
    
    if (!navigator.onLine) {
      showToast("You're offline. Data will be saved locally.", "warning");
      return;
    }
    
    showToast("An error occurred. Please try again.", "danger");
  }

  /**
   * Initialize Gesture Support
   */
  function initializeGestures() {
    if (typeof Hammer === 'undefined') {
      console.warn('[Main] Hammer.js not loaded, skipping gesture support');
      return;
    }

    const hammer = new Hammer(document.body);
    hammer.on('swipe', (ev) => {
      if (ev.direction === Hammer.DIRECTION_RIGHT) {
        navigateToPreviousDay();
      } else if (ev.direction === Hammer.DIRECTION_LEFT) {
        navigateToNextDay();
      }
    });
  }

  /**
   * Navigate to Previous Day
   */
  function navigateToPreviousDay() {
    console.log('[Main] Navigating to previous day');
    // Implementation will depend on your day navigation logic
  }

  /**
   * Navigate to Next Day
   */
  function navigateToNextDay() {
    console.log('[Main] Navigating to next day');
    // Implementation will depend on your day navigation logic
  }

  /**
   * Initialize and Start Application on Window Load
   */
  window.addEventListener("load", init);
})();
