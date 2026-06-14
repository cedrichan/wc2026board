# B006: Validate bracket topology

- **Estimate:** 1-2 hours
- **Dependencies:** B005
- **Parallelization:** Can run while other static-data and rules-engine tasks proceed.

## Outcome

Automated integrity checks that reject incomplete or contradictory bracket topology.

## Scope

- Test match-number uniqueness and complete M73-M104 coverage.
- Validate round counts and winner-feed targets/sides.
- Detect duplicate occupancy of a future match side.

## Product Requirements

- Assert the exact PRD round counts and contiguous M73-M104 coverage.
- Reject self-feeds, feeds to earlier/same rounds, nonexistent targets, invalid sides, duplicate future-side occupancy, and missing required feeds.
- Validate source-slot compatibility, including direct group slots, Annex C-dependent slots, winner placeholders, and third-place/final placement sources.
- Keep validation runnable in the normal test or build workflow with no UI dependency.

## Resolved Decision

- Golden assertions cover every M73-M104 home and away source from Article 12.6-12.11 of the May 2026 Regulations for the FIFA World Cup 26.

## Acceptance Criteria

- Tests fail for missing, duplicate, or invalid feed definitions.
- Expected round counts and the approved third-place placement feeds are asserted.
- The valid topology passes without relying on UI code.
