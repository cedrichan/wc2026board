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

## Product Requirements

- When a head-to-head criterion separates one or more teams but leaves a subset tied, reapply all three head-to-head criteria using only matches among that remaining subset.
- Continue subset reapplication as required until teams separate or no head-to-head criterion can make progress.
- Terminate safely and pass unresolved subsets to overall group goal difference, overall goals scored, conduct, then FIFA ranking.
- Record the active criterion, each separated subset, and unresolved criterion so the ordering can be explained and tested.
- Do not use an arbitrary stable sort as a qualification decision.

## Ambiguities / Decisions Required

- The PRD summarizes the FIFA subset procedure but does not cite a regulations clause or define every multi-subset edge case. Ask for the approved regulations interpretation when a scenario is not covered by the required tests.

## Acceptance Criteria

- The required three-team tie scenario separates one team then reranks the remaining two.
- Reapplication terminates safely when no criterion separates teams.
- Unit tests expose the active and unresolved criteria.
