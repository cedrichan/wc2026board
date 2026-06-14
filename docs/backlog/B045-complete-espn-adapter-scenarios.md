# B045: Complete ESPN adapter scenarios

- **Estimate:** 3-4 hours
- **Dependencies:** B025
- **Parallelization:** Can run beside B044 and B046-B048.

## Outcome

Adapter tests cover required valid, partial, unknown, malformed, and changed-schema ESPN cases.

## Scope

- Add missing tests from required scenarios 17-27 and 31-32.
- Verify optional fields, IDs, statuses, empty events, and penalty mapping.
- Assert development sources cannot become production fallbacks.

## Product Requirements

- Cover required scenarios 17-27 and 31-32: missing flag, unknown status, malformed JSON, scheduled/live/full-time mapping, stable team IDs, empty events, missing venue, schema change, and dev-only source restrictions.
- Add fixture-backed coverage for extra time, in-progress/completed penalties, missing penalty data, interrupted statuses, source timestamps, and incomplete conduct diagnostics as captured data permits.
- Assert invalid/incompatible payloads fail before normalization and cannot corrupt a previous snapshot.
- Assert raw ESPN types stay inside the adapter and production configuration resolves only `EspnScoreboardDataSource`.
- Run without contacting live ESPN.

## Ambiguities / Decisions Required

- Do not fabricate ESPN fixtures for unobserved schema states. Ask whether an unobserved release-critical state should remain blocked/not-yet-verifiable or be represented by an explicitly synthetic contract fixture.

## Acceptance Criteria

- Invalid payloads fail validation without corrupting a snapshot.
- Unknown and missing optional data remain renderable with diagnostics.
- Production configuration resolves only `EspnScoreboardDataSource`.
