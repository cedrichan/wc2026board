# B039: Add horizontal-region accessibility

- **Estimate:** 2-4 hours
- **Dependencies:** B033, B035
- **Parallelization:** Can run beside B040-B043.

## Outcome

Bracket and group horizontal regions meet keyboard and assistive-technology requirements.

## Scope

- Add region labels, usage instructions, visible focus, and keyboard scrolling.
- Verify focus is retained during data refresh.
- Hide decorative geometry from assistive technology.

## Acceptance Criteria

- Both regions are operable without a pointer.
- Instructions are discoverable by screen-reader users.
- Focus order and focus visibility meet WCAG 2.2 AA expectations.
