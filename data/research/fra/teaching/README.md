# Teaching layer

The website uses two levels of detail:

- All 280 main-set nonbasic cards expose both complete written assessments, with authors, original grades, source links, capture date and explicit cycle scope.
- `cards.json` contains 24 authored priority-card lessons: role, reason to play, support, downside and substantive differences between reviewers. These cover every card selected in Prerelease prep. They are not a claim that all 280 cards have received a synthesized verdict.

Each lesson was authored from both complete review passages and the canonical rules text. Section and paragraph references stay with the record; `basisSha256` fingerprints those exact reviews and rules. A changed basis fails the build until the lesson is reviewed. Differences are described in words, not inferred by comparing incompatible numerical scales. Silence in `disagreement` means no difference was selected for this short lesson, not that all sources agree.

Selection includes ordinary creatures, removal, conditional cards, fixing, threats and engines. Being selected does not mean a card is strong: Emrakul and Way of the Mind Sculptor teach the cost of unsupported top-end investment. Broad Limited reviews inform Sealed preparation; they are not observed Sealed performance.

Existing ten-pair archetype advice and twelve rules-based combinations remain in `../synthesis.json`, linked to their earlier reviewed claims. Automatic transcript matches are not promoted into recommendations. The new website path organizes mechanics, priority cards, combinations/colour plans, interaction, and practice/checklist into five finite lessons. Completion is self-reported, with separately marked review needs.

The new review presentation is noncommercial under the user-reported permissions in `../extraction/licensed/permissions.json`. Full transcript exports and unrelated article context stay in the research directory; the public bundle only includes per-card review passages and selected teaching.

Run `node scripts/verify-teaching.mjs` to verify source joins, changed-basis rejection, complete review presentation, safe rendering, and journey state transitions. Run the existing prep, memory, evidence, lifecycle and service-worker checks too. Adding all-card editorial takeaways, further relationship extraction, and frame-verified gameplay lessons are separate authoring work; no placeholder or inferred verdict stands in for them.
