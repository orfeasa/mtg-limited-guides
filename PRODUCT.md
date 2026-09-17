# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and JavaScript served by nginx. A separate backend exists, but this deployment exposes no API path for Limited Field Guides; the current exercise data is bundled and progress remains local.

## Users

Magic: The Gathering players preparing for prereleases and drafts who want to learn a set before the event, practise decisions, and share the same exercises with friends.

## Product Purpose

Turn each new set into a focused Limited field guide. Success means a player can recognise cards, understand the set's intended decks, distinguish Draft signals from Sealed pool-building, understand which information is settled or provisional, and practise decisions that preserve the pack and drafted-pool context of a real draft.

## Positioning

The product is a reusable preparation shelf rather than a generic stats dashboard. Every set gets an authored thematic treatment, while the underlying study habits and trustworthy data boundaries stay consistent.

## Operating Context

Used in the days before a prerelease or draft, alone or with friends. A player may train exact-tier recall, work through a grounded draft state, or browse and enlarge cards from the set. The interaction must work well with keyboard, mouse, and touch.

## Capabilities and Constraints

- Support multiple sets through a shared static data contract.
- Give each set a distinct visual theme without changing the core navigation.
- Open the latest set by default while preserving direct links to any set.
- Make Training and All cards the stable preparation modes; add Archetypes once the official plan map and format observations are authored, and Draft decisions only to sets with grounded pack-and-pool evidence.
- Keep official archetype intent, observed results, and editorial guidance visibly distinct.
- Preserve separate Premier Draft and Sealed observations, including all ten two-colour pairs and their sample sizes.
- Keep rating-dependent training absent when a complete, attributable Limited evaluation is unavailable.
- Store preparation progress per set in browser-local storage.
- Preserve the current training card, colour filter, exact-tier score, remaining queue, revealed answer, and requeued misses across browser sessions.
- Preserve the current draft decision and reviewed-decision count without turning the exercise into a score.
- Show the complete pack and drafted pool before a pick, then separate the player's choice, the historical replay pick, and the current raw-data leader.
- Explain why the rank calculation produced the data leader, and label any replay-pick rationale as editorial inference because the replay records the choice rather than the drafter's intent.
- Show attributable card-performance evidence after a Hobbit answer without exposing it before the guess.
- Browse rated sets in All cards by colour or exact tier, then enlarge a card in place without changing views.
- No cookies, analytics, required account, or deck-builder framing.
- Deploy as an atomic static release and remain useful if installed or revisited offline.
- Preserve source attribution and capture dates for every ranking or preview snapshot.

## Evidence on Hand

- The Hobbit: five official archetype plans from the Wizards prerelease guide; separate 17Lands Premier Draft and Sealed two-colour observations captured on 8 September 2026; verified 188-card pick-order and performance snapshots captured from Untapped.gg on 17 September 2026 across 750,000 matches; matching local thumbnail/readable image pairs; and 18 real pack-and-pool states from a public 17Lands 7–2 Premier Draft replay.
- Reality Fracture: current Scryfall preview index and local thumbnail/readable image pairs, without invented Limited ratings.
- Official Reality Fracture release milestones and Play Booster notes captured in set metadata.

## Product Principles

- Preparation, not deck construction, is the primary job.
- Every interaction should improve card recognition or decision fluency.
- Archetypes are plans to test against a draft lane or opened pool, not instructions to force a colour pair.
- Rankings are a baseline; grounded decisions must expose what came from current aggregate data, what the historical drafter took, and what still requires contextual judgement.
- Unknown and incomplete information stays visibly unknown.
- The tool should remain private by default, easy to share by link, and operational without an account.

## Accessibility & Inclusion

Keyboard-operable controls, visible focus states, semantic status updates, sufficient contrast, reduced-motion support, and touch targets suitable for mobile drafting.
