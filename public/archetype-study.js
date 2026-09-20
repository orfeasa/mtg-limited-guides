/* Self-assessed recall of authored plans; never archetype strength or ratings. */
(() => {
  "use strict";
  const sessions = new Map();
  const colours = { W: "White", U: "Blue", B: "Black", R: "Red", G: "Green" };
  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const fresh = (ids) => ({ queue: shuffle(ids), current: null, recalled: [], revealed: false });
  function advance(state) {
    state.current = state.queue.shift() || null;
    state.revealed = false;
  }
  function mark(state, remembered) {
    if (!state.current || !state.revealed) return;
    if (remembered) state.recalled.push(state.current);
    else state.queue.splice(Math.min(3, state.queue.length), 0, state.current);
    advance(state);
  }
  function valid(state, ids) {
    if (!state || !Array.isArray(state.queue) || !Array.isArray(state.recalled) || typeof state.revealed !== "boolean") return false;
    const all = [...state.queue, ...state.recalled, ...(state.current ? [state.current] : [])];
    return all.length === ids.length && new Set(all).size === ids.length && all.every(id => ids.includes(id));
  }
  function storageKey(set, direction) {
    let hash = 0;
    for (const char of JSON.stringify(set.archetypes.archetypes)) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return `archetype-study:v1:${set.id}:${hash}:${direction}`;
  }
  function mount(root, set, { format = "sealed", openCard = () => {} } = {}) {
    root.replaceChildren();
    if (!set?.archetypes) return;
    const archetypes = set.archetypes.archetypes;
    const ids = archetypes.map(a => a.id);
    let direction = "pair", state, key, persistent = true;
    const preferenceKey = `archetype-study:direction:${set.id}`;
    try { if (localStorage.getItem(preferenceKey) === "theme") direction = "theme"; } catch { persistent = false; }
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
    function save() {
      sessions.set(key, state);
      try { localStorage.setItem(key, JSON.stringify(state)); localStorage.setItem(preferenceKey, direction); } catch { persistent = false; }
    }
    function load() {
      key = storageKey(set, direction);
      let saved = sessions.get(key);
      try { saved ||= JSON.parse(localStorage.getItem(key)); } catch { persistent = false; }
      state = valid(saved, ids) ? saved : fresh(ids);
      if (!state.current && state.queue.length) advance(state);
      save(); render();
    }
    function render(focus = false) {
      root.replaceChildren();
      const controls = el("div", null, "study-controls");
      const label = el("label", "Recall direction"); label.htmlFor = "archetype-direction";
      const select = el("select"); select.id = "archetype-direction";
      for (const [value, text] of [["pair", "Colours → game plan"], ["theme", "Theme → colours"]]) {
        const option = el("option", text); option.value = value; select.append(option);
      }
      select.value = direction;
      select.onchange = () => { direction = select.value; load(); root.querySelector("select").focus(); };
      controls.append(label, select); root.append(controls);
      const status = el("p", `${state.recalled.length} of ${ids.length} plans recalled this run. “Again” returns after up to three other questions.`, "study-status");
      status.setAttribute("role", "status"); root.append(status);
      const a = archetypes.find(a => a.id === state.current);
      if (a) {
        const prompt = el("h3", direction === "pair" ? `${a.id} · ${a.colors.map(c => colours[c]).join(" + ")}` : `${a.name} / ${a.mechanic}`, "study-prompt");
        prompt.tabIndex = -1; root.append(prompt);
        root.append(el("p", direction === "pair" ? "Recall the theme and how this deck wins. Say it to yourself before revealing." : "Recall the two colours before revealing."));
        if (!state.revealed) root.append(button("Reveal archetype", () => { state.revealed = true; save(); render(); root.querySelector(".study-answer").focus(); }, "primary-action"));
        else {
          const answer = el("div", null, "study-answer"); answer.tabIndex = -1;
          answer.append(el("h3", `${a.id} · ${a.name}`), el("p", a.mechanic, "archetype-mechanic"), el("p", a.plan), el("h4", "What the deck needs"));
          const priorities = el("ol"); a.priorities.forEach(p => priorities.append(el("li", p))); answer.append(priorities);
          answer.append(el("h4", `${format === "sealed" ? "Sealed" : "Draft"} read`), el("p", a.formatNotes[format]));
          answer.append(el("h4", "Signposts to recognise"));
          const signposts = el("div", null, "archetype-signpost-grid");
          for (const card of a.signposts) {
            const b = button("", () => openCard(card.cardId), "archetype-signpost"); b.setAttribute("aria-label", `Enlarge ${card.name}`);
            const img = el("img"); img.src = card.trainingImage || card.image; img.onerror = () => { img.onerror = null; img.src = card.image; }; img.alt = ""; img.width = 210; img.height = 294;
            b.append(img, el("strong", card.name)); signposts.append(b);
          }
          answer.append(signposts); root.append(answer);
          const actions = el("div", null, "study-actions");
          for (const [text, remembered] of [["Got it", true], ["Again", false]]) actions.append(button(text, () => { mark(state, remembered); save(); render(true); }, remembered ? "primary-action" : "secondary-action"));
          root.append(actions);
        }
      } else root.append(el("h3", "All plans recalled", "study-prompt"), el("p", "Try the reverse direction, or repeat this run another day."));
      if (!persistent) root.append(el("p", "Storage unavailable. Progress lasts while this page stays open."));
      root.append(button("Restart archetype run", () => {
        if (state.current && !window.confirm("Restart this archetype recall run?")) return;
        state = fresh(ids); advance(state); save(); render(true);
      }, "text-button"));
      if (focus) { const prompt = root.querySelector(".study-prompt"); prompt.tabIndex = -1; prompt.focus(); }
    }
    load();
  }
  window.ARCHETYPE_STUDY = { mount, fresh, advance, mark, valid, storageKey };
})();
