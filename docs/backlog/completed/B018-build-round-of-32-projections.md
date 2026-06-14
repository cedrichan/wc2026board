# B018: Build Round-of-32 projections

- **Estimate:** 3-4 hours
- **Dependencies:** B016, B017
- **Parallelization:** Can run beside ESPN adapter and static UI work.

## Outcome

A bracket-projection function combines group standings, Annex C assignments, and knockout advancement.

## Scope

- Populate direct and third-place Round-of-32 sources.
- Label projected, confirmed, placeholder, and unresolved participants.
- Keep later-round participants restricted to finished knockout winners.

## Product Requirements

- During the group stage, treat current live scores as final and populate all resolvable direct and Annex C-dependent Round-of-32 participants.
- Clearly label projected participants and provide a source explanation such as `Projected winner of Group E`.
- Use placeholders such as `1E`, `3A/B/C/D/F`, or `Winner M73` when a team cannot yet be projected.
- Distinguish projected from officially confirmed participants and preserve provisional/unresolved qualification rather than silently presenting it as official.
- Replace superseded projections without animation that could imply an official result.
- Never project later-round winners from unplayed/live knockout matches; only finished winners advance.

## Ambiguities / Decisions Required

- **Approved decision:** A group winner or runner-up is confirmed only when every
  match in that group is final and its placement is non-provisional. A third-place
  participant is confirmed only when all groups are complete, the qualification
  boundary is resolved, and Annex C assignment succeeds.
- **Approved decision:** Do not show a provisional team in an unresolved individual
  slot. Preserve its source placeholder with an unresolved explanation. When the
  third-place boundary is unresolved, all Annex C-dependent slots are unresolved.

## Acceptance Criteria

- A live group goal can change projected Round-of-32 participants.
- A change to qualifying third-place groups updates all affected slots.
- Projection source explanations are available for UI tooltips, and unresolved placements remain explicitly unresolved.
