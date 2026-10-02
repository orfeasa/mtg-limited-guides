import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('public/data.js', 'utf8'), context);
vm.runInNewContext(fs.readFileSync('public/lifecycle.js', 'utf8'), context);
const manifest = JSON.parse(fs.readFileSync('data/sets.json', 'utf8'));
for (const config of manifest.sets.filter(s => s.observedRatingsFile)) {
  const set = context.window.LIMITED_PREP_DATA.sets.find(s => s.id === config.id);
  const snapshot = JSON.parse(fs.readFileSync(`data/${config.observedRatingsFile}`, 'utf8'));
  const cohort = set.cards.filter(c => !c.isBasicLand);
  assert.equal(snapshot.url, config.observedRatingsUrl);
  assert.equal(snapshot.format, 'Premier Draft');
  assert.equal(snapshot.metric, 'In Hand WR');
  assert.equal(snapshot.rankRange, 'Bronze–Platinum');
  assert(Number.isFinite(Date.parse(snapshot.capturedAt)));
  assert(snapshot.matches > 0);
  assert.equal(Object.keys(snapshot.cards).length, cohort.length);
  const ranks = [];
  for (const card of cohort) {
    const source = snapshot.cards[card.id];
    assert.equal(source.name, card.name);
    assert.equal(source.tier, card.tier);
    assert.equal(source.rank, card.rank);
    assert.equal(source.stats.inHandGames, card.stats.inHandGames);
    const { inHandWins: wins, inHandGames: games, inHandWinRate: rate } = card.stats;
    assert(Number.isInteger(games) && Number.isInteger(wins) && wins >= 0 && wins <= games);
    assert.equal(rate, games ? Math.round(wins / games * 1000) / 10 : null);
    if (card.tier) { assert(/^(S|[ABCD][+-]?|F)$/.test(card.tier)); assert(games > 0); ranks.push(card.rank); }
    else assert.equal(card.rank, null, 'Unrated cards must have no invented rank');
  }
  assert.equal(ranks.length, snapshot.ratedCards);
  assert.deepEqual(ranks.sort((a,b) => a-b), Array.from({length: ranks.length}, (_,i) => i+1));
  const noSource = structuredClone(set); delete noSource.observedRatings;
  assert.equal(context.window.SET_LIFECYCLE.resolve(noSource).tierBrowser, false);
  const future = structuredClone(set); future.observedRatings.capturedAt = '2999-01-01';
  assert.equal(context.window.SET_LIFECYCLE.resolve(future).tierBrowser, false);
  console.log(`Verified ${config.code}: ${ranks.length} source tiers, ${cohort.length-ranks.length} explicit unrated cards, sample arithmetic and provenance gates.`);
}
