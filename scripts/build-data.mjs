#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { compileEarlyEvidence } from "./early-evidence.mjs";
import { validatePrep } from "./prep-schema.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const dataDir = path.join(root, "data");
const publicDir = path.join(root, "public");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));

const manifest = readJson("sets.json");
const pickOrder = readJson("hobbit_pick_order.json");
const artIds = readJson("hobbit_art_ids.json");
const colorData = readJson("hobbit_colors.json");
const cardStats = readJson("hobbit_card_stats.json");
const basicLandNames = new Set(["Plains", "Island", "Swamp", "Mountain", "Forest"]);

const winRate = (wins, games) => Number.isFinite(wins) && Number.isFinite(games) && games > 0
  ? Math.round((wins / games) * 1000) / 10
  : null;

const bandForTier = (tier) => {
  if (["S", "A+", "A", "A-"].includes(tier)) return "top";
  if (["B+", "B", "B-"].includes(tier)) return "strong";
  if (["C+", "C", "C-"].includes(tier)) return "playable";
  if (["D+", "D", "D-", "F"].includes(tier)) return "filler";
  return "unrated";
};

const hobbitCards = [];
let rank = 1;
for (const section of pickOrder.sections) {
  for (const name of section.names) {
    const stats = cardStats.cards[name];
    if (!stats) throw new Error(`Missing Hobbit card statistics for ${name}`);
    const artId = artIds[name];
    if (!artId) throw new Error(`Missing Hobbit art ID for ${name}`);
    hobbitCards.push({
      id: `hob-${rank}`,
      rank,
      tier: section.tier,
      band: bandForTier(section.tier),
      name,
      color: colorData.colors[name],
      image: `assets/cards/${artId}.jpg`,
      trainingImage: `assets/cards-large/${artId}.jpg`,
      stats: {
        inHandWinRate: winRate(stats.in_hand_wins, stats.in_hand_games),
        inHandGames: stats.in_hand_games,
        openingHandWinRate: winRate(stats.opening_hand_wins, stats.opening_hand_games),
        openingHandGames: stats.opening_hand_games,
        avgLastOffered: stats.avg_last_offered,
      },
    });
    rank += 1;
  }
}

if (hobbitCards.length !== 188 || Object.keys(artIds).length !== 188) {
  throw new Error(`Expected 188 Hobbit cards and art IDs; got ${hobbitCards.length} and ${Object.keys(artIds).length}`);
}

const missingColors = hobbitCards.filter((card) => !card.color);
if (missingColors.length > 0) {
  throw new Error(`Missing color identity for: ${missingColors.map((card) => card.name).join(", ")}`);
}

if (cardStats.total_matches < Number(String(pickOrder.total_matches).replace(/,/g, ""))) {
  throw new Error("Hobbit statistics snapshot is older than the pick-order evidence");
}

const setAdapters = {
  "hobbit-ranking": () => ({ cards: hobbitCards, previewCapturedAt: null }),
  preview: (set) => {
    if (!set.dataFile) throw new Error(`Preview set ${set.id} is missing dataFile`);
    const preview = readJson(set.dataFile);
    if (preview.set !== set.code) {
      throw new Error(`Preview data ${set.dataFile} contains ${preview.set}, expected ${set.code}`);
    }
    return {
      cards: preview.cards.map((card) => ({ ...card, rank: null, tier: null, band: "unrated" })),
      previewCapturedAt: preview.capturedAt,
    };
  },
};

function adaptDraftDecisions(set, cards) {
  if (!set.decisionsFile) return null;
  const source = readJson(set.decisionsFile);
  const knownNames = new Set(cards.map((card) => card.name));
  const ids = new Set();
  const scenarios = source.scenarios.map((scenario) => {
    if (!scenario.id || ids.has(scenario.id)) throw new Error(`Invalid draft decision ID in ${set.id}: ${scenario.id}`);
    ids.add(scenario.id);
    const names = [...scenario.cards, ...scenario.pool, scenario.replay_pick];
    const unknown = names.filter((name) => !knownNames.has(name) && !basicLandNames.has(name));
    if (unknown.length > 0) throw new Error(`Unknown draft decision cards in ${scenario.id}: ${[...new Set(unknown)].join(", ")}`);
    if (!scenario.cards.includes(scenario.replay_pick)) throw new Error(`Replay pick is absent from ${scenario.id}`);
    if (!scenario.replay_read) throw new Error(`Replay interpretation is absent from ${scenario.id}`);
    if (!scenario.lesson) throw new Error(`Draft lesson is absent from ${scenario.id}`);
    return {
      id: scenario.id,
      pack: scenario.pack,
      pick: scenario.pick,
      pool: scenario.pool,
      cards: scenario.cards,
      replayPick: scenario.replay_pick,
      replayRead: scenario.replay_read,
      lesson: scenario.lesson,
    };
  });
  return {
    source: source.source,
    sourceName: source.source_name,
    cardSource: source.card_source,
    capturedAt: source.captured_at,
    format: source.format,
    record: source.record,
    notes: source.notes,
    interpretationNotes: source.interpretation_notes,
    scenarios,
  };
}

