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

## Acceptance Criteria

- Cached outage and no-cache outage behaviors pass.
- Hidden/visible transitions and retry reset pass.
- No failure path issues any secondary-provider request.
