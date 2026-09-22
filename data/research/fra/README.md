# Reality Fracture early evidence

Captured 2026-09-22. Research pilot only; not consumed by the website build or Training. Start with the source register below, then inspect `evidence.json` and `gameplay.md`.

## Source register and examination scope

| ID | Source | Author / dependency group | Examination |
| --- | --- | --- | --- |
| zone-green | [Green set review](https://mtgazone.com/reality-fracture-fra-limited-set-review-green/) | J2SJosh / j2sjosh | Read selected green entries; extracted six assessments with original 0–5 grades. |
| draftsim | [Limited set review](https://draftsim.com/mtg-fra-limited-set-review/) | Andrew Quinn / andrew-quinn | Read introduction, scale and eight selected card entries; original 0–10 grades. Initial impressions, not results. |
| tcc110 | [Shuffle Up & Play 110](https://www.youtube.com/watch?v=3r3md8snmJo) | Tolarian Community College / tcc110 | Read timestamped automatic captions for two Sealed games: 39:51–1:08:36 and 1:11:53–1:27:38. Ten selected sequences extracted. Video frames were not verified. |
| jim-deck | [Jim Davis pool](https://archidekt.com/decks/26640427/jim_davis_reality_fracture_sealed_pool) | TCC episode context / tcc110 | Examined published main deck and sideboard: 40 cards, 17 lands, 14 creatures. |
| kenji-deck | [Kenji Egashira pool](https://archidekt.com/decks/26640645/kenji_egashira_numotthenummy_reality_fracture_sealed_pool) | TCC episode context / tcc110 | Examined published main deck and sideboard: 40 cards, 16 lands, 14 creatures. |
| marshall-deck | [Marshall Sutcliffe pool](https://archidekt.com/decks/26640835/marshall_sutcliffe_reality_fractured_sealed_pool) | TCC episode context / tcc110 | Examined published main deck and sideboard: 40 cards, 17 lands, 13 creatures, one planeswalker. |

The episode description identifies main decks as played and sideboards as unused pools. These snapshots help resolve captions, not infer that every cut is bad. Decklists and multiple games from this episode are dependent context, not additional reviewers. Different bylines establish distinct attributed opinions, not proven statistical independence.

## Method and limits

The cohort deliberately includes cards appearing in the sampled games, one disagreement candidate, and extreme positive/negative review examples. It is not representative of all cards. Written reviews address Limited generally; neither provides separate Sealed grades here. Preserve each author's scale; dividing by its maximum does not make the scales comparable. No averaged rating, win rate, confidence percentage or tier is calculated.

`evidence.json` joins assessments and observations to canonical card IDs. Reviewer reasoning is a short paraphrase. Gameplay observations and our interpretations are separate. Timestamps are navigation anchors, not complete logs. The source transcript has misspelled names and unreliable speaker attribution; names were reconciled with decklists and the card file. Raw articles and full transcripts are not redistributed.

Repeated triggers are events in one game, not independent card-performance samples. The same Jim deck appears twice. Flooding, unfamiliarity with card text, unknown hands, production selection and opponent decisions prevent causal conclusions. A loss does not establish a card is weak; an unobserved card has missing gameplay evidence.

## What to surface on the website — proposal for discussion

Add an **Early assessments** section to existing card details. Keep the current navigation and rating Training gate. Show:

- A short contextual takeaway, with “review opinion” or “observed in Sealed”.
- Individual reviewer grades with their original scales and dates.
- Required support and important disagreements, rather than a blended score.
- An expandable evidence list with source links and gameplay timestamps.
- Coverage stated literally: two written reviewers, or one episode / two games. Do not call this high confidence.

Good pilot examples are a synergy-dependent card, a disagreement, and a shared negative assessment. The structured records permit those examples without publishing an unsupported set-wide ordering. Keep absent evidence absent; do not translate it to a low score. Once broad gameplay statistics arrive, show them separately by format and date.

Before implementation, decide whether these notes belong only in card details or also as a small filter in All cards. Recommendation: start in card details; useful context is more defensible than an early pick-order sort.

## Recheck

Run `node scripts/verify-early-evidence.mjs`. When adding material, record the actual examined scope, reviewer dependency group, original scale and direct locator. Revisit disagreements with additional independent reviews and games. This is a captured pilot, not automatic monitoring.
