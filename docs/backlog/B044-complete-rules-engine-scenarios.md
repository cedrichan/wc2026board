# B044: Complete rules-engine scenarios

- **Estimate:** 3-4 hours
- **Dependencies:** B018
- **Parallelization:** Can run beside B045-B048.

## Outcome

Rules-engine tests cover all ranking, projection, assignment, and advancement scenarios required by the PRD.

## Scope

- Add missing tests from required scenarios 1-16.
- Cover live goals changing direct and third-place bracket slots.
- Assert uncertainty and diagnostic metadata.

## Product Requirements

- Cover required scenarios 1-16: head-to-head points, overall GD after head-to-head, subset reapplication, conduct, latest/preceding FIFA rankings, third-place top eight/boundary, Annex C, live projection changes, normal/extra-time finishes, and shootouts.
- Validate all 495 Annex C rows and at least one authoritative known assignment.
- Assert live leaders do not advance, shootout values remain separate, and missing conduct/ranking/winner data remains provisional/unresolved.
- Keep rules tests deterministic and free of React, ESPN schemas, and live network access.
- Include regression assertions for source explanations and diagnostic metadata, not only final ordering.

## Ambiguities / Decisions Required

- If required scenarios expose an interpretation not settled by the PRD, stop and ask for the approved FIFA-regulations interpretation rather than encoding a convenient expectation.

## Acceptance Criteria

- Required group tie, conduct, ranking-edition, Annex C, live projection, extra-time, and shootout scenarios pass.
- Rules tests have no React or ESPN dependencies.
- All 495 Annex C rows remain validated.
