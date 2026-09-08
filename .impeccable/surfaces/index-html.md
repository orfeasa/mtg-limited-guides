---
version: 1
slug: "index-html"
primary_target: "public/index.html"
related_targets:
  - "public/styles.css"
  - "public/app.js"
  - "public/data.js"
---

## Scope and mode

`public/index.html` is an Operate surface for set-by-set Limited preparation before a prerelease or draft.

## Audience, job, and task

An MTG player opens the latest set, learns cards from readable local images, studies the supported archetypes through separate Draft and Sealed lenses, trains exact Limited tiers, works through grounded draft decisions when a set has real pack-and-pool evidence, and browses the full revealed or ranked card file. They can enlarge any indexed card in place and share the selected guide without creating an account or building a deck.

## Content and constraints

The Hobbit uses five official archetype plans from the Wizards prerelease guide plus separate 17Lands Premier Draft and Sealed two-colour snapshots captured on 8 September 2026. The interface retains all ten pairs so off-map evidence can surface, attaches win rate to sample size, and keeps official intent, observed results, and editorial field notes distinct. The set also uses the complete, attributable 188-card Untapped.gg ranking and performance snapshots captured on 2 September 2026 across 620,000 matches. Its Training quiz asks for the exact tier in four grouped rows—Top picks, Strong, Playable, and Filler—and follows each answer with In-hand WR, Usually gone by, In-hand games, source context, and adjacent ranks. Its Draft decisions mode contains 18 real full-pack and drafted-pool states from a public 17Lands 7–2 Premier Draft replay; an in-context lane guide keeps the five authored engine explanations, requirements, and Draft move-in tests beside the exercise, while the player's pick, historical replay pick, and current Untapped data leader remain separate evidence rather than a score. Reality Fracture uses the current Scryfall preview index and local images without invented Limited ratings; Training remains an unrated card reader, while Archetypes and Draft decisions are absent until grounded evidence exists. Both sets prefer readable local images and fall back to the matching local thumbnail. Per-set browser storage preserves Training state plus the current and reviewed draft decisions. Keyboard, touch, visible focus, responsive behavior, reduced motion, provenance, offline use, and literal state labels are first-class. The separate backend has no route in this static deployment; no account, analytics, cookies, generic stats dashboard, or deck-builder framing is required.

## Chosen direction

The Set-Specific Field Guide Shelf: one shared preparation shell with stable Training and All cards markers, a conditional Archetypes marker when the official map and observations are authored, and a conditional Draft decisions marker when grounded evidence exists. The first viewport opens the latest volume directly onto focused preparation work. Hobbit preserves Bilbo’s Expedition Atlas with forest cloth, warm map leaves, brass and oxblood wayfinding, river details, Alegreya hierarchy, rounded handled construction, exact-tier rows, and quiet evidence ledgers. Archetypes reads as five broad routes through the atlas rather than a dashboard: a Draft/Sealed brass switch, one binding-coloured format note, a sticky route index, ruled chapters for the five supported plans, and paired signpost cards that open in the existing lightbox. Draft decisions extends that atlas as one broad pack table: seat and pool read in ruled binding rows, a single collapsible lane guide with five compact route selectors and one focused explanation, the complete pack on a map leaf, then an inline three-way evidence ledger. Reality Fracture uses an angular Echoverse dossier with ink-indigo binding, cool paper, Barlow Condensed Black hierarchy, violet/cyan/pink electric seams, clipped facets, intentional two-to-four-pixel cuts, and an explicitly unrated Training reader. All cards opens readable images in a focused lightbox without changing views. Atkinson Hyperlegible Next, local imagery, common controls, information order, and 1120/860/700 responsive behavior bind both volumes together.

## Unresolved decisions

No surface-level design decision remains unresolved. Each future set still requires an authored material world and attributable ranking provenance before rating-dependent training can unlock; Archetypes requires an attributable official map plus separate Draft and Sealed observations, and Draft decisions requires grounded pack-and-pool evidence.
