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

## Product Requirements

- Validate every ESPN response at runtime, normalize upstream strings, sanitize URLs, and never render provider-supplied HTML.
- Restrict CSP network access to ESPN and only approved required origins; restrict image sources to approved hosts.
- Ensure production contains no secrets, alternate-provider API keys/URLs, development fixtures with sensitive data, or runtime fallback paths.
- Prevent raw ESPN payloads from reaching logs or analytics.
- Keep the app functional as a static direct-browser ESPN client; do not add a proxy as part of MVP.

## Ambiguities / Decisions Required

- CSP delivery mechanism and allowed static/image/analytics origins depend on the selected host and optional analytics. Ask for approved origins and hosting target before finalizing policy.
- Ask for the URL/string sanitization policy if B024 has not established one.

## Acceptance Criteria

- Production bundle contains no alternate-provider credentials.
- CSP blocks unapproved connection origins.
- Raw ESPN payloads are not sent to logs or analytics.
