document.addEventListener("DOMContentLoaded", () => {
  // Initialize Application
  function init() {
    populatePhaseSelector();
    bindUIEvents();
    loadSavedTheme();
    loadSavedPhase();
    initializeTooltips();
  }

  // Populate Phase Selector
  function populatePhaseSelector() {
    const phaseSelector = document.getElementById("phase-selector");
    PHASE_OPTIONS.forEach(opt => {
      const optionEl = document.createElement("option");
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      phaseSelector.appendChild(optionEl);
    });
  }

  // Bind UI Events
  function bindUIEvents() {
    document.getElementById("phase-selector").addEventListener("change", handlePhaseChange);
    document.getElementById("reset-data-btn").addEventListener("click", resetAllData);
    document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
    document.getElementById("filter-exercise").addEventListener("input", updateHistoryTable);
    document.getElementById("sort-select").addEventListener("change", updateHistoryTable);
    document.getElementById("prev-page").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateHistoryTable();
      }
    });
    document.getElementById("next-page").addEventListener("click", () => {
      const totalPages = Math.ceil(getFilteredData().length / entriesPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        updateHistoryTable();
      }
    });
    document.getElementById("theme-switch").addEventListener("change", toggleTheme);
    // Initialize history modal content when it's about to be shown
    var historyModal = document.getElementById('historyModal');
    historyModal.addEventListener('show.bs.modal', updateHistoryTable);
  }

  // Initialize Tooltips
  function initializeTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  // Load Saved Theme
  function loadSavedTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const themeSwitch = document.getElementById('theme-switch');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      themeSwitch.checked = true;
    }
  }

  // Toggle Theme
  function toggleTheme() {
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch.checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }

  // Load Saved Phase
  function loadSavedPhase() {
    const savedPhase = localStorage.getItem(STORAGE_KEYS.SELECTED_PHASE) || PHASE_OPTIONS[0].value;
    const phaseSelector = document.getElementById("phase-selector");
    phaseSelector.value = savedPhase;
    loadWorkout(savedPhase);
  }

  // Handle Phase Change
  function handlePhaseChange() {
    const selectedPhase = document.getElementById("phase-selector").value;
    localStorage.setItem(STORAGE_KEYS.SELECTED_PHASE, selectedPhase);
    loadWorkout(selectedPhase);
  }

  init();
});
