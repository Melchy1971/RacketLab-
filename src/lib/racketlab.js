import {
  racketCombos,
  materials,
  trainingGoals,
  trainingLibrary,
  proVideoLibrary,
  analysisInsights,
} from "../data/index.js";

const storageKey = "racketlab-state-v1";

const clone = (value) => {
  try {
    return structuredClone(value);
  } catch (error) {
    return JSON.parse(JSON.stringify(value));
  }
};

const defaultState = {
  favorites: [],
  comparison: [],
  currentSet: {
    blade: null,
    rubbers: [],
  },
  training: {
    plan: null,
    completed: {},
  },
};

const state = loadState();

function loadState() {
  try {
    if (typeof localStorage === "undefined") {
      return clone(defaultState);
    }
    const raw = localStorage.getItem(storageKey);
    if (!raw) return clone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...clone(defaultState),
      ...parsed,
    };
  } catch (error) {
    console.warn("Konnte Zustand nicht laden", error);
    return clone(defaultState);
  }
}

function persistState() {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn("Konnte Zustand nicht speichern", error);
  }
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function init() {
  setupSmoothScroll();
  initFinder();
  initExplorer();
  initTrainingPlanner();
  initVideoAnalysis();
  renderDashboard();
}

export function initRacketLab() {
  const root = document.querySelector("[data-racketlab-root]");
  if (!root) {
    console.warn("RacketLab Root nicht gefunden – konnte nicht initialisieren.");
    return;
  }
  if (root.dataset.initialized === "true") {
    return;
  }
  root.dataset.initialized = "true";
  init();
}

if (import.meta && import.meta.hot) {
  import.meta.hot.dispose(() => {
    const root = document.querySelector("[data-racketlab-root]");
    if (root) {
      delete root.dataset.initialized;
    }
  });
}

// Smooth scroll for hero button
function setupSmoothScroll() {
  $$('[data-scroll-target]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.scrollTarget;
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// MATERIAL FINDER
function initFinder() {
  const form = $("#finder-form");
  const sortSelect = $("#finder-sort");
  const carbonToggle = $("#finder-carbon-filter");

  const initialResults = buildFinderResults({
    style: form.playstyle.value,
    level: form.experience.value,
    budget: form.budget.value,
    sort: sortSelect.value,
    carbonOnly: carbonToggle.checked,
  });

  renderFinderRecommendations(initialResults);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const criteria = {
      style: form.playstyle.value,
      level: form.experience.value,
      budget: form.budget.value,
      sort: sortSelect.value,
      carbonOnly: carbonToggle.checked,
    };
    const results = buildFinderResults(criteria);
    renderFinderRecommendations(results);
  });

  [sortSelect, carbonToggle].forEach((el) => {
    el.addEventListener("change", () => {
      const criteria = {
        style: form.playstyle.value,
        level: form.experience.value,
        budget: form.budget.value,
        sort: sortSelect.value,
        carbonOnly: carbonToggle.checked,
      };
      const results = buildFinderResults(criteria);
      renderFinderRecommendations(results);
    });
  });
}

function buildFinderResults({ style, level, budget, sort, carbonOnly }) {
  const levelPriority = {
    beginner: 0,
    intermediate: 1,
    advanced: 2,
  };

  const filtered = racketCombos
    .map((combo) => {
      const styleMatch = combo.style === style;
      const levelMatch =
        level === combo.level ||
        Math.abs(levelPriority[combo.level] - levelPriority[level]) <= 1;
      const budgetMatch = combo.budget === budget;
      const carbonMatch = carbonOnly ? combo.carbon : true;
      const matchScore =
        (styleMatch ? 50 : 0) +
        (levelMatch ? 30 : 0) +
        (budgetMatch ? 20 : 0) +
        (carbonMatch ? 10 : 0);
      return { ...combo, matchScore };
    })
    .filter((combo) => (carbonOnly ? combo.carbon : true))
    .filter((combo) => combo.matchScore > 0);

  const sorted = filtered.sort((a, b) => {
    switch (sort) {
      case "price":
        return a.totalPrice - b.totalPrice;
      case "tempo":
        return b.metrics.tempo - a.metrics.tempo;
      case "control":
        return b.metrics.control - a.metrics.control;
      default:
        return b.matchScore - a.matchScore;
    }
  });

  return sorted;
}

