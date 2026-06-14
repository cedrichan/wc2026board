# B005: Add fixed bracket topology

- **Estimate:** 2-4 hours
- **Dependencies:** B002
- **Parallelization:** Can run beside B007-B010 and B020.

## Outcome

Versioned static configuration describing official matches M73-M104 and all winner feeds.

## Scope

- Define bracket source-slot types.
- Add every Round-of-32 through final and third-place match.
- Store topology independently from visual layout.

## Product Requirements

- Represent all 32 knockout matches M73-M104: 16 Round of 32, 8 Round of 16, 4 quarter-finals, 2 semi-finals, 1 third-place match, and 1 final.
- Define each match's home/away source and every applicable winner feed target/side as static, versioned configuration.
- Represent Round-of-32 direct group-position sources and Annex C-dependent third-place sources explicitly.
- Keep topology independent from rendering order, CSS grid position, qualification calculation, and ESPN response ordering.
- Preserve `Winner Mxx` source information so unresolved future participants can be displayed accurately.

## Ambiguities / Decisions Required

- The PRD does not include the complete official M73-M104 topology or cite a specific regulations edition. Obtain and record the approved official source/version before entering topology; ask if no source is designated.
- Confirm whether the third-place match consumes semi-final losers via explicit loser feeds or a separate placement source type before finalizing the schema.

## Acceptance Criteria

- Exactly 32 knockout definitions exist for M73-M104.
- Every applicable winner feed reaches the expected later match, and the approved placement-feed representation covers the third-place match.
- Rendering code is not required to interpret visual position as topology.
