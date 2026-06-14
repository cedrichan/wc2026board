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

## Product Requirements

- Map ESPN values into every normalized status from `SCHEDULED` through `UNKNOWN`, including extra-time and penalty variants.
- Normalize elapsed clock/period, normal-time score, extra-time score, penalties, completion state, and winner without fabricating unavailable values.
- Keep shootout kicks separate from the normal match score in progress and after completion.
- Ensure a real `0-0` remains distinguishable from no score and unknown statuses remain renderable with diagnostics.
- Do not treat a live leader as a winner or future-round participant.

## Ambiguities / Decisions Required

- Penalty, extra-time, and interrupted-state representation must be empirically validated against ESPN. Ask before inferring mappings for unobserved payloads.
- The PRD does not define how to normalize stoppage-time clocks or clocks beyond 120 minutes. Ask before introducing a display/domain convention.

## Acceptance Criteria

- Scheduled, live, finished, extra-time, and penalty fixtures normalize correctly.
- Unknown statuses do not crash and create diagnostics.
- Completed shootouts identify the winner without adding penalties to the match score.
