import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileEarlyEvidence, validateAndCompile } from './early-evidence.mjs';
const read = p => JSON.parse(fs.readFileSync(new URL(p, import.meta.url)));
const cards = read('../data/fra_preview.json').cards;
const archetypes = read('../data/fra_archetypes.json').archetypes.map(a => a.id);
const directory = new URL('../data/research/fra/', import.meta.url).pathname;
const result = compileEarlyEvidence(directory, cards, archetypes);
assert.deepEqual(result.coverage, read('../data/research/fra/coverage.json'), 'Coverage report is stale');
assert.equal(result.coverage.cards, 280);
assert.equal(result.coverage.grades, 560);
const sources = fs.readdirSync(`${directory}/sources`).map(f => JSON.parse(fs.readFileSync(`${directory}/sources/${f}`)));
const synthesis = read('../data/research/fra/synthesis.json');
const pilot = read('../data/research/fra/evidence.json');
// Protect against falsely counting another article from the same reviewer,
// silently dropping one rating, or disconnecting a lesson from its evidence.
const duplicateAuthor = structuredClone(sources);
duplicateAuthor.find(s => s.id === 'draftsim').dependencyGroup = 'j2sjosh';
assert.throws(() => validateAndCompile(duplicateAuthor, synthesis, pilot, cards, archetypes), /second reviewer/);
const missing = structuredClone(sources);
missing.find(s => s.id === 'zone-white').assessments.pop();
assert.throws(() => validateAndCompile(missing, synthesis, pilot, cards, archetypes), /second reviewer/);
const broken = structuredClone(synthesis);
broken.combinations[0].sourceClaimIds.push('missing-transcript');
assert.throws(() => validateAndCompile(sources, broken, pilot, cards, archetypes), /Missing claim/);
console.log(`Coverage verified: ${result.coverage.cards} cards / two reviewers, ${result.coverage.archetypes} archetypes, ${result.coverage.combinations} combinations. Missingness and dependency checks passed.`);
