# B021: Validate ESPN runtime schema

- **Estimate:** 3-4 hours
- **Dependencies:** B002, B020
- **Parallelization:** Can run beside view-model and static UI work.

## Outcome

Zod schemas validate the ESPN fields needed for normalization and reject incompatible payloads.

## Scope

- Model required and optional response structures from captured fixtures.
- Fail safely on malformed JSON and incompatible shapes.
- Preserve useful validation diagnostics without exposing raw payloads.

## Product Requirements

- Validate only the ESPN structures required to create a useful normalized snapshot while tolerating documented optional-field absence.
- Reject malformed JSON and incompatible schema changes before normalization so invalid data cannot overwrite rendered/cached state.
- Return actionable diagnostics without logging, rendering, or sending raw ESPN payloads to analytics.
- Keep schemas and raw ESPN types isolated inside the adapter boundary.
- Support partial usable responses when optional flags, venue, events, timestamps, or similar fields are absent.

## Ambiguities / Decisions Required

- The PRD does not define the minimum viable ESPN payload or which missing fields invalidate an entire snapshot versus one match. Ask before selecting those failure boundaries.
- Ask whether unknown extra fields should be stripped, retained internally, or ignored; do not expose them outside the adapter.

## Acceptance Criteria

- Known fixtures pass schema validation.
- Malformed and changed-schema fixtures fail before normalization.
- Optional missing fields do not invalidate otherwise usable matches.
