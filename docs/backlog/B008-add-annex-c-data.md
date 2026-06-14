# B008: Add Annex C assignment data

- **Estimate:** 3-4 hours
- **Dependencies:** B002
- **Parallelization:** Can run beside B005-B007 and B010.

## Outcome

A versioned static `third-place-assignments.json` containing all 495 official qualifying-group combinations.

## Scope

- Import the official Annex C combinations into the documented shape.
- Normalize qualifying-group keys and slot group letters.
- Record source/version notes adjacent to the data.

## Acceptance Criteria

- The file contains exactly 495 unique combination rows.
- Every row defines all eight required group-winner slots.
- No greedy or inferred runtime assignment is introduced.
