import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (file) => JSON.parse(fs.readFileSync(`data/${file}`, "utf8"));
const manifest = read("sets.json").sets.find((set) => set.id === "trk");
const scope = read("trk_pool_scope.json");
const snapshot = read(manifest.dataFile);
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("public/data.js", "utf8"), context);
vm.runInNewContext(fs.readFileSync("public/lifecycle.js", "utf8"), context);
const set = context.window.LIMITED_PREP_DATA.sets.find((entry) => entry.id === "trk");
const awaitingRatings = manifest.rating.status === "pending" && !manifest.reviewTraining && !manifest.observedRatingsFile;

assert.equal(set.cardCount, scope.totalImported);
assert.equal(set.browseCardCount, scope.browseCards);
assert.equal(snapshot.partial, false);
assert.equal(new Set(set.cards.map((card) => card.name)).size, scope.totalImported);
for (const [code, expected] of [["TRK", scope.mainSet], ["SDS", scope.bonusSheet]]) {
  const cards = set.cards.filter((card) => card.setCode === code);
  assert.equal(cards.length, expected.uniqueCards);
  assert.deepEqual(Array.from(cards, (card) => Number(card.collectorNumber)).sort((a, b) => a - b),
    Array.from({ length: expected.uniqueCards }, (_, index) => index + 1));
  assert.equal(snapshot.sources.find((source) => source.code === code).count, expected.uniqueCards);
  assert(cards.every((card) => card.isBonusSheet === (code === "SDS")));
}
for (const [rarity, count] of Object.entries(scope.mainSet.rarities)) {
  assert.equal(set.cards.filter((card) => card.setCode === "TRK" && card.rarity === rarity).length, count);
}
assert.equal(set.cards.filter((card) => card.isBasicLand).length, 5);
for (const card of set.cards) {
  if (awaitingRatings) {
    assert.equal(card.rank, null);
    assert.equal(card.tier, null);
    assert(!card.stats, "Pending launch must not fabricate gameplay evidence");
  }
  for (const image of [card.image, card.trainingImage]) {
    const bytes = fs.readFileSync(`public/${image}`);
    assert(bytes.length > 1000 && bytes[0] === 0xff && bytes[1] === 0xd8, `Invalid image: ${image}`);
    assert(bytes.includes(Buffer.from("Source: https://cards.scryfall.io/")), "Preserve image provenance");
  }
}
assert.equal(set.prepDefaultFormat, "sealed");
assert.equal(set.archetypeDefaultFormat, "sealed");
assert(!set.prep.twoHeadedGiant);
assert.equal(set.archetypes.archetypes.length, 10);
assert(set.archetypes.archetypes.every((pair) => pair.signposts.length === 2));
assert(set.prep.keyCards.every((card) => card.better && card.watch));
for (const date of ["2026-10-31", "2026-11-06", "2026-11-10", "2026-11-13", "2027-01-01"]) {
  const state = context.window.SET_LIFECYCLE.resolve(set, date);
  if (awaitingRatings) {
    assert.equal(state.views.join(","), "prep,archetypes,atlas");
    assert.equal(state.defaultView, "atlas");
    assert.equal(state.training, false);
    assert.equal(state.decisions, false);
  }
  assert.equal(state.memory, false);
}
const incomplete = structuredClone(set);
incomplete.lifecycle.fullSetConfirmedAt = null;
assert.equal(context.window.SET_LIFECYCLE.resolve(incomplete).views.join(","), "atlas");

// Exercise the shared popup renderer with authored notes and with no note.
context.window.CARD_RULES = { inline: (value) => value };
vm.runInNewContext(fs.readFileSync("public/early-evidence.js", "utf8"), context);
const selected = set.cards.find((card) => card.name === "Assembly Specialist");
const guidance = context.window.EARLY_EVIDENCE.card(set, selected.id);
assert(guidance.includes("Best with") && guidance.includes("Watch for"));
assert(!guidance.includes("win rate") && !guidance.includes("grade"));
const unselected = set.cards.find((card) => !set.prep.keyCards.some((item) => item.card === card.name));
assert.equal(context.window.EARLY_EVIDENCE.card(set, unselected.id), "");
console.log(`Verified Star Trek: ${set.browseCardCount} nonbasic cards, regular TRK + SDS scope, local images, Sealed defaults and evidence gates.`);
