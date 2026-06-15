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

## Product Requirements

- Expose distinct initial-loading, cached-loading, fresh, refreshing, stale, partial, cached-outage, and no-cache-outage states.
- Retain the last usable snapshot and scrollable dashboard during refresh failures; never turn "no live matches" into an error.
- Provide data age, source/generated timestamps, stale label, warnings/diagnostics, manual retry, and refresh-in-progress state.
- Ensure invalid fresh payloads cannot replace valid cached/rendered state and no failure path triggers another provider.
- Give UI consumers normalized/rules-derived data only, never raw ESPN payloads.

## Ambiguities / Decisions Required

- The PRD does not specify precedence when cached data, partial fresh data, and validation warnings coexist. Ask before deciding which snapshot is rendered or whether partial fresh data replaces cache.
- Ask which diagnostics are user-visible versus retained only for support/release evidence.

## Acceptance Criteria

- Initial cache, successful refresh, partial data, stale cache, and no-cache outage are distinct.
- No-live-match state is not treated as an error.
- A failed refresh never clears previously rendered tournament data.
