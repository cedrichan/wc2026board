# B026: Derive polling and stale-data policies

- **Estimate:** 2-3 hours
- **Dependencies:** B002
- **Parallelization:** Can run beside B020-B025 and B028.

## Outcome

Pure, configurable functions derive poll interval, active match window, tournament completion, and stale-data label.

## Scope

- Implement live, matchday, outside-window, and complete-tournament intervals.
- Implement 45-second, 5-minute, and 30-minute stale thresholds.
- Add bounded retry-delay calculation.

## Acceptance Criteria

- Boundary times are unit tested.
- Tournament complete disables automatic polling.
- Retry delay caps at five minutes and can reset after success.
