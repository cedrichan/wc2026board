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

## Acceptance Criteria

- All 495 rows pass validation.
- Corrupt keys, missing slots, and duplicate assignments fail clearly.
- Validation is included in the normal test or build workflow.
