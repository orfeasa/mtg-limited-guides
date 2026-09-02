(() => {
  "use strict";

  const dataset = window.LIMITED_PREP_DATA;
  if (!dataset || !Array.isArray(dataset.sets) || dataset.sets.length === 0) return;

  const setById = new Map(dataset.sets.map((set) => [set.id, set]));
  const params = new URLSearchParams(location.search);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const resultLimit = 10;
  const validViews = new Set(["study", "drill", "compare", "atlas"]);
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
  const colorGroups = [
    { id: "W", name: "White", note: "Plains" },
    { id: "U", name: "Blue", note: "Islands" },
    { id: "B", name: "Black", note: "Swamps" },
    { id: "R", name: "Red", note: "Mountains" },
    { id: "G", name: "Green", note: "Forests" },
    { id: "M", name: "Multicolour", note: "Gold cards" },
    { id: "C", name: "Colourless", note: "Artifacts and lands" },
  ];

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    productName: $("#product-name"),
    productSubtitle: $("#product-subtitle"),
    setSelect: $("#set-select"),
    shareSet: $("#share-set"),
    datasetCount: $("#dataset-count"),
    datasetUnit: $("#dataset-unit"),
    datasetDate: $("#dataset-date"),
    guideTitle: $("#guide-title"),
    guideBody: $("#guide-body"),
    guideFacts: $("#guide-facts"),
    ratingState: $("#rating-state"),
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
    compareLocked: $("#compare-locked"),
    compareContent: $("#compare-content"),
    searchInput: $("#card-search"),
    clearSearch: $("#clear-search"),
    searchResults: $("#search-results"),
    noResults: $("#no-results"),
    resultLabel: $("#result-label"),
    resultCount: $("#result-count"),
    pack: $("#pack"),
    packTitle: $("#pack-title"),
    packCount: $("#pack-count"),
    clearPack: $("#clear-pack"),
    packEmpty: $("#pack-empty"),
    packContent: $("#pack-content"),
    bestPick: $("#best-pick"),
    packList: $("#pack-list"),
    packDock: $("#pack-dock"),
    packDockCard: $("#pack-dock-card"),
    packDockCount: $("#pack-dock-count"),
    atlasTitle: $("#atlas-title"),
    atlasCopy: $("#atlas-copy"),
    colorNavigation: $("#color-navigation"),
    cardAtlas: $("#card-atlas"),
    footerSource: $("#footer-source"),
    sourceLink: $("#source-link"),
    toast: $("#toast"),
    liveRegion: $("#live-region"),
  };

  const viewTabs = [...document.querySelectorAll("[data-view]")];
  const views = new Map([...document.querySelectorAll(".view-panel")].map((panel) => [panel.id.replace("-view", ""), panel]));
  for (const tab of viewTabs) {
    tab.id = `${tab.dataset.view}-tab`;
    views.get(tab.dataset.view)?.setAttribute("aria-labelledby", tab.id);
  }

  let currentSet = setById.get(params.get("set")) || dataset.sets[0];
  let currentView = validViews.has(params.get("view")) ? params.get("view") : "study";
  let cards = [];
  let normalizedCards = [];
  let cardById = new Map();
  let selectedIds = new Set();
  let currentResults = [];
  let activeResultIndex = -1;
  let trainerCardId = null;
  let trainerRevealed = false;
  let trainerGuess = null;
  let challengeSeed = params.get("challenge") || makeSeed();
  let drillCards = [];
  let drillChoiceId = null;
  let progress = emptyProgress();
  let toastTimer = null;

  function emptyProgress() {
    return { seen: [], gradeAttempts: 0, gradeCorrect: 0, pickAttempts: 0, pickCorrect: 0, currentCard: null, color: "all" };
  }

  function progressKey() {
    return `limited-prep:v1:${currentSet.id}`;
  }

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey()));
      return { ...emptyProgress(), ...(saved && typeof saved === "object" ? saved : {}) };
    } catch {
      return emptyProgress();
    }
  }

  function saveProgress() {
    progress.currentCard = trainerCardId;
    progress.color = elements.trainerColor.value;
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

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
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
    elements.guideTitle.textContent = currentSet.guideTitle;
    elements.guideBody.textContent = currentSet.guideBody;
    elements.guideFacts.replaceChildren(...currentSet.guideFacts.map((fact) => {
      const item = document.createElement("li");
      item.textContent = fact;
      return item;
    }));

    if (ratingIsAvailable()) {
      const matches = currentSet.rating.matches ? `${new Intl.NumberFormat("en-GB").format(currentSet.rating.matches)} matches` : "rated snapshot";
      elements.ratingState.innerHTML = `<span class="state-seal">READY</span><div><strong>${escapeHtml(currentSet.rating.label)}</strong><p>${escapeHtml(currentSet.rating.source)} · ${escapeHtml(matches)} · ${escapeHtml(dateLabel(currentSet.rating.capturedAt))}</p></div>`;
    } else {
      elements.ratingState.innerHTML = `<span class="state-seal">PREVIEW</span><div><strong>${currentSet.cardCount} cards indexed so far</strong><p>Card study is live. Grade and pick drills stay locked until an attributable rating snapshot is added.</p></div>`;
    }

    elements.atlasTitle.textContent = currentSet.stage === "preview" ? "The revealed card file" : "The complete card atlas";
    elements.atlasCopy.textContent = currentSet.stage === "preview"
      ? `${currentSet.cardCount} revealed cards, grouped by colour. Open any card to study its full rules text.`
      : `All ${currentSet.cardCount} ranked cards, grouped by colour and ready to open in the trainer.`;

    const sourceDate = currentSet.stage === "preview"
      ? `Preview index synced ${dateLabel(currentSet.previewCapturedAt)}`
      : `${currentSet.rating.source} snapshot · ${currentSet.rating.rankRange} · ${currentSet.rating.archetype}`;
    elements.footerSource.textContent = sourceDate;
    elements.sourceLink.href = currentSet.cardSource.url;
    elements.sourceLink.textContent = currentSet.stage === "preview" ? "View preview source" : "View ranking source";
  }

  function renderTrainer() {
    const card = cardById.get(trainerCardId) || cards[0];
    if (!card) return;
    trainerCardId = card.id;
    markSeen(card.id);

    elements.trainerImage.src = card.image;
    elements.trainerImage.alt = `${card.name} card`;
    elements.trainerName.textContent = card.name;
    elements.trainerType.textContent = card.typeLine || "";
    elements.trainerOracle.textContent = card.oracleText || "";
    elements.trainerIndex.textContent = card.rank ? `#${card.rank} hidden` : `${currentSet.code} #${card.collectorNumber}`;
    elements.trainerAnswer.hidden = true;
    elements.trainerAnswer.replaceChildren();
    elements.gradeOptions.querySelectorAll("button").forEach((button) => {
      button.disabled = false;
      button.dataset.result = "";
    });

    if (ratingIsAvailable()) {
      elements.trainerInstruction.textContent = "Choose the grade band before revealing the exact tier and rank.";
      elements.gradeOptions.hidden = false;
      elements.revealCard.hidden = false;
      elements.revealCard.disabled = false;
      elements.trainerType.hidden = true;
      elements.trainerOracle.hidden = true;
      if (trainerRevealed) revealTrainer({ record: false });
    } else {
      elements.trainerInstruction.textContent = "Read the revealed card, then move through the live preview file.";
      elements.gradeOptions.hidden = true;
      elements.revealCard.hidden = true;
      elements.trainerType.hidden = false;
      elements.trainerOracle.hidden = false;
      elements.trainerAnswer.hidden = false;
      elements.trainerAnswer.innerHTML = `<strong>${escapeHtml(card.rarity)} · ${escapeHtml(currentSet.code)} #${escapeHtml(card.collectorNumber)}</strong><span>Unrated preview</span>`;
    }
  }

  function revealTrainer({ record = false } = {}) {
    const card = cardById.get(trainerCardId);
    if (!card || !ratingIsAvailable()) return;
    trainerRevealed = true;
    elements.trainerIndex.textContent = `#${card.rank}`;
    elements.trainerAnswer.hidden = false;
    elements.trainerAnswer.innerHTML = `<strong>#${card.rank} · Tier ${escapeHtml(card.tier)}</strong><span>${escapeHtml(bandLabels[card.band])}</span>`;
    elements.revealCard.disabled = true;
    elements.gradeOptions.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
      if (button.dataset.grade === card.band) button.dataset.result = "correct";
      if (trainerGuess === button.dataset.grade && trainerGuess !== card.band) button.dataset.result = "wrong";
    });
    if (record) updateProgress();
  }

  function chooseGrade(guess) {
    if (trainerRevealed || !ratingIsAvailable()) return;
    const card = cardById.get(trainerCardId);
    if (!card) return;
    trainerGuess = guess;
    progress.gradeAttempts += 1;
    if (guess === card.band) progress.gradeCorrect += 1;
    revealTrainer({ record: true });
    elements.liveRegion.textContent = guess === card.band
      ? `Correct. ${card.name} is tier ${card.tier}, rank ${card.rank}.`
      : `${card.name} is tier ${card.tier}, rank ${card.rank}.`;
  }

  function nextTrainerCard() {
    const color = elements.trainerColor.value;
    const pool = cards.filter((card) => color === "all" || card.color === color);
    if (pool.length === 0) return;
    const withoutCurrent = pool.filter((card) => card.id !== trainerCardId);
    const next = (withoutCurrent.length ? withoutCurrent : pool)[Math.floor(Math.random() * (withoutCurrent.length || pool.length))];
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
      button.innerHTML = `<img src="${escapeHtml(card.image)}" alt="${escapeHtml(card.name)} card" width="244" height="342"><span class="drill-card-name">${escapeHtml(card.name)}</span><span class="drill-card-result">${drillChoiceId ? `#${card.rank} · ${escapeHtml(card.tier)}` : "Choose this card"}</span>`;
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

  function fuzzyScore(name, query) {
    if (!query) return 0;
    if (name === query) return 2000;
    if (name.startsWith(query)) return 1600 - name.length;
    const directIndex = name.indexOf(query);
    if (directIndex !== -1) return 1300 - directIndex * 5 - name.length;
    const tokens = query.split(" ").filter(Boolean);
    if (tokens.length > 1 && tokens.every((token) => name.includes(token))) {
      return 1000 - tokens.reduce((sum, token) => sum + name.indexOf(token), 0);
    }
    let cursor = 0;
    let gaps = 0;
    for (const char of query.replaceAll(" ", "")) {
      const found = name.indexOf(char, cursor);
      if (found === -1) return -1;
      gaps += found - cursor;
      cursor = found + 1;
    }
    return 500 - gaps * 4 - name.length;
  }

  function resultCards(query) {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return normalizedCards.slice(0, resultLimit);
    return normalizedCards
      .map((card) => ({ card, score: fuzzyScore(card.normalizedName, normalizedQuery) }))
      .filter(({ score }) => score >= 0)
      .sort((a, b) => b.score - a.score || a.card.rank - b.card.rank)
      .slice(0, resultLimit)
      .map(({ card }) => card);
  }

  function selectedCards() {
    return [...selectedIds].map((id) => cardById.get(id)).filter(Boolean).sort((a, b) => a.rank - b.rank);
  }

  function renderResults() {
    if (!ratingIsAvailable()) return;
    const query = elements.searchInput.value;
    currentResults = resultCards(query);
    activeResultIndex = Math.min(activeResultIndex, currentResults.length - 1);
    if (activeResultIndex < -1) activeResultIndex = -1;
    const leader = selectedCards()[0];
    elements.searchResults.replaceChildren(...currentResults.map((card, index) => {
      const selected = selectedIds.has(card.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "result-row";
      button.id = `result-${card.id}`;
      button.dataset.cardId = card.id;
      button.dataset.active = String(index === activeResultIndex);
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(selected));
      const relation = leader
        ? card.rank === leader.rank ? "Current leader" : card.rank < leader.rank ? "Stronger than current leader" : `${card.rank - leader.rank} ranks below leader`
        : "Add to comparison";
      button.innerHTML = `<img class="card-thumb" src="${escapeHtml(card.image)}" alt="" width="55" height="78"><span class="rank-block"><strong>#${card.rank}</strong><span>pick</span></span><span class="result-name"><strong>${escapeHtml(card.name)}</strong><span>${escapeHtml(relation)}</span></span><span class="result-metadata"><span class="tier" style="--tier-color:${tierColors[card.tier] || tierColors["?"]}">${escapeHtml(card.tier)}</span><span class="result-action">${selected ? "Added" : "Add"}</span></span>`;
      return button;
    }));
    const hasResults = currentResults.length > 0;
    elements.searchResults.hidden = !hasResults;
    elements.noResults.hidden = hasResults;
    elements.clearSearch.hidden = query.length === 0;
    elements.resultLabel.textContent = query ? `Matches for “${query}”` : "Top of the order";
    elements.resultCount.textContent = query ? `${currentResults.length} results` : `Showing ${currentResults.length} of ${cards.length}`;
    elements.searchInput.setAttribute("aria-expanded", String(hasResults));
    updateActiveDescendant();
  }

  function renderPack({ animate = true } = {}) {
    const selected = selectedCards();
    const hasCards = selected.length > 0;
    elements.packCount.textContent = `${selected.length} card${selected.length === 1 ? "" : "s"} added`;
    elements.clearPack.disabled = !hasCards;
    elements.packEmpty.hidden = hasCards;
    elements.packContent.hidden = !hasCards;
    elements.packDock.hidden = !hasCards || currentView !== "compare";
    if (!hasCards) {
      elements.bestPick.replaceChildren();
      elements.packList.replaceChildren();
      return;
    }
    const leader = selected[0];
    elements.bestPick.innerHTML = `<img class="best-image" src="${escapeHtml(leader.image)}" alt="" width="110" height="155"><div class="best-copy"><span class="best-label">Baseline leader</span><h3>${escapeHtml(leader.name)}</h3><div class="best-meta"><span class="best-rank">#${leader.rank}</span><span class="tier" style="--tier-color:${tierColors[leader.tier] || tierColors["?"]}">${escapeHtml(leader.tier)}</span></div><button class="best-remove" type="button" data-remove-id="${escapeHtml(leader.id)}">Remove</button></div>`;
    elements.packList.replaceChildren(...selected.map((card) => {
      const item = document.createElement("li");
      item.className = "pack-item";
      item.innerHTML = `<img src="${escapeHtml(card.image)}" alt="" width="43" height="61"><span class="pack-item-rank">#${card.rank}</span><span class="pack-item-copy"><strong>${escapeHtml(card.name)}</strong><span>${card.rank === leader.rank ? "Leader" : `+${card.rank - leader.rank} ranks`} · Tier ${escapeHtml(card.tier)}</span></span><button class="remove-card" type="button" data-remove-id="${escapeHtml(card.id)}" aria-label="Remove ${escapeHtml(card.name)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>`;
      return item;
    }));
    elements.packDockCard.textContent = `#${leader.rank} ${leader.name}`;
    elements.packDockCount.textContent = `${selected.length} compared`;
    if (animate && !prefersReducedMotion) {
      elements.bestPick.animate([
        { clipPath: "inset(0 100% 0 0)", filter: "saturate(.55)" },
        { clipPath: "inset(0 0 0 0)", filter: "saturate(1)" },
      ], { duration: 440, easing: "cubic-bezier(.16, 1, .3, 1)" });
    }
  }

  function toggleComparedCard(cardId) {
    if (!cardById.has(cardId)) return;
    if (selectedIds.has(cardId)) selectedIds.delete(cardId);
    else selectedIds.add(cardId);
    renderPack();
    renderResults();
  }

  function renderCompare() {
    const locked = !ratingIsAvailable();
    elements.compareLocked.hidden = !locked;
    elements.compareContent.hidden = locked;
    if (locked) {
      elements.compareLocked.innerHTML = `<span class="lock-mark" aria-hidden="true"></span><h3>Comparison opens with the first rating snapshot</h3><p>The card file is real; the pick order is not ready. Study the revealed cards now and return when the full set can be evaluated honestly.</p><button type="button" data-open-atlas>Open revealed cards</button>`;
      elements.packDock.hidden = true;
      return;
    }
    elements.searchInput.placeholder = `Search ${cards.length} cards…`;
    renderResults();
    renderPack({ animate: false });
  }

  function renderAtlas() {
    const counts = new Map(colorGroups.map((group) => [group.id, 0]));
    cards.forEach((card) => counts.set(card.color, (counts.get(card.color) || 0) + 1));
    elements.colorNavigation.replaceChildren(...colorGroups.filter((group) => counts.get(group.id)).map((group) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "color-jump";
      button.dataset.color = group.id;
      button.innerHTML = `<span class="color-mark" aria-hidden="true"></span><strong>${group.name}</strong><span>${counts.get(group.id)}</span>`;
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
      section.innerHTML = `<header class="color-section-heading"><span class="color-emblem" aria-hidden="true"></span><div><h3>${group.name}</h3><p>${group.note} · ${groupCards.length} cards</p></div><span class="color-range">${range}</span></header>`;
      const grid = document.createElement("div");
      grid.className = "atlas-grid";
      grid.replaceChildren(...groupCards.map((card) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "atlas-card";
        button.dataset.cardId = card.id;
        button.dataset.color = card.color;
        button.setAttribute("aria-label", `Study ${card.name}`);
        const leading = card.rank ? `#${card.rank}` : `${currentSet.code} ${card.collectorNumber}`;
        const meta = card.tier ? `Tier ${card.tier}` : `${card.rarity || "Preview"}`;
        button.innerHTML = `<img src="${escapeHtml(card.image)}" alt="" width="64" height="90"><span class="atlas-card-copy"><span class="atlas-card-rank">${escapeHtml(leading)}</span><strong>${escapeHtml(card.name)}</strong><span class="atlas-card-meta"><span class="tier ${card.tier ? "" : "tier-pending"}" style="--tier-color:${tierColors[card.tier] || tierColors["?"]}">${escapeHtml(card.tier || "Preview")}</span><span>${escapeHtml(meta)}</span></span></span>`;
        return button;
      }));
      section.append(grid);
      return section;
    }).filter(Boolean));
  }

  function updateActiveDescendant() {
    const active = currentResults[activeResultIndex];
    if (active) elements.searchInput.setAttribute("aria-activedescendant", `result-${active.id}`);
    else elements.searchInput.removeAttribute("aria-activedescendant");
    elements.searchResults.querySelectorAll(".result-row").forEach((row, index) => { row.dataset.active = String(index === activeResultIndex); });
  }

  function moveActive(delta) {
    if (currentResults.length === 0) return;
    activeResultIndex = (activeResultIndex + delta + currentResults.length) % currentResults.length;
    updateActiveDescendant();
    document.querySelector(`#result-${currentResults[activeResultIndex].id}`)?.scrollIntoView({ block: "nearest" });
  }

  function activateView(view, { focus = false, updateHistory = true } = {}) {
    currentView = validViews.has(view) ? view : "study";
    views.forEach((panel, id) => { panel.hidden = id !== currentView; });
    viewTabs.forEach((tab) => {
      const selected = tab.dataset.view === currentView;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    document.body.dataset.view = currentView;
    elements.packDock.hidden = currentView !== "compare" || selectedIds.size === 0;
    if (updateHistory) updateUrl();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function selectSet(setId, { updateHistory = true } = {}) {
    const nextSet = setById.get(setId);
    if (!nextSet) return;
    currentSet = nextSet;
    cards = [...currentSet.cards];
    cardById = new Map(cards.map((card) => [card.id, card]));
    normalizedCards = cards
      .filter((card) => Number.isFinite(card.rank))
      .map((card) => ({ ...card, normalizedName: normalize(card.name) }))
      .sort((a, b) => a.rank - b.rank);
    selectedIds = new Set();
    currentResults = [];
    activeResultIndex = -1;
    challengeSeed = makeSeed();
    drillCards = [];
    drillChoiceId = null;
    progress = readProgress();
    elements.trainerColor.value = progress.color || "all";
    const savedCard = cardById.get(progress.currentCard);
    trainerCardId = savedCard?.id || cards[0]?.id;
    trainerRevealed = false;
    trainerGuess = null;
    elements.searchInput.value = "";
    renderSetChrome();
    updateProgress();
    renderTrainer();
    buildDrill();
    renderDrill();
    renderCompare();
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
    if (button) chooseGrade(button.dataset.grade);
  });
  elements.revealCard.addEventListener("click", () => revealTrainer({ record: true }));
  elements.trainerColor.addEventListener("change", () => {
    progress.color = elements.trainerColor.value;
    nextTrainerCard();
  });
  elements.resetProgress.addEventListener("click", () => {
    if (!window.confirm(`Reset your ${currentSet.name} preparation progress on this browser?`)) return;
    progress = emptyProgress();
    elements.trainerColor.value = "all";
    try { localStorage.removeItem(progressKey()); } catch {}
    updateProgress();
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
    trainerCardId = button.dataset.cardId;
    trainerRevealed = false;
    trainerGuess = null;
    renderTrainer();
    activateView("study");
    requestAnimationFrame(() => $("#trainer-card")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" }));
  });

  elements.searchInput.addEventListener("input", () => { activeResultIndex = -1; renderResults(); });
  elements.searchInput.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); moveActive(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveActive(-1); }
    else if (event.key === "Enter" && activeResultIndex >= 0) { event.preventDefault(); toggleComparedCard(currentResults[activeResultIndex].id); }
    else if (event.key === "Escape" && elements.searchInput.value) {
      event.preventDefault();
      elements.searchInput.value = "";
      activeResultIndex = -1;
      renderResults();
    }
  });
  elements.clearSearch.addEventListener("click", () => {
    elements.searchInput.value = "";
    activeResultIndex = -1;
    renderResults();
    elements.searchInput.focus();
  });
  elements.searchResults.addEventListener("click", (event) => {
    const button = event.target.closest("[data-card-id]");
    if (button) toggleComparedCard(button.dataset.cardId);
  });
  elements.clearPack.addEventListener("click", () => {
    selectedIds.clear();
    renderPack();
    renderResults();
    elements.liveRegion.textContent = "Comparison cleared.";
  });
  elements.pack.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (button) toggleComparedCard(button.dataset.removeId);
  });
  elements.packDock.addEventListener("click", () => {
    activateView("compare");
    requestAnimationFrame(() => {
      elements.pack.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      elements.packTitle.focus({ preventScroll: true });
    });
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

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
    if (event.key === "/" && !typing && ratingIsAvailable()) {
      event.preventDefault();
      activateView("compare");
      elements.searchInput.focus();
      elements.searchInput.select();
    }
  });

  if ("IntersectionObserver" in window) {
    const packObserver = new IntersectionObserver(([entry]) => {
      const suppressed = currentView === "compare" && entry.isIntersecting;
      elements.packDock.classList.toggle("is-suppressed", suppressed);
      elements.packDock.tabIndex = suppressed ? -1 : 0;
      elements.packDock.setAttribute("aria-hidden", String(suppressed));
    }, { threshold: 0.08 });
    packObserver.observe(elements.pack);
  }

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
