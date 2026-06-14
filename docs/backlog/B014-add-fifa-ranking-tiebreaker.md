# B014: Add FIFA ranking tiebreaker

- **Estimate:** 2-4 hours
- **Dependencies:** B007, B013
- **Parallelization:** Can run beside third-place UI and ESPN work once dependencies are ready.

## Outcome

Remaining ties use the latest then preceding bundled FIFA ranking editions.

## Scope

- Compare teams across ranking editions in documented order.
- Record the edition that resolves a tie.
- Preserve provisional diagnostics when ranking data cannot resolve it.

## Acceptance Criteria

- Tests cover resolution by latest and preceding editions.
- FIFA ranking is not used before all earlier criteria.
- Missing ranking entries do not produce a silent guess.
