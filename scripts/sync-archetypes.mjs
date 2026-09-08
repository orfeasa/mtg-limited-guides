#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const dataDir = path.join(root, "data");
const setId = process.argv[2];

if (!setId) {
  console.error("Usage: node scripts/sync-archetypes.mjs <set-id>");
  process.exit(1);
}

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
const manifest = readJson("sets.json");
const set = manifest.sets.find((entry) => entry.id === setId);

if (!set) throw new Error(`Unknown set ID: ${setId}`);
if (!set.archetypesFile) throw new Error(`Set ${setId} does not define archetypesFile`);

const archetypesPath = path.join(dataDir, set.archetypesFile);
const data = JSON.parse(fs.readFileSync(archetypesPath, "utf8"));
const supported = new Set(data.archetypes.map((archetype) => archetype.id));
const capturedAt = new Date().toISOString();
const round = (value, places = 2) => {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
};

for (const [formatId, format] of Object.entries(data.formats)) {
  const endpoint = new URL("https://www.17lands.com/color_ratings/data");
  endpoint.searchParams.set("expansion", data.set);
  endpoint.searchParams.set("event_type", format.eventType);
  const response = await fetch(endpoint, { headers: { "User-Agent": "mtg-limited-guides/1.0 archetype snapshot" } });
  if (!response.ok) throw new Error(`${format.label} archetype request failed: ${response.status}`);

  const payload = await response.json();
  const pairs = payload
    .filter((entry) => !entry.is_summary && /^[WUBRG]{2}$/.test(String(entry.short_name)) && Number.isFinite(entry.wins) && Number.isFinite(entry.games) && entry.games > 0)
    .map((entry) => ({
      id: entry.short_name,
      name: entry.color_name,
      wins: entry.wins,
      games: entry.games,
      winRate: round((entry.wins / entry.games) * 100),
      supported: supported.has(entry.short_name),
    }))
    .sort((left, right) => right.winRate - left.winRate || right.games - left.games);

  if (pairs.length !== 10) throw new Error(`Expected ten two-colour ${format.label} rows, got ${pairs.length}`);
  const supportedPairs = pairs.filter((pair) => pair.supported);
  if (supportedPairs.length !== supported.size) {
    throw new Error(`${format.label} is missing supported pairs: ${[...supported].filter((id) => !supportedPairs.some((pair) => pair.id === id)).join(", ")}`);
  }

  pairs.forEach((pair, index) => { pair.overallRank = index + 1; });
  [...supportedPairs]
    .sort((left, right) => right.winRate - left.winRate || right.games - left.games)
    .forEach((pair, index) => { pair.supportedRank = index + 1; });

  const twoColourGames = pairs.reduce((sum, pair) => sum + pair.games, 0);
  const supportedGames = supportedPairs.reduce((sum, pair) => sum + pair.games, 0);
  format.observed = {
    status: "available",
    capturedAt,
    twoColourGames,
    supportedGames,
    supportedShare: round((supportedGames / twoColourGames) * 100),
    topPair: pairs[0].id,
    pairs,
  };
  console.log(`${formatId}: ${pairs[0].name} leads ${number(pairs[0].winRate)}%; ${number(format.observed.supportedShare)}% of two-colour games use supported pairs`);
}

fs.writeFileSync(archetypesPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Updated ${set.archetypesFile} at ${capturedAt}`);

function number(value) {
  return Number(value).toFixed(1);
}
