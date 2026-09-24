> Website teaching now uses the [curated teaching layer](teaching/README.md) and complete card review passages. Historical extraction-first notes below describe earlier delivery boundaries.
> Update, 24 September: Training now uses J2SJosh’s original 0–5 grades as an explicitly attributed expert-review exercise. The earlier notes below about keeping reviews outside Training describe the previous product boundary. No averaged score, empirical tier or pick-order rank is produced.

# Reality Fracture early evidence

Captured 2026-09-22. **Full licensed extraction:** see [the research corpus](extraction/licensed/README.md) for 560 complete reviewer/card assessments, four caption exports, article context and three decklists. Website changes and synthesis are deferred.

Attributed source records are in `sources/`; our rules-based combination synthesis is in `synthesis.json`. The website consumes both through a validated `earlyEvidence` payload. See [coverage.md](coverage.md) for the exact boundaries and [coverage.json](coverage.json) for all 280 card joins.

## Extraction-first follow-up

The user has deferred further website work, including the question of a separate tab. The [licensed corpus](extraction/licensed/README.md) now retains the actual full assessment passages from both written reviewers for every main-set nonbasic card, alongside source context and captions. The earlier [passage index](extraction/README.md) remains as an integrity baseline. No public assets change in this pass.

## Source register and examination scope

| Source | Reviewer / dependency group | Examined and persisted |
| --- | --- | --- |
| [Draftsim full review](https://draftsim.com/mtg-fra-limited-set-review/) | Andrew Quinn / andrew-quinn | All 280 main-set nonbasic grades on the original 0–10 scale; selected explanations. `sources/draftsim.json`. |
| MTGAZone: [white](https://mtgazone.com/reality-fracture-fra-limited-set-review-white/), [blue](https://mtgazone.com/reality-fracture-fra-limited-set-review-blue/), [black](https://mtgazone.com/reality-fracture-fra-limited-set-review-black/), [red](https://mtgazone.com/reality-fracture-fra-limited-set-review-red/), [green](https://mtgazone.com/reality-fracture-fra-limited-set-review-green/), [multicolor](https://mtgazone.com/reality-fracture-fra-limited-set-review-multicolor/), [artifacts and lands](https://mtgazone.com/reality-fracture-fra-limited-set-review-artifacts-and-lands/) | J2SJosh / j2sjosh | All 280 grades on the original 0–5 scale. Seven articles count as one reviewer. `sources/zone-*.json`. Selected green explanations in the pilot. |
| [Reality Fracture Draft Guide](https://www.youtube.com/watch?v=zNKov5PyYCg) | NicolaiBolas / nicolaibolas | Entire automatic transcript read; 25 selected timestamped claims: ten archetypes and fifteen common recommendations. `sources/nicolai-guide.json`. |
| [Limited Level-Ups 261](https://www.youtube.com/watch?v=I1PPajMb938) | Limited Level-Ups / limited-level-ups | Entire automatic transcript read; 16 selected timestamped claims covering ten archetypes, card opinions and combinations. `sources/llu261.json`. |
| [Shuffle Up & Play 110](https://www.youtube.com/watch?v=3r3md8snmJo) | Tolarian Community College / tcc110 | Captions for two Sealed games: 39:51–1:08:36 and 1:11:53–1:27:38. Ten selected narrated sequences. Frames unverified. `sources/tcc110.json` and [gameplay.md](gameplay.md). |
| [Jim Davis pool](https://archidekt.com/decks/26640427/jim_davis_reality_fracture_sealed_pool), [Kenji Egashira pool](https://archidekt.com/decks/26640645/kenji_egashira_numotthenummy_reality_fracture_sealed_pool), [Marshall Sutcliffe pool](https://archidekt.com/decks/26640835/marshall_sutcliffe_reality_fractured_sealed_pool) | TCC episode context / tcc110 | Published main decks and sideboards examined to resolve captions. Context, not three extra reviewers; counts retained in `gameplay.md`. |

The earlier shortlist also included NicolaiBolas’s prerelease preview (same reviewer), Limited Resources 872, and LoadingReadyRun’s PrePreRelease. They remain candidates, not extracted sources. MyLimitedGrades did not expose an attributable dataset in the inspected page and contributes no vote. Discovery is not examination.

## Extraction and reconciliation

Written-review heading/rating pairs were extracted from the retrieved Draftsim HTML and indexed MTGAZone article text, then joined by normalized card name to `fra_preview.json`. Prepared-card headings map to the creature face. The source typo “Crytheory Adept” maps to “Cryotheory Adept”; the original heading remains in the locator. Explicitly rated land cycles expand to their members with `scope: cycle`, preserving the group heading. Special Guests named by Draftsim remain explicitly excluded from this main-set cohort. Capture hashes identify the examined extracts; raw articles and full transcripts are not redistributed.

Source records retain author, URL, capture date, format, original scale, scope and locator. `evidence.json` is the historical pilot: its fourteen grades are checked against the full extraction, and its short explanations are imported without counting duplicate votes. The ten gameplay observations are canonical in `sources/tcc110.json`; the pilot remains unchanged for audit history.

`synthesis.json` contains our own practical explanations. Reviewer archetype advice informs the lesson; it does not imply that the reviewer explicitly tested every exact pairing. Each combination identifies its supporting claims separately from any actual narrated game sequence. Card rules were checked against the canonical card file, including mana restrictions, finality, once-per-turn triggers and loyalty activation limits. The GU lesson explicitly requires additional loyalty: empower seven is insufficient for minus eight.

## Coverage and limits

Every one of the 280 nonbasic main-set cards has a grade from two distinct bylines. This paragraph describes the existing website payload. The separate licensed research corpus now also has both reviewers’ complete narrative passages; gameplay analysis remains selective. Extracted notes mention 56 cards; sampled games mention 16. All ten archetypes have advice from both video reviewers. Twelve combinations are authored; ten have recall questions.

Preserve the original scales. Neither a mean nor dividing by the maximum establishes comparable meanings, confidence, win rate or a pick order. No numerical consensus, empirical tier or Training unlock is produced. Reviews cover Draft or general Limited; these are not separate Sealed grades. Sealed sample selection, repeated decks, unknown hands and automatic-caption errors preclude causal strength claims. An unobserved card has missing gameplay evidence, not a low score.

## Existing website presentation — further decisions deferred

Primary task: learn the set before an event. Keep existing tabs.

- **Prerelease prep:** ten optional colour-pair lessons with readable card images, a practical requirement, a recall question and expandable attribution. The Two-Headed Giant guide remains separate.
- **Archetypes:** expand early reviewer advice and applicable combinations within each existing archetype.
- **Card details:** individual original grades for every nonbasic card; extracted explanations, combinations and narrated footage where available. Missing explanations are stated explicitly. Source links include article text locators or video timestamps.

This evidence is separate from rating Training and does not become a memorisation target. Card-memory previews retain their existing answer flow.

## Recheck and extension

Run `node scripts/verify-early-evidence.mjs`, `node scripts/verify-evidence-coverage.mjs`, then the normal build/lifecycle/data/UI checks. Add new records under `sources/`, reuse reviewer dependency groups, and link synthesis to stable IDs. Regenerate `coverage.json` using `compileEarlyEvidence(...).coverage` when records change. The build checks all joins before publication. This is a dated snapshot, not automatic monitoring.
