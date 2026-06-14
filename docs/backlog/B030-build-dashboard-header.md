# B030: Build the dashboard header

- **Estimate:** 3-4 hours
- **Dependencies:** B003, B026
- **Parallelization:** Can run beside bracket, group, table, and state components.

## Outcome

A responsive Material UI header shows title, stage, live status, update age, refresh, and timezone selection.

## Scope

- Build text-and-color live indicator and stale/cached treatments.
- Add manual refresh progress and local/UTC selector.
- Make controls accessible and optionally sticky/compact.

## Acceptance Criteria

- Refresh and timezone controls have at least 44px touch targets.
- Live, stale, cached, and refresh-in-progress states are understandable without color.
- Header never implies another provider is consulted.
