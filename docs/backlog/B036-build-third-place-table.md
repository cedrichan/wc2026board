# B036: Build third-place table

- **Estimate:** 3-4 hours
- **Dependencies:** B003, B019
- **Parallelization:** Can run beside bracket, group, header, and state work.

## Outcome

A compact table ranks all 12 third-place teams and clearly exposes the qualification boundary.

## Scope

- Render required columns, status, conduct availability, and tiebreaker tooltip.
- Draw a strong boundary between positions 8 and 9.
- Add responsive behavior for conduct and narrow screens.

## Product Requirements

- Render all 12 third-place teams with `Rank`, `Group`, `Team`, `P`, `GD`, `GF`, `Conduct`, and `Status`.
- Mark positions 1-8 `Qualifying`, positions 9-12 `Outside`, and show a strong accessible qualification line between positions 8 and 9.
- Display unavailable conduct as an em dash rather than zero and expose provisional/unresolved ordering.
- Provide a tooltip or equivalent accessible explanation of the tiebreaker used for current ordering.
- On small screens, keep the qualification line/top eight easy to access; conduct may be hidden only when it is not actively resolving a tie.

## Ambiguities / Decisions Required

- Collapsing into an accordion on small screens is optional. Ask before implementing it.
- Ask how to label an unresolved tie spanning positions 8 and 9; do not present either side as definitively qualifying/outside without a product decision.

## Acceptance Criteria

- Resolved positions 1-8 and 9-12 are clearly labeled; an unresolved boundary is not presented as definitive.
- Missing conduct displays `-`, not zero.
- Provisional ordering and the active tiebreaker are exposed.
