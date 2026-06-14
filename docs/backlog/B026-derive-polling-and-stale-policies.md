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

## Product Requirements

- Derive a configurable 15-30 second interval while any World Cup match is live.
- Poll every 60 seconds from 30 minutes before kickoff until 30 minutes after the expected final whistle on a matchday with no live match.
- Poll every 10 minutes outside active windows and disable automatic polling after tournament completion.
- Label data `Updates delayed` after 45 seconds during live play, `Data may be stale` after 5 minutes on matchday, and `Last known data` after 30 minutes outside a match window.
- Implement bounded exponential retry delays of 15s, 30s, 60s, 2m, then at most 5m, reset after success.

## Ambiguities / Decisions Required

- Ask for the exact live interval within 15-30 seconds and the configuration mechanism before implementation.
- "Expected final whistle," matchday timezone/boundaries, tournament-complete derivation, and maximum cache retention are not defined. Ask before choosing these values/rules.

## Acceptance Criteria

- Boundary times are unit tested.
- Tournament complete disables automatic polling.
- Retry delay caps at five minutes and can reset after success.
