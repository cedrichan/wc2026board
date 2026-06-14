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

## Ambiguities / Decisions Required

- Validation can prove internal consistency but cannot prove the configuration matches FIFA. Ask which approved official reference or golden assertions must be used for authoritative correctness.

## Acceptance Criteria

- Tests fail for missing, duplicate, or invalid feed definitions.
- Expected round counts and the approved third-place placement feeds are asserted.
- The valid topology passes without relying on UI code.
