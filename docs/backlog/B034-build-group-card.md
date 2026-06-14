# B034: Build group card

- **Estimate:** 3-4 hours
- **Dependencies:** B003, B019
- **Parallelization:** Can run beside bracket, header, and third-place UI work.

## Outcome

A fixed-width Material UI group card displays a complete ranked group table and qualification states.

## Scope

- Render Pos, Team, P, W-D-L, GD, and Pts with accessible headers.
- Add direct, third-place qualifying, outside, fourth, live, and unresolved treatments.
- Show GF/GA details and flag fallback where appropriate.

## Acceptance Criteria

- Qualification is not communicated by color alone.
- Each group displays exactly four rows for complete data.
- Live and provisional group states are visible and accessible.
