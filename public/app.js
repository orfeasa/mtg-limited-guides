(() => {
  "use strict";

  const dataset = window.LIMITED_PREP_DATA;
  if (!dataset || !Array.isArray(dataset.sets) || dataset.sets.length === 0) return;

  const setById = new Map(dataset.sets.map((set) => [set.id, set]));
  const params = new URLSearchParams(location.search);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numberFormatter = new Intl.NumberFormat("en-GB");
  const validViews = new Set(["training", "archetypes", "decisions", "atlas"]);
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
    archetypeOfficialSource: $("#archetype-official-source"),
    archetypeDataSource: $("#archetype-data-source"),
    decisionPosition: $("#decision-position"),
    decisionsReviewed: $("#decisions-reviewed"),
    decisionCoordinate: $("#decision-coordinate"),
    poolDirection: $("#pool-direction"),
    poolSummary: $("#pool-summary"),
    poolCount: $("#pool-count"),
    decisionPool: $("#decision-pool"),
    decisionCards: $("#decision-cards"),
    changeDecision: $("#change-decision"),
    decisionReview: $("#decision-review"),
    decisionVerdict: $("#decision-verdict"),
    decisionLedger: $("#decision-ledger"),
    decisionCoaching: $("#decision-coaching"),
    nextDecision: $("#next-decision"),
    atlasTitle: $("#atlas-title"),
    atlasCopy: $("#atlas-copy"),
    colorNavigation: $("#color-navigation"),
    cardAtlas: $("#card-atlas"),
    footerSource: $("#footer-source"),
    footerRefreshed: $("#footer-refreshed"),
    sourceLink: $("#source-link"),
    toast: $("#toast"),
    liveRegion: $("#live-region"),
    cardPreview: $("#card-preview"),
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
  let currentView = validViews.has(requestedView) ? requestedView : "training";
  let previewCardId = null;
  let previewTouchStart = null;
  let cards = [];
  let cardById = new Map();
  let trainerCardId = null;
  let trainerRevealed = false;
  let trainerGuess = null;
  let decisionIndex = 0;
  let decisionChoice = null;
  let archetypeFormat = params.get("format") === "sealed" ? "sealed" : "draft";
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
      decisionsReviewed: [],
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
      const decisionIds = new Set((currentSet.draftDecisions?.scenarios || []).map((scenario) => scenario.id));
      next.decisionsReviewed = Array.isArray(next.decisionsReviewed) ? [...new Set(next.decisionsReviewed.filter((id) => decisionIds.has(id)))] : [];
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
    else url.searchParams.delete("format");
    url.hash = "";
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
    return currentSet.rating.status === "available";
  }

  function draftDecisionsAvailable() {
    return Array.isArray(currentSet.draftDecisions?.scenarios) && currentSet.draftDecisions.scenarios.length > 0;
  }

  function archetypesAvailable() {
    return Array.isArray(currentSet.archetypes?.archetypes) && currentSet.archetypes.archetypes.length > 0;
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
    elements.productSubtitle.textContent = currentSet.subtitle;
    elements.setSelect.value = currentSet.id;
    elements.datasetCount.textContent = String(currentSet.cardCount);
    elements.datasetUnit.textContent = currentSet.stage === "preview" ? "revealed" : "cards";
    elements.datasetDate.textContent = currentSet.stage === "preview" ? "preview file" : "observed data";
    elements.atlasTitle.textContent = currentSet.stage === "preview" ? "The revealed card file" : "The complete card atlas";
    elements.atlasCopy.textContent = currentSet.stage === "preview"
      ? `${currentSet.cardCount} revealed cards, grouped by colour. Select a card to enlarge it.`
      : `All ${currentSet.cardCount} ranked cards, grouped by colour. Select a card to enlarge it.`;

    if (archetypesAvailable()) {
      elements.archetypesTitle.textContent = `${currentSet.archetypes.archetypes.length} roads through the set`;
      elements.archetypesCopy.textContent = "Official plans, tested against format-specific results. Learn what each deck needs before deciding whether your cards actually support it.";
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
    const viewCount = 2 + Number(draftDecisionsAvailable()) + Number(archetypesAvailable());
    document.documentElement.style.setProperty("--view-count", String(viewCount));
    document.documentElement.dataset.viewCount = String(viewCount);

    renderFooterSource();
  }

  function renderFooterSource() {
    const refreshedAt = currentView === "archetypes" && archetypesAvailable()
      ? archetypeFormatData()?.observed?.capturedAt
      : currentView === "decisions" && draftDecisionsAvailable()
        ? currentSet.draftDecisions.capturedAt
        : currentSet.stage === "preview"
          ? currentSet.previewCapturedAt
          : currentSet.performance?.capturedAt || currentSet.rating.capturedAt;
    elements.footerRefreshed.textContent = refreshedAt ? `Last refreshed ${dateLabel(refreshedAt)}` : "";
    elements.footerRefreshed.hidden = !refreshedAt;

    if (currentView === "archetypes" && archetypesAvailable()) {
      const format = archetypeFormatData();
      elements.footerSource.textContent = `${currentSet.archetypes.official.label} · ${format.source.label} · ${format.source.scope}`;
      elements.sourceLink.href = format.source.url;
      elements.sourceLink.textContent = `View ${format.shortLabel.toLowerCase()} data`;
      return;
    }

    if (currentView === "decisions" && draftDecisionsAvailable()) {
      elements.footerSource.textContent = `${currentSet.draftDecisions.sourceName} real draft replay · ${currentSet.draftDecisions.format} · ${currentSet.draftDecisions.record} record`;
      elements.sourceLink.href = currentSet.draftDecisions.source;
      elements.sourceLink.textContent = "View draft replay";
      return;
    }
    elements.footerSource.textContent = currentSet.stage === "preview"
      ? currentSet.cardSource.label
      : `${currentSet.rating.source} pick order · ${currentSet.rating.rankRange} · ${currentSet.rating.archetype}`;
    elements.sourceLink.href = currentSet.cardSource.url;
    elements.sourceLink.textContent = currentSet.stage === "preview" ? "View preview source" : "View ranking source";
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
    elements.trainerOracle.textContent = card.oracleText || "";
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
    const observed = format.observed;
    const topPair = observed.pairs.find((pair) => pair.id === observed.topPair);
    const topSupport = topPair?.supported ? "supported plan" : "not an official archetype";

    elements.archetypeFormatSwitch.querySelectorAll("[data-archetype-format]").forEach((button) => {
      const selected = button.dataset.archetypeFormat === archetypeFormat;
      button.setAttribute("aria-pressed", String(selected));
    });
    elements.formatHeadline.textContent = format.headline;
    elements.formatGuidance.textContent = format.guidance;
    elements.formatLeader.innerHTML = `<strong>${escapeHtml(pairLabel(topPair))}</strong><span>${topPair.winRate.toFixed(1)}% · ${escapeHtml(topSupport)}</span>`;
    elements.formatSupportedShare.innerHTML = `<strong>${observed.supportedShare.toFixed(1)}%</strong><span>of two-colour games</span>`;
    elements.formatSample.innerHTML = `<strong>${numberFormatter.format(observed.twoColourGames)}</strong><span>games in snapshot</span>`;
    elements.archetypeOfficialSource.href = currentSet.archetypes.official.url;
    elements.archetypeDataSource.href = format.source.url;
    elements.archetypeDataSource.textContent = `View ${format.shortLabel} observations`;

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
        const rank = Number.isFinite(card.rank) ? `#${card.rank} · Tier ${card.tier}` : "Official signpost";
        return `<button class="archetype-signpost" type="button" data-card-id="${escapeHtml(card.cardId)}" aria-label="Enlarge ${escapeHtml(card.name)}"><img src="${escapeHtml(card.trainingImage)}" alt="" width="210" height="294"><span><strong>${escapeHtml(card.name)}</strong><span>${escapeHtml(rank)}</span></span></button>`;
      }).join("");
      section.innerHTML = `
        <header class="archetype-section-heading">
          <div class="archetype-identity">
            <span class="archetype-route">${archetype.colors.map((color) => manaSymbol(color, "mana-symbol--archetype")).join("")}</span>
            <div><h3>${escapeHtml(archetype.name)}</h3><p class="archetype-mechanic">${escapeHtml(archetype.mechanic)}</p></div>
          </div>
          <div class="archetype-result"><strong>#${stats.supportedRank} of ${currentSet.archetypes.archetypes.length}</strong><span>${stats.winRate.toFixed(1)}% · ${numberFormatter.format(stats.games)} games</span></div>
        </header>
        <div class="archetype-body">
          <div class="archetype-guidance">
            <p class="archetype-plan">${escapeHtml(archetype.plan)}</p>
            <div class="archetype-priorities"><h4>What the deck needs</h4><ol>${archetype.priorities.map((priority) => `<li>${escapeHtml(priority)}</li>`).join("")}</ol></div>
            <div class="archetype-format-note"><h4>${escapeHtml(format.shortLabel)} read</h4><p>${escapeHtml(archetype.formatNotes[archetypeFormat])}</p></div>
          </div>
          <div class="archetype-signposts"><h4>Cards to recognise</h4><div class="archetype-signpost-grid">${signposts}</div></div>
        </div>`;
      return section;
    }));
  }

  function decisionScenario() {
    return currentSet.draftDecisions?.scenarios?.[decisionIndex] || null;
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
    if (pool.length === 0) return { direction: "No commitments yet", summary: "Your first pick can stay open.", dominant: null };
    if (pool.length < 4 || !ranked[0] || ranked[0].count === ranked[1]?.count) {
      const names = ranked.slice(0, 2).map((group) => group.name.toLowerCase()).join(" and ");
      return { direction: "Still open", summary: `${pool.length} picks so far${names ? `, led by ${names}` : ""}.`, dominant: null };
    }
    const lead = ranked[0];
    const clearLead = lead.count >= (ranked[1]?.count || 0) + 2;
    return {
      direction: clearLead ? `${lead.name} leaning` : `${lead.name} / ${ranked[1]?.name || "open"}`,
      summary: `${lead.count} of ${pool.length} picks are ${lead.name.toLowerCase()}${clearLead ? "; changing course now needs a real payoff" : "; the second colour is still fluid"}.`,
      dominant: clearLead ? lead.id : null,
    };
  }

  function decisionOption(name) {
    const meta = decisionCardMeta(name);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "decision-card";
    button.dataset.cardName = name;
    button.setAttribute("aria-pressed", String(decisionChoice === name));
    button.setAttribute("aria-label", `Choose ${name}, ${meta.rank}`);
    if (decisionChoice) button.disabled = true;
    const visual = meta.card
      ? `<img src="${escapeHtml(meta.card.trainingImage || meta.card.image)}" alt="" width="190" height="266">`
      : `<span class="decision-land" data-color="${meta.color}">${manaSymbol(meta.color, "mana-symbol--land")}<strong>${escapeHtml(name)}</strong><span>Basic land</span></span>`;
    button.innerHTML = `${visual}<span class="decision-card-copy"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(meta.rank)}</span><span>${escapeHtml(meta.detail)}</span></span>`;
    return button;
  }

  function renderDecisionPool(scenario) {
    const grouped = new Map();
    scenario.pool.forEach((name) => grouped.set(name, (grouped.get(name) || 0) + 1));
    elements.poolCount.textContent = `${scenario.pool.length} ${scenario.pool.length === 1 ? "card" : "cards"}`;
    elements.decisionPool.replaceChildren(...[...grouped].map(([name, count]) => {
      const meta = decisionCardMeta(name);
      const item = document.createElement("span");
      item.className = "pool-card";
      item.title = `${name} · ${meta.rank}`;
      item.innerHTML = meta.card
        ? `<img src="${escapeHtml(meta.card.image)}" alt="" width="40" height="56"><span>${escapeHtml(name)}</span>${count > 1 ? `<strong>×${count}</strong>` : ""}`
        : `${manaSymbol(meta.color, "mana-symbol--pool")}<span>${escapeHtml(name)}</span>${count > 1 ? `<strong>×${count}</strong>` : ""}`;
      return item;
    }));
  }

  function renderDecisionReview(scenario) {
    const choice = decisionCardMeta(decisionChoice);
    const replay = decisionCardMeta(scenario.replayPick);
    const leaderCard = decisionDataLeader(scenario);
    const leader = decisionCardMeta(leaderCard?.name || scenario.replayPick);
    const allAgree = decisionChoice === scenario.replayPick && scenario.replayPick === leader.card?.name;
    if (allAgree) elements.decisionVerdict.textContent = "Your pick, the replay, and the current raw ranking all point to the same card.";
    else if (decisionChoice === scenario.replayPick) elements.decisionVerdict.textContent = "You matched the replay pick. Now test whether its pool fit justifies moving away from the raw ranking.";
    else if (decisionChoice === leader.card?.name) elements.decisionVerdict.textContent = "You followed the current raw ranking. The replay took a different line, so context has to explain the gap.";
    else elements.decisionVerdict.textContent = "You found a third line. Compare what it gains against both raw strength and the direction taken in the replay.";

    const candidates = decisionDataCandidates(scenario);
    const runnerUp = candidates[1] || null;
    const rankGap = runnerUp && leader.card ? runnerUp.rank - leader.card.rank : null;
    const rankLead = runnerUp
      ? `${rankGap === 1 ? "one place" : `${rankGap} places`} ahead of ${runnerUp.name} at #${runnerUp.rank}`
      : "the only ranked card remaining";
    const winRateContext = Number.isFinite(leader.card?.stats?.inHandWinRate)
      ? ` Its recorded in-hand win rate is ${leader.card.stats.inHandWinRate.toFixed(1)}%.`
      : "";
    const dataRead = `The exercise takes the highest card left in the current Untapped ranking. ${leader.card?.name || scenario.replayPick} is #${leader.card?.rank || "—"}, ${rankLead}.${winRateContext} Pool fit is not part of this calculation.`;
    const ledgerItem = (label, name, meta, explanation = null) => `<div><dt>${label}</dt><dd><strong class="decision-ledger-name">${escapeHtml(name)}</strong><span class="decision-ledger-meta">${escapeHtml(meta.rank)} · ${escapeHtml(meta.detail)}</span>${explanation ? `<span class="decision-ledger-reason"><strong>${escapeHtml(explanation.label)}</strong><span>${escapeHtml(explanation.text)}</span><small>${escapeHtml(explanation.boundary)}</small></span>` : ""}</dd></div>`;
    elements.decisionLedger.innerHTML = [
      ledgerItem("Your pick", decisionChoice, choice),
      ledgerItem("Replay pick", scenario.replayPick, replay, {
        label: "Why the replay may have taken it",
        text: scenario.replayRead,
        boundary: "Editorial inference · the drafter did not supply a reason",
      }),
      ledgerItem("Data leader", leader.card?.name || scenario.replayPick, leader, {
        label: "Why the data selected it",
        text: dataRead,
        boundary: "Calculated from current rank · pool fit excluded",
      }),
    ].join("");

    if (scenario.replayPick === leader.card?.name) {
      elements.decisionCoaching.textContent = "Replay and data arrive at the same card for different evidential reasons: one is the pick that happened, while the other is a mechanical rank calculation.";
    } else {
      const replayGap = Number.isFinite(replay.card?.rank) && Number.isFinite(leader.card?.rank) ? replay.card.rank - leader.card.rank : null;
      const gapRead = Number.isFinite(replayGap)
        ? `gave up ${replayGap === 1 ? "one ranking place" : `${replayGap} ranking places`}`
        : "moved away from the ranked baseline";
      elements.decisionCoaching.textContent = `The replay ${gapRead} for the contextual case above. That is the tradeoff to interrogate—not proof that either pick is automatically correct.`;
    }
  }

  function chooseDecision(name) {
    if (!decisionScenario() || decisionChoice) return;
    decisionChoice = name;
    const scenario = decisionScenario();
    if (!progress.decisionsReviewed.includes(scenario.id)) progress.decisionsReviewed.push(scenario.id);
    progress.currentDecision = scenario.id;
    elements.decisionCards.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      button.setAttribute("aria-pressed", String(button.dataset.cardName === name));
    });
    elements.changeDecision.hidden = false;
    elements.decisionReview.hidden = false;
    elements.decisionsReviewed.textContent = `${progress.decisionsReviewed.length} reviewed`;
    renderDecisionReview(scenario);
    saveProgress();
    updateUrl();
    elements.decisionReview.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function renderDecision() {
    if (!draftDecisionsAvailable()) return;
    const scenarios = currentSet.draftDecisions.scenarios;
    decisionIndex = Math.max(0, Math.min(decisionIndex, scenarios.length - 1));
    const scenario = scenarios[decisionIndex];
    const read = poolRead(scenario.pool);
    elements.decisionPosition.textContent = `${decisionIndex + 1} / ${scenarios.length}`;
    elements.decisionsReviewed.textContent = `${progress.decisionsReviewed.length} reviewed`;
    elements.decisionCoordinate.textContent = `Pack ${scenario.pack} · Pick ${scenario.pick}`;
    elements.poolDirection.textContent = read.direction;
    elements.poolSummary.textContent = read.summary;
    renderDecisionPool(scenario);
    elements.decisionCards.replaceChildren(...scenario.cards.map(decisionOption));
    elements.changeDecision.hidden = !decisionChoice;
    elements.decisionReview.hidden = !decisionChoice;
    if (decisionChoice) renderDecisionReview(scenario);
  }

  function resetDecisionChoice() {
    decisionChoice = null;
    renderDecision();
  }

  function nextDecision() {
    if (!draftDecisionsAvailable()) return;
    decisionIndex = (decisionIndex + 1) % currentSet.draftDecisions.scenarios.length;
    progress.currentDecision = currentSet.draftDecisions.scenarios[decisionIndex].id;
    decisionChoice = null;
    renderDecision();
    saveProgress();
    updateUrl();
    document.querySelector(".decisions-heading")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function openCardPreview(cardId) {
    const card = cardById.get(cardId);
    if (!card) return;
    previewCardId = card.id;
    const readableImage = card.trainingImage || card.image;
    elements.cardPreviewImage.onerror = () => {
      elements.cardPreviewImage.onerror = null;
      elements.cardPreviewImage.src = card.image;
    };
    elements.cardPreviewImage.src = readableImage;
    elements.cardPreviewImage.alt = `${card.name} card`;
    elements.cardPreviewName.textContent = card.name;
    elements.cardPreviewMeta.textContent = cardIsRated(card)
      ? `#${card.rank} · Tier ${card.tier}`
      : `${card.rarity || "Preview"} · ${currentSet.code} #${card.collectorNumber || "—"}`;
    if (!elements.cardPreview.open) elements.cardPreview.showModal();
  }

  function navigateCardPreview(direction) {
    if (!elements.cardPreview.open || currentView !== "atlas") return;
    const atlasCards = [...elements.cardAtlas.querySelectorAll("[data-card-id]")];
    const index = atlasCards.findIndex((button) => button.dataset.cardId === previewCardId);
    if (index < 0) return;
    const nextCard = atlasCards[index + direction];
    if (nextCard) openCardPreview(nextCard.dataset.cardId);
  }

  function renderAtlas() {
    const counts = new Map(colorGroups.map((group) => [group.id, 0]));
    cards.forEach((card) => counts.set(card.color, (counts.get(card.color) || 0) + 1));
    elements.colorNavigation.replaceChildren(...colorGroups.filter((group) => counts.get(group.id)).map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "color-jump";
      button.dataset.color = group.id;
      button.innerHTML = `${manaSymbol(group.id, "mana-symbol--jump")}<strong>${group.name}</strong><span>${counts.get(group.id)}</span>`;
      button.addEventListener("click", () => document.querySelector(`#color-${group.id}`)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" }));
      return button;
    }));

    elements.cardAtlas.replaceChildren(...colorGroups.map((group) => {
      const groupCards = cards.filter((card) => card.color === group.id).sort((a, b) => {
        if (Number.isFinite(a.rank) && Number.isFinite(b.rank)) return a.rank - b.rank;
        return Number.parseInt(a.collectorNumber, 10) - Number.parseInt(b.collectorNumber, 10);
      });
      if (groupCards.length === 0) return null;
      const section = document.createElement("section");
      section.id = `color-${group.id}`;
      section.className = "color-section";
      section.dataset.color = group.id;
      const range = ratingIsAvailable()
        ? `#${groupCards[0].rank}–#${groupCards.at(-1).rank}`
        : `${groupCards.length} revealed`;
      section.innerHTML = `<header class="color-section-heading">${manaSymbol(group.id, "mana-symbol--section")}<div><h3>${group.name}</h3><p>${group.note} · ${groupCards.length} cards</p></div><span class="color-range">${range}</span></header>`;
      const grid = document.createElement("div");
      grid.className = "atlas-grid";
      grid.replaceChildren(...groupCards.map((card) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "atlas-card";
        button.dataset.cardId = card.id;
        button.dataset.color = card.color;
        button.setAttribute("aria-label", `Enlarge ${card.name}`);
        const leading = card.rank ? `#${card.rank}` : `${currentSet.code} ${card.collectorNumber}`;
        const meta = card.tier ? `Tier ${card.tier}` : `${card.rarity || "Preview"}`;
        button.innerHTML = `<img src="${escapeHtml(card.image)}" alt="" width="80" height="112"><span class="atlas-card-copy"><span class="atlas-card-rank">${escapeHtml(leading)}</span><strong>${escapeHtml(card.name)}</strong><span class="atlas-card-meta"><span class="tier ${card.tier ? "" : "tier-pending"}" style="--tier-color:${tierColors[card.tier] || tierColors["?"]}">${escapeHtml(card.tier || "Preview")}</span><span>${escapeHtml(meta)}</span></span></span>`;
        return button;
      }));
      section.append(grid);
      return section;
    }).filter(Boolean));
  }

  function activateView(view, { focus = false, updateHistory = true } = {}) {
    const canActivate = validViews.has(view)
      && (view !== "decisions" || draftDecisionsAvailable())
      && (view !== "archetypes" || archetypesAvailable());
    currentView = canActivate ? view : "training";
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
    currentSet = nextSet;
    cards = [...currentSet.cards];
    cardById = new Map(cards.map((card) => [card.id, card]));
    if (currentView === "decisions" && !draftDecisionsAvailable()) currentView = "training";
    if (currentView === "archetypes" && !archetypesAvailable()) currentView = "training";
    const requestedFormat = params.get("set") === currentSet.id ? params.get("format") : null;
    if (requestedFormat && currentSet.archetypes?.formats?.[requestedFormat]) archetypeFormat = requestedFormat;
    else if (!currentSet.archetypes?.formats?.[archetypeFormat]) archetypeFormat = "draft";
    progress = readProgress();
    elements.trainerColor.value = progress.color || "all";
    renderGradeOptions();
    const savedCard = cardById.get(progress.currentCard);
    trainerCardId = savedCard?.id || (ratingIsAvailable() ? takeTrainerCard()?.id : cards[0]?.id);
    trainerRevealed = Boolean(progress.trainerRevealed && cardIsRated(cardById.get(trainerCardId)));
    trainerGuess = trainerRevealed ? progress.trainerGuess : null;
    const requestedDecisionId = params.get("set") === currentSet.id ? params.get("decision") : null;
    const savedDecisionId = requestedDecisionId || progress.currentDecision;
    const savedDecisionIndex = currentSet.draftDecisions?.scenarios?.findIndex((scenario) => scenario.id === savedDecisionId) ?? -1;
    decisionIndex = savedDecisionIndex >= 0 ? savedDecisionIndex : 0;
    decisionChoice = null;
    renderSetChrome();
    updateProgress();
    renderTrainer();
    renderArchetypes();
    renderDecision();
    renderAtlas();
    activateView(currentView, { updateHistory: false });
    if (updateHistory) updateUrl();
  }

  elements.setSelect.replaceChildren(...dataset.sets.map((set) => {
    const option = document.createElement("option");
    option.value = set.id;
    option.textContent = `${set.name}${set.stage === "preview" ? " · preview" : ""}`;
    return option;
  }));

  elements.setSelect.addEventListener("change", () => selectSet(elements.setSelect.value));
  elements.shareSet.addEventListener("click", () => {
    updateUrl();
    sharePage({ title: currentSet.productName, text: `Prepare for ${currentSet.name} Limited with me.`, url: location.href });
  });
  elements.gradeOptions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-grade]");
    if (button) answerTrainer(button.dataset.grade);
  });
  elements.revealCard.addEventListener("click", () => answerTrainer(null));
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
  elements.decisionCards.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-name]");
    if (button) chooseDecision(button.dataset.cardName);
  });
  elements.changeDecision.addEventListener("click", resetDecisionChoice);
  elements.nextDecision.addEventListener("click", nextDecision);
  elements.trainerColor.addEventListener("change", () => {
    progress.color = elements.trainerColor.value;
    progress.queue = [];
    trainerCardId = null;
    nextTrainerCard();
  });
  elements.resetProgress.addEventListener("click", () => {
    if (!window.confirm(`Reset your ${currentSet.name} preparation progress on this browser?`)) return;
    progress = emptyProgress();
    elements.trainerColor.value = "all";
    try { localStorage.removeItem(progressKey()); } catch {}
    trainerCardId = null;
    trainerRevealed = false;
    trainerGuess = null;
    nextTrainerCard();
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

  elements.cardPreviewImage.addEventListener("touchstart", (event) => {
    previewTouchStart = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : null;
  }, { passive: true });
  elements.cardPreviewImage.addEventListener("touchend", (event) => {
    const start = previewTouchStart;
    previewTouchStart = null;
    if (!start || event.touches.length || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 2) {
      navigateCardPreview(dx > 0 ? 1 : -1);
    }
  }, { passive: true });
  elements.cardPreviewImage.addEventListener("touchcancel", () => { previewTouchStart = null; });
  elements.cardPreview.addEventListener("close", () => { previewTouchStart = null; });

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

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {}));
  }
})();
