# B011: Rank group ties by head-to-head

- **Estimate:** 3-4 hours
- **Dependencies:** B010
- **Parallelization:** Run sequentially with B012-B014; other workstreams can proceed independently.

## Outcome

Group ties are ranked first by head-to-head points, goal difference, and goals scored.

## Scope

- Identify tied sets after points calculation.
- Build mini-tables using only matches among tied teams.
- Return tiebreaker metadata for the deciding criterion.

## Acceptance Criteria

- Two-team and multi-team head-to-head ties rank correctly.
- Overall group metrics are not applied before head-to-head criteria.
- Tests cover separation by each head-to-head criterion.
