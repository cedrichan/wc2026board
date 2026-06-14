# B046: Complete refresh reliability scenarios

- **Estimate:** 3-4 hours
- **Dependencies:** B029
- **Parallelization:** Can run beside B044-B045 and B047-B048.

## Outcome

Automated tests prove stale, cached, retry, visibility, cancellation, and sole-provider behavior.

## Scope

- Add missing tests from required scenarios 20 and 28-35.
- Verify failed refresh retention and no overlapping requests.
- Verify manual refresh during delayed retries.

## Product Requirements

- Cover cached snapshot during outage, stale-data behavior, no secondary request, no alternate-provider production keys, visibility refresh, non-overlap, and manual refresh during delayed retry.
- Verify startup renders valid cache before fresh data, invalid/expired/cross-tournament cache is discarded, and failures never overwrite the last successful snapshot.
- Test live/matchday/outside/complete polling boundaries and 45-second/5-minute/30-minute stale labels.
- Verify retry sequence/cap, cancellation of obsolete requests, retry reset after success, and no-live-match normal behavior.
- Assert no failure path contacts or implies another provider.

## Ambiguities / Decisions Required

- Tests for exact live polling, expected final whistle, hidden-tab low-frequency behavior, and cache retention require decisions identified in B026-B028. Ask before hard-coding test expectations.

## Acceptance Criteria

- Cached outage and no-cache outage behaviors pass.
- Hidden/visible transitions and retry reset pass.
- No failure path issues any secondary-provider request.
