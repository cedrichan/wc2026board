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

## Product Requirements

- Assemble the exact one-page section order with no secondary route/modal required for core understanding.
- Connect `ESPN JSON -> validated adapter -> normalized snapshot -> local rules engine -> view models -> React UI`; components never inspect raw ESPN fields.
- Propagate live score changes without reload through group standings, third-place ranking, Annex C assignment, Round-of-32 bracket, header live state, and update timestamp.
- Preserve cached/last-known content, focus, and horizontal scroll positions through refresh and failure states.
- Add compact disclosure explaining projected standings/rules, ESPN as sole runtime data source, stale/provisional limitations, and no automatic provider fallback.
- Keep the product public, read-only, static, and free of accounts, user predictions, or backend behavior.

## Ambiguities / Decisions Required

- The PRD does not specify the exact rules/data-source disclosure or footer copy, links, and rights language. Ask for approved content before release-facing implementation.

## Acceptance Criteria

- Required page sections render in order without secondary routes or modals.
- Components never inspect raw ESPN fields.
- Live fixture changes propagate without page reload.
