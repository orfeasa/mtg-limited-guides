# Authoring a set's preparation guide

The reader's job is to arrive ready to build and play, not to consume our data pipeline. Keep headings and advice about their decisions. Do not frame introductions around an imaginary expectation of a tier list.

## Content contract

Add `prepFile` to the set manifest, referencing a JSON file like `data/fra_prep.json`. Version 1 requires:

- `set`, `version`, `status` (`draft` or `published`), `authoredAt`, and `publishedAt` for publication.
- Source labels and HTTPS URLs; a short editorial assessment boundary.
- Separate Sealed/Draft introductions and actionable colour-selection steps.
- Mechanics: stable ID, title, plain-language rule, practical tip, and exact indexed card names.
- Key-card roles and cards: exact card name, role, reason to know it, and the requirements or limitations. Cover ordinary cards across colours, not only rare bombs. Do not imply rarity proves strength.
- Instant-speed interaction watchlist: exact card name and a note including important targeting/cost restrictions. Displayed mana costs, colours, and rarities come from the card file. The validator rejects non-instant/non-flash cards here; activated abilities need a future explicit schema extension.
- A deck checklist, with stable IDs and practical actions. Distinguish rules (40-card minimum) from advice (usually start around 17 lands).
- Objective exercises: stable ID, scenario, distinct options, zero-based answer index, explanation, and card references. Supply relevant board assumptions. Never grade a subjective pick as a rules fact.

The build validates this contract through `scripts/prep-schema.mjs`; `verify-data.mjs` revalidates the shipped bundle. `verify-prep.mjs` checks negative cases. Content validation catches structural errors, not strategic truth: review card text, timing, costs, and rules before publication.

## Reader experience

The guide extends the existing theme. Its default common/uncommon selection is a manageable starting point; role filters expose bomb candidates, removal, engines, and fixing without adding top-level tabs. Card names and illustrations use the existing accessible lightbox. Interaction filtering includes multicolour cards containing the chosen colour.

Show editorial status alongside card assessments, sources at the end, and a review date. No invented scores, win rates, or unsupported claims about the emerging format. Ratings and observed archetype data remain separate capabilities.

Checklists and answers are local only, isolated by set, guide version/review date, and Sealed/Draft. Changing a guide's meaning requires a revision date/version bump so old answers are not applied to different questions. No Training progress is touched. Blocked storage falls back to this page session with an explicit message. Clearing the checklist does not clear exercise answers.

## Publication checklist

1. Verify the full card file and published event dates; review the official mechanics and card text.
2. Author all sections, check every card reference and answer, and set a real publication date only when ready.
3. Run `node scripts/build-data.mjs`, `node scripts/verify-data.mjs`, `node scripts/verify-lifecycle.mjs`, `node scripts/verify-prep.mjs`, and syntax checks for changed JavaScript.
4. Test Sealed/Draft deep links, guide-to-archetype navigation, filters, enlargement/Escape/focus return, reload persistence, unlimited retries, mobile layout, and an existing rated set.
5. Bump changed browser asset query versions, including generated data. Follow AGENTS.md for delivery and verify the live site separately.

Reviewed sample pools, a Sealed simulator, and subjective deck-choice exercises are future work. They need authentic or clearly labelled synthetic pools, documented collation assumptions, and reviewed explanations; they are not implied by this guide.

## Two-Headed Giant

An optional `twoHeadedGiant` object adds one preparation format button beside Sealed and Draft (`format=2hg`), without new top-level navigation or subtabs. It contains `intro`, HTTPS `sources`, `rules` (stable ID, title, text), `cards` (exact card name and note), `checklist`, and objective `exercises` using the existing exercise shape. All collections are validated before publication. Keep `publishedAt` as the original publication date and advance `authoredAt` when reviewing a revision. Omit the object for sets without reviewed team content.

Team progress has its own format namespace. Explain shared life versus individual players, mulligans, combined combat, targeting and controller-specific effects. Review each card against its full text, include relevant scenario assumptions, and distinguish strategic advice from rules. No 2HG rankings or observed results are implied.

Verified the first FRA team guide on 19 September 2026: five rules essentials, seven card notes, seven checklist items and five exercises. Build/data/lifecycle checks and 13 negative schema cases passed. Browser checks covered the direct team link, Sealed/Draft switching and isolated progress, reload persistence, wrong/correct answers and retries, checklist-only reset, card enlargement/Escape/focus return, mobile layout at 390 CSS pixels, desktop layout, and Hobbit Training. Independent visual review: ship; opening viewport screenshots and lower-section source reviewed. Existing design tokens and components are retained.

## Active preparation study

For guides with archetypes and Card memory, the shared prep page offers the recommended order: archetypes, recognition, interaction, then checklist/practice. Normal prerelease entry links use Sealed; explicit Draft links retain Draft. `study=1` opens archetype recall; `studySet=essentials|common|interactions|all|weak` and optional `colour=W|U|B|R|G|M|C` select Card memory. No second authored essentials list is needed: derive its union from `keyCards`, `interactions`, and archetype signposts. Common/uncommon selection uses imported rarity, never the editorial foundation role. A single colour includes multicolour cards containing it.

Answer-only context comes from signpost membership, role labels and watchlist notes. Do not expose it in the masked question. Interaction recognition shows the printed mana cost and authored targeting/additional-cost notes after the answer. Labels such as Bomb candidates remain editorial, without grades.

Memory runs are isolated by set, rules-text revision, study set and colour. Original all-card runs retain their namespace. Per-card attempt/miss totals use `card-memory:attempts:v1:<set>` and survive restarts; misses include “Don't know”. Weak cards selects at least two lifetime misses, takes a fixed membership snapshot for each run, and refreshes on restart. No scheduling or permanent-mastery claim. Archetype runs use `archetype-study:v1:<set>:<content-hash>:<direction>` and independently preserve current prompt, reveal, queue and recalled plans. Blocked storage retains study state in the page session. Neither namespace touches Training or prep checklist state.

Source review, 20 September 2026: added the Wizards Reality Fracture Prerelease Guide alongside the design article. Checked all ten existing short archetype names and plans against its colour-pair descriptions and all twenty signposts against imported rules text. The guide uses fuller school/character headings; the short study names are retained. Signposts are editorial recognition examples, not a claim to reproduce every pictured example in the prerelease article. Existing plans and signposts agree with the guide; no new ratings or observed results were added.
