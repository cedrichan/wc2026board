# B002: Define normalized domain models

- **Estimate:** 2-3 hours
- **Dependencies:** B001
- **Parallelization:** Can run beside B003. It blocks data, rules-engine, and view-model work.

## Outcome

Provider-independent TypeScript contracts for teams, matches, snapshots, diagnostics, standings, slots, and tournament rounds.

## Scope

- Define the domain types from `docs/product.md`.
- Represent all normalized statuses and participant states.
- Ensure scores distinguish `null` from zero.
- Add type-level fixtures or unit tests for important variants.

## Product Requirements

- Model teams, matches, scores, standings, snapshots, diagnostics, unresolved tiebreakers, disciplinary events, bracket slots, and all tournament rounds without React or ESPN types.
- Support every normalized match status listed in PRD section 8.5, including interrupted states and `UNKNOWN`.
- Model participant slots as placeholder, projected, confirmed, or unresolved/superseded-capable states, with a human-readable qualification source for projected tooltips.
- Keep normal-time, extra-time, and penalty scores separate; penalties never contribute to the normal match score.
- Include snapshot/generated/source timestamps, sole-provider diagnostics (`espn`), missing fields, warnings, schema version, tournament identity, and data needed for cache validation.
- Preserve explicit uncertainty: unavailable conduct/ranking/penalty data and unresolved tiebreakers must not collapse to zero or a guessed result.

## Ambiguities / Decisions Required

- The PRD names "eliminated or superseded" as a participant state but does not define whether historical projections are retained in the domain or simply replaced in the UI. Ask before adding projection-history state.
- The PRD does not define the exact shape/severity taxonomy of diagnostics or unresolved tiebreakers. Ask before introducing user-visible severity levels or workflow semantics.

## Acceptance Criteria

- Domain modules have no React or ESPN imports.
- Diagnostics can represent missing fields and unresolved tiebreakers.
- Production snapshot diagnostics only permit provider `espn`.
