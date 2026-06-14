# B020: Investigate and capture ESPN responses

- **Estimate:** 3-4 hours
- **Dependencies:** B001
- **Parallelization:** Can run beside all static-data and rules-engine tasks.

## Outcome

Documented ESPN endpoints/parameters and sanitized fixture responses representing key match states.

## Scope

- Record scoreboard and necessary date/range request behavior.
- Capture scheduled, live, finished, extra-time, shootout, and partial responses when available.
- Document observed IDs, CORS, optional fields, and schema risks.

## Product Requirements

- Investigate the public FIFA World Cup scoreboard endpoint and document every endpoint, query parameter, date/range request, and event-detail request production may depend on.
- Record browser CORS behavior, fixture-range coverage, stable team/match IDs, kickoff/status/clock/score fields, completion/winner data, penalties, venue/city, flags, events, and source timestamps.
- Capture sanitized fixtures for all observable key states and explicitly list unobserved states for later release validation.
- Document schema variability, rate-limit uncertainty, terms/display-rights risk, and whether 15-30 second live polling appears reasonable.
- Do not add alternate-provider investigation or runtime fallback behavior to implementation scope.

## Ambiguities / Decisions Required

- ESPN is undocumented and tournament states may not yet be observable. Ask before inventing fixture shapes or treating assumptions as validated facts.
- Ask which raw fields must be removed or transformed when sanitizing captured fixtures if licensing/privacy guidance is not documented.

## Acceptance Criteria

- Every production endpoint and parameter is documented.
- Fixtures contain no secrets or unnecessary raw metadata.
- Unknown or unobserved cases are explicitly listed for later validation.
