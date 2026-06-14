# B038: Connect the one-page dashboard

- **Estimate:** 3-4 hours
- **Dependencies:** B030, B031, B032, B033, B034, B035, B036, B037
- **Parallelization:** Integration task; start after component work converges.

## Outcome

The complete one-page dashboard consumes composed data state and rules-engine view models.

## Scope

- Connect fresh/cached snapshots through the rules engine to all page sections.
- Add compact rules/data-source disclosure and footer.
- Verify a live group-score fixture updates standings, third-place rank, and bracket.

## Acceptance Criteria

- Required page sections render in order without secondary routes or modals.
- Components never inspect raw ESPN fields.
- Live fixture changes propagate without page reload.
