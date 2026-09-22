/* Personal study reminders. No rating or mastery is inferred from these marks. */
(() => {
  'use strict';
  const sessions = new Map(), failed = new Set();
  let mounted;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = set => `limited-prep:review:${set.id}:v1`;
  const questions = set => [...(set.prep?.decisions || []), ...(set.prep?.exercises || [])];
  const title = (set, kind, id) => kind === 'card' ? set.cards.find(c => c.id === id)?.name : kind === 'combination' ? set.earlyEvidence?.combinations[id]?.title : kind === 'question' ? questions(set).find(q => q.id === id)?.title || questions(set).find(q => q.id === id)?.question : null;
  const clean = (set, value) => {
    const seen = new Set();
    return (Array.isArray(value) ? value : []).filter(item => {
      if (!item || !['card','combination','question'].includes(item.kind) || typeof item.id !== 'string' || !title(set,item.kind,item.id)) return false;
      const id = `${item.kind}:${item.id}`;
      if (seen.has(id)) return false;
      seen.add(id); return true;
    }).map(({kind,id}) => ({kind,id}));
  };
  function list(set) {
    const k = key(set);
    if (sessions.has(k)) return sessions.get(k);
    let rows = [];
    try { rows = clean(set, JSON.parse(localStorage.getItem(k) || '[]')); }
    catch { failed.add(k); }
    sessions.set(k, rows); return rows;
  }
  const has = (set,kind,id) => list(set).some(item => item.kind === kind && item.id === id);
  function change(set,kind,id,on) {
    if (!title(set,kind,id)) return;
    let rows = list(set).filter(item => item.kind !== kind || item.id !== id);
    if (on) rows.push({kind,id});
    sessions.set(key(set),rows);
    try { localStorage.setItem(key(set),JSON.stringify(rows)); }
    catch { failed.add(key(set)); }
    refresh();
    window.dispatchEvent(new CustomEvent('prep-review-change',{detail:{setId:set.id}}));
  }
  const button = (set,kind,id) => {
    const saved = has(set,kind,id);
    return `<span class="prep-review-control"><button type="button" class="prep-review-mark" data-review-set="${escape(set.id)}" data-review-kind="${escape(kind)}" data-review-id="${escape(id)}" aria-pressed="${saved}" aria-label="${escape(`${saved ? 'Remove' : 'Save'} ${title(set,kind,id)} ${saved ? 'from' : 'to'} review list`)}">${saved ? 'Saved for review' : 'Review again'}</button><small class="prep-review-storage" role="status" ${failed.has(key(set)) ? '' : 'hidden'}>Storage unavailable. Keep this page open to retain this reminder.</small></span>`;
  };
  function refresh() {
    // Updating attributes in place keeps dialog position and keyboard focus intact.
    document.querySelectorAll('[data-review-kind]').forEach(b => {
      const set = window.LIMITED_PREP_DATA.sets.find(s => s.id === b.dataset.reviewSet);
      if (!set) return;
      const saved = has(set,b.dataset.reviewKind,b.dataset.reviewId);
      b.setAttribute('aria-pressed',String(saved));
      b.setAttribute('aria-label',`${saved ? 'Remove' : 'Save'} ${title(set,b.dataset.reviewKind,b.dataset.reviewId)} ${saved ? 'from' : 'to'} review list`);
      b.textContent = saved ? 'Saved for review' : 'Review again';
      if (b.nextElementSibling?.classList.contains('prep-review-storage')) b.nextElementSibling.hidden = !failed.has(key(set));
    });
    if (mounted) render(mounted.host,mounted.set);
  }
  function render(host,set) {
    const open = host.querySelector('details')?.open || false;
    const expanded = [...host.querySelectorAll('[data-review-combination][open]')].map(d => d.dataset.reviewCombination);
    const rows = list(set);
    host.innerHTML = `<details class="prep-review-list" ${open ? 'open' : ''}><summary>Review before your event · ${rows.length} ${rows.length === 1 ? 'item' : 'items'}</summary>
      <p class="prep-assessment" ${failed.has(key(set)) ? '' : 'hidden'}>Storage unavailable. Keep this page open to retain your review list.</p>
      ${rows.length ? `<ul>${rows.map(item => `<li><div>${item.kind === 'card' ? `<button type="button" class="evidence-card" data-evidence-card="${escape(item.id)}">${escape(title(set,item.kind,item.id))}</button><p>${escape(set.earlyEvidence?.byCard[item.id]?.teaching?.role || 'Revisit this card')}</p>` : item.kind === 'combination' ? `<details data-review-combination="${escape(item.id)}" ${expanded.includes(item.id) ? 'open' : ''}><summary>${escape(title(set,item.kind,item.id))}</summary>${window.EARLY_EVIDENCE.combination(set,item.id,{recall:true})}</details>` : `<button type="button" class="evidence-card" data-review-question="${escape(item.id)}">${escape(title(set,item.kind,item.id))}</button><p>Practise this question again.</p>`}</div><button type="button" class="prep-retry" data-review-done="${escape(item.kind)}" data-review-item="${escape(item.id)}" aria-label="${escape(`Done reviewing ${title(set,item.kind,item.id)}`)}">Done reviewing</button></li>`).join('')}</ul>` : '<p>Save a card or combination with “Review again”. Missed practice questions appear here too.</p>'}</details>`;
    host.onclick = event => {
      const b = event.target.closest('button');
      if (b?.dataset.reviewDone) {
        change(set,b.dataset.reviewDone,b.dataset.reviewItem,false);
        host.querySelector('summary').focus({preventScroll:true});
      }
      if (b?.dataset.reviewQuestion) window.dispatchEvent(new CustomEvent('prep-review-question',{detail:{setId:set.id,id:b.dataset.reviewQuestion}}));
    };
  }
  document.addEventListener('click',event => {
    const b = event.target.closest('[data-review-kind]');
    if (!b) return;
    const set = window.LIMITED_PREP_DATA.sets.find(s => s.id === b.dataset.reviewSet);
    if (set) {
      change(set,b.dataset.reviewKind,b.dataset.reviewId,!has(set,b.dataset.reviewKind,b.dataset.reviewId));
      if (b.isConnected === false) mounted?.host.querySelector("summary")?.focus({preventScroll:true});
    }
  });
  window.PREP_REVIEW = { list, has, clean, button, add:(set,kind,id)=>change(set,kind,id,true), mount:(host,set)=>{mounted=host ? {host,set} : null;if(host)render(host,set);} };
})();
