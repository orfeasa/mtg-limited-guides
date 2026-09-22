# Teaching layer

The website uses two levels of detail:

- All 280 main-set nonbasic cards expose both complete written assessments, with authors, original grades, source links, capture date and explicit cycle scope.
- `cards.json` contains authored lessons for all 280 main-set nonbasic cards: role, reason to play, support, downside and substantive differences between reviewers. Fifteen lands are grounded in explicitly shared cycle reviews. The guide still starts with a curated 24-card selection; every other card is available through All cards.

Each lesson was authored from both complete review passages and the canonical rules text. Section and paragraph references stay with the record; `basisSha256` fingerprints those exact reviews and rules. A changed basis fails the build until the lesson is reviewed. Differences are described in words, not inferred by comparing incompatible numerical scales. Silence in `disagreement` means no difference was selected for this short lesson, not that all sources agree.

Selection includes ordinary creatures, removal, conditional cards, fixing, threats and engines. Being selected does not mean a card is strong: Emrakul and Way of the Mind Sculptor teach the cost of unsupported top-end investment. Broad Limited reviews inform Sealed preparation; they are not observed Sealed performance.

Existing ten-pair archetype advice and twelve rules-based combinations remain in `../synthesis.json`, linked to their earlier reviewed claims. Automatic transcript matches are not promoted into recommendations. The new website path organizes mechanics, priority cards, combinations/colour plans, interaction, and practice/checklist into five finite lessons. Completion is self-reported, with separately marked review needs.

The new review presentation is noncommercial under the user-reported permissions in `../extraction/licensed/permissions.json`. Full transcript exports and unrelated article context stay in the research directory; the public bundle only includes per-card review passages and teaching.

Run `node scripts/verify-teaching.mjs` to verify source joins, changed-basis rejection, complete review presentation, safe rendering, and journey state transitions. Run the existing prep, memory, evidence, lifecycle and service-worker checks too. Further relationship extraction and frame-verified gameplay lessons remain separate authoring work; no placeholder or inferred verdict stands in for them.

## Situational practice and review reminders

`data/fra_prep.json` now contains ten authored situations, distinct from the eight rules checks and from observed games. Every choice has an explanation. Each situation links its named cards to both review sections and the exact source/rules fingerprint. The build rejects missing reasoning, invalid answers, unrelated sections and stale source bases. No aggregate rating or implied match result is introduced.

The final lesson presents one situation at a time, preserving position and answers in the existing guide progress namespace. Existing rules-check answers and checklist entries remain valid. Each format retains its own answers; the personal review list is shared within a set because it records cards and concepts to revisit, not match results.

`public/review-queue.js` stores stable card, combination and question IDs under `limited-prep:review:<set>:v1`. Card and combination views have a manual mark. Incorrect rules/situation answers and Card memory misses add reminders automatically. A correct retry does not remove them; “Done reviewing” or the pressed mark removes a reminder explicitly. Unknown IDs and duplicate entries are discarded. Storage failures retain session state and show a warning in the review list. There is no cloud synchronization or claim of permanent storage.

Validation includes `verify-review-queue.mjs`, added to deployment, plus the existing teaching, prep, memory, lifecycle and service-worker checks. Browser checks cover wrong-answer explanations, correct retries, retained reminders, reload position, card-dialog guidance, saved combinations, keyboard use and narrow-screen overflow.
