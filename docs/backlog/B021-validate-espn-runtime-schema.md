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

## Acceptance Criteria

- Known fixtures pass schema validation.
- Malformed and changed-schema fixtures fail before normalization.
- Optional missing fields do not invalidate otherwise usable matches.
