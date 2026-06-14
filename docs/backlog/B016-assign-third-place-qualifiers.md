# B016: Assign third-place qualifiers

- **Estimate:** 3-4 hours
- **Dependencies:** B009, B015
- **Parallelization:** Can run beside B017 and provider/UI work.

## Outcome

The top eight third-place groups select exactly one Annex C row and populate the required group-winner slots.

## Scope

- Sort qualifying group letters into the Annex C key.
- Resolve each assigned third-place team by group.
- Return explicit diagnostics for a missing or invalid assignment.

## Acceptance Criteria

- Exactly eight unique teams are assigned once each.
- No winner receives an invalid third-place opponent.
- Tests cover a known combination and a changed qualification combination.
