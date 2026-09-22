(() => {
  "use strict";

  const dataset = window.LIMITED_PREP_DATA;
  if (!dataset || !Array.isArray(dataset.sets) || dataset.sets.length === 0) return;

  const setById = new Map(dataset.sets.map((set) => [set.id, set]));
  const params = new URLSearchParams(location.search);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numberFormatter = new Intl.NumberFormat("en-GB");
  const validViews = new Set(["training", "memory", "prep", "archetypes", "decisions", "atlas"]);
  const bandLabels = {
    top: "Top pick · S/A range",
    strong: "Strong · B range",
    playable: "Playable · C range",
    filler: "Filler · D/F range",
    unrated: "Not yet rated",
  };
  const tierColors = {
    S: "#604381",
    "A+": "#8c432f", A: "#995038", "A-": "#a55d40",
    "B+": "#2f644d", B: "#3d7058", "B-": "#507d67",
    "C+": "#3f6571", C: "#557781", "C-": "#6a8990",
    "D+": "#716657", D: "#83786a", "D-": "#958b7e",
    F: "#913d38", "?": "#6a716d",
  };
  const tierFamilies = [
    { label: "Top picks", tiers: ["S", "A+", "A", "A-"] },
    { label: "Strong", tiers: ["B+", "B", "B-"] },
    { label: "Playable", tiers: ["C+", "C", "C-"] },
    { label: "Filler", tiers: ["D+", "D", "D-", "F"] },
  ];
  const tierOrder = tierFamilies.flatMap((family) => family.tiers);
  const decisionReasonLabels = {
    power: "Raw power",
    pool: "Fits the pool",
    open: "Stays flexible",
    synergy: "Synergy or payoff",
    signal: "Reading a signal",
    unsure: "Not sure",
  };
  const decisionReasonIds = new Set(Object.keys(decisionReasonLabels));
  const decisionReflectionIds = new Set(["keep", "change"]);
  const decisionPhases = new Set(["choosing", "review", "complete"]);
  const atlasTierOrder = [...tierOrder, "?"];
  const validAtlasGroupings = new Set(["colour", "type", "rarity", "none", "tier"]);
  const colorGroups = [
    { id: "W", name: "White", note: "Plains" },
    { id: "U", name: "Blue", note: "Islands" },
    { id: "B", name: "Black", note: "Swamps" },
    { id: "R", name: "Red", note: "Mountains" },
    { id: "G", name: "Green", note: "Forests" },
    { id: "M", name: "Multicolour", note: "Gold cards" },
    { id: "C", name: "Colourless", note: "Artifacts and lands" },
  ];
  const manaSymbols = {
    W: `<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    U: `<svg viewBox="0 0 24 24" focusable="false"><path d="M12 2.5C10.5 6 6.2 10.2 6.2 14.2a5.8 5.8 0 1 0 11.6 0C17.8 10.2 13.5 6 12 2.5Z" fill="currentColor"/><path d="M9.2 14.2c.2 1.7 1.2 2.8 3 3.2" fill="none" stroke="var(--symbol-glint)" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    B: `<svg viewBox="0 0 24 24" focusable="false"><path d="M12 3.2a7.4 7.4 0 0 0-7.4 7.4c0 2.9 1.4 5 3.8 6.3V20h2v-2h3.2v2h2v-3.1c2.4-1.3 3.8-3.4 3.8-6.3A7.4 7.4 0 0 0 12 3.2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="11.3" r="1.7" fill="currentColor"/><circle cx="15" cy="11.3" r="1.7" fill="currentColor"/><path d="m12 13.2-1.2 2h2.4L12 13.2Z" fill="currentColor"/></svg>`,
    R: `<svg viewBox="0 0 24 24" focusable="false"><path d="M13.3 2.7c.4 3.7-2.6 5.1-2.6 8.1 0 1.2.7 2.1 1.8 2.7-.1-2.1 1.5-3.5 3.1-4.6 1.9 2 3.1 4.2 3.1 6.7a6.7 6.7 0 0 1-13.4 0c0-3.7 2.2-6.8 8-12.9Zm-1.2 16.8c2 0 3.4-1.3 3.4-3.2 0-.8-.3-1.6-.9-2.4-.4 1.5-2 1.9-2.8 3.1-.5-.7-.7-1.5-.6-2.5-1.6 1.1-2.3 2.2-2.3 3.3 0 1 .9 1.7 3.2 1.7Z" fill="currentColor" fill-rule="evenodd"/></svg>`,
    G: `<svg viewBox="0 0 24 24" focusable="false"><path d="M12 3.2 8.5 8h2.1L7 12.6h3.1l-4 4.7h4.6V21h2.6v-3.7h4.6l-4-4.7H17L13.4 8h2.1L12 3.2Z" fill="currentColor" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/></svg>`,
    M: `<svg viewBox="0 0 24 24" focusable="false"><path d="m12 4.2 7.4 5.4-2.8 8.7H7.4L4.6 9.6 12 4.2Z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="4.2" r="2" fill="currentColor"/><circle cx="19.4" cy="9.6" r="2" fill="currentColor"/><circle cx="16.6" cy="18.3" r="2" fill="currentColor"/><circle cx="7.4" cy="18.3" r="2" fill="currentColor"/><circle cx="4.6" cy="9.6" r="2" fill="currentColor"/></svg>`,
    C: `<svg viewBox="0 0 24 24" focusable="false"><path d="m12 2.8 7.3 9.2-7.3 9.2L4.7 12 12 2.8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="m12 7.2 3.8 4.8-3.8 4.8L8.2 12 12 7.2Z" fill="currentColor"/></svg>`,
  };

  function manaSymbol(color, modifier) {
    return `<span class="mana-symbol ${modifier}" data-color="${color}" aria-hidden="true">${manaSymbols[color]}</span>`;
  }

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    productName: $("#product-name"),
    productSubtitle: $("#product-subtitle"),
    setSelect: $("#set-select"),
    shareSet: $("#share-set"),
    datasetCount: $("#dataset-count"),
    datasetUnit: $("#dataset-unit"),
    datasetDate: $("#dataset-date"),
    cardsSeen: $("#cards-seen"),
    gradeScore: $("#grade-score"),
    resetProgress: $("#reset-progress"),
    trainerInstruction: $("#trainer-instruction"),
    trainerColor: $("#trainer-color"),
    trainerImage: $("#trainer-image"),
    trainerName: $("#trainer-card-name"),
    trainerType: $("#trainer-card-type"),
    trainerOracle: $("#trainer-oracle"),
    gradeOptions: $("#grade-options"),
    trainerAnswer: $("#trainer-answer"),
    revealCard: $("#reveal-card"),
    archetypesTitle: $("#archetypes-title"),
    archetypesCopy: $("#archetypes-copy"),
    archetypeFormatSwitch: $("#archetype-format-switch"),
    formatHeadline: $("#format-headline"),
    formatGuidance: $("#format-guidance"),
    formatLeader: $("#format-leader"),
    formatSupportedShare: $("#format-supported-share"),
    formatSample: $("#format-sample"),
    archetypeNavigation: $("#archetype-navigation"),
    archetypeList: $("#archetype-list"),
    archetypeEvidenceNote: $("#archetype-evidence-note"),
    archetypeOfficialSource: $("#archetype-official-source"),
    archetypeDataSource: $("#archetype-data-source"),
    decisionPage: $(".decisions-page"),
    decisionPosition: $("#decision-position"),
    decisionsReviewed: $("#decisions-reviewed"),
    decisionCoordinate: $("#decision-coordinate"),
    decisionReplayNote: $(".decision-replay-note"),
    decisionLegacyNote: $("#decision-legacy-note"),
    decisionContext: $("#decision-context"),
    poolDirection: $("#pool-direction"),
    poolSummary: $("#pool-summary"),
    poolCount: $("#pool-count"),
    decisionPool: $("#decision-pool"),
    decisionPack: $("#decision-pack"),
    decisionCards: $("#decision-cards"),
    decisionReasoning: $("#decision-reasoning"),
    decisionReasons: $("#decision-reasons"),
    decisionChoiceLabel: $("#decision-choice-label"),
    confirmDecision: $("#confirm-decision"),
    decisionReview: $("#decision-review"),
    decisionVerdict: $("#decision-verdict"),
    decisionLesson: $("#decision-lesson"),
    decisionLedger: $("#decision-ledger"),
    decisionCoaching: $("#decision-coaching"),
    decisionReflectionOptions: $("#decision-reflection-options"),
    previousDecision: $("#previous-decision"),
    nextDecision: $("#next-decision"),
    decisionSummary: $("#decision-summary"),
    summaryReplayCount: $("#summary-replay-count"),
    summaryDataCount: $("#summary-data-count"),
    summaryThirdCount: $("#summary-third-count"),
    summaryChangeCount: $("#summary-change-count"),
    summaryCommonReason: $("#summary-common-reason"),
    decisionRevisit: $("#decision-revisit"),
    decisionRevisitList: $("#decision-revisit-list"),
    reviewFirstDecision: $("#review-first-decision"),
    atlasTitle: $("#atlas-title"),
    atlasCopy: $("#atlas-copy"),
    previewCatchup: $("#preview-catchup"),
    previewSince: $("#preview-since"),
    previewCatchupSummary: $("#preview-catchup-summary"),
    atlasGrouping: $("#atlas-grouping"),
    colorNavigation: $("#color-navigation"),
    atlasEmpty: $("#atlas-empty"),
    clearPreviewFilter: $("#clear-preview-filter"),
    cardAtlas: $("#card-atlas"),
    footerSource: $("#footer-source"),
    footerRefreshed: $("#footer-refreshed"),
    sourceLink: $("#source-link"),
    toast: $("#toast"),
    liveRegion: $("#live-region"),
    cardPreview: $("#card-preview"),
    cardPreviewFrame: $(".card-preview-frame"),
    cardPreviewImage: $("#card-preview-image"),
    cardPreviewName: $("#card-preview-name"),
    cardPreviewMeta: $("#card-preview-meta"),
    closeCardPreview: $("#close-card-preview"),
  };

  const viewTabs = [...document.querySelectorAll("[data-view]")];
  const views = new Map([...document.querySelectorAll(".view-panel")].map((panel) => [panel.id.replace("-view", ""), panel]));
  for (const tab of viewTabs) {
    tab.id = `${tab.dataset.view}-tab`;
    views.get(tab.dataset.view)?.setAttribute("aria-labelledby", tab.id);
  }

  const latestSet = [...dataset.sets].sort((left, right) => String(right.releaseDate || "").localeCompare(String(left.releaseDate || "")))[0];
  const requestedView = params.get("view") === "study" ? "training" : params.get("view");
  let currentSet = setById.get(params.get("set")) || latestSet;
  let currentView = validViews.has(requestedView) ? requestedView : window.SET_LIFECYCLE.resolve(currentSet).defaultView;
  let previewCardId = null;
  let previewTouchStart = null;
  let previewOpener = null;
  let cards = [];
  let cardById = new Map();
  let trainerCardId = null;
  let trainerRevealed = false;
  let trainerGuess = null;
  let decisionIndex = 0;
  let decisionChoice = null;
  let decisionReason = null;
  let decisionStage = "choose";
  let decisionSummaryVisible = false;
  const atlasSortOptions = new Set(["mana", "name", "rarity", "rating"]);
  let atlasSort = "mana";
  let atlasGrouping = "colour";
  let atlasSize = "compact";
  try {
    if (localStorage.getItem("limited:atlas-size") === "large") atlasSize = "large";
    const savedSort = localStorage.getItem("limited:atlas-sort");
    const savedGroup = localStorage.getItem("limited:atlas-group");
    if (atlasSortOptions.has(savedSort)) atlasSort = savedSort;
    if (validAtlasGroupings.has(savedGroup)) atlasGrouping = savedGroup;
    else if (["type", "rarity"].includes(savedSort)) atlasGrouping = savedSort;
  } catch {}
  let atlasSearch = "";
  let atlasColour = "all";
  let atlasTypeFilter = "all";
  let atlasRarity = "all";
  let atlasSince = "";
  let archetypeFormat = params.get("format") === "sealed" ? "sealed" : "draft";
  let prepFormat = "sealed";
  let archetypeStudy = false;
  let memoryStudySet = "all";
  let memoryColour = "all";
  function mountMemory() {
    const selection = window.CARD_MEMORY.mount($("#memory-content"), lifecycle().memory ? { ...currentSet, prep: lifecycle().prep ? currentSet.prep : null, archetypes: lifecycle().archetypes ? currentSet.archetypes : null } : null, {
      studySet: memoryStudySet, colour: memoryColour,
      changed: (next) => { memoryStudySet = next.studySet; memoryColour = next.colour; updateUrl(); },
    });
    if (selection) { memoryStudySet = selection.studySet; memoryColour = selection.colour; }
  }
  function renderArchetypeStudy() {
    $("#archetype-study-toggle").setAttribute("aria-pressed", String(archetypeStudy));
    $("#archetype-study-toggle").textContent = archetypeStudy ? "Back to reference" : "Study archetypes";
    $("#archetype-study-content").hidden = !archetypeStudy;
    elements.archetypeNavigation.hidden = archetypeStudy;
    elements.archetypeList.hidden = archetypeStudy;
    if (archetypeStudy) window.ARCHETYPE_STUDY.mount($("#archetype-study-content"), currentSet, { format: archetypeFormat, openCard: openCardPreview });
  }
  const prepGuide = window.LIMITED_PREP_GUIDE.create(document.querySelector("#prep-content"), {
    openCard: (id) => openCardPreview(id),
    formatChanged: (format) => { prepFormat = format; updateUrl(); },
    openArchetypes: () => { archetypeFormat = prepFormat; renderArchetypes(); activateView("archetypes", { focus: true }); },
  });
  let progress = emptyProgress();
  let toastTimer = null;

  function emptyProgress() {
    return {
      seen: [],
      gradeAttempts: 0,
      gradeCorrect: 0,
      currentCard: null,
      color: "all",
      queue: [],
      trainerRevealed: false,
      trainerGuess: null,
      schemaVersion: 2,
      legacyDecisionsReviewed: [],
      decisionResponses: {},
      currentDecision: null,
    };
  }

  function progressKey() {
    return `limited-prep:v1:${currentSet.id}`;
  }

  function readProgress() {
    try {
      const raw = localStorage.getItem(progressKey());
      if (!raw) throw new Error("No current progress");
      const saved = JSON.parse(raw);
      const next = { ...emptyProgress(), ...(saved && typeof saved === "object" ? saved : {}) };
      const validIds = new Set(cards.map((card) => card.id));
      const validColors = new Set(["all", ...colorGroups.map((group) => group.id)]);
      next.seen = Array.isArray(next.seen) ? [...new Set(next.seen.filter((id) => validIds.has(id)))] : [];
      next.queue = Array.isArray(next.queue) ? [...new Set(next.queue.filter((id) => validIds.has(id)))] : [];
      next.color = validColors.has(next.color) ? next.color : "all";
      next.currentCard = validIds.has(next.currentCard) ? next.currentCard : null;
      next.gradeAttempts = Number.isInteger(next.gradeAttempts) && next.gradeAttempts >= 0 ? next.gradeAttempts : 0;
      next.gradeCorrect = Number.isInteger(next.gradeCorrect) && next.gradeCorrect >= 0 && next.gradeCorrect <= next.gradeAttempts ? next.gradeCorrect : 0;
      const decisionScenarios = currentSet.draftDecisions?.scenarios || [];
      const decisionById = new Map(decisionScenarios.map((scenario) => [scenario.id, scenario]));
      const decisionIds = new Set(decisionById.keys());
      const legacyDecisionIds = [
        ...(Array.isArray(next.legacyDecisionsReviewed) ? next.legacyDecisionsReviewed : []),
        ...(Array.isArray(next.decisionsReviewed) ? next.decisionsReviewed : []),
      ];
      next.schemaVersion = 2;
      next.legacyDecisionsReviewed = [...new Set(legacyDecisionIds.filter((id) => decisionIds.has(id)))];
      delete next.decisionsReviewed;
      next.decisionResponses = Object.fromEntries(Object.entries(next.decisionResponses && typeof next.decisionResponses === "object" ? next.decisionResponses : {}).flatMap(([id, response]) => {
        const scenario = decisionById.get(id);
        if (!scenario || !response || typeof response !== "object" || !scenario.cards.includes(response.initialPick)) return [];
        const reason = decisionReasonIds.has(response.reason) ? response.reason : null;
        const reflection = decisionReflectionIds.has(response.reflection) ? response.reflection : null;
        let phase = decisionPhases.has(response.phase) ? response.phase : reflection ? "complete" : reason ? "review" : "choosing";
        if (phase === "complete" && (!reason || !reflection)) phase = reason ? "review" : "choosing";
        if (phase === "review" && !reason) phase = "choosing";
        return [[id, {
          phase,
          initialPick: response.initialPick,
          reason,
          reflection: phase === "complete" ? reflection : null,
        }]];
      }));
      next.currentDecision = decisionIds.has(next.currentDecision) ? next.currentDecision : null;
      delete next.pickAttempts;
      delete next.pickCorrect;
      next.trainerRevealed = Boolean(next.trainerRevealed);
      next.trainerGuess = next.trainerGuess === null || tierOrder.includes(next.trainerGuess) ? next.trainerGuess : null;
      return next;
    } catch {
      // Try the final single-set trainer format once so existing Hobbit work is not lost.
      if (currentSet.id === "hob") {
        try {
          const legacy = JSON.parse(localStorage.getItem("hobbit-pick-order:training-progress:v1"));
          const byName = new Map(cards.map((card) => [card.name, card]));
          const current = byName.get(legacy?.currentCard);
          if (legacy?.version === 1 && current) {
            return {
              ...emptyProgress(),
              seen: [current.id],
              gradeAttempts: Number.isInteger(legacy.reviewed) ? legacy.reviewed : 0,
              gradeCorrect: Number.isInteger(legacy.correct) ? legacy.correct : 0,
              currentCard: current.id,
              color: legacy.filter === "ALL" ? "all" : legacy.filter,
              queue: Array.isArray(legacy.queue) ? legacy.queue.map((name) => byName.get(name)?.id).filter(Boolean) : [],
              trainerRevealed: Boolean(legacy.answered),
              trainerGuess: tierOrder.includes(legacy.guess) ? legacy.guess : null,
            };
          }
        } catch {}
      }
      return emptyProgress();
    }
  }

  function saveProgress() {
    if (!ratingIsAvailable()) return;
    progress.currentCard = trainerCardId;
    progress.color = elements.trainerColor.value;
    progress.trainerRevealed = trainerRevealed;
    progress.trainerGuess = trainerGuess;
    try {
      localStorage.setItem(progressKey(), JSON.stringify(progress));
    } catch {
      // The tool remains usable when private browsing blocks persistence.
    }
  }

  function updateProgress() {
    elements.cardsSeen.textContent = String(new Set(progress.seen).size);
    elements.gradeScore.textContent = `${progress.gradeCorrect}/${progress.gradeAttempts}`;
    saveProgress();
  }

  function markSeen(cardId) {
    if (!progress.seen.includes(cardId)) progress.seen.push(cardId);
    updateProgress();
  }

  function shuffled(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;",
    })[char]);
  }

  function dateLabel(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
  }

  function shortDateLabel(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
  }

  function previewDates() {
    return [...new Set(browseCards().map((card) => card.firstSeenAt).filter(Boolean))].sort();
  }

  function browseCards() {
    return cards.filter((card) => !card.isBasicLand);
  }

  function previewCatchupAvailable() {
    const previewEnd = Date.parse(`${currentSet.previewEndsOn || ""}T23:59:59Z`);
    return !lifecycle().complete
      && Number.isFinite(previewEnd)
      && Date.now() <= previewEnd
      && previewDates().length > 1;
  }

  function updateUrl({ replace = true } = {}) {
    const url = new URL(location.href);
    url.searchParams.set("set", currentSet.id);
    url.searchParams.set("view", currentView);
    url.searchParams.delete("challenge");
    if (currentView === "decisions" && currentSet.draftDecisions?.scenarios?.[decisionIndex]) {
      url.searchParams.set("decision", currentSet.draftDecisions.scenarios[decisionIndex].id);
    } else {
      url.searchParams.delete("decision");
    }
    if (currentView === "archetypes" && archetypesAvailable()) url.searchParams.set("format", archetypeFormat);
    else if (["prep", "memory"].includes(currentView)) url.searchParams.set("format", prepFormat);
    else url.searchParams.delete("format");
    if (currentView === "atlas" && previewCatchupAvailable() && atlasSince) url.searchParams.set("since", atlasSince);
    else url.searchParams.delete("since");
    const atlasRoute = { group: atlasGrouping, sort: effectiveAtlasSort, q: atlasSearch, cardColour: atlasColour, cardType: atlasTypeFilter, rarity: atlasRarity };
    for (const [key, value] of Object.entries(atlasRoute)) {
      if (currentView === "atlas" && value && value !== "all") url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (currentView === "archetypes" && archetypeStudy) url.searchParams.set("study", "1");
    else url.searchParams.delete("study");
    if (currentView === "memory") {
      url.searchParams.set("studySet", memoryStudySet);
      if (memoryColour !== "all") url.searchParams.set("colour", memoryColour);
      else url.searchParams.delete("colour");
    } else { url.searchParams.delete("studySet"); url.searchParams.delete("colour"); }
    if (currentView !== "prep" || !["#prep-play-around", "#prep-checklist", "#prep-practice", "#prep-mechanics", "#prep-cards", "#prep-colours"].includes(url.hash)) url.hash = "";
    history[replace ? "replaceState" : "pushState"](null, "", url);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.hidden = false;
    toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 2600);
  }

  async function sharePage({ title, text, url }) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        showToast("Share sheet opened");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("textarea");
        input.value = url;
        input.setAttribute("readonly", "");
        input.className = "copy-helper";
        document.body.append(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      showToast("Link copied");
    } catch (error) {
      if (error?.name !== "AbortError") showToast("Could not copy the link");
    }
  }

  function ratingIsAvailable() {
    return lifecycle().training;
  }

  function lifecycle() {
    return window.SET_LIFECYCLE.resolve(currentSet);
  }

  function draftDecisionsAvailable() {
    return lifecycle().decisions;
  }

  function archetypesAvailable() {
    return lifecycle().archetypes;
  }

  function archetypeFormatData() {
    return currentSet.archetypes?.formats?.[archetypeFormat] || null;
  }

  function ratedCards() {
    return cards.filter((card) => Number.isFinite(card.rank) && card.band !== "unrated");
  }

  function tierBadge(card) {
    const badge = document.createElement("span");
    badge.className = card.tier ? "tier" : "tier tier-pending";
    badge.textContent = card.tier || "Preview";
    badge.style.setProperty("--tier-color", tierColors[card.tier] || tierColors["?"]);
    badge.setAttribute("aria-label", card.tier ? `Tier ${card.tier}` : "Not yet rated");
    return badge;
  }

  function renderSetChrome() {
    document.body.dataset.theme = currentSet.theme;
    document.documentElement.dataset.theme = currentSet.theme;
    document.title = `${currentSet.name} · Limited Field Guides`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", currentSet.theme === "fracture" ? "#171426" : "#263c31");
    elements.productName.textContent = currentSet.productName;
    const state = lifecycle();
    const nextEvent = [["Prerelease", currentSet.prereleaseDate], ["Arena", currentSet.arenaDate], ["Release", currentSet.releaseDate]]
      .find(([, date]) => date && date >= new Date().toISOString().slice(0, 10));
    elements.productSubtitle.textContent = state.training ? currentSet.subtitle
      : `${state.complete ? "Full card file available. Ratings pending." : "Discover the cards as they are revealed."}${nextEvent ? ` ${nextEvent[0]} · ${dateLabel(nextEvent[1])}.` : ""}`;
    elements.setSelect.value = currentSet.id;
    elements.datasetCount.textContent = String(currentSet.browseCardCount);
    elements.datasetUnit.textContent = state.complete ? "cards" : "revealed";
    elements.datasetDate.textContent = state.training ? "observed data" : state.complete ? "full card file" : "previews";
    elements.atlasTitle.textContent = state.atlasLabel;

    if (archetypesAvailable()) {
      elements.archetypesTitle.textContent = `${currentSet.archetypes.archetypes.length} roads through the set`;
      elements.archetypesCopy.textContent = currentSet.archetypes.status === "observed"
        ? "Official plans, tested against format-specific results. Learn what each deck needs before deciding whether your cards actually support it."
        : "The official colour-pair map, with practical plans and signposts from the complete card file. Draft and Sealed results remain visibly pending.";
    }

    const decisionTab = viewTabs.find((tab) => tab.dataset.view === "decisions");
    if (decisionTab) {
      decisionTab.hidden = !draftDecisionsAvailable();
      decisionTab.tabIndex = -1;
    }
    const archetypesTab = viewTabs.find((tab) => tab.dataset.view === "archetypes");
    if (archetypesTab) {
      archetypesTab.hidden = !archetypesAvailable();
      archetypesTab.tabIndex = -1;
    }
    const trainingTab = viewTabs.find((tab) => tab.dataset.view === "training");
    trainingTab.hidden = !state.training;
    viewTabs.find((tab) => tab.dataset.view === "memory").hidden = !state.memory;
    viewTabs.find((tab) => tab.dataset.view === "prep").hidden = !state.prep;
    $("#atlas-prep-invitation").hidden = !state.prep;
    $("#atlas-prep-link").href = `?set=${encodeURIComponent(currentSet.id)}&view=prep&format=sealed`;
    viewTabs.find((tab) => tab.dataset.view === "atlas").querySelector("span").textContent = state.atlasLabel;
    const viewCount = state.views.length;
    document.documentElement.style.setProperty("--view-count", String(viewCount));
    document.documentElement.dataset.viewCount = String(viewCount);

    renderFooterSource();
  }

  function renderFooterSource() {
    if (currentView === "prep" && lifecycle().prep) {
      elements.footerRefreshed.hidden = false;
      elements.footerRefreshed.textContent = `Guide reviewed ${dateLabel(currentSet.prep.authoredAt)}`;
      elements.footerSource.textContent = "Rules references and editorial preparation notes";
      elements.sourceLink.href = currentSet.prep.sources[0].url;
      elements.sourceLink.textContent = "Read the preparation sources";
      return;
    }
    const refreshedAt = currentView === "archetypes" && archetypesAvailable()
      ? archetypeFormatData()?.observed?.capturedAt || currentSet.archetypes.authoredAt
      : currentView === "decisions" && draftDecisionsAvailable()
        ? currentSet.draftDecisions.capturedAt
        : !ratingIsAvailable()
          ? currentSet.previewCapturedAt
          : currentSet.performance?.capturedAt || currentSet.rating.capturedAt;
    elements.footerRefreshed.textContent = refreshedAt ? `Last refreshed ${dateLabel(refreshedAt)}` : "";
    elements.footerRefreshed.hidden = !refreshedAt;

    if (currentView === "archetypes" && archetypesAvailable()) {
      const format = archetypeFormatData();
      const observationsAvailable = format.observed?.status === "available";
      elements.footerSource.textContent = observationsAvailable
        ? `${currentSet.archetypes.official.label} · ${format.source.label} · ${format.source.scope}`
        : `${currentSet.archetypes.official.label} · ${format.shortLabel} observations pending`;
      elements.sourceLink.href = observationsAvailable ? format.source.url : currentSet.archetypes.official.url;
      elements.sourceLink.textContent = observationsAvailable ? `View ${format.shortLabel.toLowerCase()} data` : "View official archetype map";
      return;
    }

    if (currentView === "decisions" && draftDecisionsAvailable()) {
      elements.footerSource.textContent = `${currentSet.draftDecisions.sourceName} real draft replay · ${currentSet.draftDecisions.format} · ${currentSet.draftDecisions.record} record`;
      elements.sourceLink.href = currentSet.draftDecisions.source;
      elements.sourceLink.textContent = "View draft replay";
      return;
    }
    elements.footerSource.textContent = !ratingIsAvailable()
      ? currentSet.cardSource.label
      : `${currentSet.rating.source} pick order · ${currentSet.rating.rankRange} · ${currentSet.rating.archetype}`;
    elements.sourceLink.href = currentSet.cardSource.url;
    elements.sourceLink.textContent = !ratingIsAvailable() ? "View card source" : "View ranking source";
  }

  function cardIsRated(card) {
    return Boolean(card && Number.isFinite(card.rank) && tierOrder.includes(card.tier));
  }

  function renderGradeOptions() {
    const rows = tierFamilies.map((family) => {
      const row = document.createElement("div");
      row.className = "grade-family";
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", family.label);
      row.replaceChildren(...family.tiers.map((tier) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.grade = tier;
        button.style.setProperty("--tier-color", tierColors[tier]);
        button.setAttribute("aria-label", `Guess tier ${tier}`);
        button.innerHTML = `<strong>${escapeHtml(tier)}</strong>`;
        return button;
      }));
      return row;
    });
    elements.gradeOptions.replaceChildren(...rows);
    elements.gradeOptions.setAttribute("aria-label", "Choose the exact card tier");
  }

  function trainerPool() {
    const color = elements.trainerColor.value;
    const eligibleCards = ratingIsAvailable() ? ratedCards() : cards;
    return eligibleCards.filter((card) => color === "all" || card.color === color);
  }

  function resetTrainerQueue() {
    progress.queue = shuffled(trainerPool().map((card) => card.id));
    if (progress.queue.length > 1 && progress.queue[0] === trainerCardId) {
      progress.queue.push(progress.queue.shift());
    }
  }

  function takeTrainerCard() {
    const poolIds = new Set(trainerPool().map((card) => card.id));
    progress.queue = progress.queue.filter((id) => poolIds.has(id));
    if (progress.queue.length === 0) resetTrainerQueue();
    return cardById.get(progress.queue.shift()) || trainerPool()[0] || cards[0];
  }

  function repeatTrainerCardSoon(cardId) {
    if (progress.queue.includes(cardId)) return;
    progress.queue.splice(Math.min(3, progress.queue.length), 0, cardId);
  }

  function trainerEvidence(card) {
    if (!card.stats) return "";
    const winRate = Number.isFinite(card.stats.inHandWinRate) ? `${card.stats.inHandWinRate.toFixed(1)}%` : "—";
    const lastOffered = Number.isFinite(card.stats.avgLastOffered) ? `Pick ${card.stats.avgLastOffered.toFixed(1)}` : "—";
    const games = Number.isFinite(card.stats.inHandGames) ? numberFormatter.format(card.stats.inHandGames) : "—";
    const neighbours = [
      cards.find((entry) => entry.rank === card.rank - 1),
      cards.find((entry) => entry.rank === card.rank + 1),
    ].filter(Boolean);
    return `<dl class="trainer-stat-ledger" aria-label="Card draft statistics"><div><dt>In-hand WR</dt><dd>${winRate}</dd></div><div><dt>Usually gone by</dt><dd>${lastOffered}</dd></div><div><dt>In-hand games</dt><dd>${games}</dd></div></dl>${neighbours.length ? `<p class="trainer-neighbours"><strong>Nearby:</strong> ${neighbours.map((entry) => `#${entry.rank} ${escapeHtml(entry.name)}`).join(" · ")}</p>` : ""}`;
  }

  function renderTrainer() {
    if (!ratingIsAvailable()) return;
    const card = cardById.get(trainerCardId) || (ratingIsAvailable() ? takeTrainerCard() : cards[0]);
    if (!card) return;
    trainerCardId = card.id;
    markSeen(card.id);

    elements.trainerImage.onerror = () => {
      elements.trainerImage.onerror = null;
      elements.trainerImage.src = card.image;
    };
    elements.trainerImage.src = card.trainingImage || card.image;
    elements.trainerImage.alt = `${card.name} card`;
    elements.trainerName.textContent = card.name;
    elements.trainerType.textContent = card.typeLine || "";
    elements.trainerOracle.innerHTML = window.CARD_RULES.render(card.oracleText || "");
    elements.trainerAnswer.hidden = true;
    elements.trainerAnswer.replaceChildren();
    elements.gradeOptions.querySelectorAll("button").forEach((button) => {
      button.disabled = false;
      button.dataset.result = "";
      button.setAttribute("aria-pressed", "false");
    });

    if (cardIsRated(card)) {
      elements.trainerInstruction.textContent = "Choose the exact tier. Misses return again within a few cards.";
      elements.gradeOptions.hidden = false;
      elements.revealCard.hidden = false;
      elements.revealCard.disabled = false;
      elements.trainerType.hidden = true;
      elements.trainerOracle.hidden = true;
      if (trainerRevealed) revealTrainer();
    } else {
      elements.trainerInstruction.textContent = currentSet.stage === "preview"
        ? "Read the revealed card, then move through the live preview file."
        : "This card had no attributable tier in the captured ranking.";
      elements.gradeOptions.hidden = true;
      elements.revealCard.hidden = true;
      elements.trainerType.hidden = false;
      elements.trainerOracle.hidden = false;
      elements.trainerAnswer.hidden = false;
      elements.trainerAnswer.innerHTML = `<div class="trainer-answer-heading"><strong>${escapeHtml(card.rarity || "Unrated")} · ${escapeHtml(currentSet.code)} #${escapeHtml(card.collectorNumber || card.rank || "—")}</strong><span>${currentSet.stage === "preview" ? "Unrated preview" : "No tier in snapshot"}</span></div>`;
    }
  }

  function revealTrainer() {
    const card = cardById.get(trainerCardId);
    if (!cardIsRated(card)) return;
    trainerRevealed = true;
    elements.trainerAnswer.hidden = false;
    const result = trainerGuess === card.tier ? "Exact" : trainerGuess === null ? "Answer revealed" : `You chose ${escapeHtml(trainerGuess)}`;
    elements.trainerAnswer.innerHTML = `<div class="trainer-answer-heading"><strong>#${card.rank} · Tier ${escapeHtml(card.tier)}</strong><span>${result} · ${escapeHtml(bandLabels[card.band])}</span></div>${trainerEvidence(card)}`;
    elements.revealCard.disabled = true;
    elements.gradeOptions.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(button.dataset.grade === trainerGuess));
      if (button.dataset.grade === card.tier) button.dataset.result = "correct";
      else if (trainerGuess === button.dataset.grade) button.dataset.result = "wrong";
      else button.dataset.result = "muted";
    });
    updateProgress();
  }

  function answerTrainer(guess) {
    if (trainerRevealed || !ratingIsAvailable()) return;
    const card = cardById.get(trainerCardId);
    if (!cardIsRated(card)) return;
    trainerGuess = guess;
    progress.gradeAttempts += 1;
    if (guess === card.tier) progress.gradeCorrect += 1;
    else repeatTrainerCardSoon(card.id);
    revealTrainer();
    elements.liveRegion.textContent = guess === card.tier
      ? `Correct. ${card.name} is tier ${card.tier}, rank ${card.rank}.`
      : `${card.name} is tier ${card.tier}, rank ${card.rank}. It will return again soon.`;
  }

  function nextTrainerCard() {
    const next = takeTrainerCard();
    if (!next) return;
    trainerCardId = next.id;
    trainerRevealed = false;
    trainerGuess = null;
    renderTrainer();
  }

  function archetypeObservation(archetypeId) {
    return archetypeFormatData()?.observed?.pairs?.find((pair) => pair.id === archetypeId) || null;
  }

  function pairLabel(pair) {
    return pair?.name?.replace(/\s*\([WUBRG]+\)$/, "") || pair?.id || "No result";
  }

  function renderArchetypes() {
    if (!archetypesAvailable()) return;
    const format = archetypeFormatData();
    if (!format) return;
    renderArchetypeStudy();
    const observed = format.observed || { status: "pending", pairs: [] };
    const observationsAvailable = observed.status === "available" && observed.pairs.length > 0;
    elements.formatLeader.closest("dl").hidden = !observationsAvailable;
    const topPair = observationsAvailable ? observed.pairs.find((pair) => pair.id === observed.topPair) : null;
    const topSupport = topPair?.supported ? "supported plan" : "not an official archetype";

    elements.archetypeFormatSwitch.querySelectorAll("[data-archetype-format]").forEach((button) => {
      const selected = button.dataset.archetypeFormat === archetypeFormat;
      button.setAttribute("aria-pressed", String(selected));
    });
    elements.formatHeadline.innerHTML = window.CARD_RULES.inline(format.headline);
    elements.formatGuidance.innerHTML = window.CARD_RULES.inline(format.guidance);
    elements.formatLeader.innerHTML = observationsAvailable
      ? `<strong>${escapeHtml(pairLabel(topPair))}</strong><span>${topPair.winRate.toFixed(1)}% · ${escapeHtml(topSupport)}</span>`
      : "<strong>Not known</strong><span>no recorded games yet</span>";
    elements.formatSupportedShare.innerHTML = observationsAvailable
      ? `<strong>${observed.supportedShare.toFixed(1)}%</strong><span>of two-colour games</span>`
      : `<strong>${currentSet.archetypes.archetypes.length}</strong><span>official colour-pair plans</span>`;
    elements.formatSample.innerHTML = observationsAvailable
      ? `<strong>${numberFormatter.format(observed.twoColourGames)}</strong><span>games in snapshot</span>`
      : "<strong>Pending</strong><span>after Arena play begins</span>";
    $("#archetype-additional-sources").innerHTML = (currentSet.archetypes.sources || []).map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`).join(" ");
    elements.archetypeOfficialSource.href = currentSet.archetypes.official.url;
    elements.archetypeOfficialSource.textContent = "View official archetype map";
    elements.archetypeDataSource.href = format.source.url;
    elements.archetypeDataSource.textContent = `View ${format.shortLabel} observations`;
    elements.archetypeDataSource.hidden = !observationsAvailable;
    elements.archetypeEvidenceNote.textContent = observationsAvailable
      ? "Intended plans and observed results are separate evidence. Win rates describe games recorded by 17Lands users; compare pairs within one format rather than treating the number as your expected result."
      : "This page shows Wizards' intended plans plus editorial preparation notes. Draft and Sealed observations are pending; no archetype is ranked or recommended yet.";

    elements.archetypeNavigation.replaceChildren(...currentSet.archetypes.archetypes.map((archetype) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.archetypeJump = archetype.id;
      button.innerHTML = `<span class="archetype-route">${archetype.colors.map((color) => manaSymbol(color, "mana-symbol--route")).join("")}</span><strong>${escapeHtml(archetype.id)}</strong><span>${escapeHtml(archetype.name)}</span>`;
      return button;
    }));

    elements.archetypeList.replaceChildren(...currentSet.archetypes.archetypes.map((archetype) => {
      const stats = archetypeObservation(archetype.id);
      const section = document.createElement("article");
      section.id = `archetype-${archetype.id}`;
      section.className = "archetype-section";
      section.dataset.pair = archetype.id;
      const signposts = archetype.signposts.map((card) => {
        const rank = Number.isFinite(card.rank) ? `#${card.rank} · Tier ${card.tier}` : "Archetype signpost";
        return `<button class="archetype-signpost" type="button" data-card-id="${escapeHtml(card.cardId)}" aria-label="Enlarge ${escapeHtml(card.name)}"><img src="${escapeHtml(card.trainingImage)}" alt="" width="210" height="294"><span><strong>${escapeHtml(card.name)}</strong><span>${escapeHtml(rank)}</span></span></button>`;
      }).join("");
      const result = stats
        ? `<strong>#${stats.supportedRank} of ${currentSet.archetypes.archetypes.length}</strong><span>${stats.winRate.toFixed(1)}% · ${numberFormatter.format(stats.games)} games</span>`
        : "<strong>Official plan</strong><span>results pending</span>";
      const family = archetype.family ? `<span class="archetype-kicker">${escapeHtml(archetype.family)}</span>` : "";
      section.innerHTML = `
        <header class="archetype-section-heading">
          <div class="archetype-identity">
            <span class="archetype-route">${archetype.colors.map((color) => manaSymbol(color, "mana-symbol--archetype")).join("")}</span>
            <div>${family}<h3>${escapeHtml(archetype.name)}</h3><p class="archetype-mechanic">${window.CARD_RULES.inline(archetype.mechanic)}</p></div>
          </div>
          <div class="archetype-result">${result}</div>
        </header>
        <div class="archetype-body">
          <div class="archetype-guidance">
            <p class="archetype-plan">${window.CARD_RULES.inline(archetype.plan)}</p>
            <div class="archetype-priorities"><h4>What the deck needs</h4><ol>${archetype.priorities.map((priority) => `<li>${window.CARD_RULES.inline(priority)}</li>`).join("")}</ol></div>
            <div class="archetype-format-note"><h4>${escapeHtml(format.shortLabel)} read</h4><p>${window.CARD_RULES.inline(archetype.formatNotes[archetypeFormat])}</p></div>
            ${window.EARLY_EVIDENCE.archetype(currentSet, archetype.id)}
          </div>
          <div class="archetype-signposts"><h4>Cards to recognise</h4><div class="archetype-signpost-grid">${signposts}</div></div>
        </div>`;
      return section;
    }));
  }

  function decisionScenario(index = decisionIndex) {
    return currentSet.draftDecisions?.scenarios?.[index] || null;
  }

  function decisionResponse(scenario = decisionScenario()) {
    return scenario ? progress.decisionResponses?.[scenario.id] || null : null;
  }

  function completedDecisionCount() {
    return (currentSet.draftDecisions?.scenarios || []).filter((scenario) => decisionResponse(scenario)?.phase === "complete").length;
  }

  function hydrateDecisionState() {
    const response = decisionResponse();
    decisionChoice = response?.initialPick || null;
    decisionReason = response?.reason || null;
    decisionStage = response && response.phase !== "choosing" ? "review" : "choose";
  }

  function cardForName(name) {
    return cards.find((card) => card.name === name) || null;
  }

  function basicLandColor(name) {
    return { Plains: "W", Island: "U", Swamp: "B", Mountain: "R", Forest: "G" }[name] || null;
  }

  function decisionDataCandidates(scenario) {
    return scenario.cards.map(cardForName).filter((card) => Number.isFinite(card?.rank)).sort((left, right) => left.rank - right.rank);
  }

  function decisionDataLeader(scenario) {
    return decisionDataCandidates(scenario)[0] || null;
  }

  function decisionCardMeta(name) {
    const card = cardForName(name);
    if (!card) return { card: null, color: basicLandColor(name), rank: "Basic land", detail: "No pick-order rank" };
    const winRate = Number.isFinite(card.stats?.inHandWinRate) ? `${card.stats.inHandWinRate.toFixed(1)}% IHW` : "No win rate";
    return { card, color: card.color, rank: `#${card.rank} · ${card.tier}`, detail: winRate };
  }

  function poolRead(pool) {
    const counts = new Map(colorGroups.map((group) => [group.id, 0]));
    pool.forEach((name) => {
      const color = cardForName(name)?.color || basicLandColor(name) || "C";
      counts.set(color, (counts.get(color) || 0) + 1);
    });
    const ranked = colorGroups.map((group) => ({ ...group, count: counts.get(group.id) || 0 })).filter((group) => group.count > 0).sort((left, right) => right.count - left.count);
    if (pool.length === 0) return { direction: "No commitments yet", summary: "The first pick can stay open." };
    if (pool.length < 4 || !ranked[0] || ranked[0].count === ranked[1]?.count) {
      const names = ranked.slice(0, 2).map((group) => group.name.toLowerCase()).join(" and ");
      return { direction: "Still open", summary: `${pool.length} ${pool.length === 1 ? "pick" : "picks"} so far${names ? `, led by ${names}` : ""}.` };
    }
    const lead = ranked[0];
    const clearLead = lead.count >= (ranked[1]?.count || 0) + 2;
    return {
      direction: clearLead ? `${lead.name} leaning` : `${lead.name} / ${ranked[1]?.name || "open"}`,
      summary: `${lead.count} of ${pool.length} picks are ${lead.name.toLowerCase()}${clearLead ? "; changing course now needs a real payoff" : "; the second colour is still fluid"}.`,
    };
  }

  function decisionOption(name) {
    const meta = decisionCardMeta(name);
    const item = document.createElement("article");
    item.className = "decision-card";
    item.dataset.selected = String(decisionChoice === name);
    const visual = meta.card
      ? `<button class="decision-card-preview" type="button" data-preview-card-name="${escapeHtml(name)}" aria-label="View ${escapeHtml(name)} card"><img src="${escapeHtml(meta.card.trainingImage || meta.card.image)}" alt="" width="190" height="266"><span class="decision-view-label">View card</span></button>`
      : `<span class="decision-land" data-color="${meta.color}">${manaSymbol(meta.color, "mana-symbol--land")}<strong>${escapeHtml(name)}</strong><span>Basic land</span></span>`;
    const choiceLabel = decisionChoice === name ? `Selected ${name}` : `Choose ${name}`;
    item.innerHTML = `${visual}<div class="decision-card-copy"><strong>${escapeHtml(name)}</strong><button class="decision-card-choose" type="button" data-card-name="${escapeHtml(name)}" aria-label="${escapeHtml(choiceLabel)}" aria-pressed="${String(decisionChoice === name)}">${decisionChoice === name ? "Selected" : "Choose"}</button></div>`;
    const image = item.querySelector("img");
    if (image && meta.card.trainingImage && meta.card.trainingImage !== meta.card.image) {
      image.addEventListener("error", () => { image.src = meta.card.image; }, { once: true });
    }
    return item;
  }

  function renderDecisionPool(scenario) {
    const grouped = new Map();
    scenario.pool.forEach((name) => grouped.set(name, (grouped.get(name) || 0) + 1));
    elements.poolCount.textContent = `${scenario.pool.length} ${scenario.pool.length === 1 ? "card" : "cards"}`;
    if (grouped.size === 0) {
      const empty = document.createElement("p");
      empty.className = "decision-pool-empty";
      empty.textContent = "No earlier picks";
      elements.decisionPool.replaceChildren(empty);
      return;
    }
    elements.decisionPool.replaceChildren(...[...grouped].map(([name, count]) => {
      const meta = decisionCardMeta(name);
      const item = document.createElement(meta.card ? "button" : "span");
      item.className = "pool-card";
      if (meta.card) {
        item.type = "button";
        item.dataset.previewCardName = name;
        item.setAttribute("aria-label", `View ${name} card from the historical pool`);
      }
      item.innerHTML = meta.card
        ? `<img src="${escapeHtml(meta.card.image)}" alt="" width="40" height="56"><span>${escapeHtml(name)}</span>${count > 1 ? `<strong>×${count}</strong>` : ""}`
        : `${manaSymbol(meta.color, "mana-symbol--pool")}<span>${escapeHtml(name)}</span>${count > 1 ? `<strong>×${count}</strong>` : ""}`;
      return item;
    }));
  }

  function renderDecisionReflection(response) {
    elements.decisionReflectionOptions.querySelectorAll("[data-decision-reflection]").forEach((button) => {
      button.setAttribute("aria-pressed", String(response?.reflection === button.dataset.decisionReflection));
    });
    const complete = response?.phase === "complete";
    elements.previousDecision.disabled = !complete || decisionIndex === 0;
    elements.nextDecision.disabled = !complete;
    elements.nextDecision.textContent = decisionIndex === currentSet.draftDecisions.scenarios.length - 1 ? "Finish review" : "Next decision";
  }

  function renderDecisionReview(scenario) {
    const response = decisionResponse(scenario);
    const choice = decisionCardMeta(response.initialPick);
    const replay = decisionCardMeta(scenario.replayPick);
    const leaderCard = decisionDataLeader(scenario);
    const leader = leaderCard ? decisionCardMeta(leaderCard.name) : null;
    const allAgree = response.initialPick === scenario.replayPick && scenario.replayPick === leaderCard?.name;
    if (!leaderCard) elements.decisionVerdict.textContent = "No ranked card is available for a statistical comparison, so this review stays with your reasoning and the historical choice.";
    else if (allAgree) elements.decisionVerdict.textContent = "Your pick, the replay, and the current raw ranking all point to the same card.";
    else if (response.initialPick === scenario.replayPick) elements.decisionVerdict.textContent = "You matched the replay pick. Compare its contextual case with the raw baseline.";
    else if (response.initialPick === leaderCard.name) elements.decisionVerdict.textContent = "You followed the current raw ranking. The replay took a different line, so context has to explain the gap.";
    else elements.decisionVerdict.textContent = "You found a third line. Compare what it gains against both raw strength and the direction taken in the replay.";

    const candidates = decisionDataCandidates(scenario);
    const runnerUp = candidates[1] || null;
    const rankGap = runnerUp && leaderCard ? runnerUp.rank - leaderCard.rank : null;
    const rankLead = runnerUp
      ? `${rankGap === 1 ? "one place" : `${rankGap} places`} ahead of ${runnerUp.name} at #${runnerUp.rank}`
      : "the only ranked card remaining";
    const winRateContext = Number.isFinite(leaderCard?.stats?.inHandWinRate)
      ? ` Its recorded in-hand win rate is ${leaderCard.stats.inHandWinRate.toFixed(1)}%.`
      : "";
    const dataRead = leaderCard
      ? `The exercise takes the highest card left in the current Untapped ranking. ${leaderCard.name} is #${leaderCard.rank}, ${rankLead}.${winRateContext} Pool fit is not part of this calculation.`
      : "No card in this pack has a current rank, so the exercise does not manufacture a statistical leader.";
    const ledgerItem = (label, name, meta, explanation) => `<div><dt>${escapeHtml(label)}</dt><dd><strong class="decision-ledger-name">${escapeHtml(name)}</strong>${meta ? `<span class="decision-ledger-meta">${escapeHtml(meta.rank)} · ${escapeHtml(meta.detail)}</span>` : ""}<span class="decision-ledger-reason"><strong>${escapeHtml(explanation.label)}</strong><span>${window.CARD_RULES.inline(explanation.text)}</span><small>${window.CARD_RULES.inline(explanation.boundary)}</small></span></dd></div>`;
    elements.decisionLedger.innerHTML = [
      ledgerItem("Your decision", response.initialPick, choice, {
        label: "What drove your pick",
        text: decisionReasonLabels[response.reason],
        boundary: "Recorded before the replay choice and ranking were revealed",
      }),
      ledgerItem("What happened", scenario.replayPick, replay, {
        label: "Why the replay may have taken it",
        text: scenario.replayRead,
        boundary: "Editorial inference · the drafter did not supply a reason",
      }),
      ledgerItem("Statistical baseline", leaderCard?.name || "No ranked card", leader, {
        label: leaderCard ? "Why the data selected it" : "Why there is no data leader",
        text: dataRead,
        boundary: leaderCard ? "Calculated from current rank · pool fit excluded" : "No baseline has been inferred",
      }),
    ].join("");

    elements.decisionLesson.innerHTML = window.CARD_RULES.inline(scenario.lesson);
    if (!leaderCard) {
      elements.decisionCoaching.textContent = "Use the authored takeaway and the historical context without treating missing data as evidence for either card.";
    } else if (scenario.replayPick === leaderCard.name) {
      elements.decisionCoaching.textContent = "Replay and data arrive at the same card for different evidential reasons: one is the pick that happened, while the other is a mechanical rank calculation.";
    } else {
      const replayGap = Number.isFinite(replay.card?.rank) ? replay.card.rank - leaderCard.rank : null;
      const gapRead = Number.isFinite(replayGap)
        ? `gave up ${replayGap === 1 ? "one ranking place" : `${replayGap} ranking places`}`
        : "moved away from the ranked baseline";
      elements.decisionCoaching.textContent = `The replay ${gapRead} for the contextual case above. That is the tradeoff to interrogate—not proof that either pick is automatically correct.`;
    }
    renderDecisionReflection(response);
  }

  function renderDecisionSummary() {
    const scenarios = currentSet.draftDecisions.scenarios;
    const responses = scenarios.map((scenario) => ({ scenario, response: decisionResponse(scenario), leader: decisionDataLeader(scenario) })).filter((entry) => entry.response?.phase === "complete");
    elements.summaryReplayCount.textContent = String(responses.filter(({ scenario, response }) => response.initialPick === scenario.replayPick).length);
    elements.summaryDataCount.textContent = String(responses.filter(({ response, leader }) => response.initialPick === leader?.name).length);
    elements.summaryThirdCount.textContent = String(responses.filter(({ scenario, response, leader }) => response.initialPick !== scenario.replayPick && response.initialPick !== leader?.name).length);
    elements.summaryChangeCount.textContent = String(responses.filter(({ response }) => response.reflection === "change").length);

    const reasonCounts = new Map(Object.keys(decisionReasonLabels).map((reason) => [reason, 0]));
    responses.forEach(({ response }) => reasonCounts.set(response.reason, (reasonCounts.get(response.reason) || 0) + 1));
    const highestReasonCount = Math.max(...reasonCounts.values());
    const commonReasons = [...reasonCounts].filter(([, count]) => count === highestReasonCount && count > 0).map(([reason]) => decisionReasonLabels[reason]);
    const reasonRead = commonReasons.length === 1
      ? `Your most common reason was ${commonReasons[0].toLowerCase()}.`
      : commonReasons.length > 1
        ? `Your reasoning was mixed across ${commonReasons.map((reason) => reason.toLowerCase()).join(", ")}.`
        : "No reasoning pattern is available yet.";
    elements.summaryCommonReason.textContent = `${reasonRead} Replay and data counts can overlap when both sources selected the same card.`;

    const revisit = responses.filter(({ response }) => response.reflection === "change");
    elements.decisionRevisit.hidden = revisit.length === 0;
    elements.decisionRevisitList.replaceChildren(...revisit.map(({ scenario }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.reviewDecision = scenario.id;
      button.textContent = `Pack ${scenario.pack} · Pick ${scenario.pick}`;
      return button;
    }));
  }

  function renderDecision() {
    if (!draftDecisionsAvailable()) return;
    const scenarios = currentSet.draftDecisions.scenarios;
    decisionIndex = Math.max(0, Math.min(decisionIndex, scenarios.length - 1));
    const scenario = scenarios[decisionIndex];
    const completed = completedDecisionCount();
    const legacyIncomplete = (progress.legacyDecisionsReviewed || []).filter((id) => progress.decisionResponses?.[id]?.phase !== "complete").length;
    elements.decisionsReviewed.textContent = decisionSummaryVisible ? "Review complete" : `${completed} completed`;
    elements.decisionPosition.textContent = decisionSummaryVisible ? `${completed} / ${scenarios.length}` : `${decisionIndex + 1} / ${scenarios.length}`;
    elements.decisionReplayNote.hidden = decisionSummaryVisible;
    elements.decisionLegacyNote.hidden = decisionSummaryVisible || legacyIncomplete === 0;
    elements.decisionLegacyNote.textContent = legacyIncomplete === 1
      ? "1 decision was reviewed before this update. Revisit it to record your pick, reason, and reflection."
      : `${legacyIncomplete} decisions were reviewed before this update. Revisit them to record your picks, reasons, and reflections.`;
    elements.decisionContext.hidden = decisionSummaryVisible;
    elements.decisionPack.hidden = true;
    elements.decisionReview.hidden = true;
    elements.decisionSummary.hidden = !decisionSummaryVisible;
    if (decisionSummaryVisible) {
      renderDecisionSummary();
      return;
    }

    const read = poolRead(scenario.pool);
    elements.decisionCoordinate.textContent = `Pack ${scenario.pack} · Pick ${scenario.pick}`;
    elements.poolDirection.innerHTML = window.CARD_RULES.inline(read.direction);
    elements.poolSummary.innerHTML = window.CARD_RULES.inline(read.summary);
    renderDecisionPool(scenario);
    hydrateDecisionState();

    if (decisionStage === "choose") {
      elements.decisionPack.hidden = false;
      elements.decisionCards.replaceChildren(...scenario.cards.map(decisionOption));
      elements.decisionReasoning.hidden = !decisionChoice;
      elements.decisionReasons.querySelectorAll("input[name='decision-reason']").forEach((input) => {
        input.checked = input.value === decisionReason;
      });
      elements.decisionChoiceLabel.textContent = decisionChoice ? `${decisionChoice} selected.` : "";
      elements.confirmDecision.disabled = !decisionChoice || !decisionReason;
      return;
    }

    elements.decisionReview.hidden = false;
    renderDecisionReview(scenario);
  }

  function chooseDecision(name) {
    const scenario = decisionScenario();
    const response = decisionResponse(scenario);
    if (!scenario || !scenario.cards.includes(name) || (response && response.phase !== "choosing")) return;
    decisionChoice = name;
    progress.decisionResponses[scenario.id] = {
      phase: "choosing",
      initialPick: name,
      reason: decisionReason,
      reflection: null,
    };
    progress.currentDecision = scenario.id;
    saveProgress();
    renderDecision();
    updateUrl();
    elements.liveRegion.textContent = `${name} selected. Choose what drove your pick.`;
    requestAnimationFrame(() => {
      elements.decisionReasoning.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
      elements.decisionReasons.querySelector("input:checked, input")?.focus();
    });
  }

  function selectDecisionReason(reason) {
    const scenario = decisionScenario();
    const response = decisionResponse(scenario);
    if (!scenario || !response || response.phase !== "choosing" || !decisionReasonIds.has(reason)) return;
    decisionReason = reason;
    response.reason = reason;
    elements.confirmDecision.disabled = false;
    elements.liveRegion.textContent = `${decisionReasonLabels[reason]} selected as your reason.`;
    saveProgress();
  }

  function confirmDecision() {
    const scenario = decisionScenario();
    const response = decisionResponse(scenario);
    if (!scenario || !response || response.phase !== "choosing" || !decisionReasonIds.has(response.reason)) {
      elements.decisionReasons.querySelector("input")?.focus();
      return;
    }
    response.phase = "review";
    response.reflection = null;
    decisionStage = "review";
    saveProgress();
    renderDecision();
    elements.liveRegion.textContent = `Comparison revealed for ${response.initialPick}.`;
    requestAnimationFrame(() => {
      elements.decisionReview.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      elements.decisionReview.focus({ preventScroll: true });
    });
  }

  function setDecisionReflection(reflection) {
    const response = decisionResponse();
    if (!response || !["review", "complete"].includes(response.phase) || !decisionReflectionIds.has(reflection)) return;
    response.phase = "complete";
    response.reflection = reflection;
    saveProgress();
    renderDecision();
    const selected = elements.decisionReflectionOptions.querySelector(`[data-decision-reflection="${reflection}"]`);
    selected?.focus();
    elements.liveRegion.textContent = reflection === "keep" ? "You would keep your original pick." : "You would change your pick after review.";
  }

  function goToDecision(index) {
    const scenarios = currentSet.draftDecisions?.scenarios || [];
    if (!scenarios[index]) return;
    decisionIndex = index;
    decisionSummaryVisible = false;
    progress.currentDecision = scenarios[index].id;
    saveProgress();
    renderDecision();
    updateUrl();
    const target = decisionStage === "review" ? elements.decisionReview : elements.decisionContext;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    requestAnimationFrame(() => target.focus({ preventScroll: true }));
  }

  function previousDecision() {
    if (decisionResponse()?.phase !== "complete") return;
    goToDecision(decisionIndex - 1);
  }

  function nextDecision() {
    if (!draftDecisionsAvailable() || decisionResponse()?.phase !== "complete") return;
    const scenarios = currentSet.draftDecisions.scenarios;
    if (decisionIndex < scenarios.length - 1) {
      goToDecision(decisionIndex + 1);
      return;
    }
    const firstIncomplete = scenarios.findIndex((scenario) => decisionResponse(scenario)?.phase !== "complete");
    if (firstIncomplete >= 0) {
      showToast("Finish the remaining decisions before the summary");
      goToDecision(firstIncomplete);
      return;
    }
    decisionSummaryVisible = true;
    renderDecision();
    updateUrl();
    elements.liveRegion.textContent = "Replay review complete. Your reflection summary is ready.";
    requestAnimationFrame(() => {
      elements.decisionSummary.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      elements.decisionSummary.focus({ preventScroll: true });
    });
  }

  function openCardPreview(cardId) {
    const card = cardById.get(cardId);
    if (!card) return;
    if (!elements.cardPreview.open) previewOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    previewCardId = card.id;
    const readableImage = card.trainingImage || card.image;
    elements.cardPreviewImage.onerror = () => {
      elements.cardPreviewImage.onerror = null;
      elements.cardPreviewImage.src = card.image;
    };
    elements.cardPreviewImage.src = readableImage;
    elements.cardPreviewImage.alt = `${card.name} card`;
    elements.cardPreviewName.textContent = card.name;
    const hideDecisionRating = currentView === "decisions" && decisionStage === "choose" && !decisionSummaryVisible;
    elements.cardPreviewMeta.textContent = hideDecisionRating
      ? "Ranking hidden until comparison"
      : cardIsRated(card)
      ? `#${card.rank} · Tier ${card.tier}`
      : `${card.rarity || "Preview"} · ${currentSet.code} #${card.collectorNumber || "—"}`;
    const evidencePanel = document.getElementById("card-preview-evidence");
    evidencePanel.innerHTML = hideDecisionRating || currentView === "memory" ? "" : window.EARLY_EVIDENCE.card(currentSet, card.id);
    evidencePanel.hidden = !evidencePanel.innerHTML;
    elements.cardPreview.classList.toggle("has-early-evidence", !evidencePanel.hidden);
    if (!elements.cardPreview.open) elements.cardPreview.showModal();
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-evidence-card]");
    if (button) openCardPreview(button.dataset.evidenceCard);
  });

  function navigateCardPreview(direction) {
    if (!elements.cardPreview.open || currentView !== "atlas") return;
    const atlasCards = [...elements.cardAtlas.querySelectorAll("[data-card-id]")];
    const index = atlasCards.findIndex((button) => button.dataset.cardId === previewCardId);
    if (index < 0) return;
    const nextCard = atlasCards[index + direction];
    if (nextCard) openCardPreview(nextCard.dataset.cardId);
  }

  function renderPreviewCatchup(visibleCards) {
    const dates = previewDates();
    const available = previewCatchupAvailable();
    if (!available || (atlasSince && !dates.includes(atlasSince))) atlasSince = "";
    elements.previewCatchup.hidden = !available;
    if (!available) return;

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = `All ${currentSet.browseCardCount} revealed cards`;
    const dateOptions = dates.map((date) => {
      const option = document.createElement("option");
      const newerCount = browseCards().filter((card) => card.firstSeenAt > date).length;
      option.value = date;
      option.textContent = `New since ${shortDateLabel(date)} · ${newerCount} ${newerCount === 1 ? "card" : "cards"}`;
      return option;
    });
    elements.previewSince.replaceChildren(allOption, ...dateOptions);
    elements.previewSince.value = atlasSince;
    elements.previewCatchupSummary.textContent = atlasSince
      ? `Showing ${visibleCards.length} ${visibleCards.length === 1 ? "card" : "cards"} added after ${shortDateLabel(atlasSince)}.`
      : `Showing all ${currentSet.browseCardCount} revealed cards.`;
  }

  const atlasNameCompare = (a, b) => a.name.localeCompare(b.name);
  const atlasManaCompare = (a, b) => (a.manaValue ?? Infinity) - (b.manaValue ?? Infinity) || atlasNameCompare(a, b);
  const atlasType = (card) => /\bCreature\b/.test(card.typeLine || "") ? "Creatures" : /\bLand\b/.test(card.typeLine || "") ? "Lands" : "Non-creatures";
  const atlasRarities = ["common", "uncommon", "rare", "mythic"];
  let effectiveAtlasSort = "mana";
  function atlasCompare(a, b) {
    if (effectiveAtlasSort === "rarity") {
      const rarityOrder = (card) => atlasRarities.includes(card.rarity) ? atlasRarities.indexOf(card.rarity) : atlasRarities.length;
      return rarityOrder(a) - rarityOrder(b) || atlasManaCompare(a, b);
    }
    if (effectiveAtlasSort === "name") return atlasNameCompare(a, b);
    if (effectiveAtlasSort === "rating" && ratingIsAvailable()) return a.rank - b.rank || atlasNameCompare(a, b);
    return atlasManaCompare(a, b);
  }

  function renderAtlas() {
    const catchupAvailable = previewCatchupAvailable();
    if (!catchupAvailable || (atlasSince && !previewDates().includes(atlasSince))) atlasSince = "";
    const dateCards = catchupAvailable && atlasSince
      ? browseCards().filter((card) => card.firstSeenAt > atlasSince)
      : browseCards();
    const metadataAvailable = browseCards().every((card) => Number.isFinite(card.manaValue) && card.typeLine && card.rarity);
    const allowedSorts = metadataAvailable ? ["mana", "name", "rarity"] : ["name"];
    const allowedGroups = metadataAvailable ? ["colour", "type", "rarity", "none"] : ["colour", "none"];
    if (ratingIsAvailable()) { allowedSorts.push("rating"); allowedGroups.push("tier"); }
    if (!allowedGroups.includes(atlasGrouping)) atlasGrouping = "colour";
    effectiveAtlasSort = allowedSorts.includes(atlasSort) ? atlasSort : ratingIsAvailable() ? "rating" : "name";
    for (const [id, allowed, value] of [["atlas-sort", allowedSorts, effectiveAtlasSort], ["atlas-grouping", allowedGroups, atlasGrouping]]) {
      const select = $(`#${id}`);
      select.querySelectorAll("option").forEach((option) => { option.hidden = !allowed.includes(option.value); option.disabled = option.hidden; });
      select.value = value;
    }
    $("#atlas-type-field").hidden = !metadataAvailable;
    $("#atlas-rarity-field").hidden = !metadataAvailable;
    if (!metadataAvailable) { atlasTypeFilter = "all"; atlasRarity = "all"; }
    $("#atlas-colour").value = atlasColour;
    $("#atlas-type").value = atlasTypeFilter;
    $("#atlas-rarity").value = atlasRarity;
    $("#atlas-search").value = atlasSearch;
    $("#atlas-size").value = atlasSize;
    elements.cardAtlas.dataset.size = atlasSize;
    const visibleCards = dateCards.filter((card) =>
      card.name.toLocaleLowerCase().includes(atlasSearch.trim().toLocaleLowerCase())
      && (atlasColour === "all" || card.color === atlasColour)
      && (atlasTypeFilter === "all" || atlasType(card) === atlasTypeFilter)
      && (atlasRarity === "all" || card.rarity === atlasRarity));
    const filtered = Boolean(atlasSearch.trim() || atlasColour !== "all" || atlasTypeFilter !== "all" || atlasRarity !== "all" || atlasSince);
    $("#atlas-clear-filters").hidden = !filtered;
    $("#atlas-results").textContent = filtered ? `Showing ${visibleCards.length} of ${currentSet.browseCardCount} cards.` : "";
    renderPreviewCatchup(dateCards);
    elements.atlasCopy.textContent = `${currentSet.browseCardCount} ${ratingIsAvailable() ? "ranked cards" : lifecycle().complete ? "cards" : "revealed cards"}.${currentSet.browseCardCount < currentSet.cardCount ? " Basic lands omitted." : ""} Select a card to enlarge it.${!ratingIsAvailable() && lifecycle().released ? " Ratings are pending." : ""}`;

    const definitions = atlasGrouping === "colour" ? colorGroups
      : atlasGrouping === "tier" ? atlasTierOrder.map((id) => ({ id }))
      : atlasGrouping === "type" ? ["Creatures", "Non-creatures", "Lands"].map((id) => ({ id, name: id }))
      : atlasGrouping === "rarity" ? [...atlasRarities, "other"].map((id) => ({ id, name: ({ common: "Common", uncommon: "Uncommon", rare: "Rare", mythic: "Mythic", other: "Other rarity" })[id] }))
      : [{ id: "all" }];
    const groupKey = (card) => atlasGrouping === "colour" ? card.color : atlasGrouping === "tier" ? card.tier || "?" : atlasGrouping === "type" ? atlasType(card) : atlasGrouping === "rarity" ? atlasRarities.includes(card.rarity) ? card.rarity : "other" : "all";
    const groups = definitions.map((group) => ({ ...group, cards: visibleCards.filter((card) => groupKey(card) === group.id).sort(atlasCompare) })).filter((group) => group.cards.length);

    elements.colorNavigation.setAttribute("aria-label", atlasGrouping === "tier" ? "Jump to card tier" : "Jump to card colour");
    elements.colorNavigation.replaceChildren(...( ["colour", "tier"].includes(atlasGrouping) ? groups : []).map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      const isTierGroup = atlasGrouping === "tier";
      const sectionId = isTierGroup ? `tier-${group.id.replace("+", "plus").replace("-", "minus").replace("?", "unrated")}` : `color-${group.id}`;
      button.className = isTierGroup ? "color-jump tier-jump" : "color-jump";
      button.dataset[isTierGroup ? "tier" : "color"] = group.id;
      const cardCountLabel = `${group.cards.length} ${group.cards.length === 1 ? "card" : "cards"}`;
      button.setAttribute("aria-label", isTierGroup
        ? `Jump to ${group.id === "?" ? "unrated cards" : `tier ${group.id}`}, ${cardCountLabel}`
        : `Jump to ${group.name}, ${cardCountLabel}`);
      button.innerHTML = isTierGroup
        ? `<span class="tier ${group.id === "?" ? "tier-pending" : ""}" style="--tier-color:${tierColors[group.id] || tierColors["?"]}">${escapeHtml(group.id)}</span><span>${group.cards.length}</span>`
        : `${manaSymbol(group.id, "mana-symbol--jump")}<strong>${group.name}</strong><span>${group.cards.length}</span>`;
      button.addEventListener("click", () => document.querySelector(`#${sectionId}`)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" }));
      return button;
    }));
    elements.colorNavigation.hidden = visibleCards.length === 0 || !["colour", "tier"].includes(atlasGrouping);
    elements.atlasEmpty.hidden = visibleCards.length !== 0;
    elements.atlasEmpty.querySelector("strong").textContent = filtered ? "No matching cards." : "You are caught up.";
    elements.atlasEmpty.querySelector("p").textContent = filtered ? "Try another selection or clear the filters." : "No cards were added after that preview date.";

    elements.cardAtlas.replaceChildren(...groups.map((group) => {
      const isTierGroup = atlasGrouping === "tier";
      const groupCards = group.cards;
      const section = document.createElement("section");
      const sectionId = isTierGroup ? `tier-${group.id.replace("+", "plus").replace("-", "minus").replace("?", "unrated")}` : `color-${group.id}`;
      section.id = sectionId;
      section.className = isTierGroup ? "tier-section" : atlasGrouping === "colour" ? "color-section" : "atlas-section";
      section.dataset[isTierGroup ? "tier" : "color"] = group.id;
      const ranks = groupCards.map((card) => card.rank).filter(Number.isFinite);
      const range = isTierGroup && ranks.length ? `#${Math.min(...ranks)}–#${Math.max(...ranks)}` : "";
      if (isTierGroup) {
        const family = tierFamilies.find((item) => item.tiers.includes(group.id))?.label || "No assigned tier";
        section.style.setProperty("--tier-color", tierColors[group.id] || tierColors["?"]);
        section.innerHTML = `<header class="tier-section-heading"><span class="tier tier-section-mark ${group.id === "?" ? "tier-pending" : ""}">${escapeHtml(group.id)}</span><div><h3>${escapeHtml(group.id === "?" ? "Unrated" : family)}</h3><p>${escapeHtml(group.id === "?" ? "No assigned tier" : `Tier ${group.id}`)} · ${groupCards.length} ${groupCards.length === 1 ? "card" : "cards"}</p></div><span class="color-range">${range}</span></header>`;
      } else if (atlasGrouping === "colour") {
        section.innerHTML = `<header class="color-section-heading">${manaSymbol(group.id, "mana-symbol--section")}<div><h3>${group.name}</h3><p>${group.note} · ${groupCards.length} cards</p></div><span class="color-range">${range}</span></header>`;
      }
      if (["type", "rarity"].includes(atlasGrouping)) {
        const heading = document.createElement("h3");
        heading.className = "atlas-subheading";
        heading.textContent = `${group.name} · ${groupCards.length}`;
        section.append(heading);
      }
      const grid = document.createElement("div");
      grid.className = "atlas-grid";
      grid.replaceChildren(...groupCards.map((card) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "atlas-card";
        button.dataset.cardId = card.id;
        button.dataset.color = card.color;
        button.setAttribute("aria-label", `Enlarge ${card.name}`);
        const cost = card.manaCost ? `<span class="atlas-card-cost">${window.CARD_RULES.inline(card.manaCost)}</span> ` : "";
        const color = colorGroups.find((item) => item.id === card.color);
        const meta = isTierGroup
          ? `${manaSymbol(card.color, "mana-symbol--meta")}<span>${escapeHtml(color?.name || "Colourless")}</span>`
          : !ratingIsAvailable()
            ? `<span>${escapeHtml(card.rarity || "Unrated")}</span>`
            : `<span class="tier ${cardIsRated(card) ? "" : "tier-pending"}" style="--tier-color:${tierColors[card.tier] || tierColors["?"]}">${escapeHtml(cardIsRated(card) ? card.tier : "Unrated")}</span>`;
        button.innerHTML = `<img src="${escapeHtml(atlasSize === "large" ? card.trainingImage || card.image : card.image)}" alt="" width="80" height="112" loading="lazy" decoding="async"><span class="atlas-card-copy"><strong>${cost}${escapeHtml(card.name)}</strong>${card.typeLine ? `<span class="atlas-card-type">${escapeHtml(card.typeLine)}</span>` : ""}<span class="atlas-card-meta">${meta}</span></span>`;
        const image = button.querySelector("img");
        image.onerror = () => {
          image.onerror = null;
          image.src = card.image;
        };
        return button;
      }));
      section.append(grid);
      return section;
    }));
  }

  function activateView(view, { focus = false, updateHistory = true } = {}) {
    if (view === "archetypes" && currentView === "prep" && archetypesAvailable()) {
      archetypeFormat = prepFormat === "draft" ? "draft" : "sealed";
      renderArchetypes();
    }
    currentView = lifecycle().views.includes(view) ? view : lifecycle().defaultView;
    views.forEach((panel, id) => { panel.hidden = id !== currentView; });
    viewTabs.forEach((tab) => {
      const selected = tab.dataset.view === currentView;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    document.body.dataset.view = currentView;
    renderFooterSource();
    if (updateHistory) updateUrl();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function selectSet(setId, { updateHistory = true } = {}) {
    const nextSet = setById.get(setId);
    if (!nextSet) return;
    const routeParams = new URLSearchParams(location.search);
    const useRouteState = !updateHistory && routeParams.get("set") === setId;
    currentSet = nextSet;
    cards = [...currentSet.cards];
    cardById = new Map(cards.map((card) => [card.id, card]));
    if (!useRouteState) currentView = lifecycle().defaultView;
    const requestedFormat = useRouteState ? routeParams.get("format") : null;
    prepFormat = requestedFormat === "2hg" && currentSet.prep?.twoHeadedGiant ? "2hg" : requestedFormat === "draft" ? "draft" : "sealed";
    if (requestedFormat && currentSet.archetypes?.formats?.[requestedFormat]) archetypeFormat = requestedFormat;
    else if (!currentSet.archetypes?.formats?.[archetypeFormat]) archetypeFormat = "draft";
    archetypeStudy = useRouteState && routeParams.get("study") === "1";
    memoryStudySet = useRouteState ? routeParams.get("studySet") || "all" : "all";
    memoryColour = useRouteState ? routeParams.get("colour") || "all" : "all";
    atlasSince = useRouteState ? routeParams.get("since") || "" : "";
    if (useRouteState && validAtlasGroupings.has(routeParams.get("group"))) atlasGrouping = routeParams.get("group");
    if (useRouteState && atlasSortOptions.has(routeParams.get("sort"))) atlasSort = routeParams.get("sort");
    atlasSearch = useRouteState ? routeParams.get("q") || "" : "";
    atlasColour = useRouteState && colorGroups.some((group) => group.id === routeParams.get("cardColour")) ? routeParams.get("cardColour") : "all";
    atlasTypeFilter = useRouteState && ["Creatures", "Non-creatures", "Lands"].includes(routeParams.get("cardType")) ? routeParams.get("cardType") : "all";
    atlasRarity = useRouteState && atlasRarities.includes(routeParams.get("rarity")) ? routeParams.get("rarity") : "all";
    progress = readProgress();
    elements.trainerColor.value = progress.color || "all";
    renderGradeOptions();
    const savedCard = cardById.get(progress.currentCard);
    trainerCardId = savedCard?.id || (ratingIsAvailable() ? takeTrainerCard()?.id : cards[0]?.id);
    trainerRevealed = Boolean(progress.trainerRevealed && cardIsRated(cardById.get(trainerCardId)));
    trainerGuess = trainerRevealed ? progress.trainerGuess : null;
    const scenarios = currentSet.draftDecisions?.scenarios || [];
    const requestedDecisionId = useRouteState ? routeParams.get("decision") : null;
    const requestedDecisionIndex = scenarios.findIndex((scenario) => scenario.id === requestedDecisionId);
    const persistedDecisionIndex = scenarios.findIndex((scenario) => scenario.id === progress.currentDecision);
    decisionIndex = requestedDecisionIndex >= 0 ? requestedDecisionIndex : persistedDecisionIndex >= 0 ? persistedDecisionIndex : 0;
    progress.currentDecision = scenarios[decisionIndex]?.id || null;
    decisionChoice = null;
    decisionReason = null;
    decisionStage = "choose";
    decisionSummaryVisible = false;
    renderSetChrome();
    updateProgress();
    renderTrainer();
    renderArchetypes();
    prepGuide.render(lifecycle().prep ? currentSet : null, prepFormat);
    mountMemory();
    renderDecision();
    renderAtlas();
    activateView(currentView, { updateHistory: false });
    if (updateHistory) updateUrl();
  }

  elements.setSelect.replaceChildren(...dataset.sets.map((set) => {
    const option = document.createElement("option");
    option.value = set.id;
    const state = window.SET_LIFECYCLE.resolve(set);
    option.textContent = `${set.name}${!state.complete ? " · previews" : !state.released ? " · full reveal" : ""}`;
    return option;
  }));

  elements.setSelect.addEventListener("change", () => selectSet(elements.setSelect.value));
  $("#atlas-prep-link").addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    prepFormat = "sealed";
    prepGuide.render(currentSet, prepFormat);
    activateView("prep", { focus: true });
  });
  elements.shareSet.addEventListener("click", () => {
    updateUrl();
    sharePage({ title: currentSet.productName, text: `Prepare for ${currentSet.name} Limited with me.`, url: location.href });
  });
  elements.gradeOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-grade]");
    if (button) answerTrainer(button.dataset.grade);
  });
  elements.revealCard.addEventListener("click", () => answerTrainer(null));
  $("#archetype-study-toggle").addEventListener("click", () => {
    archetypeStudy = !archetypeStudy; renderArchetypeStudy(); updateUrl();
  });
  elements.archetypeFormatSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archetype-format]");
    if (!button || !currentSet.archetypes?.formats?.[button.dataset.archetypeFormat]) return;
    archetypeFormat = button.dataset.archetypeFormat;
    renderArchetypes();
    renderFooterSource();
    updateUrl();
    elements.liveRegion.textContent = `${archetypeFormatData().label} archetype evidence shown.`;
  });
  elements.archetypeNavigation.addEventListener("click", (event) => {
    const button = event.target.closest("[data-archetype-jump]");
    if (button) document.querySelector(`#archetype-${button.dataset.archetypeJump}`)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
  elements.archetypeList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-id]");
    if (button) openCardPreview(button.dataset.cardId);
  });
  elements.decisionPage.addEventListener("click", (event) => {
    const preview = event.target.closest("[data-preview-card-name]");
    if (preview) {
      const card = cardForName(preview.dataset.previewCardName);
      if (card) openCardPreview(card.id);
      return;
    }
    const choice = event.target.closest("[data-card-name]");
    if (choice) chooseDecision(choice.dataset.cardName);
  });
  elements.decisionReasons.addEventListener("change", (event) => {
    if (event.target.matches("input[name='decision-reason']")) selectDecisionReason(event.target.value);
  });
  elements.confirmDecision.addEventListener("click", confirmDecision);
  elements.decisionReflectionOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-decision-reflection]");
    if (button) setDecisionReflection(button.dataset.decisionReflection);
  });
  elements.previousDecision.addEventListener("click", previousDecision);
  elements.nextDecision.addEventListener("click", nextDecision);
  elements.decisionRevisitList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-decision]");
    if (!button) return;
    const index = currentSet.draftDecisions.scenarios.findIndex((scenario) => scenario.id === button.dataset.reviewDecision);
    if (index >= 0) goToDecision(index);
  });
  elements.reviewFirstDecision.addEventListener("click", () => goToDecision(0));
  elements.trainerColor.addEventListener("change", () => {
    progress.color = elements.trainerColor.value;
    progress.queue = [];
    trainerCardId = null;
    nextTrainerCard();
  });
  elements.previewSince.addEventListener("change", () => {
    atlasSince = elements.previewSince.value;
    renderAtlas();
    updateUrl();
  });

  $("#atlas-size").addEventListener("change", (event) => {
    atlasSize = event.target.value === "large" ? "large" : "compact";
    try { localStorage.setItem("limited:atlas-size", atlasSize); } catch {}
    renderAtlas();
  });

  $("#atlas-sort").addEventListener("change", (event) => {
    atlasSort = event.target.value;
    try { localStorage.setItem("limited:atlas-sort", atlasSort); } catch {}
    renderAtlas();
    updateUrl();
    elements.liveRegion.textContent = `Cards sorted by ${event.target.selectedOptions[0].textContent}.`;
  });
  $("#atlas-search").addEventListener("input", (event) => {
    atlasSearch = event.target.value;
    renderAtlas();
    updateUrl();
  });
  elements.atlasGrouping.addEventListener("change", (event) => {
    atlasGrouping = event.target.value;
    try { localStorage.setItem("limited:atlas-group", atlasGrouping); } catch {}
    renderAtlas();
    updateUrl();
    elements.liveRegion.textContent = `Grouping: ${event.target.selectedOptions[0].textContent}.`;
  });
  for (const id of ["atlas-colour", "atlas-type", "atlas-rarity"]) {
    $(`#${id}`).addEventListener("change", (event) => {
      if (id === "atlas-colour") atlasColour = event.target.value;
      if (id === "atlas-type") atlasTypeFilter = event.target.value;
      if (id === "atlas-rarity") atlasRarity = event.target.value;
      renderAtlas();
      updateUrl();
    });
  }
  function clearAtlasFilters() {
    atlasSearch = "";
    atlasColour = atlasTypeFilter = atlasRarity = "all";
    atlasSince = "";
    renderAtlas();
    updateUrl();
    $("#atlas-search").focus();
  }
  elements.clearPreviewFilter.addEventListener("click", clearAtlasFilters);
  $("#atlas-clear-filters").addEventListener("click", clearAtlasFilters);

  elements.resetProgress.addEventListener("click", () => {
    if (!window.confirm(`Reset your ${currentSet.name} preparation progress on this browser?`)) return;
    progress = emptyProgress();
    elements.trainerColor.value = "all";
    try { localStorage.removeItem(progressKey()); } catch {}
    trainerCardId = null;
    trainerRevealed = false;
    trainerGuess = null;
    decisionIndex = 0;
    decisionChoice = null;
    decisionReason = null;
    decisionStage = "choose";
    decisionSummaryVisible = false;
    progress.currentDecision = currentSet.draftDecisions?.scenarios?.[0]?.id || null;
    nextTrainerCard();
    renderDecision();
    updateUrl();
    showToast("Progress reset");
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("#next-card")) nextTrainerCard();
  });
  elements.cardAtlas.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-id]");
    if (!button) return;
    openCardPreview(button.dataset.cardId);
  });
  elements.closeCardPreview.addEventListener("click", () => elements.cardPreview.close());
  elements.cardPreview.addEventListener("click", (event) => {
    if (event.target === elements.cardPreview) elements.cardPreview.close();
  });
  elements.cardPreview.addEventListener("keydown", (event) => {
    if (!elements.cardPreview.open || currentView !== "atlas") return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    navigateCardPreview(event.key === "ArrowRight" ? 1 : -1);
  });

  elements.cardPreviewFrame.addEventListener("touchstart", (event) => {
    previewTouchStart = currentView === "atlas" && event.touches.length === 1
      && !event.target.closest("button")
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, horizontal: false }
      : null;
  }, { passive: true });
  elements.cardPreviewFrame.addEventListener("touchmove", (event) => {
    if (!previewTouchStart) return;
    if (event.touches.length !== 1) {
      previewTouchStart = null;
      return;
    }
    const dx = event.touches[0].clientX - previewTouchStart.x;
    const dy = event.touches[0].clientY - previewTouchStart.y;
    const horizontalEnough = Math.abs(dx) >= 10 && Math.abs(dx) >= Math.abs(dy) * 0.65;
    if (!horizontalEnough) return;
    previewTouchStart.horizontal = true;
    // Claim horizontal movement, but use the completed gesture for direction.
    if (event.cancelable) event.preventDefault();
  }, { passive: false });
  elements.cardPreviewFrame.addEventListener("touchend", (event) => {
    const start = previewTouchStart;
    previewTouchStart = null;
    if (!start || event.touches.length || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (start.horizontal && event.cancelable) event.preventDefault();
    if (Math.abs(dx) >= 24 && Math.abs(dx) >= Math.abs(dy) * 0.65) {
      navigateCardPreview(dx > 0 ? -1 : 1);
    }
  }, { passive: false });
  elements.cardPreviewFrame.addEventListener("touchcancel", () => { previewTouchStart = null; });
  elements.cardPreview.addEventListener("close", () => {
    previewTouchStart = null;
    previewOpener?.focus();
    previewOpener = null;
  });

  viewTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateView(tab.dataset.view));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const availableTabs = viewTabs.filter((candidate) => !candidate.hidden);
      const index = availableTabs.indexOf(tab);
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? availableTabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + availableTabs.length) % availableTabs.length;
      activateView(availableTabs[nextIndex].dataset.view, { focus: true });
    });
  });

  selectSet(currentSet.id, { updateHistory: false });
  updateUrl();
  if (currentView === "prep" && location.hash) document.querySelector(location.hash)?.scrollIntoView({ block: "start" });

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {}));
  }
})();
