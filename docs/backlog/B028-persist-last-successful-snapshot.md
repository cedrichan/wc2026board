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

## Acceptance Criteria

- A valid cached snapshot can render before a network response.
- Invalid or expired snapshots are discarded safely.
- Failed refreshes do not overwrite the last successful snapshot.
