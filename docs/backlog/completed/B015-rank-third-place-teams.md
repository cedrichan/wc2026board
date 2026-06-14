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

## Product Requirements

- Select exactly the current third-place finisher from each Group A-L after local group ranking.
- Rank the 12 teams by points, overall goal difference, overall goals scored, conduct score, latest FIFA ranking, then preceding ranking editions.
- Never apply head-to-head criteria between teams from different groups.
- Mark positions 1-8 `Qualifying` and 9-12 `Outside`, expose a strong boundary between 8 and 9, and retain criterion/provisional diagnostics.
- Treat missing conduct/ranking data as unavailable and potentially qualification-affecting; never silently choose the top eight by fallback sort.

## Ambiguities / Decisions Required

- **Approved decision:** When an unresolved tie spans positions 8 and 9, mark every
  team in that tied set `UNRESOLVED`. Teams conclusively above remain qualifying
  and teams conclusively below remain outside. Do not emit a definitive top-eight
  set.

## Acceptance Criteria

- Exactly 12 rows are produced; when the boundary is resolved, the first eight qualify, and when it is unresolved no definitive top eight is silently emitted.
- Head-to-head is never used across groups.
- Tests cover a clear top eight and a conduct-resolved boundary.
