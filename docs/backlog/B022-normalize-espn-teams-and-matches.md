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

## Acceptance Criteria

- Team identifiers remain consistent across fixture responses.
- UI and rules modules do not import ESPN schema types.
- Missing optional identity fields generate diagnostics rather than crashes.
