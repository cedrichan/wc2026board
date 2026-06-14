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

## Acceptance Criteria

- Domain modules have no React or ESPN imports.
- Diagnostics can represent missing fields and unresolved tiebreakers.
- Production snapshot diagnostics only permit provider `espn`.
