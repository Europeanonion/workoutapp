(() => {
  let entriesPerPage = 10;
  let currentPage = 1;

  /**
   * Initialize the Application
   */
  function init() {
    console.log("[Main] Initializing application.");

    // Ensure PHASE_OPTIONS is defined
    if (!window.PHASE_OPTIONS) {
      window.PHASE_OPTIONS = [
        { value: "data/workout_plan_phase_1_with_links.json", label: "Phase 1 - Base Hypertrophy" },
        { value: "data/workout_plan_phase_2_with_links.json", label: "Phase 2 - Maximum Effort" },
        { value: "data/workout_plan_phase_3_with_links.json", label: "Phase 3 - Hypertrophy & Endurance" }
      ];
      console.log("[Main] PHASE_OPTIONS was not defined. Default options have been set.");
    }

    populatePhaseSelector();
    bindUIEvents();
    loadSavedTheme();
    loadSavedPhase();
    initializeTooltips();
    console.log("[Main] Application initialized successfully.");
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
    console.log("[Main] Binding UI events.");
    document.getElementById("phase-selector").addEventListener("change", handlePhaseChange);
    document.getElementById("reset-data-btn").addEventListener("click", resetAllData);
    document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
    document.getElementById("filter-exercise").addEventListener("input", debounce(updateHistoryTable, 300));
    document.getElementById("sort-select").addEventListener("change", updateHistoryTable);
    document.getElementById("prev-page").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateHistoryTable();
        console.log(`[Main] Navigated to previous page: ${currentPage}`);
      }
    });
    document.getElementById("next-page").addEventListener("click", () => {
      const totalPages = Math.ceil(getFilteredData().length / entriesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateHistoryTable();
        console.log(`[Main] Navigated to next page: ${currentPage}`);
      }
    });
    document.getElementById("theme-switch").addEventListener("change", toggleTheme);

    // Initialize history modal content when it's about to be shown
    var historyModal = document.getElementById('historyModal');
    historyModal.addEventListener('show.bs.modal', updateHistoryTable);
    console.log("[Main] UI events bound successfully.");
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
    const historyData = getFilteredData().sort(getSortFunction());
  
    // Calculate Pagination
    const totalPages = Math.ceil(historyData.length / entriesPerPage);
    currentPage = Math.min(currentPage, totalPages) || 1;
    console.log(`[Main] Total pages: ${totalPages}, Current page: ${currentPage}`);
  
    // Slice Data for Current Page
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = historyData.slice(start, end);
    console.log(`[Main] Displaying records ${start + 1} to ${end} of ${historyData.length}.`);
  
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
      statsEl.textContent = `Showing ${paginatedData.length} of ${historyData.length} Entries | Cumulative Volume: ${totalVolume}`;
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
    updateChart(historyData);
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
    console.log("[Main] Updating volume chart.");
    // Aggregate Volume by Date
    const volumeByDate = {};
    historyData.forEach(entry => {
      const dateKey = formatDate(entry.date).split(' ')[0];
      volumeByDate[dateKey] = (volumeByDate[dateKey] || 0) + (entry.sets * entry.reps * entry.load);
    });

    const labels = Object.keys(volumeByDate).sort();
    const data = labels.map(date => volumeByDate[date]);

    // Destroy previous chart if exists
    if (window.volumeChart) {
      window.volumeChart.destroy();
      console.log("[Main] Previous volume chart destroyed.");
    }

    const ctx = document.getElementById('volume-chart').getContext('2d');
    window.volumeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Volume (kg)',
          data,
          backgroundColor: 'rgba(40, 167, 69, 0.6)', // Bootstrap success color with opacity
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Volume: ${context.parsed.y} kg`;
              }
            }
          }
        }
      }
    });
    console.log("[Main] Volume chart created successfully.");
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
   * Initialize and Start Application on Window Load
   */
  window.addEventListener("load", init);
})();
