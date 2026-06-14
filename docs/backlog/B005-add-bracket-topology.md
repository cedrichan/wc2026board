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

## Acceptance Criteria

- Exactly 32 knockout definitions exist for M73-M104.
- Every non-final winner feeds the expected later match or placement match.
- Rendering code is not required to interpret visual position as topology.
