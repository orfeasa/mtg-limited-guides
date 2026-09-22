---
name: sealed-pool-deck
description: Build the strongest supported Magic sealed deck from photos of an opened pool or a transcribed card list, using this repository's card files, reviews, teaching and format evidence. Use for pool identification, colour comparison, mana bases and sideboard plans.
---

# Sealed pool deck

Turn the user's actual pool into a playable recommendation grounded in the available evidence. Aim for the strongest coherent deck; do not promise mathematical optimality or invent expected win rates. This is an assistant workflow, not a website feature.

## Establish the pool

Use supplied photos directly; inspect local image files with the available image viewer. If no photo or list is attached, ask for it. For unreadable areas, request a close-up with card names visible and minimal overlap. Continue identifying clear cards while resolving uncertainties.

Infer the set and ordinary individual Sealed when clear. Ask about event/product or variant only when it changes construction or legality. State assumptions about match format and basic-land availability. For Two-Headed Giant, establish whether this is the complete shared pool and build two complementary decks with disjoint card allocations; consult the repo's format guidance and current official rules for any unresolved restriction.

Create an inventory with canonical name or ID, quantity, photo/row location, identification confidence and unresolved alternatives. Keep uncertain cards separate. Match names, set symbols/collector numbers, art and rules against the card file; art alone does not establish a card. Track physical copies across overlapping images rather than counting every appearance. A two-faced or prepared card is one physical card; tokens, advertisements and spell copies are not additional deck cards. Do not infer hidden copies in a stack or fill missing cards from an expected booster count.

Check whether the photos cover all colours, nonbasic lands, artifacts and any eligible promos or bonus-sheet cards. The repo's main-set index is not an event-legality whitelist: identify missing cards from authoritative card data and check product/event rules when needed. Never silently drop an unindexed card. User corrections override visual guesses.

Present a compact inventory/count and the exact uncertain locations when verification is needed. Do not require confirmation of every clear card. If ambiguity or missing photos could change the colour choice or final slots, label any build provisional and explain the specific dependency; do not call an incomplete pool final.

## Use the repository evidence

Resolve paths from the repository root containing `data/sets.json`. Read the manifest first and follow the matching set's `dataFile`, `archetypesFile`, `prepFile` and `earlyEvidenceDir`; do not hard-code current coverage, dates or rating availability. Read source metadata and distinguish capture dates from live information. Use the existing snapshots unless the task requires a refresh; consult current authoritative sources for unresolved rules or card identity. Building a deck does not require changing data, unlocking Training or deploying the website.

- Card identity and rules: the set's source JSON. `public/data.js` provides the normalized cards for every supported adapter, including Hobbit; it contains a generated header comment followed by `window.LIMITED_PREP_DATA =` and can be read as JSON after removing the header, assignment and final semicolon, without executing it. Inspect fields before querying. Some adapters lack full rules text: obtain missing text rather than inventing it. Distinguish casting costs and optional face/ability costs from aggregate colour labels or Commander colour identity.
- Plans and format evidence: `docs/archetype-methodology.md`, the manifest's archetypes file and prep file. Separate Sealed observations from Premier Draft observations and note sample scope. Archetype results provide context, not a mandate to force that pair from this pool.
- Reality Fracture: start with `data/research/fra/teaching/cards.json` for roles, support requirements, drawbacks and substantive reviewer differences. Read `data/research/fra/teaching/README.md` and `data/research/fra/extraction/licensed/README.md` for evidence boundaries. Use `node scripts/read-research-card.mjs 'Exact card name'` for the full opinions on bombs, engines, disputed inclusions and close cuts. Its corpus is `data/research/fra/extraction/licensed/card-evidence.json`; `sources/` and `synthesis.json` in `data/research/fra/` provide attributed archetype advice and combinations. Preserve source attribution and noncommercial restrictions; prefer concise synthesis over reproducing reviews.
- Hobbit: `data/hobbit_pick_order.json` and `data/hobbit_card_stats.json` contain dated Premier Draft rankings and counts. Use as supporting evidence with the format caveat, not as Sealed win probabilities or a deck objective function.

Preserve reviewers' original scales. Do not average different grading systems, count seven articles by one author as seven opinions, or treat automatic caption mentions as recommendations. Read actual assessments when comparing viewpoints. Published example decks and footage can illustrate a plan but do not prove optimal construction or that their sideboard cards are weak. Missing evidence is not a poor rating. Separate rules facts, source opinions, observed statistics and your pool-specific judgement.

## Compare complete builds

Survey every colour's playable depth, early board presence, interaction, threats, card advantage and fixing. Consider all plausible colour pairs, including those outside advertised archetypes. Develop the leading candidates into complete lists with mana bases before choosing; usually compare two or three, but do not manufacture a contender for a clearly one-sided pool. Include a splash or multicolour candidate only when the actual fixing and payoff support it.

Evaluate each build as a deck:

- Count useful early plays, creatures or other board presence, clean versus conditional answers, evasive threats, long-game resources and dead or narrow cards. Explain how it wins and survives to do so.
- Count actual enablers and targets for each payoff, with quantities and timing. Do not equate multiple uses of one card with multiple physical cards or independent early plays. Check prepared spells, flashback, token production and activated abilities against their full costs and restrictions.
- Begin ordinary Sealed near 40 cards and 17 lands, then justify deviations from curve, coloured requirements, fixing and mana sinks. Choose land counts from when spells must be cast, especially early double pips, rather than a simple ratio of coloured symbols. Include colourless requirements where applicable.
- List usable sources by colour and distinguish untapped lands, tapped lands, restricted sources, one-shot mana and delayed creature/artifact fixing. Do not count a fixer as helping cast itself or late fixing as an early source. Evaluate the splash against the best unsplashed version, including lost tempo and consistency.
- Prefer a supported coherent plan over an isolated high-grade card. Explain meaningful tradeoffs and close cuts using the pool and cited evidence; do not fabricate numerical deck scores or statistical certainty.

Before delivery, reconcile the list against the inventory programmatically when practical: every quantity is a positive integer, the main deck totals the intended size, and main deck plus sideboard never exceeds owned copies. Only event-permitted supplied basics are exempt. Reconcile all confirmed nonbasics into main deck or remaining pool. Count both faces once and keep tokens separate. For a team pool, validate both decks and sideboards together. Recheck curve, actual source counts and support counts after the final cuts.

## Deliver a build the user can assemble

Lead with the recommended colours and concise reason. Provide:

1. A copyable `quantity Card Name` main deck with spells and exact basic/nonbasic land counts, plus total cards and land count.
2. The game plan, curve/early plays, interaction and mana-source summary, highlighting the weakest assumption or slot.
3. The strongest alternative and why it loses, plus important cuts and any reviewer disagreement that affects the choice.
4. Practical sideboard swaps by matchup, with explicit ins/outs and land changes when needed. Keep a complete remaining-pool list available; never imply cards outside the pool are available.
5. Brief source references with snapshot dates and any unresolved identifications. Label a provisional build clearly and give conditional swaps when an uncertain card matters.

Use readable card names and actionable explanations rather than a long research dump. A recommendation is conditional on the confirmed pool and evidence, and should improve when the user supplies a clearer photo or correction. Return the analysis in chat by default; keep photos and pool artifacts out of the public site and Git unless the user asks to save them there.
