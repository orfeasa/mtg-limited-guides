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

## Star Trek approved local extension · 31 October 2026

The user approved a restrained Starfleet/LCARS treatment inside the existing composition and controls, then specified ordinary Sealed first and no Two-Headed Giant. This is a targeted addition to the incumbent shelf; Hobbit and Reality Fracture keep their material worlds and behavior. The Starfleet tokens and reusable rules are recorded in `DESIGN.md` and `.impeccable/design.json`.

**THESIS:** Help a player prepare to build an ordinary Sealed deck from six Star Trek Play Boosters.

**OWN-WORLD:** Starfleet briefing. Navy binding, warm paper, amber with muted salmon and pale blue navigation segments. Rajdhani Semibold display lettering and existing Atkinson Hyperlegible Next body/control text. Delta geometry in the shared logo slot. No decorative display console or lore dashboard. The font and its SIL OFL licence are self-hosted.

**STORY:** Latest set opens in All cards; a prerelease invitation and existing tabs lead to Sealed-first mechanics, ordinary key cards, interaction notes, colour selection and rules practice. Ten official archetype plans have separate Draft/Sealed notes. No ratings, rankings or statistics are fabricated. SDS source identity is retained in cards and details.

**FIRST VIEWPORT:** Existing header, set picker, 336-card nonbasic browsing scope, next known prerelease date and three available tabs. Navy/amber hierarchy and a narrow segmented LCARS band identify the new volume. Reading surfaces remain light. Mobile retains the visible full-file/ratings status and event date, wraps the shared controls, and keeps literal tab labels. Tabs have eighteen-pixel upper corners and square lower joins; pages and dialog frames use twelve-pixel radii, general controls six pixels, and shared preparation controls retain three pixels.

**FORM:** Code-led local extension of the established multi-set shell. Existing composition, navigation, cards and guide sections remain authoritative. The user approved the specific Starfleet/LCARS treatment before implementation; under new-work’s local-extension and precisely specified request rule, no concept tournament or concept seed applies.

**SIGNATURE INTERACTION:** Existing card selection opens the shared accessible image/details dialog with exact source-set code, expandable card-text source, and optional concise Best with / Watch for notes. Escape returns focus. The same dialog is used from key cards and archetypes. Rules exercises support wrong/correct answers, retry and per-format local persistence.

**CROSS-SURFACE REACH:** Shared shell and lifecycle rules remain. Star Trek defaults to ordinary Sealed in Limited guide and Archetypes, has no Two-Headed Giant control, and omits Training, Card memory and Draft decisions. Unavailable Training links fall back to the card browser. Pending observed archetype results stay in prose without empty statistics.

**EVIDENCE:** `public/styles.css` owns the Starfleet palette and mobile subtitle rule; `public/index.html` contains the inline delta mark and shared dialog; `data/sets.json` owns the format defaults and evidence gates. Finish-review captures are `.impeccable/review/mobile-prep.png` and `.impeccable/review/desktop-prep.png`. The restored mobile subtitle and persisted eighteen-pixel tab token address the two finish-review findings.

## Unresolved decisions

No surface-level design decision remains unresolved. Each future set still requires an authored material world and attributable ranking provenance before rating-dependent training can unlock. Archetypes requires an attributable official map, verified signposts, and separate Draft/Sealed guidance; observations may follow later but must remain visibly pending until captured. Draft decisions requires grounded pack-and-pool evidence.
