# Limited Field Guides

A set-by-set Magic: The Gathering Limited preparation tool. Each set keeps its own visual world while sharing the same rating-training, pick-drill, and card-index tools.

## What it does

- Card rating training with browser-local progress
- Three-card pick drills with deterministic challenge links to share with friends
- A complete card index grouped by colour with in-place card magnification
- Honest preview mode when a set has cards but no attributable Limited ranking yet
- Keyboard, mouse, and touch support
- Offline static-asset cache
- No account, analytics, cookies, backend, or deck builder

Training progress stays only in the current browser through `localStorage`, including the current card, colour filter, queue, revealed answer, exact-tier score, and requeued misses. The service worker caches public site assets for offline use.

The current guides are:

- **The Hobbit** — complete 188-card observed Premier Draft ranking, with all prep modes available.
- **Reality Fracture** — live preview file; card training and browsing are available, while rating-dependent drills remain visibly locked until a complete evaluation is captured.

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
```

`scripts/build-data.mjs` regenerates `public/data.js` and the service-worker asset list from the captured JSON source files in `data/`.

To refresh a preview file from Scryfall:

```sh
node scripts/sync-preview.mjs fra
node scripts/build-data.mjs
node scripts/verify-data.mjs
```

Run `node scripts/sync-card-stats.mjs` to refresh the bundled Premier Draft statistics from Untapped.gg before rebuilding. This stores in-hand win counts and games, opening-hand counts and games, average last offered pick, and average pick taken for all 188 cards. The deployed site never calls Untapped.gg at runtime.

`scripts/sync-colors.mjs` refreshes the local color-identity mapping from Scryfall. `scripts/sync-training-images.mjs` downloads Scryfall's large card images for the trainer; pass `--force` to replace existing files. Run the image sync before `scripts/build-data.mjs` when refreshing the set. The deployed site does not call Scryfall at runtime.

Pick drill uses the readable local card images, while All cards keeps small local thumbnails quick and loads the readable image only when a card is enlarged. Readable images are runtime-cached rather than precached on first visit; if one is unavailable while offline, the UI falls back to the precached thumbnail.

Card images and names remain the property of their respective rights holders. This is an unofficial reference tool and is not affiliated with Wizards of the Coast or Untapped.gg.
