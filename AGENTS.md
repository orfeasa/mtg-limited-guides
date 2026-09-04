# Repository working instructions

## Delivery default

After every user-requested change in this repository:

1. Verify the change with the relevant build, data, syntax, and browser checks.
2. Commit only the files belonging to that change.
3. Push the commit to the tracked remote branch.
4. Deploy the clean commit with `./bin/deploy`.
5. Verify the live site separately from the repository and deployment result.

Skip commit, push, or deployment only when the user explicitly asks to keep the change local or requests another delivery boundary. Never ship a change that fails verification; stop and report the failure instead.
