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

## Product Requirements

- Store all 495 possible combinations of eight qualifying third-place group letters in versioned static JSON.
- Use alphabetically sorted eight-letter combination keys and define opponents for winner slots `1A`, `1B`, `1D`, `1E`, `1G`, `1I`, `1K`, and `1L`.
- Preserve the official mapping exactly; runtime code must select a row and must never infer assignments greedily.
- Record the regulations/source edition and import provenance next to the data for auditability.

## Ambiguities / Decisions Required

- The PRD does not contain the 495 rows or identify an approved machine-readable source. Ask for the authoritative FIFA Annex C source/version before importing or transforming data.
- Ask whether source transcription/import requires independent review or a checked-in generation script before treating the dataset as complete.

## Acceptance Criteria

- The file contains exactly 495 unique combination rows.
- Every row defines all eight required group-winner slots.
- No greedy or inferred runtime assignment is introduced.
