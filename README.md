# Limited Field Guides

A set-by-set Magic: The Gathering Limited preparation tool. Each set keeps its own visual world while sharing the same study, pick-drill, comparison, and card-index tools.

## What it does

- Card recognition study with browser-local progress
- Three-card pick drills with deterministic challenge links to share with friends
- Fuzzy, accent-insensitive comparison of plausible picks
- A complete card index grouped by colour
- Honest preview mode when a set has cards but no attributable Limited ranking yet
- Keyboard, mouse, and touch support
- Offline static-asset cache
- No account, analytics, cookies, backend, or deck builder

Study progress stays only in the current browser through `localStorage`, including the current card, colour filter, queue, revealed answer, exact-tier score, and requeued misses. A comparison stays in page memory and resets on refresh. The service worker caches public site assets for offline use.

The current guides are:

- **The Hobbit** — complete 188-card observed Premier Draft ranking, with all prep modes available.
- **Reality Fracture** — live preview file; study and browsing are available, while ranking-dependent drills remain visibly locked until a complete evaluation is captured.

## Run locally

```sh
python3 -m http.server 8080 --directory public
```

Open <http://localhost:8080>.

## Publish with GitHub Pages

1. Create an empty GitHub repository.
2. Add it as this directory’s remote and push the `main` branch.
3. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source.
4. The included workflow publishes the `public/` directory.

The live custom domain is `hobbit.orfeasa.com`, configured in GitHub Pages with a Namecheap `CNAME` record pointing to `orfeasa.github.io`.

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

Compare and All cards keep the small local thumbnails quick. Opening a card in Study loads its readable local image; that image is runtime-cached rather than precaching every high-resolution card on first visit. If it is unavailable while offline, Study falls back to the precached thumbnail.

Card images and names remain the property of their respective rights holders. This is an unofficial reference tool and is not affiliated with Wizards of the Coast or Untapped.gg.
