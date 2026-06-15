# Frontend Requirements

## World Cup 2026 Live Bracket Dashboard

**Source:** Frontend-relevant requirements extracted from `docs/product.md`  
**Application type:** Public, read-only, responsive static single-page application

---

## 1. Frontend goals

The frontend must present the full state of the tournament on one page and make it
easy to answer:

* Who is currently qualifying?
* Which Round-of-32 match would each team enter?
* What is the current score and status of every knockout match?
* Which third-place teams are above or below the qualification line?
* When was the displayed data last refreshed?

The dashboard must:

* Update without a page reload.
* Clearly distinguish projected participants from confirmed participants.
* Label unresolved or provisional placements rather than silently guessing.
* Preserve and display the last successful snapshot when a refresh fails.
* Remain usable on mobile, tablet, and desktop.
* Run as a static client-side application with no backend, database, accounts, or
  server-side rendering.

---

## 2. Technology and architecture

Use:

* React.
* TypeScript with strict mode enabled.
* Vite.
* Material UI and Material UI Icons.
* TanStack Query for fetching, caching, retry, and polling.
* A lightweight date library such as date-fns.
* Zod or equivalent runtime schema validation.
* Vitest, React Testing Library, Playwright, and Mock Service Worker or equivalent
  ESPN fixtures.

Material UI must be the only general-purpose UI component library. Use its theme
for colors, typography, spacing, breakpoints, borders, and component defaults.
Prefer Material UI components and the `sx` prop or styled components over raw
controls and custom CSS.

Custom CSS is limited to bracket connector geometry, grid positioning, horizontal
scrolling and snapping, accessibility utilities, and a future print layout.

The production frontend fetches ESPN's public FIFA World Cup scoreboard JSON
directly from the browser. It must never query, select, reconcile, or fall back to
another provider.

Frontend data flow:

```text
ESPN JSON
  -> EspnScoreboardDataSource
  -> runtime schema validation
  -> normalized TournamentSnapshot
  -> standings and qualification rules engine
  -> bracket and group-table view models
  -> React UI
```

UI components must consume normalized domain models and must never inspect raw
ESPN response fields. Bracket rendering consumes the fixed bracket topology but
does not own advancement or qualification logic. The rules engine must remain a
standalone TypeScript module with no React or ESPN dependencies.

All score values must distinguish `null` from zero.

---

## 3. Page structure

Arrange the page vertically in this order:

1. Application header and data status.
2. Knockout bracket.
3. Best third-place ranking.
4. Horizontally scrolling group tables.
5. Compact rules and data-source disclosure.
6. Footer.

The page must not require primary navigation, a hamburger menu, a second route,
or a modal to understand the tournament's current state.

---

## 4. Header

Use Material UI components such as `AppBar`, `Toolbar`, `Stack`, `Typography`,
`Chip`, `Tooltip`, `IconButton`, and `Alert`.

Display:

* Product title.
* Current tournament stage.
* A live indicator when at least one match is in progress.
* `Updated X seconds ago`.
* Manual refresh control.
* Local-time/UTC selector.
* Optional light/dark appearance control.

Behavior:

* The header may become compact and sticky after scrolling.
* The live indicator must use text and color.
* Refresh must show an in-progress state.
* Failed refreshes must preserve previously loaded data.
* Stale data must show a visible indicator.
* The UI must not imply that another data provider is being consulted.

---

## 5. Knockout bracket

### 5.1 Layout

The bracket is the primary visual element and flows left to right:

1. Round of 32: 16 matches.
2. Round of 16: 8 matches.
3. Quarter-finals: 4 matches.
4. Semi-finals: 2 matches.
5. Third-place match: 1 match.
6. Final: 1 match.

Use Material UI `Box` and CSS Grid for bracket columns, `Stack` for rounds and
matches, `Card` or `Paper` for match cards, `Chip` for status, `Divider` for team
rows, `Avatar` or a compact image wrapper for flags, `Typography` for metadata
and scores, and `Skeleton` for loading states.

When the full bracket does not fit:

* Make the bracket horizontally scrollable.
* Keep round headers visible where practical.
* Scroll the active tournament round into view on initial load.
* Provide a small round selector for quick navigation on mobile.
* Do not shrink match cards until their text is unreadable.

### 5.2 Match cards

Each match card must display:

* FIFA match number, such as `M73`.
* Round.
* Scheduled kickoff in the selected timezone.
* Venue or host city when space permits.
* Match status.
* Home and away teams or source-slot placeholders.
* Team flags.
* Current or final score.
* Penalty shootout score when applicable.
* The advancing team after a result is final.

Participant slots support these states:

* **Placeholder:** No team can be projected, for example `Winner M73`, `1E`, or
  `3A/B/C/D/F`.
