# Card details for every set

All cards must open a useful detail popup, not just an enlarged image. This applies to The Hobbit, Reality Fracture and every future set. Use the shared `observedCardEvidence()` renderer and existing accessible dialog; do not add set-specific popups.

Training also offers an image-only zoom when the player taps the exercise card. Reuse the shared dialog, hide all answer evidence in this mode, and preserve the exercise and focus when closing it. Other card entry points retain the full details below.

## Information order

1. Readable card image, name, and tier/rank once. Do not repeat the tier in the statistics section or prefix it with “Published”. Unrated cards stay explicitly unrated.
2. Available observed statistics: in-hand win rate, its game count, and average last-offered pick when supported. “Last seen · avg. pick” describes the source average, not a guarantee that the card will wheel. Omit missing metrics; never create placeholder statistics or turn expert grades into observed tiers.
3. A compact, expandable source line with format and capture date; expansion gives the provider link, player ranks and archetype scope. Keep Draft and Sealed attribution distinct.
4. Authored guidance, where available: “Best with” for enablers or deck context, and “Watch for” for the relevant limitation or rules trap. Prefer concrete conditions over praise. Do not restate rules already readable on the card or add generic role headings.
5. Useful card combinations may remain collapsed. Expert grades, full reviews, reviewer disagreements, generic editorial disclaimers and historical Sealed-footage transcripts do not belong in the popup. Preserve research/provenance in source files.

The Hobbit currently supplies observed statistics for all 188 cards. Reality Fracture additionally has validated authored guidance. Lack of authored guidance must not prevent displaying genuine statistics, and must not be filled with invented advice.

## Source contract and verification

The shared renderer accepts `observedRatings` provenance or complete `rating` provenance with `performance.format` and `performance.capturedAt`. Card-level `stats` supply `inHandWinRate`, `inHandGames`, and optional `avgLastOffered`. Retain sample sizes and source dates when refreshing data.

When adding a set, check both a rated and an unrated/missing-data card where applicable. Verify desktop and mobile layout, readable metric contrast, source expansion, keyboard dismissal and focus return. Draft decision cards must not reveal ranks or statistics before the pick is locked; Card memory must not reveal answer context. Run the card-detail assertions in `scripts/verify-observed-ratings.mjs`, build and the relevant lifecycle/data checks. Follow AGENTS.md delivery.
