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

## Product Requirements

- Display product title, derived tournament stage, live indicator when any match is in progress, `Updated X seconds ago`, manual refresh, and local/UTC selection.
- Use text plus color for live/stale/cached states and expose warnings/status to screen readers.
- Show refresh-in-progress state; a failed refresh must leave prior data visible and must never imply another provider is being consulted.
- Use accessible Material UI controls with visible focus and at least 44x44 CSS-pixel touch targets.
- Support all PRD stage labels from group stage through tournament complete.

## Ambiguities / Decisions Required

- Sticky/compact-on-scroll behavior and light/dark appearance control are optional. Ask whether either is in scope before implementing it.
- Ask whether timezone selection persists across sessions and how frequently relative update-age text should repaint.

## Acceptance Criteria

- Refresh and timezone controls have at least 44px touch targets.
- Live, stale, cached, and refresh-in-progress states are understandable without color.
- Header never implies another provider is consulted.
