# B037: Build loading and error states

- **Estimate:** 3-4 hours
- **Dependencies:** B003, B029
- **Parallelization:** Can run beside all content component work.

## Outcome

The dashboard has structured skeleton, partial-data, cached, stale, and no-cache outage presentations.

## Scope

- Add dimensionally stable bracket and group skeletons.
- Add non-blocking stale/outage alerts with data age and retry.
- Retain static bracket/group placeholders when no snapshot exists.

## Acceptance Criteria

- Initial load does not use a full-screen spinner.
- Cached data remains visible during an ESPN outage.
- Missing fields are shown as unavailable and do not crash the page.
