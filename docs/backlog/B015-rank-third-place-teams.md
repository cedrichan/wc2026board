# B015: Rank third-place teams

- **Estimate:** 3-4 hours
- **Dependencies:** B013, B014
- **Parallelization:** Can run beside B017 and all provider/UI work.

## Outcome

The third-place finisher from each group is ranked using cross-group criteria and marked qualifying or outside.

## Scope

- Select the third-place row from each of 12 groups.
- Rank by points, GD, GF, conduct, and ranking editions.
- Expose qualification boundary, tiebreaker, and provisional metadata.

## Acceptance Criteria

- Exactly 12 rows are produced and the first eight qualify.
- Head-to-head is never used across groups.
- Tests cover a clear top eight and a conduct-resolved boundary.
