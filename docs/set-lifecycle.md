# Set lifecycle and navigation

One policy applies to every set. The full card reveal, retail release, and usable ratings are different events. A date tells us when to check; imported and verified evidence determines what we can teach.

| State | Tabs in order | Default | Player task |
| --- | --- | --- | --- |
| Cards still being revealed | Previews | Previews | Browse newly revealed cards and catch up by date |
| Full card file confirmed, before retail release | Card memory (when supported), Prerelease prep, Archetypes, All cards | All cards | Browse the complete file; choose prep to learn mechanics, key cards, interactions, and how to build a deck |
| Retail released, ratings still pending | Card memory (when supported), Prerelease prep, Archetypes, All cards | All cards | Keep preparing from the complete file and authored guidance |
| Complete attributable ratings verified | Training, Card memory (when supported), Prerelease prep, Archetypes, All cards | Training | Practise ratings; retain rules and deck-building preparation |

Prerelease prep is optional: require the full card file plus a validated guide with `status: published` and a reached `publishedAt` date. All unrated sets open the card browser, whether or not a prep guide or archetypes exist. All cards offers “Preparing for prerelease? Start here” only when a published prep guide is available. Never publish an empty guide just to fill a tab. The name describes the preparation task, not an expiry date: retain this reference after release. Default to Sealed in prep unless a set explicitly configures `prepDefaultFormat` for its current player task; preserve explicit Draft links and Two-Headed Giant links (`format=2hg`) when authored team content exists, and never infer a player's format from the calendar. See [prep authoring](prep-authoring.md).

Archetypes requires a confirmed full card file, a sourced official map, verified signposts, and authored Draft/Sealed notes. If those are missing, omit the tab; the unrated default remains the card browser. Real archetype results can arrive separately from card ratings. Show their source, format, sample, and capture date only when present. Before then, explain pending results once; omit empty leader/sample ledgers.

Draft decisions is an optional tab between Archetypes and the card browser, available with Training and verified real pack-and-pool scenarios. Preserve the existing Hobbit replay and progress. A set with all capabilities has five tabs; mobile navigation wraps rather than compressing their labels.

## Dates and evidence

Training also supports a complete attributed expert review. Its heading identifies “Expert review” or “Observed draft data”. Expert review requires `reviewTraining` provenance, a reached `confirmedAt`, and a grade joined to that reviewer for every nonbasic card. Basic lands are excluded from the exercise. Original numerical scales are preserved; expert grades create no pick-order ranks, statistical tiers, or Draft decisions capability. The review snapshot has its own progress namespace. `ratingsConfirmedAt` continues to describe the ranked snapshot; FRA's observed ratings remain pending.

Reality Fracture expert review was verified on 2026-09-24 against J2SJosh’s complete MTGAZone assessments captured 2026-09-22. All 280 nonbasic cards are covered, including explicit land-cycle grades. Training asks for the original 0–5 grade and reveals both reviewers’ original assessments afterward. Grade labels summarize the source’s scale; they are not a merged evaluation. Both expert and observed Training open by default when their evidence is complete.

Expert Training accepts a 0.5 difference within the same displayed grade row as close and does not requeue it. Cross-row differences, differences greater than 0.5, and manual reveals are misses and return after three intervening cards. Exact-answer scoring remains exact, matching Hobbit's treatment of accepted close calls. Rendering and evaluation share the same row definitions; `scripts/verify-training-tolerance.mjs` checks all 121 numerical answer pairs and the Hobbit modifier boundaries.

A partial gameplay snapshot may appear only after an Expert Training answer as supplementary context for cards with a materially different early signal. It must name the format, capture date, sample and source, and must remain visibly provisional. Partial results do not create a new grade, tier, rank, ratings milestone or observed-Training capability; Draft results must not be presented as Sealed evidence.

`data/sets.json` is canonical:

