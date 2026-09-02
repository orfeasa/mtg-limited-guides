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
}

const hobbit = data.sets.find((set) => set.id === "hob");
if (hobbit.cards.length !== 188) throw new Error(`Expected 188 Hobbit cards, got ${hobbit.cards.length}`);
if (hobbit.cards.some((card, index) => card.rank !== index + 1)) throw new Error("Hobbit ranks are not contiguous");
if (hobbit.cards.some((card) => !card.trainingImage || !Number.isFinite(card.stats?.inHandGames))) {
  throw new Error("Hobbit cards must preserve readable images and observed performance evidence");
}

const fracture = data.sets.find((set) => set.id === "fra");
if (fracture.rating.status !== "pending") throw new Error("Reality Fracture must remain explicitly unrated during preview season");
if (fracture.cards.some((card) => card.rank || card.tier)) throw new Error("Reality Fracture preview cards must not have invented ratings");
if (fracture.cards.some((card) => !card.trainingImage)) throw new Error("Reality Fracture preview cards need readable study images");

console.log(`Verified ${data.sets.length} sets and ${data.sets.reduce((sum, set) => sum + set.cards.length, 0)} cards.`);
