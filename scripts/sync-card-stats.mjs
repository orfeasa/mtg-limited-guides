#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(here);
const sourceUrl = "https://mtga.untapped.gg/limited/draft/the-hobbit/card-data";
const rankNames = ["bronze", "silver", "gold", "platinum"];
const rankCodes = ["b", "s", "g", "p"];

const response = await fetch(sourceUrl, {
  headers: { "user-agent": "hobbit-pick-order data refresh" },
});
if (!response.ok) throw new Error(`Untapped.gg request failed: ${response.status}`);

const html = await response.text();
const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
if (!nextDataMatch) throw new Error("Could not find Untapped.gg page data");

const nextData = JSON.parse(nextDataMatch[1]);
const ssrProps = nextData.props?.pageProps?.ssrProps;
const statsResponse = ssrProps?.limitedCardStatsResp;
const statsPayload = statsResponse?.data;
const statsByTitleId = statsPayload?.data;
const metadata = statsPayload?.metadata;
const draftRows = ssrProps?.limitedDraftInfo?.data;
const localeData = ssrProps?.minifiedMtgaJsonData?.localeData;

if (!statsByTitleId || !metadata?.fields || !Array.isArray(draftRows) || !Array.isArray(localeData)) {
  throw new Error("Untapped.gg card statistics payload is incomplete");
}

const pickOrder = JSON.parse(fs.readFileSync(path.join(root, "data", "hobbit_pick_order.json"), "utf8"));
const pickNames = pickOrder.sections.flatMap((section) => section.names);
const titleIdsByName = new Map();
for (const [titleId, name] of localeData) {
  if (typeof name !== "string") continue;
  const ids = titleIdsByName.get(name) || [];
  ids.push(String(titleId));
  titleIdsByName.set(name, ids);
}

const draftByTitleId = new Map(draftRows.map((row) => [String(row.title_id), row]));

function fieldLocation(fieldName) {
  for (let dataIndex = 0; dataIndex < metadata.fields.length; dataIndex += 1) {
    const fieldIndex = metadata.fields[dataIndex].indexOf(fieldName);
    if (fieldIndex !== -1) return { dataIndex, fieldIndex };
  }
  throw new Error(`Untapped.gg payload is missing ${fieldName}`);
}

function summedStat(cardStats, fieldName) {
  const { dataIndex, fieldIndex } = fieldLocation(fieldName);
  return rankCodes.reduce((total, rankCode) => (
    total + (cardStats?.ALL?.[rankCode]?.[dataIndex]?.[fieldIndex] || 0)
  ), 0);
}

function meanRankValue(values, fieldName) {
  const selected = rankNames.map((rank) => values?.[rank]).filter(Number.isFinite);
  if (selected.length === 0) throw new Error(`Untapped.gg payload is missing ${fieldName}`);
  return selected.reduce((total, value) => total + value, 0) / selected.length;
}

const cards = {};
for (const name of pickNames) {
  const titleId = (titleIdsByName.get(name) || []).find((candidate) => (
    statsByTitleId[candidate] && draftByTitleId.has(candidate)
  ));
  if (!titleId) throw new Error(`No Untapped.gg statistics found for ${name}`);

  const cardStats = statsByTitleId[titleId];
  const draft = draftByTitleId.get(titleId);
  cards[name] = {
    title_id: Number(titleId),
    in_hand_games: summedStat(cardStats, "available_games"),
    in_hand_wins: summedStat(cardStats, "available_wins"),
    opening_hand_games: summedStat(cardStats, "in_opening_hands"),
    opening_hand_wins: summedStat(cardStats, "in_opening_hand_wins"),
    total_games: summedStat(cardStats, "games"),
    avg_last_offered: Number(meanRankValue(draft.avg_last_pick_offered, "avg_last_pick_offered").toFixed(2)),
    avg_pick_taken: Number(meanRankValue(draft.avg_pick_chosen, "avg_pick_chosen").toFixed(2)),
  };
}

const totalMatches = rankNames.reduce((total, rank) => total + (metadata.games?.ALL?.[rank] || 0), 0);
const totalMatchesDisplay = html.match(/Total matches:\s*<strong>([\d,]+)<\/strong>/)?.[1]
  || totalMatches.toLocaleString("en-GB");

const output = {
  source: sourceUrl,
  captured_at: new Date().toISOString(),
  source_last_modified: new Date(statsResponse.lastModified).toISOString(),
  format: "Premier Draft",
  rank_range: "Bronze-Platinum",
  total_matches: totalMatches,
  total_matches_display: totalMatchesDisplay,
  cards,
};

fs.writeFileSync(
  path.join(root, "data", "hobbit_card_stats.json"),
  `${JSON.stringify(output, null, 2)}\n`,
);
console.log(`Captured statistics for ${Object.keys(cards).length} cards from ${totalMatchesDisplay} matches.`);
