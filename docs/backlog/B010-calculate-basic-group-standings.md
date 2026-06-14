# B010: Calculate basic group standings

- **Estimate:** 3-4 hours
- **Dependencies:** B002
- **Parallelization:** Can run beside static-data, advancement, and ESPN tasks.

## Outcome

A pure rules-engine function that calculates group totals from normalized matches.

## Scope

- Apply win/draw/loss points and calculate P, W, D, L, GF, GA, GD.
- Treat live scores as current final scores for projections.
- Ignore scheduled matches and unsupported interrupted results.

## Acceptance Criteria

- Completed and live match contributions are correct.
- Scheduled matches contribute nothing.
- Tests include real `0-0`, missing scores, and all result types.
