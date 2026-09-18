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
