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

## Product Requirements

- For teams tied on group points, apply head-to-head points, then head-to-head goal difference, then head-to-head goals scored.
- Build each mini-table only from countable matches among the tied teams, using live scores under the same projection rule as basic standings.
- Do not apply overall group goal difference/goals scored until the head-to-head process, including required subset reapplication, is exhausted.
- Return enough metadata to explain the deciding criterion in UI tooltips and diagnostics.
- Preserve unresolved ties for later criteria; never use input order, team name, or ESPN order as an implicit tiebreaker.

## Ambiguities / Decisions Required

- If required head-to-head matches are missing or not countable, the PRD does not define whether the tie is provisional immediately or proceeds using available matches. Ask before implementing that case.

## Acceptance Criteria

- Two-team and multi-team head-to-head ties rank correctly.
- Overall group metrics are not applied before head-to-head criteria.
- Tests cover separation by each head-to-head criterion.
