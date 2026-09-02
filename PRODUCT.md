# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and JavaScript served by nginx. No framework or runtime backend.

## Users

Magic: The Gathering players preparing for prereleases and drafts who want to learn a set before the event, practise decisions, and share the same exercises with friends.

## Product Purpose

Turn each new set into a focused Limited field guide. Success means a player can recognise cards, understand which information is settled or provisional, rehearse baseline picks, and send a friend the exact same challenge without being handed a finished deck.

## Positioning

The product is a reusable preparation shelf rather than a generic stats dashboard. Every set gets an authored thematic treatment, while the underlying study habits and trustworthy data boundaries stay consistent.

## Operating Context

Used in the days before a prerelease or draft, alone or with friends. A player may study revealed cards, practise exact tiers, attempt deterministic pick drills, compare a few plausible cards, or browse the set. The interaction must work well with keyboard, mouse, and touch.

## Capabilities and Constraints

- Support multiple sets through a shared static data contract.
- Give each set a distinct visual theme without changing the core navigation.
- Make Study, Pick drill, Compare, and All cards the stable preparation modes.
- Keep rating-dependent answers locked when a complete, attributable Limited evaluation is unavailable.
- Preserve deterministic challenge URLs so friends can attempt the same three-card choice.
- Store preparation progress per set in browser-local storage; keep comparisons session-only.
- Preserve the current study card, colour filter, exact-tier score, remaining queue, revealed answer, and requeued misses across browser sessions.
- Show attributable card-performance evidence after a Hobbit answer without exposing it before the guess.
- Fuzzy, accent-insensitive name search.
- No cookies, analytics, account, backend, deck builder, or external runtime dependency.
- Deploy as an atomic static release and remain useful if installed or revisited offline.
- Preserve source attribution and capture dates for every ranking or preview snapshot.

## Evidence on Hand

- The Hobbit: verified 188-card pick-order snapshot captured from Untapped.gg on 19 August 2026, an observed card-performance snapshot captured on 20 August 2026, and matching local thumbnail/readable image pairs.
- Reality Fracture: current Scryfall preview index and local thumbnail/readable image pairs, without invented Limited ratings.
- Official Reality Fracture release milestones and Play Booster notes captured in set metadata.

## Product Principles

- Preparation, not deck construction, is the primary job.
- Every interaction should improve card recognition or decision fluency.
- Rankings are a baseline; the interface must not imply deck-context intelligence it does not have.
- Unknown and incomplete information stays visibly unknown.
- The tool should remain private by default, easy to share by link, and operational without an account.

## Accessibility & Inclusion

Keyboard-operable controls, visible focus states, semantic status updates, sufficient contrast, reduced-motion support, and touch targets suitable for mobile drafting.