* **Projected:** Show the team name, flag, a `Projected` chip, and a tooltip that
  explains the qualification source.
* **Provisional:** When a specific team is known but its placement still depends
  on an unresolved tiebreaker, render it like the other identified participants
  while keeping the participant labeled provisional rather than confirmed.
* **Confirmed:** The group stage or prior knockout match has conclusively placed
  the team in the slot.
* **Eliminated or superseded:** Replace a former projection without animation
  that could imply an official result.

Supported normalized statuses:

```text
SCHEDULED
PRE_MATCH
FIRST_HALF
HALF_TIME
SECOND_HALF
EXTRA_TIME
EXTRA_TIME_BREAK
PENALTY_SHOOTOUT
FINISHED
FINISHED_AFTER_EXTRA_TIME
FINISHED_AFTER_PENALTIES
POSTPONED
SUSPENDED
CANCELLED
UNKNOWN
```

Score presentation must clearly separate normal match scores from shootout
scores. Scheduled matches must not show fabricated zero scores, while a real
`0-0` score must display correctly. Missing penalty data must be shown as
unavailable rather than guessed.

Advancement behavior:

* A finished knockout winner populates the correct next-round slot.
* A live leader must not populate a future round as an official winner.
* A live leader may receive a subtle `currently ahead` treatment in its current
  card.
* Future rounds remain `Winner Mxx` until the preceding match is final.
* Round-of-32 teams may be projected during the group stage.
* Later-round participants must not be projected from unplayed knockout matches.

---

## 6. Group tables

Display all 12 group tables below the bracket in one horizontally scrolling,
scroll-snapping row. Use a horizontal Material UI `Stack` inside a scrolling
`Box`, with one fixed-width `Card` or `Paper` per group. Recommended card width
is 300-340 CSS pixels.

Each group card must contain:

* Group name, `Group A` through `Group L`.
* Four ranked team rows.
* Flag and team name or three-letter code.
* Played, wins, draws, losses, goal difference, and points.

Default compact columns:

| Pos | Team | P | W-D-L | GD | Pts |
| --- | ---- | -: | ----: | -: | --: |

Full goals-for and goals-against values may appear in a row tooltip.

Rows must distinguish direct qualifiers, qualifying third-place teams, third-place
teams outside the top eight, fourth-place teams, and unresolved placements.
Color alone must not communicate qualification state.

During live group matches:

* Reflect current scores in projected points, goals, ordering, and bracket slots.
* Mark affected group cards with a `Live` chip.
* Animate changed numeric values subtly.
* Avoid aggressive row movement that makes tables difficult to follow.
* Announce important changes through an ARIA live region without announcing every
  polling cycle.

---

## 7. Best third-place ranking

Display a compact table between the bracket and group cards with these columns:

| Rank | Group | Team | P | GD | GF | Conduct | Status |
| ---- | ----- | ---- | -: | -: | -: | ------: | ------ |

Requirements:

* Rank one third-place team from each of the 12 groups.
* Show a strong qualification line between positions 8 and 9.
* Show `Qualifying` for positions 1-8 and `Outside` for positions 9-12.
* Display `-` rather than zero when conduct data is unavailable.
* Explain the active tiebreaker in a tooltip.
* Mark unresolved orderings as `Provisional`.
* The table may collapse into an accordion on small screens, but the qualification
  line and top eight must remain easy to access.

Detailed ranking and third-place assignment algorithms are defined in
`docs/product.md`; the frontend must render their output and uncertainty without
reimplementing them in components.

---

## 8. Refresh, caching, and visibility

Polling intervals must be configurable:

* Live match: every 15-30 seconds.
* Matchday active window, from 30 minutes before kickoff until 30 minutes after
  the expected final whistle: every 60 seconds.
* Outside an active match window: every 10 minutes.
* Tournament complete: page load and manual refresh only.

The frontend must:

* Pause frequent polling while the tab is hidden.
* Refresh immediately when the tab becomes visible.
* Prevent overlapping requests and cancel obsolete requests.
* Deduplicate identical requests in the same refresh cycle.
* Reset retry delays after a successful response.
* Keep the last successful snapshot after failures.
* Use bounded exponential backoff, suggested as 15 seconds, 30 seconds, 60
  seconds, 2 minutes, then a maximum of 5 minutes.
* Allow manual refresh during retry delays.
* Never contact another provider after a failure.

Persist the latest successful normalized snapshot in local storage or IndexedDB.
On startup, render a valid saved snapshot immediately, label it as cached, fetch
fresh data, and replace it after a successful response.

Discard stored snapshots that have an incompatible schema version, belong to a
different tournament, are structurally invalid, exceed the configured retention
period, or are explicitly cleared.

Stale-data labels:

