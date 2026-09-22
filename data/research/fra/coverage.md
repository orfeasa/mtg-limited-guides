# Reality Fracture evidence coverage

Captured 2026-09-22. Main-set nonbasic cards only. Basic lands and Special Guests are outside this cohort.

| Evidence | Coverage |
| --- | --- |
| Two distinct written reviewers | 280 / 280 cards |
| Original numerical grades | 560 |
| Extracted notes (including archetype mentions) | 56 cards |
| Narrated gameplay | 16 cards, 2 games, one episode |
| Archetype advice from two video reviewers | 10 / 10 |
| Authored combinations | 12 (ten with recall questions) |

Two grades establish opinion coverage, not two independent gameplay samples or two full explanations. Missing prose or footage remains missing. Different reviewers can share assumptions. Scores on 0–5 and 0–10 scales are not averaged.

The machine-readable [coverage.json](coverage.json) lists every card, reviewers, note IDs, game observations and combinations. The build rejects missing second reviewers, duplicate reviewer votes, invalid card joins, invalid grades and broken source links. Run `node scripts/verify-evidence-coverage.mjs`.
