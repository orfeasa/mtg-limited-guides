# Prerelease preparation implementation

## Reader outcome

Arrive able to recognise the set's mechanics, important threats and answers, build a coherent Sealed deck, and avoid common rules mistakes. Ratings are not required for this work.

## Agreed scope

1. A reusable, sourced preparation guide, first authored for Reality Fracture.
2. Prerelease prep as an optional full-reveal guide. Following reader feedback, All cards is the unrated landing page with a visible invitation to prep; rated sets still open Training. Keep Archetypes and preserve Hobbit's existing views.
3. Mechanics with card examples; reasoned key-card selections; an instant-speed interaction reference; separate Sealed/Draft colour-selection guidance; a locally saved deck checklist.
4. Objective rules exercises with explanations and unlimited retries, separate from rating Training and its saved progress.
5. Validate references, publication readiness, lifecycle transitions, keyboard/mobile behaviour, local persistence, and rated-set regressions before delivery.

## Evidence policy

Rules use the indexed card text and Wizards' mechanics/format references. Card selections and deck-building advice are editorial judgements, labelled as such, with costs and constraints rather than invented scores. A published guide is an explicit content milestone, not a scheduled-date side effect. No sample pools, simulator, predictive tiers, or new data service in this increment.

## Delivery

Build, data/lifecycle and syntax checks; desktop/mobile browser checks; independent design review; commit, push, clean deployment, and independent live verification. Record results below when completed.

## Implementation and verification — 18 September 2026

Implemented all five guide sections plus objective practice for FRA: four mechanics, 22 key cards, 11 instant-speed interactions, separate Sealed/Draft advice, eight checklist items, and five retryable exercises. Future-set authoring is documented in `prep-authoring.md`; sample pools and simulators remain deferred.

Passed generated-data, lifecycle, preparation-schema/negative-case, JavaScript syntax, shell syntax, and diff whitespace checks. Lifecycle tests cover incomplete previews, unpublished/future guides, full reveal, retail release without ratings, rated sets, and prep retained after ratings.

Browser verified at desktop (1440 CSS px) and mobile (390 CSS px): default and unavailable-view fallback, keyboard tab navigation, role/colour filters, card enlargement and Escape focus return, checklist/answer reload persistence, incorrect/correct feedback and retries, format-isolated state, guide-to-archetypes format routing, and Hobbit Training/real draft replay. No console errors or horizontal overflow observed. These are browser checks, not physical-device touch tests.

Independent design verdict: ship; named fixes resolved. Section jumps now clear sticky tabs. DESIGN.md describes the new capability within the existing visual identity. Full-page capture stitching was unreliable; final review used verified individual viewport captures. Future five-tab mobile wrapping is covered in source/lifecycle tests, not a published five-tab set.

Delivery follows the clean-commit deployment procedure; verify the deployed guide independently after deployment. Do not infer live success from these pre-deployment results alone.

## Focused study pass — 20 September 2026

Added shared two-direction archetype recall with saved reveal/queue state and three-question retries; an ordered prep path; and Card memory sets for 46 derived essentials, rarity-based commons/uncommons, 11 interactions, all nonbasic cards and repeatedly missed cards. Colour intersections include multicolour cards. Answer-only role/signpost labels and interaction cost/restriction notes teach context without ratings. Attempt/miss totals survive restarts; Weak cards uses two lifetime misses and a fixed run snapshot.

Added and reviewed the official Wizards prerelease guide alongside existing design attribution. All ten plans and twenty existing signposts were checked; no rankings or invented Arena/17Lands observations were added. Replaced stale preview/default HTML copy with neutral markup. Updated capability and authoring documentation and deployment verification.

Verification: build, data/schema, lifecycle, prep negative cases, memory and archetype-study tests, every public JavaScript and script syntax check, deploy shell syntax and diff whitespace passed. New tests cover filtering, requeue/reload/completion, answer-only metadata, per-card attempts, weak selection, corrupt/blocked storage, and set/filter/direction isolation. Browser checks at 390px and 1440px covered prep-to-Sealed study routing, both recall directions, signpost enlargement/Escape/focus return, memory reveal/reload/colour filters/empty state/next focus, checklist anchor reload and Sealed/Draft isolation. Hobbit Training reveal and persistence, five archetypes, format selection, draft replay and tier browsing passed; FRA still lands on All cards with Training absent. No horizontal overflow or browser errors observed. New study buttons meet 44px touch targets. These are browser checks, not physical-device tests.

Independent implementation/documentation review: ship; no material findings. Mechanical visual warnings described the inherited generic body/hidden Training styles and existing decorative patterns; inspected study content remains on the established readable paper surface. No visual-system replacement was needed. Full spaced repetition, simulators, deckbuilders and FRA rating Training remain outside this pass.
