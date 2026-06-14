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

- The PRD does not define the exact condition that makes a group-stage participant "confirmed" before the group stage is complete. Ask for the confirmation rule before labeling any placement confirmed.
- Ask how unresolved qualification-boundary ties should appear in individual Round-of-32 slots and whether a provisional team may be shown there.

## Acceptance Criteria

- A live group goal can change projected Round-of-32 participants.
- A change to qualifying third-place groups updates all affected slots.
- Projection source explanations are available for UI tooltips, and unresolved placements remain explicitly unresolved.
