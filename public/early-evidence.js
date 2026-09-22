/* Source opinions and authored lessons remain separate from statistical ratings. */
(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text = value => window.CARD_RULES.inline(value);
  const colours = { W:'White', U:'Blue', B:'Black', R:'Red', G:'Green' };
  const pair = id => [...id].map(c => colours[c]).join('–');
  const sourceLink = (evidence, record) => {
    const source = evidence.sources[record.sourceId];
    const url = new URL(source.url);
    if (Number.isInteger(record.startSeconds)) url.searchParams.set('t', `${record.startSeconds}s`);
    else if (record.locator?.heading) url.hash = `:~:text=${encodeURIComponent(record.locator.heading)}`;
    return `<a href="${escape(url.href)}" target="_blank" rel="noopener noreferrer">${escape(source.author)}</a>`;
  };
  const claim = (evidence, id) => {
    const row = evidence.claims[id];
    const source = evidence.sources[row.sourceId];
    return `<li>${text(row.paraphrase)} <span class="evidence-attribution">${sourceLink(evidence, row)} · ${source.format === 'Limited-unspecified' ? 'Limited' : escape(source.format)}</span></li>`;
  };
  const cardLinks = (set, ids, pictures = false) => `<div class="evidence-cards ${pictures ? 'evidence-cards--pictured' : ''}">${ids.map(id => {
    const card = set.cards.find(c => c.id === id);
    return `<button type="button" class="evidence-card" data-evidence-card="${escape(id)}">${pictures ? `<img src="${escape(card.image)}" alt="" loading="lazy" width="244" height="340">` : ''}<span>${escape(card.name)}</span></button>`;
  }).join('')}</div>`;
  function combination(set, id, { pictures = false, recall = false } = {}) {
    const evidence = set.earlyEvidence;
    const item = evidence.combinations[id];
    return `${cardLinks(set, item.cardIds, pictures)}<p>${text(item.explanation)}</p><p class="evidence-condition"><strong>Check first:</strong> ${text(item.requirements)}</p>
      ${recall && item.question ? `<p class="evidence-question">${text(item.question)}</p><details class="evidence-answer"><summary>Reveal answer</summary><p>${text(item.answer)}</p></details>` : ''}
      <details class="evidence-sources"><summary>Why this lesson?</summary><p>Our reading of the card rules, informed by these early reviews:</p><ul>${item.sourceClaimIds.map(id => claim(evidence, id)).join('')}</ul>
      ${item.gameObservationIds.length ? `<p>Also narrated in Sealed footage (automatic captions; frames unverified):</p><ul>${item.gameObservationIds.map(id => {
        const row = evidence.observations[id];
        return `<li>${text(row.observation)} ${sourceLink(evidence, row)} · ${escape(row.timeLabel)}</li>`;
      }).join('')}</ul>` : ''}</details>`;
  }
  function prep(set) {
    const evidence = set.earlyEvidence;
    if (!evidence) return '';
    return `<section id="prep-combinations" class="prep-section" aria-labelledby="prep-combinations-title"><h3 id="prep-combinations-title">See how the cards work together</h3><p>Choose a colour pair. Read the cards, then test the timing or deck requirement that makes the combination work.</p><div class="evidence-lessons">${evidence.lessonIds.map(id => {
      const item = evidence.combinations[id];
      return `<details class="evidence-lesson"><summary><span class="evidence-pair">${escape(pair(item.archetypeIds[0]))}</span> ${escape(item.title)}</summary><div class="evidence-lesson-body">${combination(set, id, { pictures: true, recall: true })}</div></details>`;
    }).join('')}</div></section>`;
  }
  function archetype(set, id) {
    const evidence = set.earlyEvidence;
    const row = evidence?.archetypes.find(a => a.id === id);
    if (!row) return '';
    return `<details class="evidence-archetype"><summary>Early advice & combinations</summary><ul>${row.claimIds.map(id => claim(evidence, id)).join('')}</ul>${row.combinationIds.map(id => `<h4>${escape(evidence.combinations[id].title)}</h4>${combination(set, id)}`).join('')}</details>`;
  }
  function card(set, id) {
    const evidence = set.earlyEvidence;
    const row = evidence?.byCard[id];
    if (!row) return '';
    const notes = row.notes.filter(id => evidence.claims[id].kind !== 'archetype');
    return `<h3>Early assessments</h3><p class="evidence-caption">Reviewer opinions · captured ${escape(evidence.reviewedAt)}</p><dl class="evidence-grades">${row.grades.map(g => {
      const source = evidence.sources[g.sourceId];
      return `<div><dt>${sourceLink(evidence, g)}</dt><dd>${g.grade} / ${source.scale.max}${g.scope === 'cycle' ? '<small>Cycle grade</small>' : ''}</dd></div>`;
    }).join('')}</dl><p class="evidence-caption">Original scales; no combined score. Limited reviews, not Sealed results.</p>
    ${notes.length ? `<ul class="evidence-notes">${notes.map(id => claim(evidence, id)).join('')}</ul>` : '<p class="evidence-caption">Grades captured; no card-specific explanation extracted yet.</p>'}
    ${row.combinationIds.map(id => `<details class="evidence-related"><summary>${escape(evidence.combinations[id].title)}</summary>${combination(set, id)}</details>`).join('')}
    ${row.observationIds.length ? `<details class="evidence-related"><summary>From the Sealed games</summary><p class="evidence-caption">Selected automatic-caption sequences; video frames unverified.</p><ul>${row.observationIds.map(id => {
      const o = evidence.observations[id];
      return `<li><p>${text(o.observation)}</p><p>${text(o.interpretation)}</p>${sourceLink(evidence, o)} · ${escape(o.timeLabel)}</li>`;
    }).join('')}</ul></details>` : ''}`;
  }
  window.EARLY_EVIDENCE = { prep, archetype, card };
})();
