# Limited Field Guides

A set-by-set Magic: The Gathering Limited preparation tool. Each set keeps its own visual world while sharing archetype field notes, rating training, grounded draft decisions where evidence exists, and a complete card index.

## What it does

- Card rating training with browser-local progress
- Archetype recall in both directions and Card memory study sets, including essentials, interactions and repeatedly missed cards
- Official archetype plans interpreted against separate Premier Draft and Sealed observations
- Full-pack draft decisions that capture your independent pick and reason before revealing the historical line, statistical baseline, and an authored takeaway
- A complete card index grouped by colour or, for rated sets, exact tier, with in-place card magnification
- Honest preview mode when a set has cards but no attributable Limited ranking yet
- Keyboard, mouse, and touch support
- Offline static-asset cache
- No required account, analytics, cookies, or deck builder

Preparation progress stays only in the current browser through `localStorage`, including the current training card, colour filter, queue, revealed answer, exact-tier score, requeued misses, and each draft decision's pick, reason, reveal state, and reflection. The service worker caches public site assets for offline use.

The current guides are:

- **The Hobbit** — five official archetype plans with separate Draft and Sealed field data, a complete 188-card observed Premier Draft ranking refreshed from 750,000 matches, and 18 real draft decisions from a public 17Lands 7–2 replay.
- **Reality Fracture** — complete card file with Sealed prerelease preparation, active archetype recall, filtered Card memory and an interaction watchlist; rating training remains unavailable until a complete attributable evaluation is captured.

## Run locally

```sh
python3 -m http.server 8080 --directory public
```

Open <http://localhost:8080>.

## Deploy

The public site is `https://limited.orfeasa.com` and is served by nginx on `birthday.orfeasa.com`. The GitHub repository can remain private because production receives only an archive of the committed `public/` tree; it does not clone the repository or hold GitHub credentials.

Deploy a clean, committed checkout with:

```sh
./bin/deploy
```

The command rebuilds and verifies the generated data, refuses stale or uncommitted output, creates an immutable release under `/home/orfeas/apps/mtg-limited-guides/releases/<commit>`, and atomically switches the `current` symlink. The checked-in nginx configuration is in `deploy/nginx/`.

The former `hobbit.orfeasa.com` hostname is retired rather than redirected. Browser-local progress is intentionally not transferred between domains.

## Build and verify the data

```sh
node scripts/build-data.mjs
node scripts/verify-data.mjs
node scripts/verify-lifecycle.mjs
node scripts/verify-prep.mjs
node scripts/verify-memory.mjs
node scripts/verify-archetype-study.mjs
```

`scripts/build-data.mjs` regenerates `public/data.js` and the service-worker asset list from the captured JSON source files in `data/`.

Each new set's archetypes start from `data/archetypes.template.json`. Author the official plan and format-specific field notes, add `archetypesFile` to the set manifest, then capture the current Draft and Sealed observations with:

```sh
node scripts/sync-archetypes.mjs hob
node scripts/build-data.mjs
node scripts/verify-data.mjs
```

The sync retains all ten two-colour pairs, so an unsupported combination can still surface when it matters—especially in Sealed. The complete evidence and editorial workflow is documented in [`docs/archetype-methodology.md`](docs/archetype-methodology.md).

To refresh a preview file from Scryfall:

```sh
node scripts/sync-preview.mjs fra
node scripts/build-data.mjs
node scripts/verify-data.mjs
```

Run `node scripts/sync-card-stats.mjs` to refresh the bundled Premier Draft statistics from Untapped.gg before rebuilding. This stores in-hand win counts and games, opening-hand counts and games, average last offered pick, and average pick taken for all 188 cards. Refresh `data/hobbit_pick_order.json` from the matching Untapped In Hand WR tier view at the same time. The deployed site never calls Untapped.gg at runtime.

The Hobbit decision states are stored in `data/hobbit_draft_decisions.json`. They preserve real pack contents, previous picks, the historical replay pick, and an authored lesson for each comparison. The replay is fixed: a player's choices do not rewrite later historical pools. Rankings, tiers, win rates, and replay hints stay hidden until the player chooses a card, records the main reason, and locks the decision. Because 17Lands records the choice rather than the drafter's reasoning, each replay explanation is displayed as an editorial inference from the draft state and Scryfall card text. The revealed review keeps that inference separate from the bundled rank-only statistical baseline, asks whether the comparison changed the player's judgement, and ends with a non-scored reasoning summary. Reality Fracture has no Draft decisions tab until equivalent grounded evidence exists.

`scripts/sync-colors.mjs` refreshes the local color-identity mapping from Scryfall. `scripts/sync-training-images.mjs` downloads Scryfall's large card images for the trainer; pass `--force` to replace existing files. Run the image sync before `scripts/build-data.mjs` when refreshing the set. The deployed site does not call Scryfall at runtime.

Training and Draft decisions use the readable local card images, while All cards keeps small local thumbnails quick and loads the readable image only when a card is enlarged. Readable images are runtime-cached rather than precached on first visit; if one is unavailable while offline, the UI falls back to the precached thumbnail.

Card images and names remain the property of their respective rights holders. Draft replay states are attributed and linked to 17Lands. This is an unofficial reference tool and is not affiliated with Wizards of the Coast, Untapped.gg, or 17Lands.