function renderFinderRecommendations(recommendations) {
  const container = $("#finder-recommendations");
  container.innerHTML = "";

  if (!recommendations.length) {
    container.innerHTML =
      '<p class="list-empty">Keine passenden Sets gefunden. Passe deine Filter an.</p>';
    return;
  }

  recommendations.forEach((combo) => {
    const card = document.createElement("article");
    card.className = "recommendation-card";
    card.innerHTML = `
      <header>
        <div>
          <h5>${combo.name}</h5>
          <div class="badge">${combo.blade.name}</div>
        </div>
        <strong>${combo.totalPrice.toFixed(0)} €</strong>
      </header>
      <div class="metrics-grid">
        <div class="metric-item"><span>Tempo</span><strong>${combo.metrics.tempo}</strong></div>
        <div class="metric-item"><span>Spin</span><strong>${combo.metrics.spin}</strong></div>
        <div class="metric-item"><span>Kontrolle</span><strong>${combo.metrics.control}</strong></div>
        <div class="metric-item"><span>Charakter</span><strong>${combo.metrics.balance}</strong></div>
      </div>
      <table aria-label="Belag-Details">
        <thead>
          <tr>
            <th>Seite</th>
            <th>Belag</th>
            <th>Tempo</th>
            <th>Spin</th>
            <th>Kontrolle</th>
          </tr>
        </thead>
        <tbody>
          ${combo.rubbers
            .map(
              (rubber) => `
              <tr>
                <td>${rubber.side}</td>
                <td>${rubber.name}</td>
                <td>${rubber.tempo}</td>
                <td>${rubber.spin}</td>
                <td>${rubber.control}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>
      <p>${combo.description}</p>
      <div class="feedback-list">
        ${combo.reviews
          .map(
            (review) => `
            <div class="feedback-item">
              <strong>${review.user}</strong> – ${review.quote}
              <div class="tag">Bewertung ${review.rating.toFixed(1)}/5</div>
            </div>
          `
          )
          .join("")}
      </div>
      <footer>
        <button class="secondary" data-action="compare" data-id="${combo.id}">
          Zum Vergleich hinzufügen
        </button>
        <button class="primary" data-action="adopt" data-id="${combo.id}">
          Setup übernehmen
        </button>
      </footer>
    `;

    container.append(card);
  });

  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;
      const combo = racketCombos.find((item) => item.id === id);
      if (!combo) return;
      if (action === "compare") {
        addToComparison({
          id: combo.id,
          name: combo.name,
          price: combo.totalPrice,
          tempo: combo.metrics.tempo,
          spin: combo.metrics.spin,
          control: combo.metrics.control,
        });
      }
      if (action === "adopt") {
        adoptCombo(combo);
      }
    });
  });
}

function adoptCombo(combo) {
  state.currentSet = {
    blade: clone(combo.blade),
    rubbers: combo.rubbers.map((rubber) => clone(rubber)),
    origin: combo.name,
    price: combo.totalPrice,
  };
  persistState();
  renderDashboard();
}

// MATERIAL EXPLORER
function initExplorer() {
  renderExplorerFilters();
  renderExplorer(materials);
  updateCurrentSetView();
  updateFavoritesView();
  updateComparisonView();

  $("#save-set").addEventListener("click", () => {
    if (!state.currentSet.blade || state.currentSet.rubbers.length < 2) {
      alert("Bitte wähle ein Holz und zwei Beläge aus.");
      return;
    }
    const newFavorite = {
      id: `custom-${Date.now()}`,
      name: state.currentSet.origin || "Eigenes Set",
      blade: state.currentSet.blade,
      rubbers: state.currentSet.rubbers,
      price:
        state.currentSet.blade.price +
        state.currentSet.rubbers.reduce((sum, rubber) => sum + rubber.price, 0),
    };
    state.favorites = [newFavorite, ...state.favorites].slice(0, 6);
    persistState();
    updateFavoritesView();
  });
}

function renderExplorerFilters() {
  const container = $("#explorer-filters");
  const brands = [...new Set(materials.map((item) => item.brand))];

  container.innerHTML = `
    <h4>Filter</h4>
    <div class="form-group">
      <label for="filter-type">Typ</label>
      <select id="filter-type">
        <option value="all">Alle</option>
        <option value="blade">Hölzer</option>
        <option value="rubber">Beläge</option>
      </select>
    </div>
    <div class="form-group">
      <label for="filter-brand">Marke</label>
      <select id="filter-brand">
        <option value="all">Alle</option>
        ${brands.map((brand) => `<option value="${brand}">${brand}</option>`).join("")}
      </select>
    </div>
    <div class="form-group">
      <label>Spielstil</label>
      <div class="chip-group" id="filter-style">
        <span class="chip" data-style="allround">Allround</span>
        <span class="chip" data-style="offensive">Angriff</span>
        <span class="chip" data-style="defensive">Abwehr</span>
      </div>
    </div>
    <div class="form-group">
      <label for="filter-price">Preis bis</label>
      <input type="range" id="filter-price" min="20" max="250" value="250" />
      <span id="filter-price-value">250 €</span>
    </div>
    <div class="form-group">
      <label for="filter-tempo">Tempo mindestens</label>
      <input type="range" id="filter-tempo" min="40" max="100" value="40" />
      <span id="filter-tempo-value">40</span>
    </div>
    <div class="form-group">
      <label for="filter-control">Kontrolle mindestens</label>
      <input type="range" id="filter-control" min="40" max="100" value="40" />
      <span id="filter-control-value">40</span>
    </div>
    <label class="toggle">
      <input type="checkbox" id="filter-carbon" />
      <span>Nur Carbon/Faser</span>
    </label>
  `;

  const filterElements = {
    type: $("#filter-type"),
    brand: $("#filter-brand"),
    price: $("#filter-price"),
    tempo: $("#filter-tempo"),
    control: $("#filter-control"),
    carbon: $("#filter-carbon"),
    styleChips: $$("#filter-style .chip"),
  };

  const filterValues = {
    type: "all",
    brand: "all",
    styles: new Set(),
    price: 250,
    tempo: 40,
    control: 40,
    carbon: false,
  };

  const handleChange = () => {
    const filtered = materials.filter((item) => {
      if (filterValues.type !== "all" && item.type !== filterValues.type) {
        return false;
      }
      if (filterValues.brand !== "all" && item.brand !== filterValues.brand) {
        return false;
      }
      if (filterValues.styles.size && !filterValues.styles.has(item.style)) {
        return false;
      }
      if (item.price > filterValues.price) return false;
      if (item.tempo < filterValues.tempo) return false;
      if (item.control < filterValues.control) return false;
      if (filterValues.carbon && !item.carbon) return false;
      return true;
    });
    renderExplorer(filtered);
  };

  filterElements.type.addEventListener("change", (event) => {
    filterValues.type = event.target.value;
    handleChange();
  });

  filterElements.brand.addEventListener("change", (event) => {
    filterValues.brand = event.target.value;
    handleChange();
  });

  [filterElements.price, filterElements.tempo, filterElements.control].forEach(
    (slider) => {
      slider.addEventListener("input", (event) => {
        const value = Number(event.target.value);
        if (event.target === filterElements.price) {
          filterValues.price = value;
          $("#filter-price-value").textContent = `${value} €`;
        }
        if (event.target === filterElements.tempo) {
          filterValues.tempo = value;
          $("#filter-tempo-value").textContent = value;
        }
        if (event.target === filterElements.control) {
          filterValues.control = value;
          $("#filter-control-value").textContent = value;
        }
        handleChange();
      });
    }
  );

  filterElements.carbon.addEventListener("change", (event) => {
    filterValues.carbon = event.target.checked;
    handleChange();
  });

  filterElements.styleChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.style;
      if (chip.classList.contains("selected")) {
        chip.classList.remove("selected");
        filterValues.styles.delete(value);
      } else {
        chip.classList.add("selected");
        filterValues.styles.add(value);
      }
      handleChange();
    });
  });
}

function renderExplorer(list) {
  const content = $("#explorer-content");
  const toolbarButtons = $$(".view-toggle button");
  const activeView = toolbarButtons.find((btn) => btn.classList.contains("active"))
    ?.dataset.view || "cards";

  content.innerHTML = "";

  toolbarButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toolbarButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      renderExplorer(list);
    });
  });

  if (!list.length) {
    content.innerHTML = '<p class="list-empty">Keine Treffer.</p>';
    return;
  }

  if (activeView === "table") {
    const table = document.createElement("table");
    table.className = "table-view";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Typ</th>
          <th>Name</th>
          <th>Marke</th>
          <th>Tempo</th>
          <th>Spin</th>
          <th>Kontrolle</th>
          <th>Preis</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${list
          .map(
            (item) => `
            <tr>
              <td>${item.type === "blade" ? "Holz" : "Belag"}</td>
              <td>${item.name}</td>
              <td>${item.brand}</td>
              <td>${item.tempo ?? "-"}</td>
              <td>${item.spin ?? "-"}</td>
              <td>${item.control ?? "-"}</td>
              <td>${item.price} €</td>
              <td>
                <button class="secondary" data-action="set" data-id="${item.id}">Übernehmen</button>
              </td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    `;
    content.append(table);
  } else {
    const fragment = document.createDocumentFragment();
    list.forEach((item) => {
      const card = document.createElement("article");
      card.className = "explorer-card";
      card.innerHTML = `
        <header>
          <div>
            <h5>${item.name}</h5>
            <div class="badge">${item.brand} · ${item.type === "blade" ? "Holz" : "Belag"}</div>
          </div>
          <strong>${item.price} €</strong>
        </header>
        <div class="metrics-grid">
          <div class="metric-item"><span>Tempo</span><strong>${item.tempo ?? "-"}</strong></div>
          <div class="metric-item"><span>Spin</span><strong>${item.spin ?? "-"}</strong></div>
          <div class="metric-item"><span>Kontrolle</span><strong>${item.control ?? "-"}</strong></div>
          <div class="metric-item"><span>Gewicht</span><strong>${item.weight ?? "-"} g</strong></div>
        </div>
        <p>${item.composition || item.hardness || ""}</p>
        <footer>
          <button class="secondary" data-action="favorite" data-id="${item.id}">Favorit</button>
          <button class="secondary" data-action="compare" data-id="${item.id}">Vergleichen</button>
          <button class="primary" data-action="set" data-id="${item.id}">Zum Set</button>
        </footer>
      `;
      fragment.append(card);
    });
    content.append(fragment);
  }

  content.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, id } = button.dataset;
      const item = materials.find((entry) => entry.id === id);
      if (!item) return;
      if (action === "favorite") {
        addMaterialFavorite(item);
      }
      if (action === "compare") {
        addToComparison({
          id: item.id,
          name: item.name,
          price: item.price,
          tempo: item.tempo,
          spin: item.spin,
          control: item.control,
        });
      }
      if (action === "set") {
        applyToCurrentSet(item);
      }
    });
  });
}

function applyToCurrentSet(item) {
  if (item.type === "blade") {
    state.currentSet.blade = item;
  } else {
    const existingIndex = state.currentSet.rubbers.findIndex(
      (rubber) => rubber.id === item.id
    );
    if (existingIndex >= 0) {
      state.currentSet.rubbers.splice(existingIndex, 1);
    } else {
      if (state.currentSet.rubbers.length >= 2) {
        state.currentSet.rubbers.shift();
      }
      state.currentSet.rubbers.push(item);
    }
  }
  state.currentSet.origin = "Eigenes Set";
  persistState();
  updateCurrentSetView();
}

function addMaterialFavorite(item) {
  const exists = state.favorites.some((fav) => fav.id === item.id);
  if (!exists) {
    state.favorites.unshift({
      id: item.id,
      name: item.name,
      blade: item.type === "blade" ? item : null,
      rubbers: item.type === "rubber" ? [item] : [],
      price: item.price,
    });
    state.favorites = state.favorites.slice(0, 6);
    persistState();
    updateFavoritesView();
  }
}

function addToComparison(entry) {
  const exists = state.comparison.some((item) => item.id === entry.id);
  if (!exists) {
    state.comparison = [entry, ...state.comparison].slice(0, 5);
    persistState();
    updateComparisonView();
  }
}

function renderDashboard() {
  updateCurrentSetView();
  updateFavoritesView();
  updateComparisonView();
}

function updateCurrentSetView() {
  const container = $("#current-set");
  if (!container) return;
  const { blade, rubbers } = state.currentSet;
  if (!blade && !rubbers.length) {
    container.innerHTML = '<p class="list-empty">Noch kein Setup gewählt.</p>';
    return;
  }
  const totalPrice =
    (blade?.price || 0) + rubbers.reduce((sum, rubber) => sum + rubber.price, 0);
  container.innerHTML = `
    <div class="explorer-card">
      <header>
        <div>
          <h5>${state.currentSet.origin || "Eigenes Set"}</h5>
          <div class="badge">${blade ? blade.name : "Holz wählen"}</div>
        </div>
        <strong>${totalPrice} €</strong>
      </header>
      <ul>
        <li>${blade ? `Holz: ${blade.name}` : "Noch kein Holz"}</li>
        <li>
          Beläge: ${rubbers.length ? rubbers.map((r) => r.name).join(", ") : "-"}
        </li>
      </ul>
      <footer>
        <button class="secondary" id="clear-set">Zurücksetzen</button>
      </footer>
    </div>
  `;

  $("#clear-set").addEventListener("click", () => {
    state.currentSet = clone(defaultState.currentSet);
    persistState();
    updateCurrentSetView();
  });
}

function updateFavoritesView() {
  const container = $("#favorites");
  if (!container) return;
  container.innerHTML = "";
  if (!state.favorites.length) {
    container.innerHTML = '<p class="list-empty">Noch keine Favoriten.</p>';
    return;
  }

  state.favorites.forEach((fav) => {
    const element = document.createElement("div");
    element.className = "explorer-card";
    const rubbers = fav.rubbers?.length
      ? fav.rubbers.map((rubber) => rubber.name).join(", ")
      : "-";
    element.innerHTML = `
      <header>
        <div>
          <h5>${fav.name}</h5>
          <div class="badge">${fav.blade ? fav.blade.name : "Material"}</div>
        </div>
        <strong>${fav.price ?? "-"} €</strong>
      </header>
      <p>Beläge: ${rubbers}</p>
      <footer>
        <button class="primary" data-id="${fav.id}">Aktivieren</button>
      </footer>
    `;
    element.querySelector("button").addEventListener("click", () => {
      if (fav.blade || fav.rubbers) {
        state.currentSet = {
          blade: fav.blade,
          rubbers: fav.rubbers,
          origin: fav.name,
        };
        persistState();
        updateCurrentSetView();
      }
    });
    container.append(element);
  });
}

function updateComparisonView() {
  const container = $("#comparison");
  if (!container) return;
  container.innerHTML = "";
  if (!state.comparison.length) {
    container.innerHTML = '<p class="list-empty">Noch keine Vergleiche.</p>';
    return;
  }

  const table = document.createElement("table");
  table.className = "table-view";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Tempo</th>
        <th>Spin</th>
        <th>Kontrolle</th>
        <th>Preis</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${state.comparison
        .map(
          (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.tempo ?? "-"}</td>
            <td>${item.spin ?? "-"}</td>
            <td>${item.control ?? "-"}</td>
            <td>${item.price ? `${item.price} €` : "-"}</td>
            <td>
              <button class="secondary" data-remove="${item.id}">Entfernen</button>
            </td>
          </tr>
        `
        )
        .join("")}
    </tbody>
  `;
  container.append(table);

  container.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.remove;
      state.comparison = state.comparison.filter((item) => item.id !== id);
      persistState();
      updateComparisonView();
    });
  });
}

// TRAINING PLANNER
function initTrainingPlanner() {
  const goalContainer = $("#goal-group");
  trainingGoals.forEach((goal) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = goal;
    chip.dataset.value = goal;
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
    });
    goalContainer.append(chip);
  });

  const timeRange = $("#time-availability");
  const timeValue = $("#time-value");
  timeRange.addEventListener("input", (event) => {
    timeValue.textContent = `${event.target.value} Stunden`;
  });

  $("#training-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedGoals = $$("#goal-group .chip.selected").map(
      (chip) => chip.dataset.value
    );
    const skillLevel = $("#skill-level").value;
    const hours = Number(timeRange.value);
    const plan = generateTrainingPlan({ selectedGoals, skillLevel, hours });
    state.training.plan = plan;
    state.training.completed = {};
    persistState();
    renderTrainingPlan();
  });

  if (state.training.plan) {
    renderTrainingPlan();
  } else {
    $("#training-plan").innerHTML =
      '<p class="list-empty">Starte mit der Umfrage, um deinen persönlichen Trainingsplan zu erhalten.</p>';
  }
}

function generateTrainingPlan({ selectedGoals, skillLevel, hours }) {
  const minutes = hours * 60;
  const matchingExercises = trainingLibrary
    .filter((exercise) => exercise.level === "all" || exercise.level === skillLevel)
    .map((exercise) => {
      const goalMatch = exercise.goals.filter((goal) => selectedGoals.includes(goal));
      const score = goalMatch.length * 20 + (exercise.level === skillLevel ? 15 : 0);
      return { ...exercise, score };
    })
    .sort((a, b) => b.score - a.score);

  const blocks = [];
  let accumulated = 0;

  matchingExercises.forEach((exercise) => {
    if (accumulated >= minutes) return;
    blocks.push(exercise);
    accumulated += exercise.duration;
  });

  if (!blocks.length && matchingExercises.length) {
    blocks.push(matchingExercises[0]);
  }

  const totalDuration = blocks.reduce((sum, ex) => sum + ex.duration, 0);

  return {
    id: `plan-${Date.now()}`,
    skillLevel,
    goals: selectedGoals,
    hours,
    totalDuration,
    exercises: blocks,
  };
}

function renderTrainingPlan() {
  const container = $("#training-plan");
  const plan = state.training.plan;
  if (!plan) return;

  const completedIds = new Set(Object.keys(state.training.completed));
  const completedMinutes = plan.exercises.reduce((sum, exercise) => {
    return sum + (completedIds.has(exercise.id) ? exercise.duration : 0);
  }, 0);
  const progress = Math.min(100, Math.round((completedMinutes / plan.totalDuration) * 100));

  container.innerHTML = `
    <div class="training-header">
      <h4>Dein Wochenplan</h4>
      <p>Ziele: ${plan.goals.length ? plan.goals.join(", ") : "Allgemeine Entwicklung"}</p>
      <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
        <span style="width:${progress}%"></span>
      </div>
      <small>${completedMinutes} von ${plan.totalDuration} Minuten absolviert</small>
    </div>
    <div class="exercise-list">
      ${plan.exercises
        .map((exercise) => {
          const done = completedIds.has(exercise.id);
          return `
            <div class="training-block" data-id="${exercise.id}">
              <header>
                <div>
                  <h5>${exercise.title}</h5>
                  <div class="badge">${exercise.category} · ${exercise.intensity}</div>
                </div>
                <strong>${exercise.duration} min</strong>
              </header>
              <p>${exercise.description}</p>
              <small>Fokus: ${exercise.goals.join(", ")}</small>
              <div class="media-card">
                <strong>${exercise.media.title}</strong>
                <span>${exercise.media.type.toUpperCase()}</span>
              </div>
              <div class="exercise-item">
                <span>Status: ${done ? "Erledigt" : "Ausstehend"}</span>
                <button class="secondary" data-complete="${exercise.id}">
                  ${done ? "Rückgängig" : "Abschließen"}
                </button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  container.querySelectorAll("[data-complete]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.complete;
      if (state.training.completed[id]) {
        delete state.training.completed[id];
      } else {
        state.training.completed[id] = true;
      }
      persistState();
      renderTrainingPlan();
    });
  });
}

// VIDEO ANALYSIS
function initVideoAnalysis() {
  $("#analysis-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const type = $("#analysis-type").value;
    const fileInput = $("#video-upload");
    if (!fileInput.files.length) {
      alert("Bitte lade ein Video hoch.");
      return;
    }
    const file = fileInput.files[0];
    simulateAnalysis(type, file);
  });
}

function simulateAnalysis(type, file) {
  const results = $("#analysis-results");
  const insights = analysisInsights[type];
  const proVideos = proVideoLibrary[type] || [];
  if (!insights) return;

  const created = new Date().toLocaleString();

  results.innerHTML = `
    <div class="analysis-summary">
      <h4>Analyse abgeschlossen</h4>
      <p><strong>Upload:</strong> ${file.name} · ${Math.round(file.size / 1024)} KB · ${created}</p>
      <div class="badge">Modul: ${type}</div>
    </div>
    <div>
      <h5>Stärken</h5>
      <div class="feedback-list">
        ${insights.strengths
          .map((item) => `<div class="feedback-item">${item}</div>`)
          .join("")}
      </div>
    </div>
    <div>
      <h5>Verbesserungspotenzial</h5>
      <div class="feedback-list">
        ${insights.improvements
          .map((item) => `<div class="feedback-item">${item}</div>`)
          .join("")}
      </div>
    </div>
    <div>
      <h5>Empfohlene Übungen</h5>
      <div class="exercise-list">
        ${insights.drills
          .map((drillId) => {
            const exercise = trainingLibrary.find((item) => item.id === drillId);
            if (!exercise) return "";
            return `
              <div class="training-block">
                <header>
                  <div>
                    <h5>${exercise.title}</h5>
                    <div class="badge">${exercise.category}</div>
                  </div>
                  <strong>${exercise.duration} min</strong>
                </header>
                <p>${exercise.description}</p>
                <div class="exercise-item">
                  <span>${exercise.intensity} Intensität</span>
                  <button class="secondary" data-add-drill="${exercise.id}">Zum Plan hinzufügen</button>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
    <div>
      <h5>Profi-Videos</h5>
      <div class="media-grid">
        ${proVideos
          .map(
            (video) => `
            <a class="media-card" href="${video.url}" target="_blank" rel="noopener">
              <strong>${video.title}</strong>
              <span>${video.focus}</span>
            </a>
          `
          )
          .join("")}
      </div>
    </div>
  `;

  results.querySelectorAll("[data-add-drill]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.addDrill;
      const exercise = trainingLibrary.find((item) => item.id === id);
      if (!exercise) return;
      if (!state.training.plan) {
        state.training.plan = {
          id: `plan-${Date.now()}`,
          skillLevel: "custom",
          goals: ["Videoanalyse"],
          hours: 0,
          totalDuration: exercise.duration,
          exercises: [exercise],
        };
      } else {
        const exists = state.training.plan.exercises.some(
          (item) => item.id === exercise.id
        );
        if (!exists) {
          state.training.plan.exercises.push(exercise);
          state.training.plan.totalDuration += exercise.duration;
        }
      }
      persistState();
      renderTrainingPlan();
    });
  });
}
