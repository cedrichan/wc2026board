# B024: Normalize optional ESPN data and diagnostics

- **Estimate:** 3-4 hours
- **Dependencies:** B023
- **Parallelization:** Can run beside refresh-policy and UI component tasks.

## Outcome

The adapter safely handles venue, city, source timestamps, disciplinary events, flags, empty events, and missing fields.

## Scope

- Normalize usable optional fields and sanitize provider strings/URLs.
- Add missing-field and conduct-coverage diagnostics.
- Treat incomplete disciplinary data as unavailable, not zero.

## Acceptance Criteria

- Missing venue, flag, and empty event arrays do not crash.
- Unsafe URLs and provider HTML are not exposed to rendering.
- Incomplete conduct data can trigger provisional rules-engine output.
