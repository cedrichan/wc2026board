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

## Product Requirements

- Normalize venue, host city, source timestamp, safe flag/logo URLs, and disciplinary events when usable.
- Handle missing flags, venue, empty events, source timestamps, and other optional fields without crashing or invalidating otherwise useful matches.
- Determine and report disciplinary coverage; incomplete coverage must make conduct unavailable/provisional rather than zero.
- Normalize upstream strings before rendering, reject unsafe URLs, and never render provider-supplied HTML.
- Preserve diagnostic metadata needed to explain unavailable fields and unresolved tiebreakers.

## Ambiguities / Decisions Required

- The PRD does not define an allowlist of image hosts/URL schemes or a concrete string sanitization policy. Ask before finalizing sanitizer behavior and CSP dependencies.
- Ask how conduct coverage completeness is established from ESPN data before marking disciplinary data complete.

## Acceptance Criteria

- Missing venue, flag, and empty event arrays do not crash.
- Unsafe URLs and provider HTML are not exposed to rendering.
- Incomplete conduct data can trigger provisional rules-engine output.
