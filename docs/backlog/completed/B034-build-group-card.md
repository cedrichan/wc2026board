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

## Product Requirements

- Render Group A-L cards with exactly four ranked rows when complete and compact columns `Pos`, `Team`, `P`, `W-D-L`, `GD`, and `Pts`.
- Use team name or three-letter code as space requires, meaningful flag alt/fallback, and correctly associated table headers/cells.
- Make GF/GA available in a row tooltip without making it the only accessible source.
- Distinguish direct qualifiers, qualifying third-place, outside third-place, fourth-place, and unresolved/provisional states without color alone.
- Mark a group `Live` when one of its matches is ongoing and support subtle numeric updates while avoiding disruptive row movement.

## Ambiguities / Decisions Required

- The PRD does not specify when to use full team names versus short names/codes or how to reduce disruptive live row movement. Ask before adding delayed/reordered presentation that differs from calculated ranking.
- Ask for exact qualification icons/labels if no design system decision exists.

## Acceptance Criteria

- Qualification is not communicated by color alone.
- Each group displays exactly four rows for complete data.
- Live and provisional group states are visible and accessible.
