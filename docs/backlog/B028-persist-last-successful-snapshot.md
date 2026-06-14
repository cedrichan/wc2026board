# B028: Persist the last successful snapshot

- **Estimate:** 3-4 hours
- **Dependencies:** B021
- **Parallelization:** Can run beside B025-B027 and UI work.

## Outcome

The browser loads, validates, retains, and clears the latest successful normalized snapshot.

## Scope

- Persist schema version, tournament ID, timestamps, normalized data, and diagnostics.
- Validate stored snapshots before use.
- Reject incompatible, invalid, cross-tournament, or expired data.

## Product Requirements

- Persist the latest successful normalized ESPN snapshot with generated/source timestamps, teams, matches, diagnostics, application schema version, and tournament identity.
- On startup, validate and render a valid cached snapshot immediately as cached, then replace it only after a successful fresh ESPN response.
- Discard structurally invalid, incompatible-schema, cross-tournament, expired, or explicitly cleared snapshots.
- Never overwrite the last successful snapshot with a failed, malformed, or incompatible response.
- Keep cached diagnostics provider-fixed to ESPN and do not persist raw provider payloads.

## Ambiguities / Decisions Required

- The PRD permits local storage or IndexedDB but does not choose one. Ask before implementation if repository constraints do not clearly favor one.
- Maximum retention period, storage key/version migration policy, and user-facing "clear cached data" location are unspecified; ask before selecting them.

## Acceptance Criteria

- A valid cached snapshot can render before a network response.
- Invalid or expired snapshots are discarded safely.
- Failed refreshes do not overwrite the last successful snapshot.