* More than 45 seconds old during a live match: `Updates delayed`.
* More than 5 minutes old on a matchday: `Data may be stale`.
* More than 30 minutes old outside a match window: `Last known data`.

---

## 9. Loading, empty, and error states

Initial load:

* Render bracket and group-card skeletons matching final dimensions.
* Do not use a full-screen spinner.
* Render a valid cached snapshot immediately when available.

Partial data:

* Render every field that can be normalized safely.
* Mark missing information as unavailable.
* Show FIFA-code initials in an `Avatar` when a flag fails.
* Show affected standings or tiebreakers as provisional when required data is
  unavailable.

Complete ESPN failure:

* Keep and display the last cached snapshot when available.
* Show a non-blocking `Alert`, data age, and manual retry.
* Preserve bracket and group scroll positions.
* Continue retrying ESPN without contacting another provider.
* If no cache exists, retain static bracket structure and group placeholders in a
  structured error state.

The absence of live matches is not an error. Show scheduled or completed matches
normally.

---

## 10. Responsive behavior

Desktop:

* Use most of the viewport width for the bracket.
* Show multiple rounds simultaneously.
* Keep group cards in a horizontally scrolling row.
* Show all third-place table columns where space permits.

Tablet:

* Keep the bracket horizontal and scrollable.
* Preserve readable team names.
* Snap one or two group cards at a time.

Mobile:

* Show one or two bracket rounds at once.
* Provide a round selector.
* Use short team names when required.
* Size group cards to approximately 85-92% of the viewport width.
* Hide conduct score unless it is actively resolving a tie.
* Keep touch targets at least 44 by 44 CSS pixels.

---

## 11. Accessibility

Target WCAG 2.2 AA.

Requirements:

* Full keyboard access to controls and horizontal scroll regions.
* Visible focus indicators.
* Scores and qualification states understandable without color.
* Meaningful flag alternative text.
* Decorative connector lines hidden from assistive technology.
* Polite live-score announcements that do not interrupt continuously.
* Reduced-motion support that disables score-change and row-movement animations.
* Correct table-header associations.
* Match-card accessible labels containing teams, score, status, and kickoff time.
* Usage instructions for horizontal regions for keyboard and assistive-technology
  users.
* Screen-reader exposure for data-source and stale-data warnings.

---

## 12. Performance and security

Performance:

* Keep initial JavaScript appropriate for a single dashboard page.
* Lazy-load nonessential rules and help content.
* Use small optimized flag assets and avoid full-resolution team artwork.
* Do not rerender every match card when one score changes.
* Maintain smooth horizontal scrolling on mid-range mobile hardware.
* Target Largest Contentful Paint below 2.5 seconds on typical broadband after
  static assets are cached.
* Avoid duplicate ESPN requests and unnecessary date-range prefetches.

Security:

* Do not commit or bundle secrets or alternate-provider API keys.
* Validate ESPN responses at runtime.
* Normalize provider strings before rendering.
* Never render provider-supplied HTML.
* Sanitize provider URLs before using them as links or image sources.
* Apply a Content Security Policy restricted to required ESPN and image origins.
* Do not send raw ESPN payloads to analytics or logging services.

Analytics are optional. The dashboard must work when analytics are blocked and
must not collect precise location, account identity, or cross-site advertising
identifiers by default.

---

## 13. Frontend acceptance criteria

* The one-page layout renders the header, full bracket, third-place ranking, all
  12 group cards, disclosure, and footer.
* Projected, confirmed, unresolved, qualifying, outside, live, finished, cached,
  stale, loading, partial-data, and error states are visually and accessibly
  distinct.
* All matches M73-M104 render in the correct topology supplied by configuration.
* A live group score can update standings, Round-of-32 projections, and
  third-place qualification without a page reload.
* Live knockout leaders never populate future-round winner slots.
* Shootout scores remain separate from match scores.
* Horizontal bracket and group scrolling work with mouse, touch, trackpad, and
  keyboard.
* Failed refreshes preserve the previous snapshot and show stale-data treatment.
* Hidden-tab polling pauses and visibility restoration triggers an immediate
  refresh.
* Multiple refresh triggers do not create overlapping requests.
* Invalid payloads do not corrupt rendered state.
* The production application never contacts a secondary provider.
* Material UI is used consistently and no second general-purpose component
  library is installed.
* The interface meets WCAG 2.2 AA and responsive requirements.

Required frontend-focused automated scenarios include match-card status and score
variants, missing flags and venue data, unknown statuses, malformed or changed
ESPN schemas, empty event arrays, cached-snapshot outage behavior, stale-data
behavior, visibility restoration, request overlap prevention, manual refresh
during retry delays, responsive horizontal scrolling, and keyboard/screen-reader
accessibility.
