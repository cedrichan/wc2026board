# B032: Build bracket layout

- **Estimate:** 3-4 hours
- **Dependencies:** B006, B031
- **Parallelization:** Can run beside group and third-place UI work.

## Outcome

A left-to-right, horizontally scrollable bracket renders all M73-M104 matches from topology.

## Scope

- Build round columns with readable fixed-size match cards.
- Add limited custom CSS for grid positioning and decorative connector lines.
- Keep round headers visible where practical.

## Product Requirements

- Render the bracket left-to-right from fixed topology with 16 Round-of-32, 8 Round-of-16, 4 quarter-final, 2 semi-final, third-place, and final matches.
- Use Material UI `Box`/CSS Grid, `Stack`, and match-card surfaces; custom CSS is limited to geometry, positioning, and scrolling.
- Keep cards readable and horizontally scroll instead of shrinking text below a usable size.
- Keep round headers visible where practical and hide decorative connector lines from assistive technology.
- Rendering consumes topology/view models and must not own advancement logic or derive feeds from visual position.

## Ambiguities / Decisions Required

- The PRD does not specify whether third-place and final share one visual column or appear as separate columns, despite calling for six rounds/placements. Ask before fixing layout geometry.
- "Where practical" sticky round headers and exact fixed card dimensions require a design decision; ask if no established design exists.

## Acceptance Criteria

- All six round/placement columns and 32 matches render.
- Connector lines are decorative and hidden from assistive technology.
- Layout uses topology/view models rather than deriving advancement from position.
