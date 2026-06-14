# B007: Add versioned FIFA ranking data

- **Estimate:** 2-4 hours
- **Dependencies:** B002
- **Parallelization:** Can run beside topology and Annex C work.

## Outcome

Versioned static FIFA ranking editions with a typed lookup API and bundled-edition metadata.

## Scope

- Add the required ranking JSON structure and loader.
- Support current and preceding editions in order.
- Record bundled edition identifiers in build-readable metadata.

## Acceptance Criteria

- A team can be looked up consistently by normalized team ID or FIFA code.
- Missing ranking data remains explicit.
- Tests cover lookup across more than one edition.
