import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const evidence = read('../data/research/fra/evidence.json');
const cards = new Map(read('../data/fra_preview.json').cards.map(card => [card.id, card]));
const sources = new Map(evidence.sources.map(source => [source.id, source]));
assert.equal(sources.size, evidence.sources.length, 'Duplicate sources');
assert.equal(evidence.status, 'research-only');
const ids = new Set();
const games = new Set();
function checkRecord(record) {
  assert(!ids.has(record.id), `Duplicate record: ${record.id}`);
  ids.add(record.id);
  assert(sources.has(record.sourceId), `Missing source: ${record.sourceId}`);
}
function checkCard(id, name) {
  assert.equal(cards.get(id)?.name, name, `Card reference mismatch: ${name}`);
}
for (const source of sources.values()) {
  assert.equal(new URL(source.url).protocol, 'https:');
  assert(source.author && source.dependencyGroup && source.format);
}
for (const row of evidence.assessments) {
  checkRecord(row);
  checkCard(row.cardId, row.cardName);
  const source = sources.get(row.sourceId);
  assert.equal(source.kind, 'review');
  assert(Number.isFinite(row.grade));
  assert(row.grade >= source.scale.min && row.grade <= source.scale.max);
  assert(row.cardName.split(' // ').includes(row.locator.heading));
  assert.equal(row.evidenceType, 'reviewer-opinion');
}
for (const row of evidence.observations) {
  checkRecord(row);
  assert.equal(sources.get(row.sourceId).kind, 'gameplay-transcript');
  assert(Number.isInteger(row.startSeconds) && row.startSeconds >= 0);
  assert.equal(row.cardIds.length, row.cardNames.length);
  row.cardIds.forEach((id, i) => checkCard(id, row.cardNames[i]));
  assert(row.observation && row.interpretation && row.ambiguity);
  games.add(row.gameId);
}
assert.equal(games.size, evidence.gameSample.games);
console.log(`Early evidence verified: ${evidence.assessments.length} assessments, ${evidence.observations.length} observations, ${games.size} games.`);
