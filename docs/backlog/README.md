# World Cup 2026 Dashboard Backlog

This backlog decomposes `docs/product.md` into tasks sized for one person to complete in roughly one hour to half a day. Task estimates include focused implementation and task-level tests, but not review or deployment lead time.

## Conventions

- Dependencies are task IDs that should be complete before starting the item.
- `None` means the task can start immediately.
- Parallelization describes the safest concurrent work, not a hard scheduling rule.
- Every task should leave the main branch buildable and its acceptance criteria demonstrably satisfied.

## Recommended Delivery Waves

| Wave | Goal | Tasks | Recommended parallelization |
| --- | --- | --- | --- |
| 1 | Establish the application and contracts | B001-B004 | B003 can run beside B002 after B001; B004 follows B002 |
| 2 | Add static tournament data | B005-B009 | Topology, ranking data, and Annex C work can run as three workstreams |
| 3 | Build the rules engine | B010-B018 | Group ranking is mostly sequential; advancement can run beside it |
| 4 | Isolate and normalize ESPN data | B019-B024 | Investigation and view-model work can run beside early adapter work |
| 5 | Add refresh reliability | B025-B029 | Polling policy, persistence, and state derivation can run concurrently |
| 6 | Build the dashboard UI | B030-B038 | Header, bracket, group tables, and supporting states are separate workstreams |
| 7 | Harden behavior and accessibility | B039-B043 | Accessibility, responsive, security, and performance work can overlap |
| 8 | Complete automated and release validation | B044-B048 | Rules, adapter, reliability, E2E, and release validation can run concurrently |

## Task Index

| ID | Task | Estimate | Dependencies |
| --- | --- | --- | --- |
| [B001](B001-scaffold-react-application.md) | Scaffold the React application | 2-4 hours | None |
| [B002](B002-define-domain-models.md) | Define normalized domain models | 2-3 hours | B001 |
| [B003](B003-create-theme-and-page-shell.md) | Create theme and page shell | 2-4 hours | B001 |
| [B004](B004-add-development-data-sources.md) | Add development data sources and fixtures | 2-4 hours | B002 |
| [B005](B005-add-bracket-topology.md) | Add fixed bracket topology | 2-4 hours | B002 |
| [B006](B006-validate-bracket-topology.md) | Validate bracket topology | 1-2 hours | B005 |
| [B007](B007-add-fifa-ranking-data.md) | Add versioned FIFA ranking data | 2-4 hours | B002 |
| [B008](B008-add-annex-c-data.md) | Add Annex C assignment data | 3-4 hours | B002 |
| [B009](B009-validate-annex-c-data.md) | Validate all Annex C rows | 2-3 hours | B008 |
| [B010](B010-calculate-basic-group-standings.md) | Calculate basic group standings | 3-4 hours | B002 |
| [B011](B011-rank-groups-by-head-to-head.md) | Rank group ties by head-to-head | 3-4 hours | B010 |
| [B012](B012-handle-head-to-head-subsets.md) | Handle remaining tied subsets | 3-4 hours | B011 |
| [B013](B013-add-conduct-and-provisional-ranking.md) | Add conduct and provisional ranking | 3-4 hours | B012 |
| [B014](B014-add-fifa-ranking-tiebreaker.md) | Add FIFA ranking tiebreaker | 2-4 hours | B007, B013 |
| [B015](B015-rank-third-place-teams.md) | Rank third-place teams | 3-4 hours | B013, B014 |
| [B016](B016-assign-third-place-qualifiers.md) | Assign third-place qualifiers | 3-4 hours | B009, B015 |
| [B017](B017-advance-knockout-winners.md) | Advance finished knockout winners | 3-4 hours | B005 |
| [B018](B018-build-round-of-32-projections.md) | Build Round-of-32 projections | 3-4 hours | B016, B017 |
| [B019](B019-build-dashboard-view-models.md) | Build dashboard view models | 3-4 hours | B006, B018 |
| [B020](B020-investigate-espn-scoreboard.md) | Investigate and capture ESPN responses | 3-4 hours | B001 |
| [B021](B021-validate-espn-runtime-schema.md) | Validate ESPN runtime schema | 3-4 hours | B002, B020 |
| [B022](B022-normalize-espn-teams-and-matches.md) | Normalize ESPN teams and matches | 3-4 hours | B021 |
| [B023](B023-normalize-status-clock-and-scores.md) | Normalize status, clock, and scores | 3-4 hours | B022 |
| [B024](B024-normalize-optional-espn-data.md) | Normalize optional ESPN data and diagnostics | 3-4 hours | B023 |
| [B025](B025-implement-espn-fixture-retrieval.md) | Implement ESPN fixture retrieval | 3-4 hours | B024 |
| [B026](B026-derive-polling-and-stale-policies.md) | Derive polling and stale-data policies | 2-3 hours | B002 |
| [B027](B027-integrate-tanstack-query-refresh.md) | Integrate refresh and retry behavior | 3-4 hours | B025, B026 |
| [B028](B028-persist-last-successful-snapshot.md) | Persist the last successful snapshot | 3-4 hours | B021 |
| [B029](B029-compose-dashboard-data-state.md) | Compose dashboard data state | 3-4 hours | B027, B028 |
| [B030](B030-build-dashboard-header.md) | Build the dashboard header | 3-4 hours | B003, B026 |
| [B031](B031-build-match-card.md) | Build match-card states | 3-4 hours | B003, B019 |
| [B032](B032-build-bracket-layout.md) | Build bracket layout | 3-4 hours | B006, B031 |
| [B033](B033-add-bracket-navigation.md) | Add bracket navigation | 2-4 hours | B032 |
| [B034](B034-build-group-card.md) | Build group card | 3-4 hours | B003, B019 |
| [B035](B035-build-group-card-strip.md) | Build group-card strip | 2-3 hours | B034 |
| [B036](B036-build-third-place-table.md) | Build third-place table | 3-4 hours | B003, B019 |
| [B037](B037-build-loading-and-error-states.md) | Build loading and error states | 3-4 hours | B003, B029 |
| [B038](B038-connect-one-page-dashboard.md) | Connect the one-page dashboard | 3-4 hours | B030-B037 |
| [B039](B039-add-horizontal-region-accessibility.md) | Add horizontal-region accessibility | 2-4 hours | B033, B035 |
| [B040](B040-add-live-announcements-and-motion.md) | Add live announcements and reduced motion | 3-4 hours | B034, B038 |
| [B041](B041-polish-responsive-layout.md) | Polish responsive layout | 3-4 hours | B038 |
| [B042](B042-add-security-controls.md) | Add browser security controls | 2-4 hours | B025, B038 |
| [B043](B043-audit-rendering-performance.md) | Audit rendering and bundle performance | 3-4 hours | B038 |
| [B044](B044-complete-rules-engine-scenarios.md) | Complete rules-engine scenarios | 3-4 hours | B018 |
| [B045](B045-complete-espn-adapter-scenarios.md) | Complete ESPN adapter scenarios | 3-4 hours | B025 |
| [B046](B046-complete-refresh-reliability-scenarios.md) | Complete refresh reliability scenarios | 3-4 hours | B029 |
| [B047](B047-add-dashboard-end-to-end-tests.md) | Add dashboard end-to-end tests | 3-4 hours | B038-B041 |
| [B048](B048-prepare-release-validation.md) | Prepare release validation | 3-4 hours | B042-B047 |
