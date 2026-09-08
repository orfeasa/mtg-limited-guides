#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const publicDir = path.join(root, "public");
const source = fs.readFileSync(path.join(publicDir, "data.js"), "utf8");
const context = { window: {} };
vm.runInNewContext(source, context);

const data = context.window.LIMITED_PREP_DATA;
if (!data || data.version !== 1) throw new Error("Missing versioned Limited Prep data");
if (!Array.isArray(data.sets) || data.sets.length < 2) throw new Error("Expected at least two sets");

const ids = new Set();
for (const set of data.sets) {
  if (ids.has(set.id)) throw new Error(`Duplicate set ID: ${set.id}`);
  ids.add(set.id);
  if (!Array.isArray(set.cards) || set.cards.length === 0) throw new Error(`No cards for ${set.id}`);

  const cardIds = new Set();
  for (const card of set.cards) {
    if (cardIds.has(card.id)) throw new Error(`Duplicate card ID in ${set.id}: ${card.id}`);
    cardIds.add(card.id);
    if (!card.name || !card.image || !card.color) throw new Error(`Incomplete card in ${set.id}: ${card.id}`);
    if (!fs.existsSync(path.join(publicDir, card.image))) throw new Error(`Missing card image: ${card.image}`);
    if (card.trainingImage && !fs.existsSync(path.join(publicDir, card.trainingImage))) {
      throw new Error(`Missing readable card image: ${card.trainingImage}`);
    }
  }

  if (set.archetypes) {
    if (set.archetypes.set !== set.code || !Array.isArray(set.archetypes.archetypes) || set.archetypes.archetypes.length === 0) {
      throw new Error(`Invalid archetype data for ${set.id}`);
    }
    if (set.archetypes.status !== "observed" || !set.archetypes.official?.label || !set.archetypes.official?.url) {
      throw new Error(`Archetype evidence is not publication-ready for ${set.id}`);
    }
    const archetypeIds = new Set();
    for (const archetype of set.archetypes.archetypes) {
      if (!/^[WUBRG]{2}$/.test(archetype.id) || archetypeIds.has(archetype.id)) throw new Error(`Invalid archetype ID in ${set.id}: ${archetype.id}`);
      archetypeIds.add(archetype.id);
      if (!Array.isArray(archetype.colors) || archetype.colors.join("") !== archetype.id || new Set(archetype.colors).size !== 2 || !archetype.name || !archetype.mechanic || !archetype.plan) {
        throw new Error(`Incomplete archetype ${archetype.id} in ${set.id}`);
      }
      if (!Array.isArray(archetype.priorities) || archetype.priorities.length !== 3) throw new Error(`Archetype ${archetype.id} needs three priorities`);
      if (!Array.isArray(archetype.signposts) || archetype.signposts.length < 2 || archetype.signposts.some((card) => !cardIds.has(card.cardId))) {
        throw new Error(`Archetype ${archetype.id} has invalid signposts`);
      }
      if (!archetype.formatNotes?.draft || !archetype.formatNotes?.sealed) throw new Error(`Archetype ${archetype.id} needs Draft and Sealed notes`);
    }
    for (const formatId of ["draft", "sealed"]) {
      const format = set.archetypes.formats?.[formatId];
      if (!format?.label || !format?.shortLabel || !format?.eventType || !format?.headline || !format?.source?.label || !format?.source?.url || !format?.source?.scope || !format?.guidance || format.observed?.status !== "available") {
        throw new Error(`Archetype ${formatId} evidence is unavailable for ${set.id}`);
      }
      const observed = format.observed;
      if (!observed.capturedAt || Number.isNaN(Date.parse(observed.capturedAt)) || !Array.isArray(observed.pairs) || observed.pairs.length !== 10) {
        throw new Error(`Expected a dated ten-pair ${formatId} snapshot for ${set.id}`);
      }
      const pairIds = new Set();
      for (const pair of observed.pairs) {
        if (!/^[WUBRG]{2}$/.test(pair.id) || pairIds.has(pair.id) || new Set(pair.id).size !== 2) throw new Error(`Invalid ${formatId} pair in ${set.id}: ${pair.id}`);
        pairIds.add(pair.id);
        if (!pair.name || !Number.isInteger(pair.wins) || !Number.isInteger(pair.games) || pair.wins < 0 || pair.games <= 0 || pair.wins > pair.games || !Number.isFinite(pair.winRate) || !Number.isInteger(pair.overallRank)) {
          throw new Error(`Incomplete ${formatId} observation for ${set.id} ${pair.id}`);
        }
        const calculatedWinRate = Math.round((pair.wins / pair.games) * 10000) / 100;
        if (Math.abs(calculatedWinRate - pair.winRate) > .01 || pair.supported !== archetypeIds.has(pair.id)) {
          throw new Error(`Inconsistent ${formatId} observation for ${set.id} ${pair.id}`);
        }
      }
      const twoColourGames = observed.pairs.reduce((sum, pair) => sum + pair.games, 0);
      const supportedGames = observed.pairs.filter((pair) => pair.supported).reduce((sum, pair) => sum + pair.games, 0);
      const supportedShare = Math.round((supportedGames / twoColourGames) * 10000) / 100;
      if (observed.twoColourGames !== twoColourGames || observed.supportedGames !== supportedGames || Math.abs(observed.supportedShare - supportedShare) > .01 || !pairIds.has(observed.topPair)) {
        throw new Error(`Inconsistent ${formatId} snapshot totals for ${set.id}`);
      }
      for (const id of archetypeIds) {
        const pair = observed.pairs.find((entry) => entry.id === id);
        if (!pair?.supported || !Number.isFinite(pair.winRate) || !Number.isFinite(pair.games) || !Number.isInteger(pair.supportedRank)) {
          throw new Error(`Missing ${formatId} observation for ${set.id} ${id}`);
        }
      }
    }
  }
}