- `previewEndsOn`: scheduled final reveal day; check the official gallery and sync the card file then. Reaching it does not prove completeness.
- `lifecycle.fullSetConfirmedAt`: actual day the repository's full card file was verified; null while incomplete. This unlocks authored Archetypes.
- `prereleaseDate`, `arenaDate`, `releaseDate`: published event dates; null or omitted when unknown. `releaseDate` means retail release, not full reveal.
- `lifecycle.ratingsConfirmedAt`: actual verification day of the currently published complete rating snapshot; null until usable. It is not a prediction or necessarily the first date ratings ever existed.
- `lifecycle.source`: official milestone/full-set evidence URL. Rating provenance remains in `rating.source`, `rating.url`, and `rating.capturedAt`.
- `prepFile`: optional authored guide file; its `publishedAt` is the verified content-publication day, not a prediction of when it will be ready. `authoredAt` records its review revision. Event dates remain in this manifest.

All dates use ISO YYYY-MM-DD. Calendar presentation changes at midnight UTC on page load. Previews becomes All cards when `lifecycle.fullSetConfirmedAt` confirms the complete file, even before retail release. Retail release alone does not change the tabs. A set may opt out of Card memory using `cardMemory: false` and name its reference with `prepLabel`. Reality Fracture now uses Limited guide with Draft as its configured default; explicit Sealed/2HG links remain valid. Neither release nor Arena launch enables Training. Complete-snapshot Training requires every indexed card to have a real rank/tier and source/capture provenance. Explicitly configured rated-card Training may use a verified subset, excluding unrated cards and disclosing its scope. A later tab open after a date change should reload the page. Stored progress survives hidden tabs and returns when the evidence is available.

The existing `stage` field is a descriptive snapshot (`preview`, `complete`, `observed`); it does not control navigation. `public/lifecycle.js` derives capabilities from dated evidence and actual content. Do not fork this logic per set, hardcode today's set into the app, or gate future ratings with permanent FRA-specific validation.

## Current milestones

| Set | Final scheduled reveal | Full file verified | Prerelease | Arena | Retail release | Current ratings verified |
| --- | --- | --- | --- | --- | --- | --- |
| Reality Fracture | 2026-09-18 | 2026-09-18 | 2026-09-25 | 2026-09-29 | 2026-10-02 | Pending |
| The Hobbit | Not recorded | 2026-09-08 | Not recorded | Not recorded | 2026-08-14 | 2026-09-20 |

These are a readable snapshot of the manifest, not a second configuration. Unknown historical dates are not guessed. No automatic fetch or monitoring service is implied by these dates; existing refresh workflows must check the milestones and update the evidence.

## UX rules

- Hide unavailable tabs completely. Do not show a disabled exercise, an unrated Training reader, empty scores, or progress-reset controls for browsing.
- Keep route IDs stable: `atlas` displays either Previews or All cards. Old `training`/`study` and unavailable mode links resolve to the set's useful default and rewrite the URL.
- Selecting a different set opens its useful default; explicit valid deep links retain their selected view and Draft/Sealed format.
- Use a short header status and the next known event date. Full reveal must stop saying the file is still expanding. Avoid repeating Preview on every card.
- Only incomplete preview sets show the catch-up rail. A complete file defaults to colour grouping. All card browsers support independent filtering, grouping, and sorting when the necessary metadata exists; rated sets also offer exact tiers. Missing type, rarity, or mana-value metadata must hide those choices rather than fabricate classifications.
- Omit basic lands from Previews/All cards, colour/tier counts, catch-up dates/counts, and the header card count. Keep nonbasic lands. Preserve the full imported card file and its completeness evidence; `browseCardCount` describes the browser scope, not source completeness.
- Keep local readable images, accessible card enlargement, focus return, touch/keyboard navigation, source links, and per-set progress.
- Preserve the existing themed shell. Stage changes alter available tasks and honest copy, not the entire visual language.

## Transition checklist

