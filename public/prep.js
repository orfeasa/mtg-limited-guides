/* Authored preparation, independent of rating-training state. */
(() => {
  "use strict";
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const text = value => window.CARD_RULES.inline(String(value));
  const colours = { W: "White", U: "Blue", B: "Black", R: "Red", G: "Green", M: "Multicolour", C: "Colourless" };

  function create(root, actions) {
    let set, guide, cards, format, state, key, journey;
    let persistent = true;
    const sessionStates = new Map();
    const cardButton = (name, illustrated = false) => {
      const card = cards.get(name);
      return `<button type="button" class="prep-card-link${illustrated ? " prep-card-image" : ""}" data-prep-card="${escape(card.id)}" aria-label="Enlarge ${escape(name)}">${illustrated ? `<img src="${escape(card.image)}" alt="" loading="lazy" width="146" height="204">` : ""}<span>${escape(name)}</span></button>`;
    };
    const references = (names) => `<div class="prep-examples">${names.map((name) => cardButton(name)).join("")}</div>`;
    const save = () => {
      sessionStates.set(key, state);
      try { localStorage.setItem(key, JSON.stringify(state)); }
      catch { persistent = false; }
      root.querySelector("#prep-storage").hidden = persistent;
      root.querySelector("#prep-storage").textContent = persistent ? "" : "Storage is unavailable. Your practice progress will last only while this page stays open.";
    };
    function readState() {
      persistent = true;
      let saved;
      try { saved = JSON.parse(localStorage.getItem(key) || "null"); }
      catch { persistent = false; }
      saved = sessionStates.get(key) || saved;
      const answers = {};
      for (const q of [...guide.exercises, ...(guide.decisions || [])]) {
        const answer = saved?.answers?.[q.id];
        if (Number.isInteger(answer) && answer >= 0 && answer < q.options.length) answers[q.id] = answer;
      }
      return { answers, decisionIndex: Number.isInteger(saved?.decisionIndex) && saved.decisionIndex >= 0 && saved.decisionIndex < (guide.decisions?.length || 0) ? saved.decisionIndex : 0 };
    }
    function renderFormat() {
      root.querySelectorAll("[data-prep-format]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.prepFormat === format)));
      if (format === "2hg") return;
      root.querySelector("#prep-format-intro").innerHTML = text(guide.formats[format].intro);
      root.querySelector("#prep-colour-steps").innerHTML = guide.formats[format].steps.map((step) => `<li><h4>${text(step.title)}</h4><p>${text(step.text)}</p></li>`).join("");
      root.querySelector("#prep-archetypes").textContent = `Explore the ${format === "sealed" ? "Sealed" : "Draft"} archetypes`;
    }
    function renderKeyCards() {
      const role = root.querySelector("#prep-role").value;
      const selected = guide.keyCards.filter((item) => role === "all" || item.role === role);
      root.querySelector("#prep-card-count").textContent = `${selected.length} of ${guide.keyCards.length} selected cards`;
      root.querySelector("#prep-key-cards").innerHTML = selected.map((item) => {
        const card = cards.get(item.card);
        const teaching = set.earlyEvidence?.byCard[card.id]?.teaching;
        return `<article class="prep-card-row">${cardButton(item.card, true)}<div><p class="prep-card-meta">${escape(colours[card.color])} · ${escape(card.rarity)} · ${text(card.manaCost || "Land")}</p><h4>${text(teaching?.role || "Why know it")}</h4><p>${text(teaching?.why || item.why)}</p>${teaching ? `<h4>When it gets better</h4><p>${text(teaching.better)}</p>` : ""}<h4>What can go wrong</h4><p>${text(teaching?.watch || item.watch)}</p>${teaching?.disagreement ? `<details class="prep-review-difference"><summary>Where reviewers differ</summary><p>${text(teaching.disagreement)}</p></details>` : ""}</div></article>`;
      }).join("");
    }
    function renderInteractions() {
      const selected = root.querySelector("#prep-colour").value;
      const items = guide.interactions.filter((item) => selected === "all" || cards.get(item.card).colors.includes(selected));
      items.sort((a, b) => Object.keys(colours).indexOf(cards.get(a.card).color) - Object.keys(colours).indexOf(cards.get(b.card).color) || cards.get(a.card).manaValue - cards.get(b.card).manaValue || a.card.localeCompare(b.card));
      root.querySelector("#prep-interaction-count").textContent = `${items.length} interactions`;
      root.querySelector("#prep-interactions").innerHTML = items.map((item) => {
        const card = cards.get(item.card);
        return `<li><div>${cardButton(item.card)}<p class="prep-card-meta">${escape(colours[card.color])} · ${text(card.manaCost)} · ${escape(card.rarity)}</p></div><p>${text(item.note)}</p></li>`;
      }).join("");
    }
    const explanation = q => {
      const chosen = state.answers[q.id];
      if (!Number.isInteger(chosen)) return "";
      const correct = chosen === q.answer;
      return `<p><strong>${correct ? "Correct." : `The answer is: ${text(q.options[q.answer])}.`}</strong> ${text(q.reasoning?.[chosen] || q.explanation)}</p>${!correct && q.reasoning ? `<p>${text(q.explanation)}</p>` : ""}`;
    };
    function renderDecisions(focus = false) {
      const host = root.querySelector("#prep-decisions");
      if (!host || !guide.decisions?.length) return;
      const q = guide.decisions[state.decisionIndex];
      const done = guide.decisions.filter(q => Number.isInteger(state.answers[q.id])).length;
      host.innerHTML = `<div class="prep-decision-heading"><h4>${text(q.title)}</h4><span>${state.decisionIndex + 1} of ${guide.decisions.length} · ${done} answered</span></div>${renderExercise(q)}<div class="prep-decision-nav"><button type="button" data-decision-move="-1" ${state.decisionIndex === 0 ? "disabled" : ""}>Previous situation</button><button type="button" data-decision-move="1" ${state.decisionIndex === guide.decisions.length - 1 ? "disabled" : ""}>Next situation</button></div>`;
      if (focus) { const legend = host.querySelector("legend"); legend.tabIndex = -1; legend.focus({preventScroll:true}); host.scrollIntoView({block:"start",behavior:"instant"}); }
    }
    function renderExercise(q) {
      const chosen = state.answers[q.id];
      const answered = Number.isInteger(chosen);
      return `<fieldset id="prep-question-${q.id}" class="prep-question"><legend>${text(q.question)}</legend>${references(q.cards)}<div class="prep-options">${q.options.map((option, index) => `<button type="button" data-prep-answer="${q.id}" data-answer="${index}" aria-pressed="${chosen === index}" ${answered ? "disabled" : ""}>${text(option)}</button>`).join("")}</div><div class="prep-feedback" role="status">${explanation(q)}</div><button type="button" class="prep-retry" data-prep-retry="${q.id}" ${answered ? "" : "hidden"}>Try again</button></fieldset>`;
    }
    function updateExercise(q) {
      const node = root.querySelector(`#prep-question-${q.id}`);
      const chosen = state.answers[q.id];
      const answered = Number.isInteger(chosen);
      node.querySelectorAll("[data-prep-answer]").forEach((b) => {
        b.disabled = answered;
        b.setAttribute("aria-pressed", String(Number(b.dataset.answer) === chosen));
      });
      const feedback = node.querySelector(".prep-feedback");
      feedback.innerHTML = explanation(q);
      const retry = node.querySelector("[data-prep-retry]");
      retry.hidden = !answered;
      if (answered) retry.focus({ preventScroll: true });
      else node.querySelector("[data-prep-answer]").focus({ preventScroll: true });
    }
    function render(nextSet, nextFormat) {
      set = nextSet;
      if (!set) { root.replaceChildren(); return; }
      format = nextFormat === "2hg" && set.prep.twoHeadedGiant ? "2hg" : nextFormat === "draft" ? "draft" : "sealed";
      const team = format === "2hg" ? set.prep.twoHeadedGiant : null;
      guide = team ? { ...set.prep, exercises: team.exercises, decisions: [], sources: [...set.prep.sources, ...team.sources] } : set.prep;
      cards = new Map(set.cards.map((c) => [c.name, c]));
      // Revision namespaces prevent old answers being misapplied to changed content.
      key = `limited-prep:guide:${set.id}:v${guide.version}:${guide.progressRevision || guide.authoredAt}:${format}`;
      state = readState();
      root.innerHTML = `
        <header class="prep-heading"><div><h2>${team ? "Prepare as a team" : "Prepare for your event"}</h2><p>${team ? "Two decks, one shared game plan." : "Learn the mechanics, recognise the cards that matter, and give your deck a plan."}</p></div><div class="archetype-format-switch prep-format-switch" role="group" aria-label="Preparation format"><button type="button" data-prep-format="sealed">Sealed</button><button type="button" data-prep-format="draft">Draft</button>${set.prep.twoHeadedGiant ? '<button type="button" data-prep-format="2hg">Two-Headed Giant</button>' : ""}</div></header>
        ${team ? `<p class="prep-intro">${text(team.intro)}</p>
        <section class="prep-section" aria-labelledby="prep-team-rules"><h3 id="prep-team-rules">Understand Two-Headed Giant</h3><div class="prep-team-rules">${team.rules.map((rule) => `<article><h4>${text(rule.title)}</h4><p>${text(rule.text)}</p></article>`).join("")}</div></section>
        <section class="prep-section" aria-labelledby="prep-team-cards"><h3 id="prep-team-cards">Cards to discuss with your partner</h3><ul class="prep-interactions">${team.cards.map((item) => `<li><div>${cardButton(item.card)}</div><p>${text(item.note)}</p></li>`).join("")}</ul></section>` : `
        <p id="prep-format-intro" class="prep-intro"></p>
        ${set.earlyEvidence?.teaching ? `<section id="prep-journey" class="prep-journey" aria-label="Your preparation path"></section>` : set.archetypes && window.SET_LIFECYCLE.resolve(set).memory ? `<section class="prep-study-path" aria-labelledby="prep-path-title"><h3 id="prep-path-title">Recommended preparation</h3><ol><li><a href="?set=${encodeURIComponent(set.id)}&view=archetypes&format=${format}&study=1">Archetypes</a></li><li><a href="?set=${encodeURIComponent(set.id)}&view=memory&format=${format}&studySet=essentials">Card memory</a></li><li><a href="#prep-play-around">Learn the interactions</a></li><li><a href="#prep-practice">Quick practice</a></li></ol></section>` : ""}
        <nav class="prep-jumps" aria-label="In this preparation guide" ${set.earlyEvidence?.teaching ? "hidden" : ""}><a href="#prep-mechanics">Mechanics</a><a href="#prep-cards">Cards to know</a>${set.earlyEvidence ? '<a href="#prep-combinations">Combinations</a>' : ""}<a href="#prep-play-around">Interactions</a><a href="#prep-colours">Find your colours</a><a href="#prep-practice">Quick practice</a></nav>
        <section id="prep-mechanics" class="prep-section" aria-labelledby="prep-mechanics-title"><h3 id="prep-mechanics-title">How this set works</h3><p>Open a card name to read the example.</p><div class="prep-mechanics">${guide.mechanics.map((item, index) => `<details ${index === 0 ? "open" : ""}><summary>${text(item.title)}</summary><p>${text(item.text)}</p><p class="prep-tip">${text(item.tip)}</p>${references(item.cards)}</details>`).join("")}</div></section>
        <section id="prep-cards" class="prep-section" aria-labelledby="prep-cards-title"><h3 id="prep-cards-title">Cards to know</h3><p>Start with cards you are more likely to open, then explore threats, answers, and engines. Open any card for its takeaway and full reviews.</p><p class="prep-assessment">Early Limited opinions interpreted for preparation, not measured Sealed results.</p><div class="prep-filter"><label for="prep-role">Look for</label><select id="prep-role"><option value="all">All key cards</option>${guide.roles.map((r) => `<option value="${r.id}" ${r.id === "foundation" ? "selected" : ""}>${escape(r.label)}</option>`).join("")}</select><span id="prep-card-count" role="status"></span></div><div id="prep-key-cards"></div>${set.earlyEvidence?.teaching ? `<p><a href="?set=${encodeURIComponent(set.id)}&view=atlas">Explore guidance for all ${set.earlyEvidence.teaching.cards} cards</a></p>` : ""}</section>
        ${window.EARLY_EVIDENCE.prep(set)}
        <section id="prep-play-around" class="prep-section" aria-labelledby="prep-play-title"><h3 id="prep-play-title">Learn the interactions</h3><p>Learn instant-speed interaction, grouped by colour and printed mana cost. Check additional costs and discounts; open mana is a possibility, not proof of a trick.</p>${window.SET_LIFECYCLE.resolve(set).memory ? `<p><a class="prep-study-link" href="?set=${encodeURIComponent(set.id)}&view=memory&format=${format}&studySet=interactions">Practise these interactions in Card memory</a></p>` : ""}<div class="prep-filter"><label for="prep-colour">Card colour</label><select id="prep-colour"><option value="all">All colours</option>${Object.entries(colours).filter(([c]) => !["M", "C"].includes(c)).map(([c, name]) => `<option value="${c}">${name}</option>`).join("")}</select><span id="prep-interaction-count" role="status"></span></div><ul id="prep-interactions" class="prep-interactions"></ul></section>
        <section id="prep-colours" class="prep-section" aria-labelledby="prep-colours-title"><h3 id="prep-colours-title">Find your colours</h3><ol id="prep-colour-steps" class="prep-steps"></ol><button id="prep-archetypes" type="button" class="primary-button" ${set.archetypes ? "" : "hidden"}></button></section>
        `}
        <section id="prep-practice" class="prep-section" aria-labelledby="prep-practice-title"><h3 id="prep-practice-title">${guide.decisions?.length ? "Practise a situation" : "Quick practice"}</h3>${guide.decisions?.length ? `<p>Use the cards and the situation to choose an answer. These are authored examples based on the reviews and rules.</p><div id="prep-decisions"></div><details id="prep-rules-checks"><summary>${guide.exercises.length} quick rules checks</summary>${guide.exercises.map(renderExercise).join("")}</details>` : `<p>${guide.exercises.length} short rules checks. Read the card if you need to, choose an answer, and try again as often as you like.</p>${guide.exercises.map(renderExercise).join("")}`} </section>
        <p id="prep-storage" class="prep-assessment" ${persistent ? "hidden" : ""}>${persistent ? "" : "Storage is unavailable. Your practice progress will last only while this page stays open."}</p>
        ${!team && set.earlyEvidence?.teaching ? `<div id="prep-journey-actions"></div>` : ""}
        <aside class="prep-sources" aria-label="Guide sources"><h3>Keep learning</h3><p>Guide reviewed ${escape(guide.authoredAt)}.</p><ul>${guide.sources.map((source) => `<li><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.label)}</a></li>`).join("")}</ul></aside>`;
      renderFormat();
      if (!team) { renderKeyCards(); renderInteractions(); }
      renderDecisions();
      journey = !team && set.earlyEvidence?.teaching ? window.PREP_JOURNEY.mount(root, set, format) : null;
    }
    root.addEventListener("click", (event) => {
      const target = event.target.closest("button");
      if (!target || !set) return;
      if (target.dataset.prepCard) actions.openCard(target.dataset.prepCard);
      if (target.dataset.prepFormat && target.dataset.prepFormat !== format) {
        const next = target.dataset.prepFormat;
        render(set, next);
        root.querySelector(`[data-prep-format="${next}"]`).focus({ preventScroll: true });
        actions.formatChanged(next);
      }
      if (target.id === "prep-archetypes") actions.openArchetypes();
      if (target.dataset.decisionMove) {
        state.decisionIndex = Math.max(0, Math.min(guide.decisions.length - 1, state.decisionIndex + Number(target.dataset.decisionMove)));
        save(); renderDecisions(true);
      }
      const questionId = target.dataset.prepAnswer || target.dataset.prepRetry;
      if (questionId) {
        const q = [...guide.exercises, ...(guide.decisions || [])].find((q) => q.id === questionId);
        if (!q) return;
        if (target.dataset.prepRetry) delete state.answers[q.id];
        else state.answers[q.id] = Number(target.dataset.answer);
        updateExercise(q); save();
        const count = root.querySelector(".prep-decision-heading span");
        if (count) count.textContent = `${state.decisionIndex + 1} of ${guide.decisions.length} · ${guide.decisions.filter(q => Number.isInteger(state.answers[q.id])).length} answered`;
      }
    });
    root.addEventListener("change", (event) => {
      if (event.target.id === "prep-role") renderKeyCards();
      if (event.target.id === "prep-colour") renderInteractions();
    });
    window.addEventListener("hashchange", () => { if (root.getClientRects().length) journey?.applyHash(); });
    return { render };
  }
  window.LIMITED_PREP_GUIDE = { create };
})();
