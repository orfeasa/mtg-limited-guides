#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const dataDir = path.join(root, "data");
const pickOrder = JSON.parse(fs.readFileSync(path.join(dataDir, "hobbit_pick_order.json"), "utf8"));
const pickNames = pickOrder.sections.flatMap((section) => section.names);

const normalize = (value) => value
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const classify = (identity) => {
  if (!Array.isArray(identity) || identity.length === 0) return "C";
  if (identity.length === 1) return identity[0];
  return "M";
};

let pageUrl = "https://api.scryfall.com/cards/search?order=set&q=e%3Ahob%20game%3Aarena&unique=cards";
const scryfallCards = [];

while (pageUrl) {
  const response = await fetch(pageUrl, { headers: { "User-Agent": "mtg-limited-guides/1.0" } });
  if (!response.ok) throw new Error(`Scryfall request failed: ${response.status}`);
  const page = await response.json();
  scryfallCards.push(...page.data);
  pageUrl = page.has_more ? page.next_page : null;
}

const byName = new Map();
for (const card of scryfallCards) {
  const group = classify(card.color_identity);
  byName.set(normalize(card.name), group);
  const frontName = card.name.split(" // ")[0];
  byName.set(normalize(frontName), group);
}

const colors = {};
const missing = [];
for (const name of pickNames) {
  const color = byName.get(normalize(name));
  if (!color) missing.push(name);
  else colors[name] = color;
}

if (missing.length > 0) {
  throw new Error(`Could not match ${missing.length} cards: ${missing.join(", ")}`);
}

const output = {
  source: "Scryfall HOB Arena card data",
  captured: new Date().toISOString().slice(0, 10),
  colors,
};

fs.writeFileSync(path.join(dataDir, "hobbit_colors.json"), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Matched color identity for ${Object.keys(colors).length} cards from ${scryfallCards.length} HOB records.`);
