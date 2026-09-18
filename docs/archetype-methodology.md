# Archetype methodology

Archetypes are a practical map of a Limited format, not a colour-pair tier list. Every set guide should help a player answer three questions:

1. What is each supported deck trying to do?
2. What evidence tells me that the plan is actually coming together?
3. How should my use of that plan change between Draft and Sealed?

## Evidence layers

Keep these layers distinct in both the source data and the interface.

### 1. Official intent

Start with an attributable Wizards of the Coast set, mechanics, or prerelease guide. Record the supported colour pairs, their named theme or mechanic, and the cards Wizards uses to signpost the plan.

This establishes the format's intended lanes. It does not establish which lane is strongest, whether it is open in a Draft, or whether a Sealed pool can support it.

### 2. Observed results

Capture the 17Lands two-colour deck rows separately for Premier Draft and Sealed. Store wins, games, win rate, overall rank, supported-archetype rank, total two-colour games, and the share of games in officially supported pairs.

Retain all ten two-colour pairs. Unsupported pairs are useful evidence: a strong off-map Sealed combination may be a real pool-building option, and hiding it would make the guide less useful.

Always show sample size beside win rate. Treat small samples as directional rather than settled; avoid strong editorial claims below 1,000 games. Do not compare an absolute Draft win rate with an absolute Sealed win rate as if the populations and play patterns were interchangeable.

### 3. Editorial field notes

For each supported archetype, author:

- a one-sentence plan describing how its resources become a win;
- exactly three structural priorities, ordered from foundation to finish;
- at least two verified signpost cards from the set file;
- one Draft note about signals, density, or commitment;
- one Sealed note about the pool evidence needed to build the deck.

The notes should interpret the evidence without turning aggregates into instructions. “This pair performed best” is an observation; “force this pair” is not a useful conclusion.

## Data contract

Copy `data/archetypes.template.json` to a set-specific file and add its filename as `archetypesFile` in `data/sets.json`.

The top-level `status` describes the editorial state:

- `provisional` once the official map, signposts, and field notes are publication-ready but one or both observed format snapshots are still pending;
- `observed` once both format snapshots and all field notes have been checked.

A provisional guide may be published before play begins. It must omit leaders, ranks, win rates, and samples, and say plainly that observations are pending. Never use zero games as if it were a result.

Each format has its own source context, guidance, and `observed` snapshot. The sync script replaces only that snapshot; it does not overwrite the official source or editorial notes.

## New-set workflow

1. Copy the template and replace the set code, official source, source URLs, supported archetypes, priorities, signposts, and format notes.
2. Add `archetypesFile` to the set manifest.
3. Confirm every signpost name exactly matches a card in the set's card file.
4. Once 17Lands exposes both formats, capture the observations:

   ```sh
   node scripts/sync-archetypes.mjs <set-id>
   ```

5. Build and verify the complete data contract:

   ```sh
   node scripts/build-data.mjs
   node scripts/verify-data.mjs
   ```

6. Review both Draft and Sealed in the browser at desktop and mobile widths. Check that the format switch, archetype anchors, card lightbox, source links, direct URL state, keyboard focus, and unsupported leading pair all remain understandable.
7. Commit, push, deploy, and verify the public site separately.

## Refresh policy

Refresh observations when the format has materially more play, after a balance or collation change, or before an event where stale guidance would be misleading. The captured timestamp must travel with the data. If one format is unavailable, keep that format visibly pending rather than copying the other format's results or inventing a conclusion.
