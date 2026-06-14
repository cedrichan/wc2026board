# B042: Add browser security controls

- **Estimate:** 2-4 hours
- **Dependencies:** B025, B038
- **Parallelization:** Can run beside B039-B041, B043, and automated-test tasks.

## Outcome

The static application restricts network/content origins and prevents unsafe provider content from rendering.

## Scope

- Add a CSP compatible only with required ESPN/image/static origins.
- Verify URLs and strings are sanitized and provider HTML is never rendered.
- Add production checks for secrets and alternate-provider keys/URLs.

## Acceptance Criteria

- Production bundle contains no alternate-provider credentials.
- CSP blocks unapproved connection origins.
- Raw ESPN payloads are not sent to logs or analytics.
