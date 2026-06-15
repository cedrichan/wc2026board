# B022: Normalize ESPN teams and matches

- **Estimate:** 3-4 hours
- **Dependencies:** B021
- **Parallelization:** Can run beside B026, B028, and UI work.

## Outcome

`EspnScoreboardDataSource` maps validated ESPN responses into normalized teams and match identities.

## Scope

- Normalize stable team IDs, names, FIFA codes, flags, groups, match IDs, match numbers, rounds, and kickoff times.
- Deduplicate teams and matches across responses.
- Keep ESPN-specific field access inside the adapter.

## Product Requirements

- Normalize all team/match identity and scheduling fields needed by the domain while preserving missing optional fields as diagnostics.
- Deduplicate repeated date/range responses into one tournament snapshot using stable identities.
- Map all 12 groups and official match numbers/rounds without relying on ESPN's displayed standings order.
- Normalize provider strings and sanitize flag/logo URLs before they can reach rendering.
- Keep all ESPN field access and mapping decisions inside `EspnScoreboardDataSource`.

## Ambiguities / Decisions Required

- ESPN ID stability and availability are release-validation items, not guaranteed facts. Ask for the approved fallback identity strategy before synthesizing any team or match ID.
- Ask how to resolve conflicting copies of the same match across range responses before choosing "latest," "most complete," or another merge rule.

## Acceptance Criteria

- Team identifiers remain consistent across fixture responses.
- UI and rules modules do not import ESPN schema types.
- Missing optional identity fields generate diagnostics rather than crashes.
