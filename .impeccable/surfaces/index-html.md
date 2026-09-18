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

The Hobbit uses five official archetype plans from the Wizards prerelease guide plus separate 17Lands Premier Draft and Sealed two-colour snapshots captured on 8 September 2026. The interface retains all ten pairs so off-map evidence can surface, attaches win rate to sample size, and keeps official intent, observed results, and editorial field notes distinct. The set also uses the complete, attributable 188-card Untapped.gg ranking and performance snapshots captured on 17 September 2026 across 750,000 matches. Its Training quiz asks for the exact tier in four grouped rows—Top picks, Strong, Playable, and Filler—and follows each answer with In-hand WR, Usually gone by, In-hand games, source context, and adjacent ranks. Its Draft decisions mode contains 18 real full-pack and drafted-pool states from a public 17Lands 7–2 Premier Draft replay; after a choice, the ledger explains the editorially inferred replay line and the exact rank-only calculation behind the current Untapped data leader while keeping both evidence types separate rather than presenting a score. Reality Fracture uses the complete 281-card Scryfall preview index and local images without invented Limited ratings. Training is absent until complete attributable ratings are verified. Archetypes presents Wizards' official ten-pair Draft structure, verified local signposts, and separate Draft/Sealed preparation notes while all leaders, samples, rankings, and win rates remain explicitly pending until real play begins. Draft decisions remain absent until grounded pack-and-pool evidence exists. Both sets prefer readable local images and fall back to the matching local thumbnail. Per-set browser storage preserves Training state plus the current and reviewed draft decisions. Keyboard, touch, visible focus, responsive behavior, reduced motion, provenance, offline use, and literal state labels are first-class. The separate backend has no route in this static deployment; no account, analytics, cookies, generic stats dashboard, or deck-builder framing is required.

## Chosen direction

The Set-Specific Field Guide Shelf: one shared preparation shell governed by docs/set-lifecycle.md with evidence-gated Training and a browser labelled Previews until the full card file is confirmed, then All cards, a conditional Archetypes marker when the official map, signposts, and editorial notes are authored, and a conditional Draft decisions marker when grounded evidence exists. The first viewport opens the latest volume directly onto focused preparation work. Hobbit preserves Bilbo’s Expedition Atlas with forest cloth, warm map leaves, brass and oxblood wayfinding, river details, Alegreya hierarchy, rounded handled construction, exact-tier rows, and quiet evidence ledgers. Archetypes reads as broad routes rather than a dashboard: a Draft/Sealed switch, one binding-coloured format note, a sticky route index, ruled chapters for each supported plan, and paired signpost cards that open in the existing lightbox. An observed set attaches ranks and samples; a pre-play set omits empty statistics and explains pending observations in prose. Draft decisions extends the Hobbit atlas as one broad pack table: seat and pool read in ruled binding rows, the complete pack on a map leaf, then an inline three-way evidence ledger whose replay and data entries carry their own explanation and evidence boundary. Reality Fracture uses an angular Echoverse dossier with ink-indigo binding, cool paper, Barlow Condensed Black hierarchy, violet/cyan/pink electric seams, clipped facets, intentional two-to-four-pixel cuts, an All cards landing page before ratings exist, with a clear invitation into published Prerelease prep, and ten official archetype chapters without premature power claims. All cards opens readable images in a focused lightbox without changing views. Atkinson Hyperlegible Next, local imagery, common controls, information order, and 1120/860/700 responsive behavior bind both volumes together.

## Direction contract

**THESIS:** Prerelease prep turns the complete card file into practical event preparation, without requiring ratings or a dashboard of empty statistics.

**OWN-WORLD:** The catch-up rail belongs inside the Reality Fracture Echoverse dossier: cool paper, ink-indigo binding, Atkinson control copy, clipped three-pixel corners, and restrained violet seams. The rated Hobbit atlas adds its own compact colour/tier arrangement control in forest cloth and warm paper without borrowing dossier styling.

**STORY:** A player chooses Sealed or Draft, learns mechanics and key cards, checks possible interaction, then builds and checks their deck. Objective exercises explain rules; editorial selections explain requirements. Card references open the existing lightbox.

**FIRST VIEWPORT:** A broad cool-paper page opens with a condensed preparation heading, Sealed/Draft choice, short event guidance, and jump links. The first mechanics examples begin immediately below. Ruled reading sections and compact illustrated card rows alternate with a plain checklist and inline practice. Mobile uses one reading column.

**FORM:** Code-led extension of the established dossier, with the five-section preparation structure explicitly accepted by the user. No new visual world, concept seed, or separate comp is required. Existing tokens, fonts, card imagery, and controls remain authoritative.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

No surface-level design decision remains unresolved. Each future set still requires an authored material world and attributable ranking provenance before rating-dependent training can unlock. Archetypes requires an attributable official map, verified signposts, and separate Draft/Sealed guidance; observations may follow later but must remain visibly pending until captured. Draft decisions requires grounded pack-and-pool evidence.
