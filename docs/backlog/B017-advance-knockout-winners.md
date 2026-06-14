# B017: Advance finished knockout winners

- **Estimate:** 3-4 hours
- **Dependencies:** B005
- **Parallelization:** Can run beside the group-ranking workstream.

## Outcome

A pure advancement function populates future bracket slots only from final knockout results.

## Scope

- Resolve winners for normal time, extra time, and penalties.
- Follow configured winner-feed targets.
- Preserve `Winner Mxx` placeholders for live or unresolved matches.

## Product Requirements

- Advance only a conclusively finished knockout winner into the configured later-match side.
- Support normal-time, extra-time, and penalty-shootout finishes while keeping penalty scores separate from the match score.
- Never advance a live leader; live leaders may only receive a "currently ahead" treatment in their current card.
- Leave future participants as `Winner Mxx` when a preceding match is live, scheduled, interrupted, unknown, or final without a reliable winner.
- Populate the third-place match and final from the appropriate semi-final outcomes according to the approved topology.

## Ambiguities / Decisions Required

- The example topology models winner feeds but the third-place match requires semi-final losers. Ask for the approved loser/placement-feed representation before implementing that path.
- Ask whether a final status plus derivable score is sufficient to determine a winner when `winnerTeamId` is missing, especially after penalties; do not guess shootout winners from incomplete data.

## Acceptance Criteria

- Finished winners populate the correct future side.
- The approved semi-final placement result populates each third-place-match side.
- Live leaders never populate future-round slots.
- Tests cover normal time, extra time, shootout, and missing winner data.
