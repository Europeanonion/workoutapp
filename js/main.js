// js/main.js

(() => {
  /**
   * Initialize the Application
   */
  function init() {
    console.log("Initializing application.");
    populatePhaseSelector();
    bindUIEvents();
    loadSavedTheme();
    loadSavedPhase();
    initializeTooltips();
  }

  /**
   * Populate Phase Selector Dropdown
   */
  function populatePhaseSelector() {
    const phaseSelector = document.getElementById("phase-selector");
    if (!window.PHASE_OPTIONS) {
      console.error("PHASE_OPTIONS is not defined.");
      showToast("Failed to load workout phases.", "danger");
      return;
    }
    window.PHASE_OPTIONS.forEach(opt => {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      phaseSelector.appendChild(optionEl);
      console.log(`Phase option added: ${opt.label}`);
    });
  }

  /**
   * Bind UI Events
   */
  function bindUIEvents() {
    console.log("Binding UI events.");
    document.getElementById("phase-selector").addEventListener("change", handlePhaseChange);
    document.getElementById("reset-data-btn").addEventListener("click", resetAllData);
    document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
    document.getElementById("filter-exercise").addEventListener("input", updateHistoryTable);
    document.getElementById("sort-select").addEventListener("change", updateHistoryTable);
    document.getElementById("prev-page").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateHistoryTable();
        console.log(`Navigated to previous page: ${currentPage}`);
      }
    });
    document.getElementById("next-page").addEventListener("click", () => {
      const totalPages = Math.ceil(getFilteredData().length / entriesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateHistoryTable();
        console.log(`Navigated to next page: ${currentPage}`);
      }
    });
    document.getElementById("theme-switch").addEventListener("change", toggleTheme);

    // Initialize history modal content when it's about to be shown
    var historyModal = document.getElementById('historyModal');
    historyModal.addEventListener('show.bs.modal', updateHistoryTable);
    console.log("UI events bound successfully.");
  }

  /**
   * Initialize Bootstrap Tooltips
   */
  function initializeTooltips() {
    console.log("Initializing Bootstrap tooltips.");
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    console.log("Bootstrap tooltips initialized.");
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
      console.log("Dark theme loaded from localStorage.");
    } else {
      console.log("Light theme loaded from localStorage or default.");
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
      console.log("Dark theme activated.");
    } else {
      document.documentElement.classList.remove('dark');
      saveTheme('light');
      console.log("Light theme activated.");
    }
  }

  /**
   * Load Saved Workout Phase from localStorage
   */
  function loadSavedPhase() {
    const savedPhase = getSelectedPhase() || window.PHASE_OPTIONS[0].value;
    const phaseSelector = document.getElementById("phase-selector");
    phaseSelector.value = savedPhase;
    console.log(`Loading saved phase: ${savedPhase}`);
    window.loadWorkout(savedPhase);
  }

  /**
   * Handle Phase Selection Change
   */
  function handlePhaseChange() {
    const selectedPhase = document.getElementById("phase-selector").value;
    saveSelectedPhase(selectedPhase);
    console.log(`Phase changed to: ${selectedPhase}`);
    window.loadWorkout(selectedPhase);
  }

  /**
   * Save Progress Handler
   * @param {number} index - The index of the exercise
   * @param {string} exerciseName - The name of the exercise
   */
  function saveProgress(index, exerciseName) {
    console.log(`Saving progress for exercise '${exerciseName}' at index ${index}.`);
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
      console.warn(`Invalid sets input for exercise '${exerciseName}': ${sets}`);
    } else {
      validateInput(setsInput, true);
    }

    if (!validateNumber(reps)) {
      validateInput(repsInput, false);
      isValid = false;
      console.warn(`Invalid reps input for exercise '${exerciseName}': ${reps}`);
    } else {
      validateInput(repsInput, true);
    }

    if (!validateNumber(load)) {
      validateInput(loadInput, false);
      isValid = false;
      console.warn(`Invalid load input for exercise '${exerciseName}': ${load}`);
    } else {
      validateInput(loadInput, true);
    }

    if (!isValid) {
      showToast(`Please ensure all fields are correctly filled for ${exerciseName}.`, 'danger');
      return;
    }

    // Save to localStorage
    saveWorkoutData(index, { sets, reps, load });
    console.log(`Workout data saved for exercise '${exerciseName}': Sets=${sets}, Reps=${reps}, Load=${load}`);

    // Log to history
    saveWorkoutHistory({
      date: new Date().toISOString(),
      exercise: exerciseName,
      sets: Number(sets),
      reps: Number(reps),
      load: Number(load)
    });
    console.log(`Workout history updated for exercise '${exerciseName}'.`);

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
      console.log(`Input validation passed for element ID: ${inputElement.id}`);
    } else {
      inputElement.classList.remove('input-success');
      inputElement.classList.add('input-error');
      console.warn(`Input validation failed for element ID: ${inputElement.id}`);
    }
  }

  /**
   * Export Workout History as CSV
   */
  function exportCSV() {
    console.log("Exporting workout history as CSV.");
    const historyData = getWorkoutHistory();
    if (!historyData.length) {
      showToast("No history data to export.", 'warning');
      console.warn("No workout history data available for export.");
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
    console.log("Workout history exported successfully.");
  }

  /**
   * Reset All Workout Data
   */
  function resetAllData() {
    console.log("Resetting all workout data.");
    if (!confirm("Are you sure you want to clear ALL workout data?")) return;

    clearWorkoutData();
    showToast("All saved workout data has been cleared.", 'success');
    console.log("All workout data cleared.");

    // Reload current phase
    const currentPhase = document.getElementById("phase-selector").value;
    window.loadWorkout(currentPhase);
    console.log(`Reloaded workout data for phase: ${currentPhase}`);
  }

  /**
   * Show Toast Notifications
   * @param {string} message - The message to display
   * @param {string} type - The type of toast ('success', 'danger', 'warning')
   */
  function showToast(message, type = 'success') {
    console.log(`Displaying toast: [${type.toUpperCase()}] ${message}`);
    const toastContainer = document.getElementById('toast-container');
    
    // Create Toast Element
    const toastEl = document.createElement('div');
    toastEl.classList.add('toast', `text-bg-${type}`, 'border-0');
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

    // Append to Container
    toastContainer.appendChild(toastEl);

    // Initialize and Show Toast
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Remove Toast after hidden
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
      console.log("Toast removed from DOM.");
    });
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
    console.log(`Formatted date: ${formattedDate}`);
    return formattedDate;
  }

  /**
   * Update History Table with Sorting and Filtering
   */
  function updateHistoryTable() {
    console.log("Updating workout history table.");
    const historyData = getFilteredData().sort(getSortFunction());

    // Calculate Pagination
    const totalPages = Math.ceil(historyData.length / entriesPerPage);
    currentPage = Math.min(currentPage, totalPages) || 1;

    // Slice Data for Current Page
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    const paginatedData = historyData.slice(start, end);
    console.log(`Displaying page ${currentPage} of ${totalPages}.`);

    // Render Table
    const tableBody = document.querySelector("#history-table tbody");
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
      console.log(`History entry added: ${entry.exercise}, Volume: ${volume}`);
    });

    // Update stats
    const statsEl = document.getElementById("history-stats");
    statsEl.textContent = `Showing ${paginatedData.length} of ${historyData.length} Entries | Cumulative Volume: ${totalVolume}`;
    console.log(`History stats updated: ${paginatedData.length} entries, Total Volume: ${totalVolume}`);

    // Update Pagination Controls
    document.getElementById('prev-page').classList.toggle('disabled', currentPage === 1);
    document.getElementById('next-page').classList.toggle('disabled', currentPage === totalPages || totalPages === 0);
    console.log("Pagination controls updated.");

    // Update Chart
    updateChart(historyData);
    console.log("Volume chart updated.");
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
      console.log(`Filtered history data with keyword: ${filterValue}`);
    }
    return historyData;
  }

  /**
   * Get Sort Function Based on Selection
   * @returns {Function} - Sorting comparator function
   */
  function getSortFunction() {
    const sortValue = document.getElementById('sort-select').value;
    console.log(`Sorting history data by: ${sortValue}`);
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
        return () => 0;
    }
  }

  /**
   * Update Volume Chart
   * @param {Array} historyData - The workout history data
   */
  function updateChart(historyData) {
    console.log("Updating volume chart.");
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
      console.log("Previous volume chart destroyed.");
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
    console.log("Volume chart created successfully.");
  }

  /**
   * Initialize and Start Application on Window Load
   */
  window.addEventListener("load", init);
})();
