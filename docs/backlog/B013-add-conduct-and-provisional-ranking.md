# B013: Add conduct and provisional ranking

- **Estimate:** 3-4 hours
- **Dependencies:** B012
- **Parallelization:** Sequential with group-ranking tasks; can run beside B015 data preparation.

## Outcome

Remaining group ties use overall metrics and conduct while explicitly representing incomplete data.

## Scope

- Apply overall GD and GF after head-to-head exhaustion.
- Calculate documented conduct deductions when event data is complete.
- Mark unresolved orderings provisional when conduct data is incomplete.

## Acceptance Criteria

- Conduct is never assumed to be zero when unavailable.
- A conduct-resolved tie ranks correctly.
- Diagnostics identify the unresolved criterion and affected teams.
