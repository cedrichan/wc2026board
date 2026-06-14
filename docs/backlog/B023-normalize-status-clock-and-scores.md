# B023: Normalize status, clock, and scores

- **Estimate:** 3-4 hours
- **Dependencies:** B022
- **Parallelization:** Can run beside B026-B028 and static UI work.

## Outcome

ESPN status, elapsed time, normal scores, extra-time scores, penalties, completion, and winners map to domain models.

## Scope

- Map all documented normalized statuses with an `UNKNOWN` fallback.
- Preserve `null` versus zero.
- Keep shootout values separate from match scores.

## Acceptance Criteria

- Scheduled, live, finished, extra-time, and penalty fixtures normalize correctly.
- Unknown statuses do not crash and create diagnostics.
- Completed shootouts identify the winner without adding penalties to the match score.
