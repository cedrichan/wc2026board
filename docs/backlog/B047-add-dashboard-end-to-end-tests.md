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

## Product Requirements

- Verify one-page workflows at desktop and mobile: live group score changes standings, third-place ranking, and Round-of-32 assignments without reload.
- Verify finished knockout advancement, live leader non-advancement, separate in-progress/final shootout display, and scheduled versus real `0-0` scores.
- Verify cached/stale/outage/manual-retry presentations using controlled ESPN fixtures with no live network calls.
- Verify bracket/group horizontal navigation by keyboard and touch-equivalent interaction, preserved scroll/focus after updates, and readable responsive content.
- Check key accessible names, qualification state without color, visible focus, and polite deduplicated live announcements.

## Ambiguities / Decisions Required

- Browser/device matrix beyond desktop/mobile and exact accessibility assertion tooling are unspecified. Ask before expanding release-gating coverage or selecting paid/external services.

## Acceptance Criteria

- Core workflows pass at desktop and mobile viewports.
- Horizontal regions are operable by keyboard and touch-equivalent interaction.
- Tests run without contacting live ESPN.
