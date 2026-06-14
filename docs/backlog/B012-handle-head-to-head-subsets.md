# B012: Handle remaining tied subsets

- **Estimate:** 3-4 hours
- **Dependencies:** B011
- **Parallelization:** Sequential with adjacent group-ranking tasks.

## Outcome

The rules engine reapplies head-to-head criteria to any unresolved subset as FIFA rules require.

## Scope

- Detect when one or more teams separate from a tied set.
- Reapply the head-to-head mini-table to the remaining subset.
- Preserve deterministic ordering and diagnostics.

## Acceptance Criteria

- The required three-team tie scenario separates one team then reranks the remaining two.
- Reapplication terminates safely when no criterion separates teams.
- Unit tests expose the active and unresolved criteria.
