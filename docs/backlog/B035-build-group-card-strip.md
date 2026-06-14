# B035: Build group-card strip

- **Estimate:** 2-3 hours
- **Dependencies:** B034
- **Parallelization:** Can run beside B033 and B036-B037.

## Outcome

All 12 group cards render in one horizontal, scroll-snapping region.

## Scope

- Add responsive card widths and horizontal Material UI stack.
- Preserve scroll position across data refreshes.
- Include Group A-L placeholders for no-data/error states.

## Acceptance Criteria

- All groups are reachable by mouse, touch, trackpad, and keyboard.
- Mobile cards occupy approximately 85-92% of viewport width.
- Data updates do not reset horizontal scroll position.
