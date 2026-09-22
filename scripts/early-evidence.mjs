import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Reviewer identity, not article count, determines coverage. This payload never
// supplies ranks, tiers, or lifecycle rating confirmation.
export function compileEarlyEvidence(directory, cards, archetypeIds) {
  const read = file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
  const sources = fs.readdirSync(path.join(directory, 'sources')).filter(f => f.endsWith('.json')).sort().map(f => read(`sources/${f}`));
  const synthesis = read('synthesis.json');
  const pilot = read('evidence.json');
  return validateAndCompile(sources, synthesis, pilot, cards, archetypeIds);
}
export function validateAndCompile(sources, synthesis, pilot, cards, archetypeIds) {
  const known = new Map(cards.map(c => [c.id, c]));
  const cohort = cards.filter(c => !c.isBasicLand && !/^Basic Land/.test(c.typeLine || ''));
  const byCard = Object.fromEntries(cohort.map(c => [c.id, { grades: [], notes: [], observationIds: [], combinationIds: [] }]));
  const sourceMap = new Map();
  const claims = {};
  const observations = {};
  const checkCard = id => assert(byCard[id], `Unknown or excluded card ${id}`);
  for (const source of sources) {
    assert(!sourceMap.has(source.id), `Duplicate source ${source.id}`);
    sourceMap.set(source.id, source);
    assert(source.author && source.dependencyGroup && source.format && source.capturedAt);
    assert.equal(new URL(source.url).protocol, 'https:');
    const seen = new Set();
    for (const row of source.assessments || []) {
      checkCard(row.cardId);
      assert(!seen.has(row.cardId), `Duplicate assessment ${source.id}/${row.cardId}`);
      seen.add(row.cardId);
      assert(Number.isFinite(row.grade) && row.grade >= source.scale.min && row.grade <= source.scale.max, `Invalid grade ${source.id}/${row.cardId}`);
      assert(row.locator?.heading && ['card', 'cycle'].includes(row.scope));
      byCard[row.cardId].grades.push({ ...row, sourceId: source.id });
    }
    for (const row of source.claims || []) {
      assert(!claims[row.id], `Duplicate claim ${row.id}`);
      assert(row.paraphrase && Number.isInteger(row.startSeconds) && row.startSeconds >= 0);
      row.cardIds.forEach(checkCard);
      if (row.kind === 'archetype') assert(archetypeIds.includes(row.subject));
      claims[row.id] = { ...row, sourceId: source.id };
      row.cardIds.forEach(id => byCard[id].notes.push(row.id));
    }
    for (const row of source.observations || []) {
      assert(!observations[row.id], `Duplicate observation ${row.id}`);
      assert.equal(row.sourceId, source.id);
      row.cardIds.forEach((id, i) => { checkCard(id); assert.equal(known.get(id).name, row.cardNames[i]); });
      assert(row.observation && row.interpretation && row.ambiguity && row.gameId);
      observations[row.id] = row;
      row.cardIds.forEach(id => byCard[id].observationIds.push(row.id));
    }
  }
  // Retain the pilot's short explanations, but never count its duplicate scores.
  for (const row of pilot.assessments) {
    const grade = byCard[row.cardId]?.grades.find(g => g.sourceId === row.sourceId);
    assert.equal(grade?.grade, row.grade, `Pilot/full-review mismatch for ${row.cardName}`);
    claims[row.id] = { ...row, cardIds: [row.cardId], kind: 'card' };
    byCard[row.cardId].notes.push(row.id);
  }
  const combinations = {};
  for (const item of synthesis.combinations) {
    assert(!combinations[item.id], `Duplicate combination ${item.id}`);
    assert(item.cardIds.length >= 2 && item.title && item.explanation && item.requirements);
    assert.equal(item.basis, 'editorial-rules-analysis');
    item.cardIds.forEach(id => { checkCard(id); byCard[id].combinationIds.push(item.id); });
    item.archetypeIds.forEach(id => assert(archetypeIds.includes(id)));
    item.sourceClaimIds.forEach(id => assert(claims[id], `Missing claim ${id}`));
    item.gameObservationIds.forEach(id => assert(observations[id], `Missing observation ${id}`));
    combinations[item.id] = item;
  }
  assert.deepEqual([...synthesis.archetypes.map(a => a.id)].sort(), [...archetypeIds].sort());
  for (const item of synthesis.archetypes) {
    const groups = new Set(item.claimIds.map(id => {
      assert.equal(claims[id]?.subject, item.id);
      return sourceMap.get(claims[id].sourceId).dependencyGroup;
    }));
    assert(groups.size >= 2, `Missing second archetype reviewer ${item.id}`);
    item.combinationIds.forEach(id => assert(combinations[id]?.archetypeIds.includes(item.id)));
  }
  synthesis.lessonIds.forEach(id => assert(combinations[id]?.question && combinations[id]?.answer));
  const rows = cohort.map(card => {
    const row = byCard[card.id];
    const reviewerGroups = [...new Set(row.grades.map(g => sourceMap.get(g.sourceId).dependencyGroup))];
    assert(reviewerGroups.length >= 2, `Missing second reviewer for ${card.name}`);
    assert.equal(reviewerGroups.length, row.grades.length, `Duplicate reviewer vote for ${card.name}`);
    return { cardId: card.id, name: card.name, sourceIds: row.grades.map(g => g.sourceId), reviewerGroups, noteIds: row.notes, observationIds: row.observationIds, combinationIds: row.combinationIds };
  });
  const coverage = {
    capturedAt: synthesis.reviewedAt, scope: 'Main-set nonbasic cards; basic lands and Special Guests excluded',
    cards: rows.length, cardsWithTwoReviewers: rows.filter(r => r.reviewerGroups.length >= 2).length,
    grades: rows.reduce((n, r) => n + r.sourceIds.length, 0),
    cardsWithNotes: rows.filter(r => r.noteIds.length).length,
    cardsWithGameplay: rows.filter(r => r.observationIds.length).length,
    archetypes: synthesis.archetypes.length, combinations: synthesis.combinations.length,
    games: new Set(Object.values(observations).map(o => o.gameId)).size,
    rows,
  };
  return { reviewedAt: synthesis.reviewedAt, sources: Object.fromEntries(sources.map(({ assessments, claims, observations, ...s }) => [s.id, s])), byCard, claims, observations, combinations, archetypes: synthesis.archetypes, lessonIds: synthesis.lessonIds, coverage };
}
