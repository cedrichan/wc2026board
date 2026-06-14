# B029: Compose dashboard data state

- **Estimate:** 3-4 hours
- **Dependencies:** B027, B028
- **Parallelization:** Can run beside independent UI component work.

## Outcome

A single application hook/controller exposes fresh, cached, stale, loading, partial, and error states while retaining usable data.

## Scope

- Combine query state, cache state, timestamps, stale policy, and diagnostics.
- Preserve prior snapshot and scrollable UI during refresh failures.
- Expose manual retry and refresh-in-progress state.

## Acceptance Criteria

- Initial cache, successful refresh, partial data, stale cache, and no-cache outage are distinct.
- No-live-match state is not treated as an error.
- A failed refresh never clears previously rendered tournament data.
