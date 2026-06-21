# B049: Team detail tooltip

- **Estimate:** 3–5 hours
- **Dependencies:** B034, B035, B038
- **Parallelization:** Can run beside B039–B043.

## Outcome

Hovering (or tapping on mobile) any team flag or name — in the bracket or in a group card — shows a compact tooltip with that team's current standing and projected knockout path.

## Scope

- Add a reusable tooltip component that accepts a `teamId` and derives its content from the already-computed dashboard view model.
- Display: team name, flag, group, record (W-D-L), goals for/against, goal difference, points, and current group position.
- Below the standing row, show the team's projected Round-of-32 match slot (match number + opponent slot) if determinable.
- Wire the tooltip to team flags/names in `MatchCard` (bracket) and `GroupCard` (group strip).
- Touch devices: tap to toggle (tap away to dismiss); pointer devices: hover.
- Tooltip must not obscure the score or status area of the card that triggered it.

## Product Requirements

- All data shown in the tooltip is already present in the normalized view model — no new ESPN fields or additional fetches are required.
- Bracket and group-card layouts must not shift when the tooltip opens.
- The tooltip must be dismissible without a page reload and must not trap keyboard focus.
- Projected path must be labeled "Projected" (consistent with the bracket projection labeling rule in PRD §5.2).
- When a team's bracket slot cannot yet be determined, show a placeholder rather than omitting the row.

## Ambiguities / Decisions Required

- **Tooltip trigger in bracket vs group card:** flag only, name only, or the whole team row? Decide before implementation to keep the hit-targets consistent.
- **Mobile disclosure pattern:** a simple popover dismissed by tapping elsewhere is assumed; confirm if a bottom-sheet or drawer is preferred instead.
- **Projected path depth:** show R32 slot only, or also the projected R16 match? Deeper projection adds complexity; decide before building.

## Acceptance Criteria

- Tooltip appears on hover (pointer) and tap (touch) for any team in the bracket and in any group card.
- Standing data (record, GD, points, position) matches the group card for the same team.
- Projected R32 slot label matches what the bracket renders for that slot.
- Tooltip is keyboard-accessible: focusable trigger, Escape to dismiss, no focus trap.
- Tooltip does not appear for placeholder slots where no team is projected.
- No additional ESPN requests are triggered by opening a tooltip.