1. Check published dates and update their source; never treat an anticipated date as verified content.
2. Sync cards; verify scope, completeness, image coverage, and confirmation dates.
3. Author/review archetypes and the optional prep guide against the full file before publishing them. Verify every card reference, instant-speed restriction, exercise answer, and editorial rationale.
4. Import attributable ratings with explicit coverage; record verification and capture dates separately. Unrated cards are excluded from observed Training, never assigned fallback expert tiers.
5. Build and run data, lifecycle, and prep checks. Test direct links, default landing, set switching, visible tabs, keyboard navigation, card enlargement, desktop/mobile layout, and the existing rated set. For prep, test format isolation, filters, checklist reload, incorrect/correct answers, and retries.
6. Follow AGENTS.md delivery and independently verify the live UI and served files.

## Card memory

The separate `memory` view requires a confirmed full file and imported rules text for every card (an empty string is valid for a vanilla creature). It does not require or fabricate ratings. It leaves the default landing and rating Training gate unchanged. The game omits basic lands, uses three distinct rules-text choices from the file, normalizes self-references, and favours distractors of similar colour, type and cost. Art/name cues remain visible; answers reveal the complete image. Incorrect or skipped cards return after up to three other cards. Unique correct cards count once toward a finite run, saved separately per set and content revision. A completed run measures recognition rather than lasting mastery; another run is optional.

Archetype recall is an optional mode inside the already-gated Archetypes view, not rating Training. Its self-assessed progress is isolated per set and recall direction. Card memory study sets and answer-only context use existing authored metadata and imported rarity; no extra lifecycle gate or dates are introduced. Static HTML starts with neutral set copy and hides rating Training until the shared lifecycle resolver confirms it.

## Post-release tier browsing

Reality Fracture imports Untapped.gg's published Premier Draft / Bronze–Platinum / In Hand WR tiers with `python3 scripts/sync-observed-ratings.py fra`. The importer joins front-face names to stable full-card IDs and rejects missing or duplicate source coverage. It imports the published tiers without calculating grade boundaries; source low-volume cards keep null ranks and tiers. Rank describes source order among the guide's included cards; bonus-sheet cards outside the imported file are excluded. The snapshot preserves per-card samples, capture time and source-update time. Unchanged evidence does not rewrite timestamps.

`observedRatings` permits tier browsing independently of the complete-rating milestone. On 2 October the snapshot contains 266 published tiers out of 280 nonbasic cards, from 194,223 matches. Fourteen cards remain unrated. Training now uses the 266 published Untapped tiers, with the 14 unrated cards excluded. An explicit `observedTraining` configuration confirms this rated-card scope; it never sets the complete-snapshot `ratingsConfirmedAt` milestone. The tier browser opens grouped by tier and identifies coverage, source, sample, capture date and early-result uncertainty. The prerelease invitation is hidden after release; rules, interaction guidance and all authored formats remain available in Limited guide. Old memory links fall back to Training without deleting saved progress.

Refresh with the tier importer and `node scripts/sync-archetypes.mjs fra`, then rebuild and verify. Archetype imports match colour pairs independently of letter order, keep Draft/Sealed results separate, and do not rewrite unchanged snapshots. Follow AGENTS.md for delivery; preserve the previous valid snapshot when an import fails.

Rated-card Training requires `observedTraining.scope: "rated-cards"`, a reached `confirmedAt`, a dated attributable observed snapshot, exact agreement between declared and actual rated counts, and valid tiers/ranks with positive per-card samples. Observed Training takes precedence over expert Training. Progress is isolated by set and observed capture time so changed answers do not inherit a previous snapshot’s score. Concise authored guidance remains available after reveal; no expert grade is converted into a statistical tier. Draft decisions retain their separate complete-rating and replay-evidence gates.

All cards detail popups follow [the shared card-details contract](card-details.md) for existing and future sets.

All card-group headers use one explicit right-aligned count (for example, `8 cards` or `1 card`). This applies to tier, colour, type, rarity and ungrouped views across every set. Counts describe the currently visible cards after filtering; omit duplicate subtitle counts and rank ranges.
