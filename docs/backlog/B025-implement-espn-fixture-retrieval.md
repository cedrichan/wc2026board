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

## Product Requirements

- Retrieve enough ESPN scoreboard/date/range/event data to cover the full group and knockout fixture set in a single normalized snapshot.
- Document every production endpoint and parameter, support cancellation, and avoid duplicate/unnecessary date-range requests.
- Merge/deduplicate responses deterministically and pass each payload through runtime validation before normalization/use.
- Make ESPN the only production runtime provider: no fallback, provider selector, parallel comparison, alternate key, or proxy.
- Produce diagnostics for incomplete fixture coverage while retaining usable data.

## Ambiguities / Decisions Required

- The exact ESPN date/range request strategy is intentionally left to investigation. Ask before shipping a strategy whose full-tournament coverage or rate behavior has not been validated.
- Ask for conflict-resolution rules if duplicate responses disagree and B022 has not established them.

## Acceptance Criteria

- Obsolete requests can be cancelled.
- Duplicate fixtures do not create duplicate matches.
- No alternate provider URL, key, or fallback path exists in production code.
