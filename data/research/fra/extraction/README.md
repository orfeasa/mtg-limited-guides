# Review extraction workspace

This is research-only material. It is not imported by the site build. Website presentation and navigation decisions are deferred.

## Actual state

Both written reviewers have commentary passages for all 280 main-set nonbasic cards. The earlier lack of explanations in the repository was an extraction gap, not missing articles. This pass indexes all of those passages and retains selected explicit relationships. **It does not complete the requested two substantive assessments per card.**

| Artifact | What it contains | What it does not establish |
| --- | --- | --- |
| `review-index.json` | Eight documents; 534 card/cycle sections; 1,117 paragraphs, with hashes, passage locations, canonical card mentions and topic mentions | No paragraph prose; lexical topics are not semantic assessments |
| `card-mentions.json` | Every detected reference from a reviewed card/cycle to another main-set nonbasic card | A mention can be an answer, comparison or synergy; it remains unclassified here |
| `review-relationships.json` | Sixteen explicitly read and classified relationships, with short attributed paraphrases | Selected coverage, not an exhaustive relationship graph; no gameplay verification |
| `index-coverage.json` | Passage-index totals and reviewer groups | Not substantive-assessment coverage |

Four multi-card land passages expand to their constituent card references across the source collection, so section and card counts differ. Cycle scope is preserved. Different MTGAZone colour articles do not become different reviewers. Basic lands can occur as literal mentions but are excluded from related-card edges and the 280-card cohort. Special Guests are outside this cohort.

## Provenance and method

Inputs are the previously examined captures dated 2026-09-22. Each must match the SHA-256 in `../sources/`. Draftsim uses HTML paragraph positions within each heading. MTGAZone uses line positions from the indexed text captures. A paragraph hash identifies normalized text; it does not recover the passage without the source. Original headings and URLs locate the material on the publisher's site.

Topic matching is deliberately mechanical. A paragraph saying a card is unsuitable for an aggressive deck still mentions aggression. These fields are discovery aids only. Exact card-name matching can miss nicknames or references such as “this creature”; missing a mention does not prove no relationship exists. Shared prepared-spell names are not automatically assigned to every creature with that spell.

Reviewed relationships distinguish synergy, enabler, support requirement, answer target, vulnerability, counterplay, shared cost, comparison and relative evaluation. The source claim is preserved separately from whether the interaction's performance has been tested. For example, a named answer to Sphinx of False Conclusions is a vulnerability record, not a suggested pairing.

## Copyright and completeness boundary

Public access to a review does not authorize reproducing its full text or creating an exhaustive substitute rewrite. This workspace therefore retains factual indexing and selected bounded summaries, rather than whole articles. The earlier promise to extract every author's complete explanation exceeded that boundary.

For an exhaustive transformation, the review text needs to be supplied by the user, or the source needs a suitable permission/license. Until then, `semanticAssessmentStatus: not-extracted` remains explicit for every indexed section. The historical selected notes and the sixteen relationships must not be represented as full narrative coverage.

## Reproduction and checks

With the original local captures available:

```sh
python3 scripts/index-review-passages.py --captures /tmp
node scripts/verify-review-extraction.mjs
```

The importer accepts another directory containing the `captureFilename` files recorded in the index. It refuses a changed capture hash. It reads local captures only: it does not fetch articles or write raw prose into the repository. The verifier can run without the capture files and checks card joins, grades, groups, scopes, hashes, paragraph references and every reviewed relationship's named cards.

Next semantic records should preserve source ID, passage ID, canonical subjects, relationship type, context, uncertainties and a short attributable assessment. Keep absence explicit; neither a detected topic nor a rating supplies missing reasoning. A later presentation decision can use those records without changing their provenance.
