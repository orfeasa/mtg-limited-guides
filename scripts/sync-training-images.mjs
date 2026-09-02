#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const dataDir = path.join(root, "data");
const outputDir = path.join(root, "public", "assets", "cards-large");
const pickOrder = JSON.parse(fs.readFileSync(path.join(dataDir, "hobbit_pick_order.json"), "utf8"));
const artIds = JSON.parse(fs.readFileSync(path.join(dataDir, "hobbit_art_ids.json"), "utf8"));
const pickNames = pickOrder.sections.flatMap((section) => section.names);
const force = process.argv.includes("--force");

const normalize = (value) => value
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")
  .toLowerCase()
  .replace(/[’']/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const requestHeaders = {
  Accept: "application/json;q=0.9,image/jpeg;q=0.8,*/*;q=0.5",
  "User-Agent": "hobbit-pick-order/1.0 (https://github.com/orfeasa/hobbit-pick-order)",
};

const withSourceComment = (buffer, source, name) => {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return buffer;
  const description = `impeccable:prompt\0Source: ${source}. Downloaded from Scryfall as the readable study image for ${name} in The Hobbit Limited guide.`;
  const comment = Buffer.from(description, "utf8");
  const header = Buffer.alloc(4);
  header[0] = 0xff;
  header[1] = 0xfe;
  header.writeUInt16BE(comment.length + 2, 2);
  return Buffer.concat([buffer.subarray(0, 2), header, comment, buffer.subarray(2)]);
};

let pageUrl = "https://api.scryfall.com/cards/search?order=set&q=e%3Ahob%20game%3Aarena&unique=cards";
const scryfallCards = [];

while (pageUrl) {
  const response = await fetch(pageUrl, { headers: requestHeaders });
  if (!response.ok) throw new Error(`Scryfall request failed: ${response.status}`);
  const page = await response.json();
  scryfallCards.push(...page.data);
  pageUrl = page.has_more ? page.next_page : null;
  if (pageUrl) await wait(100);
}

const byName = new Map();
for (const card of scryfallCards) {
  byName.set(normalize(card.name), card);
  byName.set(normalize(card.name.split(" // ")[0]), card);
  for (const face of card.card_faces || []) byName.set(normalize(face.name), card);
}

const matches = pickNames.map((name, index) => {
  const card = byName.get(normalize(name));
  if (!card) throw new Error(`Could not match ${name} to a Scryfall HOB card`);

  const matchedFace = card.card_faces?.find((face) => normalize(face.name) === normalize(name));
  const imageUris = matchedFace?.image_uris || card.image_uris || card.card_faces?.[0]?.image_uris;
  const imageUrl = imageUris?.large || imageUris?.normal;
  if (!imageUrl) throw new Error(`No large card image found for ${name}`);

  return {
    name,
    imageUrl,
    outputPath: path.join(outputDir, `${artIds[index]}.jpg`),
  };
});

fs.mkdirSync(outputDir, { recursive: true });
let downloaded = 0;
let retained = 0;

for (const [index, match] of matches.entries()) {
  if (!force && fs.existsSync(match.outputPath) && fs.statSync(match.outputPath).size > 50_000) {
    retained += 1;
    continue;
  }

  const response = await fetch(match.imageUrl, { headers: requestHeaders });
  if (!response.ok) throw new Error(`Image request failed for ${match.name}: ${response.status}`);
  const image = Buffer.from(await response.arrayBuffer());
  if (image.length < 50_000) throw new Error(`Downloaded image for ${match.name} is unexpectedly small`);
  fs.writeFileSync(match.outputPath, withSourceComment(image, match.imageUrl, match.name));
  downloaded += 1;

  if ((index + 1) % 25 === 0 || index === matches.length - 1) {
    console.log(`Prepared ${index + 1}/${matches.length} training images…`);
  }
  await wait(100);
}

console.log(`High-resolution training images ready: ${downloaded} downloaded, ${retained} already current.`);
