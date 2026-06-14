# B004: Add development data sources and fixtures

- **Estimate:** 2-4 hours
- **Dependencies:** B002
- **Parallelization:** Can run beside B005-B009 and B020.

## Outcome

Development-only `MockDataSource` and `FixtureFileDataSource` implementations of `TournamentDataSource`.

## Scope

- Define the `TournamentDataSource` interface.
- Add representative normalized snapshots for group, live, knockout, shootout, partial-data, and outage states.
- Guard fixture-based sources from production configuration.

## Product Requirements

- Implement the documented `getSnapshot(signal?: AbortSignal): Promise<TournamentSnapshot>` contract.
- Provide fixtures for scheduled, pre-match, live halves, half-time, extra time, extra-time break, shootout, all finished variants, postponed, suspended, cancelled, and unknown statuses.
- Include live group-score changes, direct/third-place qualification changes, final knockout advancement, cached/stale data, missing flags/venue/events, incomplete conduct, malformed/partial-equivalent normalized states, and no-live-match states.
- Ensure fixtures preserve `null` versus zero and separate penalties from match scores.
- Development sources are testing aids only; they must never be selectable as production fallbacks or contact alternate providers.

## Ambiguities / Decisions Required

- The PRD does not prescribe fixture file format, directory layout, or scenario naming. Follow established repository conventions; ask before creating a format that becomes a public contract.

## Acceptance Criteria

- Both sources return valid normalized snapshots.
- Production builds cannot select either development source.
- Fixtures include zero scores, null scores, missing fields, and provisional ordering.
