(() => {
  "use strict";

  const dataset = window.LIMITED_PREP_DATA;
  if (!dataset || !Array.isArray(dataset.sets) || dataset.sets.length === 0) return;

  const setById = new Map(dataset.sets.map((set) => [set.id, set]));
  const params = new URLSearchParams(location.search);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numberFormatter = new Intl.NumberFormat("en-GB");
  const validViews = new Set(["training", "drill", "atlas"]);
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
    return `<span class="mana-symbol ${modifier}" aria-hidden="true">${manaSymbols[color]}</span>`;
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
    pickScore: $("#pick-score"),
    resetProgress: $("#reset-progress"),
    trainerInstruction: $("#trainer-instruction"),
    trainerColor: $("#trainer-color"),
    trainerImage: $("#trainer-image"),
    trainerIndex: $("#trainer-index"),
    trainerName: $("#trainer-card-name"),
    trainerType: $("#trainer-card-type"),
    trainerOracle: $("#trainer-oracle"),
    gradeOptions: $("#grade-options"),
    trainerAnswer: $("#trainer-answer"),
    revealCard: $("#reveal-card"),
    drillLocked: $("#drill-locked"),
    drillContent: $("#drill-content"),
    drillCards: $("#drill-cards"),
    drillAnswer: $("#drill-answer"),
    newChallenge: $("#new-challenge"),
    shareChallenge: $("#share-challenge"),
    atlasTitle: $("#atlas-title"),
    atlasCopy: $("#atlas-copy"),
    colorNavigation: $("#color-navigation"),
    cardAtlas: $("#card-atlas"),
    footerSource: $("#footer-source"),
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
  let cards = [];
  let cardById = new Map();
  let trainerCardId = null;
  let trainerRevealed = false;
  let trainerGuess = null;
  let challengeSeed = params.get("challenge") || makeSeed();
  let drillCards = [];
  let drillChoiceId = null;
  let progress = emptyProgress();
  let toastTimer = null;

  function emptyProgress() {
    return {
      seen: [],
      gradeAttempts: 0,
      gradeCorrect: 0,
      pickAttempts: 0,
      pickCorrect: 0,
      currentCard: null,
      color: "all",
      queue: [],
      trainerRevealed: false,
      trainerGuess: null,
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
      next.pickAttempts = Number.isInteger(next.pickAttempts) && next.pickAttempts >= 0 ? next.pickAttempts : 0;
      next.pickCorrect = Number.isInteger(next.pickCorrect) && next.pickCorrect >= 0 && next.pickCorrect <= next.pickAttempts ? next.pickCorrect : 0;
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
    elements.pickScore.textContent = `${progress.pickCorrect}/${progress.pickAttempts}`;
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

  function makeSeed() {
    if (window.crypto?.getRandomValues) {
      return window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    }
    return Math.floor(Math.random() * 0xffffffff).toString(36);
  }

  function seededRandom(seed) {
    let state = 2166136261;
    for (const char of seed) {
      state ^= char.charCodeAt(0);
      state = Math.imul(state, 16777619);
    }
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function updateUrl({ replace = true } = {}) {
    const url = new URL(location.href);
    url.searchParams.set("set", currentSet.id);
    url.searchParams.set("view", currentView);
    if (currentView === "drill" && currentSet.rating.status === "available") {
      url.searchParams.set("challenge", challengeSeed);
    } else {
      url.searchParams.delete("challenge");
    }
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

    const sourceDate = currentSet.stage === "preview"
      ? `Preview index synced ${dateLabel(currentSet.previewCapturedAt)}`
      : `${currentSet.rating.source} pick order · ${currentSet.rating.rankRange} · ${currentSet.rating.archetype}${currentSet.performance ? ` · card evidence ${dateLabel(currentSet.performance.capturedAt)}` : ""}`;
    elements.footerSource.textContent = sourceDate;
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
    return ratedCards().filter((card) => color === "all" || card.color === color);
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
    const evidence = currentSet.performance
      ? `${escapeHtml(currentSet.performance.source)} · ${escapeHtml(dateLabel(currentSet.performance.capturedAt))}`
      : "Observed card evidence";
    return `<dl class="trainer-stat-ledger" aria-label="Card draft statistics"><div><dt>In-hand WR</dt><dd>${winRate}</dd></div><div><dt>Usually gone by</dt><dd>${lastOffered}</dd></div><div><dt>In-hand games</dt><dd>${games}</dd></div></dl><p class="trainer-stat-note">${evidence}. Rankings remain a baseline.</p>${neighbours.length ? `<p class="trainer-neighbours"><strong>Nearby:</strong> ${neighbours.map((entry) => `#${entry.rank} ${escapeHtml(entry.name)}`).join(" · ")}</p>` : ""}`;
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
    elements.trainerIndex.textContent = cardIsRated(card) ? `#${card.rank} hidden` : `${currentSet.code} #${card.collectorNumber || card.rank || "—"}`;
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
    elements.trainerIndex.textContent = `#${card.rank}`;
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

  function buildDrill() {
    drillChoiceId = null;
    const ranked = ratedCards().sort((a, b) => a.rank - b.rank);
    if (ranked.length < 3) {
      drillCards = [];
      return;
    }
    const random = seededRandom(`${currentSet.id}:${challengeSeed}`);
    const centre = Math.floor(random() * ranked.length);
    const start = Math.max(0, Math.min(ranked.length - 38, centre - 19));
    const pool = ranked.slice(start, start + 38);
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
    }
    drillCards = pool.slice(0, 3);
  }

  function renderDrill() {
    const locked = !ratingIsAvailable();
    elements.drillLocked.hidden = !locked;
    elements.drillContent.hidden = locked;
    elements.newChallenge.disabled = locked;
    elements.shareChallenge.disabled = locked;
    if (locked) {
      elements.drillLocked.innerHTML = `<span class="lock-mark" aria-hidden="true"></span><h3>Pick drills are waiting for ratings</h3><p>The ${escapeHtml(currentSet.name)} preview file has ${currentSet.cardCount} cards, but no complete Limited ranking yet. You can study every revealed card without guessing at an answer.</p><button type="button" data-open-atlas>Open revealed cards</button>`;
      return;
    }

    if (drillCards.length === 0) buildDrill();
    const ordered = [...drillCards].sort((a, b) => a.rank - b.rank);
    const best = ordered[0];
    elements.drillCards.replaceChildren(...drillCards.map((card) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "drill-card";
      button.dataset.cardId = card.id;
      button.setAttribute("aria-pressed", String(drillChoiceId === card.id));
      button.dataset.verdict = drillChoiceId ? (card.id === best.id ? "best" : card.id === drillChoiceId ? "picked" : "other") : "";
      button.innerHTML = `<img src="${escapeHtml(card.trainingImage || card.image)}" alt="${escapeHtml(card.name)} card" width="672" height="936" loading="lazy" decoding="async"><span class="drill-card-name">${escapeHtml(card.name)}</span><span class="drill-card-result">${drillChoiceId ? `#${card.rank} · ${escapeHtml(card.tier)}` : "Choose this card"}</span>`;
      const image = button.querySelector("img");
      image.addEventListener("error", () => { image.src = card.image; }, { once: true });
      return button;
    }));

    if (!drillChoiceId) {
      elements.drillAnswer.innerHTML = `<p>Choose a card to reveal the full order.</p><span>Challenge ${escapeHtml(challengeSeed.toUpperCase())}</span>`;
    } else {
      const correct = drillChoiceId === best.id;
      elements.drillAnswer.innerHTML = `<strong>${correct ? "Baseline pick found" : `${escapeHtml(best.name)} leads this group`}</strong><ol>${ordered.map((card) => `<li><span>#${card.rank}</span><b>${escapeHtml(card.name)}</b><small>Tier ${escapeHtml(card.tier)}</small></li>`).join("")}</ol><p>Rankings are a format-level baseline; an actual draft can change the choice.</p>`;
    }
  }

  function chooseDrillCard(cardId) {
    if (drillChoiceId || !ratingIsAvailable()) return;
    const best = [...drillCards].sort((a, b) => a.rank - b.rank)[0];
    drillChoiceId = cardId;
    progress.pickAttempts += 1;
    if (cardId === best.id) progress.pickCorrect += 1;
    updateProgress();
    renderDrill();
    elements.liveRegion.textContent = cardId === best.id ? "Correct baseline pick." : `${best.name} is the strongest baseline pick.`;
  }

  function openCardPreview(cardId) {
    const card = cardById.get(cardId);
    if (!card) return;
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
    elements.cardPreview.showModal();
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
        button.innerHTML = `<img src="${escapeHtml(card.image)}" alt="" width="64" height="90"><span class="atlas-card-copy"><span class="atlas-card-rank">${escapeHtml(leading)}</span><strong>${escapeHtml(card.name)}</strong><span class="atlas-card-meta"><span class="tier ${card.tier ? "" : "tier-pending"}" style="--tier-color:${tierColors[card.tier] || tierColors["?"]}">${escapeHtml(card.tier || "Preview")}</span><span>${escapeHtml(meta)}</span></span></span>`;
        return button;
      }));
      section.append(grid);
      return section;
    }).filter(Boolean));
  }

  function activateView(view, { focus = false, updateHistory = true } = {}) {
    currentView = validViews.has(view) ? view : "training";
    views.forEach((panel, id) => { panel.hidden = id !== currentView; });
    viewTabs.forEach((tab) => {
      const selected = tab.dataset.view === currentView;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    document.body.dataset.view = currentView;
    if (updateHistory) updateUrl();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function selectSet(setId, { updateHistory = true } = {}) {
    const nextSet = setById.get(setId);
    if (!nextSet) return;
    currentSet = nextSet;
    cards = [...currentSet.cards];
    cardById = new Map(cards.map((card) => [card.id, card]));
    challengeSeed = makeSeed();
    drillCards = [];
    drillChoiceId = null;
    progress = readProgress();
    elements.trainerColor.value = progress.color || "all";
    renderGradeOptions();
    const savedCard = cardById.get(progress.currentCard);
    trainerCardId = savedCard?.id || (ratingIsAvailable() ? takeTrainerCard()?.id : cards[0]?.id);
    trainerRevealed = Boolean(progress.trainerRevealed && cardIsRated(cardById.get(trainerCardId)));
    trainerGuess = trainerRevealed ? progress.trainerGuess : null;
    renderSetChrome();
    updateProgress();
    renderTrainer();
    buildDrill();
    renderDrill();
    renderAtlas();
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

  elements.drillCards.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-id]");
    if (button) chooseDrillCard(button.dataset.cardId);
  });
  elements.newChallenge.addEventListener("click", () => {
    challengeSeed = makeSeed();
    buildDrill();
    renderDrill();
    updateUrl();
  });
  elements.shareChallenge.addEventListener("click", () => {
    currentView = "drill";
    updateUrl();
    sharePage({ title: `${currentSet.name} pick challenge`, text: "Which card would you take?", url: location.href });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("#next-card")) nextTrainerCard();
    if (event.target.closest("[data-open-atlas]")) activateView("atlas");
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

  viewTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateView(tab.dataset.view));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? viewTabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + viewTabs.length) % viewTabs.length;
      activateView(viewTabs[nextIndex].dataset.view, { focus: true });
    });
  });

  selectSet(currentSet.id, { updateHistory: false });
  if (params.get("challenge") && ratingIsAvailable()) {
    challengeSeed = params.get("challenge");
    buildDrill();
    renderDrill();
  }
  activateView(currentView, { updateHistory: false });
  updateUrl();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {}));
  }
})();
