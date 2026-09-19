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
  function mount(root, set) {
    root.replaceChildren();
    if (!set) return;
    const cards = set.cards.filter((card) => !card.isBasicLand);
    const byId = new Map(cards.map((card) => [card.id, card]));
    // Content changes invalidate a run rather than applying answers to edited cards.
    let hash = 0;
    for (const char of JSON.stringify(cards.map(c => [c.id, c.oracleText]))) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    const key = `card-memory:v1:${set.id}:${hash}`;
    let persistent = true;
    const fresh = () => ({ cleared: [], queue: shuffle(cards.map(c => c.id)), current: null, options: [], selected: null, revealed: false });
    let state = fresh();
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && Array.isArray(saved.cleared) && Array.isArray(saved.queue)) {
        const ids = [...saved.cleared, ...saved.queue, ...(saved.current ? [saved.current] : [])];
        if (ids.every(id => byId.has(id)) && cards.every(c => ids.includes(c.id)) && Array.isArray(saved.options)
          && (!saved.current || saved.options.includes(effect(byId.get(saved.current))))) state = saved;
      }
    } catch { persistent = false; }
    const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch { persistent = false; } };
    const el = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    const button = (text, action, className = "secondary-action") => {
      const node = el("button", text, className); node.type = "button"; node.onclick = action; return node;
    };
    function next() {
      state.current = state.queue.shift() || null;
      state.revealed = false; state.selected = null;
      state.options = state.current ? choices(byId.get(state.current), cards) : [];
      save(); render();
    }
    function answer(value) {
      if (state.revealed) return;
      state.selected = value; state.revealed = true;
      if (value === effect(byId.get(state.current))) {
        if (!state.cleared.includes(state.current)) state.cleared.push(state.current);
      } else if (!state.queue.includes(state.current)) state.queue.splice(Math.min(3, state.queue.length), 0, state.current);
      save(); render();
      root.querySelector(".memory-next").focus();
    }
    function render() {
      root.replaceChildren(el("h2", "Complete the card"), el("p", "Match the name and artwork to its rules text. Misses return after a few cards. Clear every card to finish the run."));
      const count = el("p", `${state.cleared.length} / ${cards.length} cards cleared`, "memory-count");
      root.append(count);
      const meter = el("progress"); meter.max = cards.length; meter.value = state.cleared.length; meter.setAttribute("aria-label", "Cards cleared"); root.append(meter);
      const card = byId.get(state.current);
      if (!card) {
        root.append(el("h3", "Set cleared!"), el("p", "You matched every card in this run. Try another run tomorrow to see what stuck."));
      } else {
        const stage = el("div", null, "memory-stage");
        const figure = el("div");
        const frame = el("div", null, `memory-image${state.revealed ? " is-revealed" : ""}`);
        const img = el("img"); img.src = card.trainingImage || card.image; img.alt = `${card.name} — ${state.revealed ? "complete card" : "name and artwork; rules hidden"}`;
        frame.append(img); figure.append(frame, el("h3", card.name));
        const quiz = el("div", null, "memory-quiz");
        quiz.append(el("h3", "Which rules text belongs to this card?"));
        const answers = el("div", null, "memory-options");
        for (const option of state.options) {
          const choice = button(option, () => answer(option), "memory-option");
          choice.disabled = state.revealed;
          if (state.revealed && option === effect(card)) { choice.dataset.result = "correct"; choice.prepend(el("strong", "Correct answer · ")); }
          else if (state.revealed && option === state.selected) { choice.dataset.result = "wrong"; choice.prepend(el("strong", "Your answer · ")); }
          answers.append(choice);
        }
        quiz.append(answers);
        if (state.revealed) {
          const feedback = el("p", state.selected === effect(card) ? "Correct — card cleared." : "This card will return. Read the revealed card before continuing.");
          feedback.setAttribute("role", "status"); quiz.append(feedback, button(state.queue.length ? "Next card" : "Finish run", next, "primary-action memory-next"));
        } else quiz.append(button("Don’t know — show me", () => answer(null)));
        stage.append(figure, quiz); root.append(stage);
      }
      root.append(el("p", persistent ? "Run saved on this browser. Clearing a run measures recognition, not permanent mastery. Basic lands are omitted." : "Storage unavailable. Keep this page open to retain your run.", "memory-note"));
      root.append(button(card ? "Restart this run" : "Play again", () => {
        if (card && !window.confirm("Restart this Card memory run? Other preparation progress stays saved.")) return;
        state = fresh(); next();
      }, "text-button"));
    }
    if (!state.current && state.queue.length) next(); else render();
  }
  window.CARD_MEMORY = { mount, choices, effect };
})();