function adaptArchetypes(set, cards) {
  if (!set.archetypesFile) return null;
  const source = readJson(set.archetypesFile);
  if (source.set !== set.code) {
    throw new Error(`Archetype data ${set.archetypesFile} contains ${source.set}, expected ${set.code}`);
  }
  const cardsByName = new Map(cards.map((card) => [card.name, card]));
  return {
    ...source,
    archetypes: source.archetypes.map((archetype) => ({
      ...archetype,
      signposts: archetype.signposts.map((name) => {
        const card = cardsByName.get(name);
        if (!card) throw new Error(`Unknown ${set.id} archetype signpost: ${name}`);
        return {
          cardId: card.id,
          name: card.name,
          image: card.image,
          trainingImage: card.trainingImage || card.image,
          rank: card.rank,
          tier: card.tier,
        };
      }),
    })),
  };
}

const sets = manifest.sets.map((set) => {
  const adapt = setAdapters[set.adapter];
  if (!adapt) throw new Error(`No card-data adapter configured for set ${set.id}`);
  const { cards, previewCapturedAt } = adapt(set);
  for (const card of cards) {
    const type = (card.typeLine || "").split("—")[0];
    if ((/\bBasic\b/.test(type) && /\bLand\b/.test(type)) || (!card.typeLine && (basicLandNames.has(card.name) || card.name === "Wastes" || /^Snow-Covered (Plains|Island|Swamp|Mountain|Forest)$/.test(card.name)))) card.isBasicLand = true;
  }
  const prep = set.prepFile ? readJson(set.prepFile) : null;
  validatePrep(prep, { ...set, cards });
  return {
    ...set,
    cardCount: cards.length,
    browseCardCount: cards.filter((card) => !card.isBasicLand).length,
    previewCapturedAt,
    draftDecisions: adaptDraftDecisions(set, cards),
    archetypes: adaptArchetypes(set, cards),
    prep,
    earlyEvidence: set.earlyEvidenceDir ? compileEarlyEvidence(path.join(dataDir, set.earlyEvidenceDir), cards, readJson(set.archetypesFile).archetypes.map(a => a.id)) : null,
    cards,
  };
});

const dataScript = `/* Generated by scripts/build-data.mjs. */\nwindow.LIMITED_PREP_DATA = ${JSON.stringify({ version: manifest.version, sets }, null, 2)};\n`;
fs.writeFileSync(path.join(publicDir, "data.js"), dataScript);

const cacheFiles = [
  "./",
  "./index.html",
  "./styles.css",
  "./data.js",
  "./app.js",
  "./lifecycle.js",
  "./prep.js",
  "./prep-journey.js",
  "./early-evidence.js",
  "./memory.js",
  "./rules-text.js",
  ...fs.readdirSync(path.join(publicDir, "assets/symbols")).filter(file => file.endsWith(".svg")).sort().map(file => `./assets/symbols/${file}`),
  "./archetype-study.js",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-32.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/fonts/Alegreya-SemiBold.ttf",
  "./assets/fonts/Alegreya-Bold.ttf",
  "./assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf",
  "./assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf",
  "./assets/fonts/BarlowCondensed-Black.ttf",
  ...sets.flatMap((set) => set.cards.map((card) => `./${card.image}`)),
];

const cacheDigest = crypto.createHash("sha256");
for (const file of cacheFiles) {
  if (file === "./") continue;
  const relativePath = file.replace(/^\.\//, "");
  cacheDigest.update(file);
  cacheDigest.update(fs.readFileSync(path.join(publicDir, relativePath)));
}
const cacheVersion = cacheDigest.digest("hex").slice(0, 12);

const serviceWorker = `/* Generated static cache manifest. */
const CACHE = "limited-prep-${cacheVersion}";
const ASSETS = ${JSON.stringify(cacheFiles, null, 2)};

const fetchAndCache = async (request) => {
  const response = await fetch(request);
  if (response.ok) {
    try {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    } catch {
      // Offline storage is optional; always deliver a successful network response.
    }
  }
  return response;
};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(
    ASSETS.map((asset) => new Request(asset, { cache: "reload" }))
  )).catch(() => {
    // Allow the updated worker to activate even when offline storage is full.
  }));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const networkFirst = event.request.mode === "navigate"
    || ["document", "script", "style", "manifest"].includes(event.request.destination);

  if (networkFirst) {
    event.respondWith(
      fetchAndCache(event.request).catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("./index.html");
        throw new Error("No offline response for " + event.request.url);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).catch(() => undefined)
      .then((cached) => cached || fetchAndCache(event.request))
  );
});
`;
fs.writeFileSync(path.join(publicDir, "sw.js"), serviceWorker);

console.log(`Generated ${sets.length} sets, ${sets.reduce((sum, set) => sum + set.cards.length, 0)} cards, and ${cacheFiles.length} cached assets.`);
