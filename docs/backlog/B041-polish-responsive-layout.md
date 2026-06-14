# B041: Polish responsive layout

- **Estimate:** 3-4 hours
- **Dependencies:** B038
- **Parallelization:** Can run beside accessibility, security, performance, and test tasks.

## Outcome

The full dashboard remains readable and usable at product-defined desktop, tablet, and mobile widths.

## Scope

- Tune bracket columns, match-card names, group-card widths, and table columns.
- Verify touch targets and overflow behavior.
- Ensure no component shrinks text below a readable size.

## Product Requirements

- Desktop: use most viewport width, show multiple bracket rounds where possible, keep group cards horizontal, and show all third-place columns where space permits.
- Tablet: keep bracket horizontal/scrollable, preserve readable team names, and snap one or two group cards at a time.
- Mobile: show one or two bracket rounds, provide round navigation, allow short team names, size group cards to about 85-92% viewport width, and keep touch targets at least 44x44 CSS pixels.
- Keep the third-place qualification boundary/top eight accessible; hide conduct only when it is not actively resolving a tie.
- Ensure every required item remains reachable through overflow and no match card shrinks to unreadable text.

## Ambiguities / Decisions Required

- Exact breakpoints, readable minimum typography/card sizes, and which secondary metadata hides first are not defined. Ask for design decisions before choosing them.

## Acceptance Criteria

- Mobile shows one or two bracket rounds and provides round navigation.
- Desktop shows multiple rounds where viewport width permits.
- No required information is inaccessible due to overflow.
