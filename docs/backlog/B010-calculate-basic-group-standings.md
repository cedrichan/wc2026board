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

## Product Requirements

- Calculate each four-team group locally from normalized match data; never trust ESPN's displayed standings or order.
- Award 3 points for a win, 1 for a draw, and 0 for a loss; derive played, wins, draws, losses, goals for/against, goal difference, and points.
- Include completed matches and treat live current scores as final for projection purposes.
- Scheduled matches contribute nothing. Postponed, suspended, abandoned-equivalent, or cancelled matches contribute only when normalized data explicitly marks an official result.
- Keep the function deterministic, pure, and independent of React and ESPN.

## Ambiguities / Decisions Required

- The PRD does not define how ESPN signals an "official result" for interrupted matches. Ask for the normalized-domain rule before counting a postponed, suspended, cancelled, or unknown-status match.
- Ask how structurally valid but incomplete groups/fixtures should be represented if exactly four teams or all expected matches are not available.

## Acceptance Criteria

- Completed and live match contributions are correct.
- Scheduled matches contribute nothing.
- Tests include real `0-0`, missing scores, and all result types.
