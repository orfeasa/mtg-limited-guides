# Set lifecycle and navigation

One policy applies to every set. The full card reveal, retail release, and usable ratings are different events. A date tells us when to check; imported and verified evidence determines what we can teach.

| State | Tabs in order | Default | Player task |
| --- | --- | --- | --- |
| Cards still being revealed | Previews | Previews | Browse newly revealed cards and catch up by date |
| Full card file confirmed, before retail release | Prerelease prep, Archetypes, All cards | Prerelease prep | Learn mechanics, key cards, interactions, and how to build a deck |
| Retail released, ratings still pending | Prerelease prep, Archetypes, All cards | Prerelease prep | Keep preparing from the complete file and authored guidance |
| Complete attributable ratings verified | Training, Prerelease prep, Archetypes, All cards | Training | Practise ratings; retain rules and deck-building preparation |

Prerelease prep is optional: require the full card file plus a validated guide with `status: published` and a reached `publishedAt` date. If unavailable, use Archetypes, then the card browser. Never publish an empty guide just to fill a tab. The name describes the preparation task, not an expiry date: retain this reference after release. Default to Sealed in prep, preserve explicit Draft links, and never infer a player's format from the calendar. See [prep authoring](prep-authoring.md).

Archetypes requires a confirmed full card file, a sourced official map, verified signposts, and authored Draft/Sealed notes. If those are missing, omit the tab and default to the card browser. Real archetype results can arrive separately from card ratings. Show their source, format, sample, and capture date only when present. Before then, explain pending results once; omit empty leader/sample ledgers.

Draft decisions is an optional tab between Archetypes and the card browser, available with Training and verified real pack-and-pool scenarios. Preserve the existing Hobbit replay and progress. A set with all capabilities has five tabs; mobile navigation wraps rather than compressing their labels.

## Dates and evidence

`data/sets.json` is canonical:

- `previewEndsOn`: scheduled final reveal day; check the official gallery and sync the card file then. Reaching it does not prove completeness.
- `lifecycle.fullSetConfirmedAt`: actual day the repository's full card file was verified; null while incomplete. This unlocks authored Archetypes.
- `prereleaseDate`, `arenaDate`, `releaseDate`: published event dates; null or omitted when unknown. `releaseDate` means retail release, not full reveal.
- `lifecycle.ratingsConfirmedAt`: actual verification day of the currently published complete rating snapshot; null until usable. It is not a prediction or necessarily the first date ratings ever existed.
- `lifecycle.source`: official milestone/full-set evidence URL. Rating provenance remains in `rating.source`, `rating.url`, and `rating.capturedAt`.
- `prepFile`: optional authored guide file; its `publishedAt` is the verified content-publication day, not a prediction of when it will be ready. `authoredAt` records its review revision. Event dates remain in this manifest.

All dates use ISO YYYY-MM-DD. Calendar presentation changes at midnight UTC on page load. Previews becomes All cards when `lifecycle.fullSetConfirmedAt` confirms the complete file, even before retail release. Retail release does not change the tabs. Neither release nor Arena launch enables Training: every indexed card must have a real rank/tier and the source and capture date must be present. A later tab open after a date change should reload the page. Stored progress survives hidden tabs and returns when the evidence is available.

The existing `stage` field is a descriptive snapshot (`preview`, `complete`, `observed`); it does not control navigation. `public/lifecycle.js` derives capabilities from dated evidence and actual content. Do not fork this logic per set, hardcode today's set into the app, or gate future ratings with permanent FRA-specific validation.

## Current milestones

| Set | Final scheduled reveal | Full file verified | Prerelease | Arena | Retail release | Current ratings verified |
| --- | --- | --- | --- | --- | --- | --- |
| Reality Fracture | 2026-09-18 | 2026-09-18 | 2026-09-25 | 2026-09-29 | 2026-10-02 | Pending |
| The Hobbit | Not recorded | 2026-09-08 | Not recorded | Not recorded | 2026-08-14 | 2026-09-17 |

These are a readable snapshot of the manifest, not a second configuration. Unknown historical dates are not guessed. No automatic fetch or monitoring service is implied by these dates; existing refresh workflows must check the milestones and update the evidence.

## UX rules

- Hide unavailable tabs completely. Do not show a disabled exercise, an unrated Training reader, empty scores, or progress-reset controls for browsing.
- Keep route IDs stable: `atlas` displays either Previews or All cards. Old `training`/`study` and unavailable mode links resolve to the set's useful default and rewrite the URL.
- Selecting a different set opens its useful default; explicit valid deep links retain their selected view and Draft/Sealed format.
- Use a short header status and the next known event date. Full reveal must stop saying the file is still expanding. Avoid repeating Preview on every card.
- Only incomplete preview sets show the catch-up rail. A complete file uses ordinary colour browsing; rated sets also offer exact tiers.
- Keep local readable images, accessible card enlargement, focus return, touch/keyboard navigation, source links, and per-set progress.
- Preserve the existing themed shell. Stage changes alter available tasks and honest copy, not the entire visual language.

## Transition checklist

1. Check published dates and update their source; never treat an anticipated date as verified content.
2. Sync cards; verify scope, completeness, image coverage, and confirmation dates.
3. Author/review archetypes and the optional prep guide against the full file before publishing them. Verify every card reference, instant-speed restriction, exercise answer, and editorial rationale.
4. Import attributable ratings only when complete; record verification and capture dates separately.
5. Build and run data, lifecycle, and prep checks. Test direct links, default landing, set switching, visible tabs, keyboard navigation, card enlargement, desktop/mobile layout, and the existing rated set. For prep, test format isolation, filters, checklist reload, incorrect/correct answers, and retries.
6. Follow AGENTS.md delivery and independently verify the live UI and served files.
