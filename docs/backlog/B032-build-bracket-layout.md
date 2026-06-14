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

## Acceptance Criteria

- All six round/placement columns and 32 matches render.
- Connector lines are decorative and hidden from assistive technology.
- Layout uses topology/view models rather than deriving advancement from position.
