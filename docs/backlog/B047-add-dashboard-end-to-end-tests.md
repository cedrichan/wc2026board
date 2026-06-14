# B047: Add dashboard end-to-end tests

- **Estimate:** 3-4 hours
- **Dependencies:** B038, B039, B040, B041
- **Parallelization:** Can run beside unit/integration completion and release preparation.

## Outcome

Playwright verifies core one-page workflows across desktop and mobile using controlled ESPN fixtures.

## Scope

- Test live group change propagation, finished knockout advancement, and shootout display.
- Test responsive bracket/group navigation and manual refresh.
- Add focused keyboard and accessible-name checks.

## Acceptance Criteria

- Core workflows pass at desktop and mobile viewports.
- Horizontal regions are operable by keyboard and touch-equivalent interaction.
- Tests run without contacting live ESPN.
