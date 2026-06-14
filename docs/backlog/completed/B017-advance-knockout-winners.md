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

- **Approved decision:** Use the existing target-side `MATCH_LOSER` topology sources
  for the third-place match. Do not add separate loser-feed metadata.
- **Approved decision:** Advance only a valid explicit `winnerTeamId` from a final
  match. Do not derive a winner from scores when `winnerTeamId` is missing or
  invalid.

## Acceptance Criteria

- Finished winners populate the correct future side.
- The approved semi-final placement result populates each third-place-match side.
- Live leaders never populate future-round slots.
- Tests cover normal time, extra time, shootout, and missing winner data.
