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

Study scores stay only in the current browser through `localStorage`. A comparison stays in page memory and resets on refresh. The service worker caches public site assets for offline use.

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

`scripts/sync-colors.mjs` refreshes the local color-identity mapping from Scryfall. The deployed site does not call Scryfall at runtime.

Card images and names remain the property of their respective rights holders. This is an unofficial reference tool and is not affiliated with Wizards of the Coast or Untapped.gg.
