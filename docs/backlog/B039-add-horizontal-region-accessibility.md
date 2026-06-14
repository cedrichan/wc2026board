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

## Product Requirements

- Make bracket and group-card horizontal regions fully operable without a pointer and clearly labeled as scrollable regions.
- Provide discoverable keyboard/assistive-technology usage instructions and visible WCAG 2.2 AA focus indicators.
- Preserve focus and scroll position during live updates and refresh failures.
- Hide connector lines and other decorative geometry from assistive technology.
- Verify round/group navigation, controls, cards, and tables maintain a logical focus order.

## Ambiguities / Decisions Required

- The PRD does not prescribe keyboard bindings beyond general keyboard access. Ask before adding nonstandard arrow/Page/Home/End behavior that could conflict with browser or screen-reader conventions.

## Acceptance Criteria

- Both regions are operable without a pointer.
- Instructions are discoverable by screen-reader users.
- Focus order and focus visibility meet WCAG 2.2 AA expectations.
