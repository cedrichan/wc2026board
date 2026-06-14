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

## Product Requirements

- Apply FIFA men's ranking only after all earlier same-group criteria remain tied.
- Compare the latest bundled edition first, then each preceding bundled edition in chronological order until separation.
- Rank the lower numeric FIFA rank higher and record the exact edition that resolved the tie.
- If an edition lacks a tied team or all bundled editions remain tied, preserve an explicit provisional/unresolved result rather than guessing.
- Keep ranking lookup static and provider-independent; do not fetch another source at runtime.

## Ambiguities / Decisions Required

- Ask whether an edition with a missing tied team should be skipped for the whole tied set or should immediately make the criterion unresolved; the PRD does not define this.
- Ask what terminal behavior is expected if all available preceding editions fail to separate teams.

## Acceptance Criteria

- Tests cover resolution by latest and preceding editions.
- FIFA ranking is not used before all earlier criteria.
- Missing ranking entries do not produce a silent guess.
