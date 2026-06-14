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

## Acceptance Criteria

- Tests fail for missing, duplicate, or invalid feed definitions.
- Expected round counts are asserted.
- The valid topology passes without relying on UI code.
