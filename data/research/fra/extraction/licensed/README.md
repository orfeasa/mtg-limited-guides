# Licensed source extraction

This directory contains the actual review prose and available video captions, not only passage hashes or numerical grades. It is research-only and is not loaded by the website. Website presentation and cross-source synthesis remain deferred.

## Permission

The user reports permission from all relevant sources, including storage in Git, provided the material is not used to make a profit. See [permissions.json](permissions.json) for the exact statements and limits of the record. No formal license identifier, license document or expiry was supplied. We retain attribution and use this material only for noncommercial research. Do not treat it as licensed under any general repository software license.

## Contents and coverage

| Material | Retained |
| --- | --- |
| Main-set card assessments | 560 full-text reviewer/card records covering all 280 nonbasic cards |
| Individual card passages | 265 cards have an individual passage from each written reviewer |
| Shared land-cycle passages | 15 lands use explicit cycle commentary from each reviewer; scope remains marked |
| Written reviews | Eight documents, two reviewer groups, 534 unique card/cycle sections, 1,117 review paragraphs |
| Article context | 2,516 text blocks, including introductions, original grading scales, mechanics, archetypes, examples and conclusions |
| Special Guests | Ten additional Draftsim reviews retained separately, outside the main-set completeness claim |
| Videos | Four available automatic-caption exports, 6,543 timestamped segments |
| Card/video joins | 156 exact-name mentions across 70 cards, plus the previously reviewed claim references |
| Episode decklists | Jim, Kenji and Marshall: 40-card main decks and 58 / 59 / 56 sideboard cards respectively |

[card-evidence.json](card-evidence.json) is the card-by-card starting point. Each card has both authors' full assessment text, original grade/scale, heading, date, source URL, paragraph IDs and individual/cycle scope. It also links to exact-name transcript mentions and the earlier manually reviewed video claims and card relationships. The complete paragraphs preserve strengths, drawbacks, comparisons, conditions and uncertainty without deciding which sentences deserve inclusion in a short summary.

The full documents are in [articles/](articles/), and captions in [transcripts/](transcripts/). [decklists.json](decklists.json) retains names, quantities, categories and zones, without unrelated account/profile or pricing data. Published unused pools are not evidence that each cut card is bad.

## Source register

| ID | Source | Captured material |
| --- | --- | --- |
| draftsim | [Andrew Quinn: full Limited review](https://draftsim.com/mtg-fra-limited-set-review/) | All card/cycle prose, ten Special Guests and article context |
| zone-white | [J2SJosh: white](https://mtgazone.com/reality-fracture-fra-limited-set-review-white/) | All card prose and article context |
| zone-blue | [J2SJosh: blue](https://mtgazone.com/reality-fracture-fra-limited-set-review-blue/) | All card prose and article context |
| zone-black | [J2SJosh: black](https://mtgazone.com/reality-fracture-fra-limited-set-review-black/) | All card prose and article context |
| zone-red | [J2SJosh: red](https://mtgazone.com/reality-fracture-fra-limited-set-review-red/) | All card prose and article context |
| zone-green | [J2SJosh: green](https://mtgazone.com/reality-fracture-fra-limited-set-review-green/) | All card prose and article context |
| zone-multicolor | [J2SJosh: multicolor](https://mtgazone.com/reality-fracture-fra-limited-set-review-multicolor/) | All card prose and article context |
| zone-artifacts-and-lands | [J2SJosh: artifacts and lands](https://mtgazone.com/reality-fracture-fra-limited-set-review-artifacts-and-lands/) | All card/cycle prose and article context |
| nicolai-guide | [NicolaiBolas: draft guide](https://www.youtube.com/watch?v=zNKov5PyYCg) | 1,280 caption segments, 0:00–34:24; video duration 34:28 |
| llu261 | [Limited Level-Ups 261](https://www.youtube.com/watch?v=I1PPajMb938) | 999 caption segments, 0:00–32:57; video duration 33:02 |
| tcc110 | [Tolarian Community College: Shuffle Up & Play 110](https://www.youtube.com/watch?v=3r3md8snmJo) | 3,655 caption segments, 0:00–1:43:44; video duration 1:43:48 |
| nicolai-prerelease | [NicolaiBolas: prerelease preview](https://www.youtube.com/watch?v=aJk9RSiccW4) | 609 caption segments, 0:00–16:50; video duration 16:51 |
| jim-deck | [Jim Davis pool](https://archidekt.com/decks/26640427) | Full published card list and categories |
| kenji-deck | [Kenji Egashira pool](https://archidekt.com/decks/26640645) | Full published card list and categories |
| marshall-deck | [Marshall Sutcliffe pool](https://archidekt.com/decks/26640835) | Full published card list and categories |

The two Nicolai videos share one reviewer group. MTGAZone's seven articles share one reviewer group. TCC decklists and the episode are dependent context. These counts are not independent performance samples.

## Acquisition gaps

- **Limited Resources 872:** the [official episode page](https://lrcast.com/limited-resources-872-reality-fracture-set-review-commons-and-uncommons/) and [4:41:58 YouTube video](https://www.youtube.com/watch?v=mLABrUxyTKw) are accessible. Caption export returned no transcript after the player loaded. Its chapter boundaries are saved in `additional-sources.json`; audio content has not been transcribed and contributes no card assessment.
- **LoadingReadyRun PrePreRelease:** a verified archive was not located. Preview discussion and the North 100 review were not substituted for Sealed gameplay.

These are acquisition gaps, not licensing objections. No material from these unextracted sources is counted in coverage.

## Integrity and interpretation

The 1,117 imported review paragraphs must match every hash and locator in the earlier index. Full text is retained after whitespace, HTML/entity and citation-wrapper normalization; editorial wording and source errors are not silently corrected. Advertisements, shopping controls, navigation, image bytes and comment sections are excluded. Article blocks retain lists and headings, not just paragraphs.

Canonical card joins use the existing grade extraction's verified names and explicit cycle membership. The original source heading remains intact, including the Draftsim “Crytheory Adept” typo. No automatic reassignment to similarly named echoed or prepared cards occurs.

Captions are automatic and may garble card names or omit speech. All available segments are retained, but this does not imply a human reviewed every game or verified video frames. Name matching spans caption boundaries but deliberately does not guess phonetic aliases. The 156 matches are a lower bound on mentions, not an exhaustive semantic map. The two historically annotated games remain the only manually analysed gameplay sample.

Original source text is distinct from our opinion: `extraction: full-source-prose` does not mean we endorse the review. Cross-source reconciliation, contradiction adjudication, role taxonomy and website copy are later work. Original scales are never averaged.

## Use and reproduce

Read one card, with both complete opinions and caption context:

```sh
node scripts/read-research-card.mjs 'Greenhouse Propagator'
```

Rebuild card joins from the committed source records, then verify:

```sh
node scripts/build-research-corpus.mjs
node scripts/verify-licensed-research.mjs
```

Re-import the examined capture snapshots when the original local inputs are available:

```sh
python3 -B scripts/extract-licensed-reviews.py --captures /tmp --transcripts /path/to/caption/exports
python3 -B scripts/extract-research-decklists.py --captures /tmp
```

Article input hashes must match the saved capture provenance. The source snapshots remain dated 2026-09-22; rerunning the builder does not refresh the sources. The checks verify exact paragraph retention, two distinct reviewer groups per card, cycle scope, caption ordering/end coverage, cross-references, canonical deck names and quantities. They do not validate every reviewer opinion or correct ASR errors.
