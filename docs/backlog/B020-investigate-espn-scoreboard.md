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

## Acceptance Criteria

- Every production endpoint and parameter is documented.
- Fixtures contain no secrets or unnecessary raw metadata.
- Unknown or unobserved cases are explicitly listed for later validation.
