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

## Acceptance Criteria

- Required group tie, conduct, ranking-edition, Annex C, live projection, extra-time, and shootout scenarios pass.
- Rules tests have no React or ESPN dependencies.
- All 495 Annex C rows remain validated.
