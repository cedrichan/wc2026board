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

## Acceptance Criteria

- Round selection moves focus/scroll predictably.
- Mouse, touch, trackpad, and keyboard navigation work.
- Live refresh does not reset the user's bracket scroll position.
