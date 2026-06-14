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

## Product Requirements

- Store versioned static JSON editions containing normalized team ID, FIFA code, and rank.
- Compare the most recently published men's ranking first, then immediately preceding editions until a tie separates.
- Make missing teams/editions explicit and preserve provisional diagnostics rather than guessing.
- Record exactly which ranking editions are bundled in build-readable metadata for release verification.
- Treat ranking data as static application data; do not fetch rankings from another provider at runtime.

## Ambiguities / Decisions Required

- The PRD gives example filenames but does not specify the exact ranking publication dates to bundle or the approved source/import process. Ask for those before importing data.
- Ask how normalized team IDs are assigned/mapped if the official ranking source only supplies FIFA codes.

## Acceptance Criteria

- A team can be looked up consistently by normalized team ID or FIFA code.
- Missing ranking data remains explicit.
- Tests cover lookup across more than one edition.
