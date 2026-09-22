/* Browse preparation lessons without tracking reading completion. */
(() => {
  'use strict';
  const steps = [
    { id: 'mechanics', title: 'Understand the set', sections: ['prep-mechanics'] },
    { id: 'cards', title: 'Recognise important cards', sections: ['prep-cards'] },
    { id: 'connections', title: 'Find cards that work together', sections: ['prep-combinations', 'prep-colours'] },
    { id: 'interaction', title: 'Prepare for opposing plays', sections: ['prep-play-around'] },
    { id: 'practice', title: 'Check what you remember', sections: ['prep-practice'] },
  ];
  const ids = steps.map(s => s.id);
  function mount(root) {
    const host = root.querySelector('#prep-journey');
    if (!host) return;
    let current = ids[0];
    const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const focusLesson = (section = steps.find(s => s.id === current).sections[0]) => {
      const h = root.querySelector(`#${section} h3`);
      h.tabIndex = -1; h.focus({ preventScroll: true }); h.scrollIntoView({ block: 'start', behavior: 'auto' });
    };
    const move = (id, focus = true, syncHash = true) => {
      current = id; render();
      if (syncHash) history.replaceState(null, '', `${location.pathname}${location.search}#${steps.find(s => s.id === id).sections[0]}`);
      if (focus) focusLesson();
    };
    function render() {
      const index = ids.indexOf(current);
      host.innerHTML = `<div class="journey-heading"><h3>Explore the set</h3></div>
        <nav aria-label="Preparation lessons"><ol>${steps.map((s,i) => `<li><button type="button" data-step="${s.id}" ${s.id === current ? 'aria-current="step"' : ''}>${i+1}. ${escape(s.title)}</button></li>`).join('')}</ol></nav>`;
      for (const step of steps) for (const section of step.sections) {
        const node = root.querySelector(`#${section}`);
        if (node) node.hidden = step.id !== current;
      }
      const footer = root.querySelector('#prep-journey-actions');
      footer.innerHTML = `<div class="journey-actions"><button type="button" data-journey="previous" ${index === 0 ? 'disabled' : ''}>Previous lesson</button><button type="button" data-journey="next" class="primary-button" ${index === steps.length - 1 ? 'disabled' : ''}>Next lesson</button></div>`;
    }
    host.onclick = event => {
      const id = event.target.closest('button')?.dataset.step;
      if (ids.includes(id)) move(id);
    };
    root.querySelector('#prep-journey-actions').onclick = event => {
      const action = event.target.closest('button')?.dataset.journey;
      const index = ids.indexOf(current);
      if (action === 'previous' && index > 0) move(ids[index-1]);
      if (action === 'next' && index < ids.length-1) move(ids[index+1]);
    };
    // Retain incoming guide anchors and browser Back/Forward between lessons.
    const applyHash = () => {
      const section = location.hash === '#prep-checklist' ? 'prep-practice' : location.hash.slice(1);
      const step = steps.find(s => s.sections.includes(section));
      if (step) { move(step.id, false, false); focusLesson(section); }
    };
    render(); applyHash();
    return { applyHash, show: section => { const step = steps.find(s => s.sections.includes(section)); if (step) move(step.id); } };
  }
  window.PREP_JOURNEY = { mount, steps };
})();
