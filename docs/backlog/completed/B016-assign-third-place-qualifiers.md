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

## Product Requirements

- Take the resolved top eight third-place teams, sort their group letters alphabetically, and select exactly one matching official Annex C row.
- Populate the eight applicable Round-of-32 opponents for winner slots `1A`, `1B`, `1D`, `1E`, `1G`, `1I`, `1K`, and `1L`.
- Ensure each selected third-place team appears exactly once and no group winner receives an opponent from an invalid group.
- Treat missing, duplicate, invalid, or non-unique Annex C rows as explicit diagnostic failures; never infer a greedy assignment.
- Keep assignment logic pure and independent from rendering and ESPN.

## Ambiguities / Decisions Required

- **Approved decision:** Annex C assignment is allowed when top-eight membership is
  definitive, even if ordering wholly within the top eight or bottom four remains
  provisional. Do not assign Annex C slots when uncertainty spans the qualification
  boundary.

## Acceptance Criteria

- For a resolved top eight, exactly eight unique teams are assigned once each; an unresolved boundary follows the product-owner decision instead of being guessed.
- No winner receives an invalid third-place opponent.
- Tests cover a known combination and a changed qualification combination.
