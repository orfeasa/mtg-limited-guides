#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const setCode = (process.argv[2] || "fra").toLowerCase();
const outputPath = path.join(root, "data", `${setCode}_preview.json`);
const imageDirectory = path.join(root, "public", "assets", "cards", setCode);
const trainingImageDirectory = path.join(root, "public", "assets", "cards-large", setCode);
const apiUrl = `https://api.scryfall.com/cards/search?order=spoiled&q=set%3A${encodeURIComponent(setCode)}&unique=cards`;
const userAgent = "mtg-limited-guides/1.0 (https://github.com/orfeasa/mtg-limited-guides)";

const stableSourceUrl = (value) => {
  const url = new URL(value);
  url.search = "";
  return url.toString();
};

const writeFileIfChanged = async (filePath, buffer) => {
  try {
    const existing = await fs.readFile(filePath);
    if (existing.equals(buffer)) return false;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  await fs.writeFile(filePath, buffer);
  return true;
};

const withSourceComment = (buffer, source, purpose) => {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return buffer;
  const description = `impeccable:prompt\0Source: ${source}. Downloaded from Scryfall as a ${purpose} for the ${setCode.toUpperCase()} study interface.`;
  const comment = Buffer.from(description, "utf8");
  const header = Buffer.alloc(4);
  header[0] = 0xff;
  header[1] = 0xfe;
  header.writeUInt16BE(comment.length + 2, 2);
  return Buffer.concat([buffer.subarray(0, 2), header, comment, buffer.subarray(2)]);
};

const cardRecords = [];
let nextPage = apiUrl;
while (nextPage) {
  const response = await fetch(nextPage, { headers: { "User-Agent": userAgent, Accept: "application/json" } });
  if (!response.ok) throw new Error(`Scryfall request failed: ${response.status}`);

  const payload = await response.json();
  if (!Array.isArray(payload.data)) throw new Error("Scryfall returned no card data");
  cardRecords.push(...payload.data);
  if (payload.has_more && !payload.next_page) throw new Error("Scryfall omitted the next preview page URL");
  nextPage = payload.has_more ? payload.next_page : null;
}

await fs.mkdir(imageDirectory, { recursive: true });
await fs.mkdir(trainingImageDirectory, { recursive: true });

const classify = (identity) => {
  if (!Array.isArray(identity) || identity.length === 0) return "C";
  if (identity.length === 1) return identity[0];
  return "M";
};

const cards = [];
let changedAssets = 0;
for (const card of cardRecords) {
  const imageUris = card.image_uris || card.card_faces?.[0]?.image_uris;
  const imageUrl = imageUris?.small;
  const trainingImageUrl = imageUris?.normal || imageUris?.large || imageUrl;
  if (!imageUrl) throw new Error(`No image for ${card.name}`);

  const imageSource = stableSourceUrl(imageUrl);
  const trainingImageSource = stableSourceUrl(trainingImageUrl);

  const imageName = `${card.id}.jpg`;
  const imagePath = path.join(imageDirectory, imageName);
  const trainingImagePath = path.join(trainingImageDirectory, imageName);
  const imageResponse = await fetch(imageUrl, { headers: { "User-Agent": userAgent } });
  if (!imageResponse.ok) throw new Error(`Image request failed for ${card.name}: ${imageResponse.status}`);
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  if (await writeFileIfChanged(imagePath, withSourceComment(imageBuffer, imageSource, "preview card thumbnail"))) {
    changedAssets += 1;
  }

  const trainingImageResponse = await fetch(trainingImageUrl, { headers: { "User-Agent": userAgent } });
  if (!trainingImageResponse.ok) throw new Error(`Training image request failed for ${card.name}: ${trainingImageResponse.status}`);
  const trainingImageBuffer = Buffer.from(await trainingImageResponse.arrayBuffer());
  if (await writeFileIfChanged(trainingImagePath, withSourceComment(trainingImageBuffer, trainingImageSource, "readable card image"))) {
    changedAssets += 1;
  }

  const faces = Array.isArray(card.card_faces) ? card.card_faces : [];
  cards.push({
    id: card.id,
    name: card.name,
    collectorNumber: card.collector_number,
    color: classify(card.color_identity),
    colors: card.color_identity || [],
    manaCost: card.mana_cost || faces.map((face) => face.mana_cost).filter(Boolean).join(" // "),
    manaValue: card.cmc,
    typeLine: card.type_line,
    oracleText: card.oracle_text || faces.map((face) => `${face.name} — ${face.oracle_text}`).join("\n\n"),
    rarity: card.rarity,
    keywords: card.keywords || [],
    image: `assets/cards/${setCode}/${imageName}`,
    trainingImage: `assets/cards-large/${setCode}/${imageName}`,
    imageSource,
    trainingImageSource,
    scryfallUrl: card.scryfall_uri,
  });
}

const collectorNumberOrder = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
cards.sort((left, right) => (
  collectorNumberOrder.compare(left.collectorNumber, right.collectorNumber)
  || left.name.localeCompare(right.name)
  || left.id.localeCompare(right.id)
));

const snapshotContent = {
  set: setCode.toUpperCase(),
  source: apiUrl,
  partial: true,
  count: cards.length,
  cards,
};

let previousContent = null;
try {
  const previous = JSON.parse(await fs.readFile(outputPath, "utf8"));
  previousContent = {
    set: previous.set,
    source: previous.source,
    partial: previous.partial,
    count: previous.count,
    cards: previous.cards,
  };
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

if (JSON.stringify(previousContent) === JSON.stringify(snapshotContent) && changedAssets === 0) {
  console.log(`No changes to ${cards.length} ${setCode.toUpperCase()} preview cards.`);
  process.exit(0);
}

const snapshot = {
  set: snapshotContent.set,
  source: snapshotContent.source,
  capturedAt: new Date().toISOString(),
  partial: snapshotContent.partial,
  count: snapshotContent.count,
  cards: snapshotContent.cards,
};

await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Captured ${cards.length} ${setCode.toUpperCase()} preview cards and changed ${changedAssets} image files.`);
