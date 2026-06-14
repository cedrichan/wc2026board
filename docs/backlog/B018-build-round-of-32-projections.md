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

## Acceptance Criteria

- A live group goal can change projected Round-of-32 participants.
- A change to qualifying third-place groups updates all affected slots.
- Projection source explanations are available for UI tooltips.
