# B045: Complete ESPN adapter scenarios

- **Estimate:** 3-4 hours
- **Dependencies:** B025
- **Parallelization:** Can run beside B044 and B046-B048.

## Outcome

Adapter tests cover required valid, partial, unknown, malformed, and changed-schema ESPN cases.

## Scope

- Add missing tests from required scenarios 17-27 and 31-32.
- Verify optional fields, IDs, statuses, empty events, and penalty mapping.
- Assert development sources cannot become production fallbacks.

## Acceptance Criteria

- Invalid payloads fail validation without corrupting a snapshot.
- Unknown and missing optional data remain renderable with diagnostics.
- Production configuration resolves only `EspnScoreboardDataSource`.
