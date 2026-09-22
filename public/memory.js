/* Card recognition practice. Answers come only from the imported card file. */
(() => {
  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const effect = (card) => {
    let text = card.oracleText;
    const names = [card.name, ...card.name.split(" // ")];
    for (const name of names) {
      text = text.split(name).join("This card");
      text = text.split(name.split(",")[0]).join("This card");
      if (card.typeLine.includes("Legendary")) text = text.split(name.split(/,| the /)[0]).join("This card");
    }
    return text || "No rules abilities.";
  };
  function choices(card, cards) {
    const answer = effect(card);
    const score = (other) => (other.color === card.color ? 4 : 0)
      + (other.typeLine.split(" — ")[0] === card.typeLine.split(" — ")[0] ? 3 : 0)
      + (Math.abs(other.manaValue - card.manaValue) <= 1 ? 1 : 0);
    const candidates = shuffle(cards.filter((other) => effect(other) !== answer))
      .sort((a, b) => score(b) - score(a));
    const wrong = [...new Set(candidates.map(effect))].slice(0, 2);
    return shuffle([answer, ...wrong]);
  }
  const sessions = new Map();
  const studySets = { essentials: "Prerelease essentials", common: "Commons & uncommons", interactions: "Interactions", all: "All cards", weak: "Weak cards" };
  const colours = { all: "All colours", W: "White", U: "Blue", B: "Black", R: "Red", G: "Green", M: "Multicolour", C: "Colourless" };
  function metadata(set, card) {
    const labels = [];
    for (const a of set.archetypes?.archetypes || []) {
      if (a.signposts.some(c => (typeof c === "string" ? c : c.name) === card.name)) labels.push(`${a.id} · ${a.name} archetype signpost`);
    }
    const key = set.prep?.keyCards.find(item => item.card === card.name);
    const role = set.prep?.roles.find(role => role.id === key?.role);
    if (role) labels.push(role.label);
    const interaction = set.prep?.interactions.find(item => item.card === card.name);
    if (interaction) labels.push("Play-around");
    return { labels, interaction };
  }
  function filterCards(set, studySet = "all", colour = "all", attempts = {}) {
    const essentials = new Set([
      ...(set.prep?.keyCards || []).map(item => item.card),
      ...(set.prep?.interactions || []).map(item => item.card),
      ...(set.archetypes?.archetypes || []).flatMap(a => a.signposts.map(c => typeof c === "string" ? c : c.name)),
    ]);
    const interactions = new Set((set.prep?.interactions || []).map(item => item.card));
    return set.cards.filter(card => !card.isBasicLand
      && (colour === "all" || (["M", "C"].includes(colour) ? card.color === colour : card.colors?.includes(colour)))
      && (studySet === "all" || (studySet === "essentials" && essentials.has(card.name))
        || (studySet === "interactions" && interactions.has(card.name))
        || (studySet === "common" && ["common", "uncommon"].includes(card.rarity))
        || (studySet === "weak" && attempts[card.id]?.misses >= 2)));
  }
  function mount(root, set, { studySet = "all", colour = "all", changed = () => {} } = {}) {
    root.replaceChildren();
    if (!set) return;
    const cards = set.cards.filter((card) => !card.isBasicLand);
    const byId = new Map(cards.map((card) => [card.id, card]));
    // Content changes invalidate a run rather than applying answers to edited cards.
    let hash = 0;
    for (const char of JSON.stringify(cards.map(c => [c.id, c.oracleText]))) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    studySet = Object.hasOwn(studySets, studySet) ? studySet : "all";
    colour = Object.hasOwn(colours, colour) ? colour : "all";
    let key, pool, state, persistent = true;
    const attemptKey = `card-memory:attempts:v1:${set.id}`;
    let attempts = {};
    try {
      const saved = sessions.get(attemptKey) || JSON.parse(localStorage.getItem(attemptKey));
      for (const card of cards) {
        const value = saved?.[card.id];
        if (Number.isInteger(value?.attempts) && Number.isInteger(value?.misses) && value.misses >= 0 && value.attempts >= value.misses) attempts[card.id] = value;
      }
    } catch { persistent = false; }
    const fresh = () => ({ pool: pool.map(c => c.id), cleared: [], queue: shuffle(pool.map(c => c.id)), current: null, options: [], selected: null, revealed: false });
    const save = () => {
      sessions.set(key, state); sessions.set(attemptKey, attempts);
      try { localStorage.setItem(key, JSON.stringify(state)); localStorage.setItem(attemptKey, JSON.stringify(attempts)); } catch { persistent = false; }
    };
    function load() {
      // Keep the original all-card namespace so existing runs resume unchanged.
      key = `card-memory:v1:${set.id}:${hash}` + (studySet === "all" && colour === "all" ? "" : `:${studySet}:${colour}`);
      pool = filterCards(set, studySet, colour, attempts);
      let saved;
      try { saved = sessions.get(key) || JSON.parse(localStorage.getItem(key)); } catch { persistent = false; }
      state = fresh();
      if (saved && Array.isArray(saved.cleared) && Array.isArray(saved.queue)) {
        // Weak runs retain their starting membership until restarted. New misses join the next run.
        const members = studySet === "weak" && Array.isArray(saved.pool) && saved.pool.length > 0
          ? pool.filter(c => saved.pool.includes(c.id)) : pool;
        const ids = [...saved.cleared, ...saved.queue, ...(saved.current ? [saved.current] : [])];
        if (ids.every(id => members.some(c => c.id === id)) && members.every(c => ids.includes(c.id))
          && new Set(saved.cleared).size === saved.cleared.length && new Set(saved.queue).size === saved.queue.length
          && typeof saved.revealed === "boolean" && Array.isArray(saved.options)
          && (!saved.current || (saved.options.length === 3 && new Set(saved.options).size === 3
            && saved.options.includes(effect(byId.get(saved.current)))
            && (!saved.revealed || saved.selected === null || saved.options.includes(saved.selected))))) {
          state = saved; pool = members;
        }
      }
      if (!state.current && state.queue.length) next(); else { save(); render(); }
    }
    const el = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text) {
        node.textContent = text;
        if (/\{[^}]+\}|\[[+−-]?(?:\d+|X)\]|(?:^|\n)[+−-]?(?:\d+|X):/.test(text)) node.innerHTML = window.CARD_RULES.inline(text);
      }
      if (className) node.className = className;
      return node;
    };
    const button = (text, action, className = "secondary-action") => {
      const node = el("button", text, className); node.type = "button"; node.onclick = action; return node;
    };
    function next(focus = false) {
      state.current = state.queue.shift() || null;
      state.revealed = false; state.selected = null;
      state.options = state.current ? choices(byId.get(state.current), cards) : [];
      save(); render();
      if (focus) { const prompt = root.querySelector(".memory-prompt"); prompt.tabIndex = -1; prompt.focus(); }
    }
    function answer(value) {
      if (state.revealed) return;
      state.selected = value; state.revealed = true;
      const record = attempts[state.current] ||= { attempts: 0, misses: 0 };
      record.attempts++;
      if (value !== effect(byId.get(state.current))) record.misses++;
      if (value === effect(byId.get(state.current))) {
        if (!state.cleared.includes(state.current)) state.cleared.push(state.current);
      } else if (!state.queue.includes(state.current)) state.queue.splice(Math.min(3, state.queue.length), 0, state.current);
      save(); render();
      root.querySelector(".memory-next").focus();
    }
    function render() {
      root.replaceChildren(el("h2", "Complete the card"), el("p", "Match the name and artwork to its rules text. Misses return after a few cards. Choose a study set and clear its cards to finish the run."));
      const controls = el("div", null, "study-controls");
      for (const [id, title, values, selected] of [["memory-study-set", "Study set", studySets, studySet], ["memory-colour", "Card colour", colours, colour]]) {
        const label = el("label", title); label.htmlFor = id;
        const select = el("select"); select.id = id;
        for (const [value, text] of Object.entries(values)) {
          if ((value === "essentials" && !set.prep && !set.archetypes) || (value === "interactions" && !set.prep?.interactions.length)) continue;
          const option = el("option", text); option.value = value; select.append(option);
        }
        select.value = selected;
        select.onchange = () => {
          if (id === "memory-study-set") studySet = select.value; else colour = select.value;
          load(); changed({ studySet, colour }); root.querySelector(`#${id}`).focus();
        };
        controls.append(label, select);
      }
      root.append(controls);
      if (studySet === "weak") root.append(el("p", "Cards missed at least twice across your runs. Each run keeps its starting cards; restart to include new misses."));
      const count = el("p", `${state.cleared.length} / ${pool.length} cards cleared`, "memory-count");
      root.append(count);
      const meter = el("progress"); meter.max = Math.max(1, pool.length); meter.value = state.cleared.length; meter.setAttribute("aria-label", "Cards cleared"); root.append(meter);
      const card = byId.get(state.current);
      if (!card) {
        root.append(el("h3", pool.length ? "Set cleared!" : "No cards in this study set", "memory-prompt"), el("p", pool.length ? "You matched every card in this run. Try another run tomorrow to see what stuck." : "Choose another study set or colour. Weak cards appear after you miss them at least twice."));
      } else {
        const stage = el("div", null, "memory-stage");
        const figure = el("div");
        const frame = el("div", null, `memory-image${state.revealed ? " is-revealed" : ""}`);
        frame.dataset.layout = card.name.includes(" // ") ? "prepared" : card.typeLine.includes("Planeswalker") ? "planeswalker" : "standard";
        frame.dataset.hasStats = String(/Creature|Planeswalker|Vehicle/.test(card.typeLine));
        const img = el("img"); img.src = card.trainingImage || card.image; img.alt = `${card.name} — ${state.revealed ? "complete card" : "name, artwork, type and stats visible; rules hidden"}`;
        img.onerror = () => { img.onerror = null; img.src = card.image; };
        frame.append(img);
        if (!state.revealed) {
          const mask = el("span", "Rules text hidden", "memory-rules-mask");
          frame.append(mask);
          if (frame.dataset.layout === "prepared") frame.append(el("span", null, "memory-spell-mask"));
        }
        figure.append(frame, el("h3", card.name, "memory-prompt"));
        const quiz = el("div", null, "memory-quiz");
        quiz.append(el("h3", "Which rules text belongs to this card?"));
        const answers = el("div", null, "memory-options");
        for (const option of state.options) {
          const choice = button(option, () => answer(option), "memory-option");
          // Imported face-name headings are not rules text. Hide their anonymised
          // labels only at display time so saved answers still match unchanged.
          choice.innerHTML = window.CARD_RULES.render(option.replace(/^This card — /gm, ""));
          choice.disabled = state.revealed;
          if (state.revealed && option === effect(card)) { choice.dataset.result = "correct"; choice.prepend(el("strong", "Correct answer · ")); }
          else if (state.revealed && option === state.selected) { choice.dataset.result = "wrong"; choice.prepend(el("strong", "Your answer · ")); }
          answers.append(choice);
        }
        quiz.append(answers);
        if (state.revealed) {
          const feedback = el("p", state.selected === effect(card) ? "Correct — card cleared." : "This card will return. Read the revealed card before continuing.");
          const context = metadata(set, card);
          if (context.labels.length) quiz.append(el("p", context.labels.join(" · "), "memory-context"));
          if (context.interaction) quiz.append(el("p", `${card.manaCost} · ${context.interaction.note}`, "memory-interaction"));
          const teaching = set.earlyEvidence?.byCard[card.id]?.teaching;
          if (teaching) {
            quiz.append(el("h4", teaching.role), el("p", teaching.why), el("p", `Watch for: ${teaching.watch}`, "memory-interaction"));
          }
          feedback.setAttribute("role", "status"); quiz.append(feedback, button(state.queue.length ? "Next card" : "Finish run", () => next(true), "primary-action memory-next"));
        } else quiz.append(button("Don’t know — show me", () => answer(null)));
        stage.append(figure, quiz); root.append(stage);
      }
      if (!persistent) root.append(el("p", "Storage unavailable. Keep this page open to retain your run.", "memory-note"));
      root.append(button(card ? "Restart this run" : "Play again", () => {
        if (card && !window.confirm("Restart this Card memory run? Other preparation progress stays saved.")) return;
        pool = filterCards(set, studySet, colour, attempts); state = fresh(); next(true);
      }, "text-button"));
    }
    load();
    return { studySet, colour };
  }
  window.CARD_MEMORY = { mount, choices, effect, filterCards, metadata, studySets };
})();
