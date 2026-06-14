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

## Acceptance Criteria

- Both sources return valid normalized snapshots.
- Production builds cannot select either development source.
- Fixtures include zero scores, null scores, missing fields, and provisional ordering.
