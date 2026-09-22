import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = file => JSON.parse(fs.readFileSync(new URL(file, import.meta.url)));
const directory = '../data/research/fra/';
const index = read(`${directory}extraction/review-index.json`);
const relationships = read(`${directory}extraction/review-relationships.json`);
const cards = new Map(read('../data/fra_preview.json').cards.map(c => [c.id, c]));
const passages = new Map();
const sections = new Map();
const sources = new Map();
assert.equal(index.status, 'research-only');
assert.equal(relationships.status, 'research-only');
for (const source of index.sources) {
  const saved = read(`${directory}sources/${source.id}.json`);
  assert.equal(source.captureSha256, saved.captureSha256);
  assert.equal(source.dependencyGroup, saved.dependencyGroup);
  assert(!sources.has(source.id));
  sources.set(source.id, source);
  for (const section of source.sections) {
    assert(!sections.has(section.id));
    sections.set(section.id, { ...section, sourceId: source.id });
    assert.equal(section.semanticAssessmentStatus, 'not-extracted');
    assert(section.paragraphs.length > 0);
    for (const id of section.cardIds) {
      assert(cards.has(id));
      const assessment = saved.assessments.find(a => a.cardId === id);
      assert.equal(section.grade, assessment.grade);
      assert.equal(section.heading, assessment.locator.heading);
      assert.equal(section.scope, assessment.scope);
    }
    for (const p of section.paragraphs) {
      assert(!passages.has(p.id));
      passages.set(p.id, { ...p, cardIds: section.cardIds, sourceId: source.id });
      assert(/^[a-f0-9]{64}$/.test(p.textSha256));
      assert(Number.isInteger(p.wordCount) && p.wordCount > 0);
      assert(Number.isInteger(p.locator.paragraph || p.locator.indexedLine));
      assert(!('text' in p), 'Full article text is not retained in the index');
      p.mentionedCardIds.forEach(id => assert(cards.has(id)));
      p.relatedCardIds.forEach(id => {
        assert(p.mentionedCardIds.includes(id));
        assert(!section.cardIds.includes(id));
        assert(!cards.get(id).typeLine.startsWith('Basic Land'));
      });
    }
  }
}
assert.equal(index.cards.length, 280);
assert.equal(new Set(index.cards.map(c => c.cardId)).size, 280);
for (const card of index.cards) {
  assert.equal(card.name, cards.get(card.cardId)?.name);
  const groups = new Set();
  for (const ref of card.passageReferences) {
    const source = sources.get(ref.sourceId);
    const section = sections.get(ref.sectionId);
    assert.equal(source.dependencyGroup, ref.dependencyGroup);
    assert.equal(section.sourceId, source.id);
    assert(section.cardIds.includes(card.cardId));
    assert.equal(section.paragraphs.length, ref.paragraphCount);
    groups.add(ref.dependencyGroup);
  }
  assert.equal(groups.size, 2, `Missing reviewer passages: ${card.name}`);
}
for (const row of relationships.records) {
  const passage = passages.get(row.passageId);
  assert.equal(passage.sourceId, row.sourceId);
  assert(row.paraphrase && row.relationshipType);
  assert.equal(row.gameplayVerified, false);
  assert.equal(row.status, 'passage-read');
  for (const id of row.cardIds) assert(passage.cardIds.includes(id) || passage.mentionedCardIds.includes(id), `Unfounded relation: ${row.id}/${id}`);
}
console.log(`Verified ${index.cards.length} two-reviewer passage joins, ${sections.size} sections, ${passages.size} paragraphs and ${relationships.records.length} reviewed relationships. These are not full substantive assessments.`);