const hobbit = data.sets.find((set) => set.id === "hob");
if (hobbit.cards.length !== 188) throw new Error(`Expected 188 Hobbit cards, got ${hobbit.cards.length}`);
if (hobbit.cards.some((card, index) => card.rank !== index + 1)) throw new Error("Hobbit ranks are not contiguous");
if (hobbit.cards.some((card) => !card.trainingImage || !Number.isFinite(card.stats?.inHandGames))) {
  throw new Error("Hobbit cards must preserve readable images and observed performance evidence");
}
if (hobbit.draftDecisions?.scenarios?.length !== 18) {
  throw new Error(`Expected 18 grounded Hobbit draft decisions, got ${hobbit.draftDecisions?.scenarios?.length || 0}`);
}
if (!hobbit.draftDecisions.cardSource || !hobbit.draftDecisions.interpretationNotes) {
  throw new Error("Hobbit draft decisions must identify the card source and the replay-interpretation boundary");
}
if (hobbit.archetypes?.archetypes?.length !== 5) throw new Error("Expected five official Hobbit archetypes");
const hobbitNames = new Set(hobbit.cards.map((card) => card.name));
const basicLandNames = new Set(["Plains", "Island", "Swamp", "Mountain", "Forest"]);
for (const scenario of hobbit.draftDecisions.scenarios) {
  if (scenario.cards.length < 3) throw new Error(`Draft decision ${scenario.id} is too trivial`);
  if (!scenario.cards.includes(scenario.replayPick)) throw new Error(`Draft decision ${scenario.id} omits its replay pick`);
  if (!scenario.replayRead) throw new Error(`Draft decision ${scenario.id} omits its replay interpretation`);
  const unknown = [...scenario.cards, ...scenario.pool].filter((name) => !hobbitNames.has(name) && !basicLandNames.has(name));
  if (unknown.length > 0) throw new Error(`Draft decision ${scenario.id} has unknown cards: ${unknown.join(", ")}`);
}

const fracture = data.sets.find((set) => set.id === "fra");
if (fracture.rating.status !== "pending") throw new Error("Reality Fracture must remain explicitly unrated during preview season");
if (fracture.cards.some((card) => card.rank || card.tier)) throw new Error("Reality Fracture preview cards must not have invented ratings");
if (fracture.cards.some((card) => !card.trainingImage)) throw new Error("Reality Fracture preview cards need readable study images");
if (fracture.draftDecisions) throw new Error("Reality Fracture must not expose draft decisions before grounded data exists");

console.log(`Verified ${data.sets.length} sets and ${data.sets.reduce((sum, set) => sum + set.cards.length, 0)} cards.`);
