# Teaching layer

The website uses two levels of detail:

- All 280 main-set nonbasic cards expose both complete written assessments, with authors, original grades, source links, capture date and explicit cycle scope.
- `cards.json` contains authored lessons for all 280 main-set nonbasic cards: role, reason to play, support, downside and substantive differences between reviewers. Fifteen lands are grounded in explicitly shared cycle reviews. The guide still starts with a curated 24-card selection; every other card is available through All cards.

Each lesson was authored from both complete review passages and the canonical rules text. Section and paragraph references stay with the record; `basisSha256` fingerprints those exact reviews and rules. A changed basis fails the build until the lesson is reviewed. Differences are described in words, not inferred by comparing incompatible numerical scales. Silence in `disagreement` means no difference was selected for this short lesson, not that all sources agree.

Selection includes ordinary creatures, removal, conditional cards, fixing, threats and engines. Being selected does not mean a card is strong: Emrakul and Way of the Mind Sculptor teach the cost of unsupported top-end investment. Broad Limited reviews inform Sealed preparation; they are not observed Sealed performance.

Existing ten-pair archetype advice and twelve rules-based combinations remain in `../synthesis.json`, linked to their earlier reviewed claims. Automatic transcript matches are not promoted into recommendations. The new website path organizes mechanics, priority cards, combinations/colour plans, interaction, and practice into five finite lessons. Lessons are freely browsable without completion marks.

The new review presentation is noncommercial under the user-reported permissions in `../extraction/licensed/permissions.json`. Full transcript exports and unrelated article context stay in the research directory; the public bundle only includes per-card review passages and teaching.

Run `node scripts/verify-teaching.mjs` to verify source joins, changed-basis rejection, complete review presentation, safe rendering, and journey state transitions. Run the existing prep, memory, evidence, lifecycle and service-worker checks too. Further relationship extraction and frame-verified gameplay lessons remain separate authoring work; no placeholder or inferred verdict stands in for them.

## Situational practice

`data/fra_prep.json` now contains ten authored situations, distinct from the eight rules checks and from observed games. Every choice has an explanation. Each situation links its named cards to both review sections and the exact source/rules fingerprint. The build rejects missing reasoning, invalid answers, unrelated sections and stale source bases. No aggregate rating or implied match result is introduced.

The final lesson presents one situation at a time, preserving position and answers in the existing guide progress namespace. Each format retains its own answers. Manual review reminders, lesson completion and deck checklists were removed on September 22: preparation should not depend on a browser-local to-do list.

Validation includes the teaching, prep, memory, lifecycle and service-worker checks. Lesson navigation is tested without a storage API. Source material and card takeaways are unchanged.
