# B009: Validate all Annex C rows

- **Estimate:** 2-3 hours
- **Dependencies:** B008
- **Parallelization:** Can run beside rules-engine tasks that do not yet consume Annex C.

## Outcome

Build-time or unit-test validation proving Annex C data integrity.

## Scope

- Validate unique sorted eight-letter keys.
- Validate required winner slots and allowed group letters.
- Assert each selected third-place group appears exactly once per row.
- Add at least one known assignment assertion.

## Product Requirements

- Validate exactly 495 unique rows and exactly eight unique selected groups per sorted key.
- Require all eight winner slots (`1A`, `1B`, `1D`, `1E`, `1G`, `1I`, `1K`, `1L`) in every row.
- Reject group letters outside A-L, assignments to a non-qualifying group, duplicate third-place opponents, missing slots, extra slots, and malformed keys.
- Run validation in the normal test or build workflow and include authoritative golden assertions, not only structural checks.

## Ambiguities / Decisions Required

- The PRD asks for at least one known assignment but does not identify it. Ask which official rows should be used as golden assertions and cite their source.

## Acceptance Criteria

- All 495 rows pass validation.
- Corrupt keys, missing slots, and duplicate assignments fail clearly.
- Validation is included in the normal test or build workflow.
