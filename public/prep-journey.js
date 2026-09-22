/* A finite reading path. Completion is self-reported, never inferred mastery. */
(() => {
  'use strict';
  const steps = [
    { id: 'mechanics', title: 'Understand the set', sections: ['prep-mechanics'] },
    { id: 'cards', title: 'Recognise important cards', sections: ['prep-cards'] },
    { id: 'connections', title: 'Find cards that work together', sections: ['prep-combinations', 'prep-colours'] },
    { id: 'interaction', title: 'Prepare for opposing plays', sections: ['prep-play-around'] },
    { id: 'practice', title: 'Check what you remember', sections: ['prep-practice', 'prep-checklist'] },
  ];
  const ids = steps.map(s => s.id);
  const clean = value => ({
    current: ids.includes(value?.current) ? value.current : ids[0],
    started: value?.started === true,
    completed: ids.filter(id => Array.isArray(value?.completed) && value.completed.includes(id)),
    review: ids.filter(id => Array.isArray(value?.review) && value.review.includes(id)),
  });
  const sessions = new Map();
  const failedKeys = new Set();
  function mount(root, set, format) {
    const host = root.querySelector('#prep-journey');
    if (!host) return;
    const key = `limited-prep:journey:${set.id}:v${set.earlyEvidence.teaching.version}:${format}`;
    let state, persistent = !failedKeys.has(key);
    try { state = clean(JSON.parse(localStorage.getItem(key) || 'null')); }
    catch { persistent = false; failedKeys.add(key); state = clean(null); }
    state = sessions.get(key) || state;
    const write = () => {
      sessions.set(key, state);
      try { localStorage.setItem(key, JSON.stringify(state)); }
      catch { persistent = false; failedKeys.add(key); }
    };
    const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const focusLesson = (section = steps.find(s => s.id === state.current).sections[0]) => {
      const h = root.querySelector(`#${section} h3`);
      h.tabIndex = -1; h.focus({ preventScroll: true }); h.scrollIntoView({ block: 'start', behavior: 'auto' });
    };
    const move = (id, focus = true, syncHash = true) => {
      state.current = id; state.started = true; write(); render();
      if (syncHash) history.replaceState(null, '', `${location.pathname}${location.search}#${steps.find(s => s.id === id).sections[0]}`);
      if (focus) focusLesson();
    };
    function render() {
      const index = ids.indexOf(state.current);
      const complete = state.completed.includes(state.current);
      const allDone = state.completed.length === steps.length;
      host.innerHTML = `<div class="journey-heading"><div><h3>Your preparation path</h3><p role="status">${state.completed.length} of ${steps.length} lessons completed${state.review.length ? ` · ${state.review.length} marked for review` : ''}</p></div><button type="button" class="primary-button" data-journey="continue">${!state.started ? 'Start preparing' : allDone ? 'Revisit lessons' : 'Continue preparing'}</button></div>
        <nav aria-label="Preparation lessons"><ol>${steps.map((s,i) => `<li><button type="button" data-step="${s.id}" ${s.id === state.current ? 'aria-current="step"' : ''}><span>${i+1}. ${escape(s.title)}</span><small>${state.review.includes(s.id) ? 'Review again' : state.completed.includes(s.id) ? 'Completed' : s.id === state.current && state.started ? 'In progress' : 'Not completed'}</small></button></li>`).join('')}</ol></nav>
        ${allDone ? '<p>You have completed the five lessons. Revisit anything you want to practise again.</p>' : ''}
        <p class="journey-storage" ${persistent ? 'hidden' : ''}>Storage unavailable. Keep this page open to retain your lesson progress.</p>`;
      for (const step of steps) for (const section of step.sections) {
        const node = root.querySelector(`#${section}`);
        if (node) node.hidden = step.id !== state.current;
      }
      const footer = root.querySelector('#prep-journey-actions');
      footer.innerHTML = `<div class="journey-actions"><button type="button" data-journey="previous" ${index === 0 ? 'disabled' : ''}>Previous lesson</button><button type="button" data-journey="review" aria-pressed="${state.review.includes(state.current)}">${state.review.includes(state.current) ? 'Marked for review' : 'Mark for review'}</button><button type="button" data-journey="complete" class="primary-button">${complete ? 'Mark incomplete' : index === steps.length - 1 ? 'Complete preparation' : 'Complete & continue'}</button></div><p class="journey-note">Mark a lesson complete when you have worked through it. You can revisit it at any time.</p>`;
      if (state.review.length) footer.insertAdjacentHTML('beforeend','<button type="button" class="prep-retry" data-journey="review-next">Review marked lessons</button>');
    }
    host.onclick = event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.dataset.step) move(button.dataset.step);
      if (button.dataset.journey === 'continue') move(state.review.find(id => state.completed.includes(id)) || (state.started ? state.current : ids[0]));
    };
    root.querySelector('#prep-journey-actions').onclick = event => {
      const action = event.target.closest('button')?.dataset.journey;
      if (!action) return;
      const index = ids.indexOf(state.current);
      if (action === 'previous' && index) move(ids[index-1]);
      if (action === 'review-next') move(state.review.find(id => id !== state.current) || state.review[0]);
      if (action === 'review') {
        state.review = state.review.includes(state.current) ? state.review.filter(id => id !== state.current) : [...state.review, state.current];
        write(); render(); root.querySelector('[data-journey="review"]').focus({ preventScroll: true });
      }
      if (action === 'complete') {
        if (state.completed.includes(state.current)) {
          state.completed = state.completed.filter(id => id !== state.current);
          write(); render(); root.querySelector('[data-journey="complete"]').focus({ preventScroll: true });
        } else {
          state.completed.push(state.current);
          move(ids[index+1] || state.current, index < ids.length-1);
          if (index === ids.length-1) { const heading = host.querySelector('h3'); heading.tabIndex = -1; heading.focus({ preventScroll: true }); heading.scrollIntoView({ block: 'start' }); }
        }
      }
    };
    // Retain incoming guide anchors and browser Back/Forward between lessons.
    const applyHash = () => {
      const section = location.hash.slice(1);
      const step = steps.find(s => s.sections.includes(section));
      if (step) { move(step.id, false, false); focusLesson(section); }
    };
    render(); applyHash();
    return { applyHash, show: section => { const step = steps.find(s => s.sections.includes(section)); if (step) move(step.id); } };
  }
  window.PREP_JOURNEY = { mount, clean, steps };
})();
