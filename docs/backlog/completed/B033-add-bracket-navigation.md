# B033: Add bracket navigation

- **Estimate:** 2-4 hours
- **Dependencies:** B032
- **Parallelization:** Can run beside group strip, third-place table, and state work.

## Outcome

Users can reach and navigate bracket rounds on desktop, mobile, touch, and keyboard.

## Scope

- Add scroll snapping and round selector.
- Scroll the active round into view on initial load.
- Preserve readable cards and scroll position during updates.

## Product Requirements

- Make every bracket round reachable with mouse, touch, trackpad, and keyboard.
- Add horizontal scroll snapping and a compact round selector, especially for mobile where one or two rounds are visible.
- Scroll the active tournament round into view on initial load without stealing focus unexpectedly.
- Preserve user scroll position and focus across live data refreshes.
- Maintain readable match cards rather than zooming/shrinking to fit.

## Ambiguities / Decisions Required

- The PRD does not define how to choose the "active tournament round" when rounds overlap, no match is live, or fixture data is incomplete. Ask for the priority rule.
- Ask whether the round selector is always visible or mobile-only and whether selection should move keyboard focus or only scroll.

## Acceptance Criteria

- Round selection moves focus/scroll predictably.
- Mouse, touch, trackpad, and keyboard navigation work.
- Live refresh does not reset the user's bracket scroll position.
