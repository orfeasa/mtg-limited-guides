# Repository working instructions

## Set lifecycle and UX

Read `docs/set-lifecycle.md` before adding a set, changing navigation, refreshing evidence, or changing milestone dates. `data/sets.json` owns milestone dates and confirmation evidence; `public/lifecycle.js` owns tab policy. Run `node scripts/verify-lifecycle.mjs` after rebuilding. Do not invent a data-availability date or unlock Training on a calendar milestone alone.

## Delivery default

After every user-requested change in this repository:

1. Verify the change with the relevant build, data, syntax, and browser checks.
2. Commit only the files belonging to that change.
3. Push the commit to the tracked remote branch.
4. Deploy the clean commit with `./bin/deploy`.
5. Verify the live site separately from the repository and deployment result.

Skip commit, push, or deployment only when the user explicitly asks to keep the change local or requests another delivery boundary. Never ship a change that fails verification; stop and report the failure instead.

## Card details

Read `docs/card-details.md` when adding a set or changing card popups. Every set must use the shared detail view with available source-backed statistics, concise authored guidance where available, and accessible desktop/mobile behavior.
