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

## Product Requirements

- Render all 12 group cards in one horizontally scrolling, scroll-snapping Material UI row below the third-place table.
- Use fixed-width cards around the recommended 300-340 CSS pixels on larger screens and approximately 85-92% viewport width on mobile.
- Make every group reachable by mouse, touch, trackpad, and keyboard and preserve scroll/focus during data refreshes.
- Retain Group A-L structural placeholders when data is absent or ESPN fails.
- Keep the region compatible with assistive-technology usage instructions and visible focus.

## Ambiguities / Decisions Required

- The PRD gives width ranges rather than exact responsive values and says tablets may snap one or two cards at a time. Ask for breakpoint/width choices if designs do not settle them.

## Acceptance Criteria

- All groups are reachable by mouse, touch, trackpad, and keyboard.
- Mobile cards occupy approximately 85-92% of viewport width.
- Data updates do not reset horizontal scroll position.
