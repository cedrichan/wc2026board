# B025: Implement ESPN fixture retrieval

- **Estimate:** 3-4 hours
- **Dependencies:** B024
- **Parallelization:** Can run beside B026, B028, and UI work.

## Outcome

The production ESPN source retrieves and deduplicates the fixture range needed for a complete tournament snapshot.

## Scope

- Implement documented scoreboard/date/range requests with `AbortSignal`.
- Merge and deduplicate responses into one normalized snapshot.
- Ensure ESPN is the sole production runtime provider.

## Acceptance Criteria

- Obsolete requests can be cancelled.
- Duplicate fixtures do not create duplicate matches.
- No alternate provider URL, key, or fallback path exists in production code.
