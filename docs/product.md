# Product Requirements Document

## World Cup 2026 Live Bracket Dashboard

**Status:** Draft v0.2
**Product type:** Public, read-only, single-page web application
**Working title:** World Cup 2026 Dashboard
**Primary platform:** Responsive desktop and mobile web
**Tournament:** FIFA World Cup 2026

---

## 1. Product summary

The World Cup 2026 Dashboard is a live tournament status page that presents the entire competition in one view.

The page will display:

1. A horizontally arranged knockout bracket at the top.
2. Current and projected Round-of-32 participants based on live group standings.
3. Live, scheduled, and completed knockout match scores.
4. Penalty shootout scores when applicable.
5. All 12 group tables in a horizontally scrolling row below the bracket.
6. A ranking of the 12 third-place teams showing which eight currently qualify.

The application should answer these questions quickly:

* Who is currently qualifying?
* Which Round-of-32 match would each team enter?
* What is the current score of every knockout match?
* Which third-place teams are above or below the qualification line?
* When was the displayed data last refreshed?

The product is informational only. It will not require accounts, user-generated content, predictions, or a database.

---

## 2. Goals

### 2.1 Primary goals

* Show the state of the full tournament on one webpage.
* Keep the bracket synchronized with the latest available ESPN match data.
* Correctly project all 32 knockout participants during the group stage.
* Correctly assign the eight qualifying third-place teams to their Round-of-32 slots.
* Clearly distinguish projected bracket participants from officially confirmed participants.
* Provide useful live status information without requiring navigation to separate match or group pages.
* Remain usable on mobile, tablet, and desktop screens.
* Operate as a static, client-side web application without a backend.

### 2.2 Success criteria

The product is successful when:

* A visitor can identify all currently qualifying teams within several seconds.
* The bracket updates without a page reload when match scores change.
* The projected Round-of-32 assignments match the official FIFA qualification rules.
* Completed penalty shootouts are displayed unambiguously.
* All 12 groups are reachable through horizontal scrolling.
* Temporary ESPN failures do not immediately erase the last successfully loaded state.
* The application can be deployed as static files without server-side application logic.

---

## 3. Non-goals

The MVP will not include:

* User accounts or authentication.
* Personalized favorite teams.
* Push notifications.
* Match commentary.
* Lineups, player statistics, possession, shots, or expected goals.
* Betting odds.
* Bracket predictions entered by users.
* News articles or video highlights.
* Historical World Cup tournaments.
* An administrative dashboard.
* A persistent application database.
* A server-side application component.
* Runtime scraping of FIFA webpages.
* Runtime switching between sports-data providers.
* Automatic failover to another provider when ESPN is unavailable.
* Official FIFA branding, logos, or other protected artwork unless separately licensed.

Country flags or neutral team identifiers may be used where licensing permits.

---

## 4. Target users

### 4.1 Casual viewer

Wants a quick visual answer to who is advancing and what matches are currently live.

### 4.2 Tournament follower

Wants to understand how group results affect the Round-of-32 bracket, particularly the best third-place teams.

### 4.3 Second-screen viewer

Keeps the dashboard open during simultaneous group matches and expects automatic updates.

---

## 5. Product principles

### 5.1 One-page comprehension

The most important tournament information should be available without opening a second route or modal.

### 5.2 Projection must be labeled

During the group stage, the bracket represents what would happen if all current scores became final. It must be labeled **Projected** rather than presented as official.

### 5.3 Never silently guess

When a tie cannot be resolved because required disciplinary or ranking data is missing, the UI must label the placement as provisional or unresolved.

### 5.4 Tournament rules are independent from ESPN

The application must not assume that ESPN’s ordering or standings implement the exact 2026 FIFA rules.

Qualification and bracket-placement logic belongs in a tested local rules engine.

### 5.5 Last-known data is better than a blank page

When an ESPN refresh fails, display the most recent successful snapshot with a stale-data warning.

The application must not switch to another provider automatically.

### 5.6 Provider dependency must remain isolated

Although ESPN is the only runtime provider, ESPN-specific response fields must be contained inside a dedicated adapter.

This makes a future provider migration possible without coupling the user interface or qualification engine to ESPN’s schema.

---

## 6. Page structure

The page is arranged vertically in this order:

1. Application header and data status.
2. Knockout bracket.
3. Best third-place ranking.
4. Horizontally scrolling group tables.
5. Compact rules and data-source disclosure.
6. Footer.

The page must not require a hamburger menu or primary navigation.

---

## 7. Header requirements

Use Material UI components such as:

* `AppBar`
* `Toolbar`
* `Stack`
* `Typography`
* `Chip`
* `Tooltip`
* `IconButton`
* `Alert`

The header must contain:

* Product title.
* Tournament status, such as:

  * Group stage
  * Round of 32
  * Round of 16
  * Quarter-finals
  * Semi-finals
  * Final
  * Tournament complete
* A live indicator when at least one match is in progress.
* “Updated X seconds ago.”
* Manual refresh button.
* Local-time/UTC display selector.
* Optional light/dark appearance control.

### Header behavior

* The header may become compact and sticky after scrolling.
* The live indicator must use both text and color.
* The refresh control must show an in-progress state while fetching.
* A failed refresh must not remove previously loaded data.
* A stale-data indicator must appear when ESPN has not refreshed successfully within the configured threshold.
* The UI must not suggest that another provider is being consulted.

---

## 8. Knockout bracket requirements

### 8.1 General layout

The bracket appears at the top of the page and is the primary visual element.

Rounds:

1. Round of 32 — 16 matches
2. Round of 16 — 8 matches
3. Quarter-finals — 4 matches
4. Semi-finals — 2 matches
5. Third-place match — 1 match
6. Final — 1 match

The bracket should flow from left to right.

On screens where the full bracket does not fit:

* The bracket container must scroll horizontally.
* Round headers should remain visible while scrolling where practical.
* The active tournament round should be scrolled into view on initial load.
* A small round selector may jump to a bracket column.
* The layout must not shrink match cards until text becomes unreadable.

### 8.2 Component implementation

Use Material UI for the visible interface:

* `Box` and CSS Grid for bracket columns.
* `Stack` for round and match arrangement.
* `Card` or `Paper` for match cards.
* `Chip` for status.
* `Divider` for team rows.
* `Avatar` or a compact image wrapper for flags.
* `Typography` for match metadata and scores.
* `Skeleton` for loading states.

Custom CSS should be limited to:

* Bracket connector lines.
* Grid positioning.
* Horizontal scrolling and scroll snapping.
* Print layout if later required.

Do not introduce a second general-purpose UI component library.

### 8.3 Match-card contents

Each match card must display:

* FIFA match number, such as `M73`.
* Round.
* Scheduled kickoff time in the selected timezone.
* Venue or host city when space permits.
* Match status.
* Home team or source slot.
* Away team or source slot.
* Team flags.
* Current or final score.
* Penalty shootout score when applicable.
* A visual indication of the advancing team after the result is final.

### 8.4 Participant states

A participant slot can be in one of four states.

#### Placeholder

Used when no team can yet be projected.

Examples:

* `Winner M73`
* `1E`
* `3A/B/C/D/F`

#### Projected

A team has been calculated from current group scores but is not officially confirmed.

Display:

* Team name and flag.
* A small `Projected` chip.
* Tooltip explaining the qualification source, such as `Projected winner of Group E`.

#### Confirmed

The group stage or prior knockout match has conclusively placed the team in the slot.

#### Eliminated or superseded

A previously projected team moved out of the slot after a live score changed.

Update the slot without animation that could imply an official result.

### 8.5 Match status normalization

The UI must support these normalized states:

* `SCHEDULED`
* `PRE_MATCH`
* `FIRST_HALF`
* `HALF_TIME`
* `SECOND_HALF`
* `EXTRA_TIME`
* `EXTRA_TIME_BREAK`
* `PENALTY_SHOOTOUT`
* `FINISHED`
* `FINISHED_AFTER_EXTRA_TIME`
* `FINISHED_AFTER_PENALTIES`
* `POSTPONED`
* `SUSPENDED`
* `CANCELLED`
* `UNKNOWN`

ESPN-specific status values must be converted in the ESPN adapter.

### 8.6 Score presentation

Examples:

#### Scheduled

`USA — Australia`

#### Live

`USA 1–0 Australia`
`67′`

#### Extra time

`USA 2–2 Australia`
`ET 113′`

#### Penalty shootout in progress

`USA 2–2 Australia`
`PEN 4–3`

#### Completed after penalties

`USA 2–2 Australia`
`Pens 5–4`

Shootout kicks must not be added to the normal match score.

### 8.7 Advancement behavior

* A completed knockout winner must populate the correct next-round slot.
* A live match leader must not be treated as an official winner.
* The leading team may receive a subtle “currently ahead” treatment within its current match card.
* Future rounds remain `Winner Mxx` until the preceding match is final.
* During the group stage, Round-of-32 participants may be projected.
* Later-round participants must not be projected from unplayed knockout matches.

---

## 9. Group table requirements

### 9.1 Layout

All 12 group tables must appear below the bracket in a single horizontally scrolling row.

Use:

* A Material UI `Stack` with `direction="row"`.
* A horizontally scrolling `Box`.
* One fixed-width `Card` or `Paper` per group.
* Scroll snapping between group cards.

Recommended card width: 300–340 CSS pixels.

### 9.2 Table contents

Each group card must contain:

* Group name, `Group A` through `Group L`.
* Four team rows.
* Current ranking.
* Flag.
* Team name or three-letter code when necessary.
* Played.
* Wins.
* Draws.
* Losses.
* Goal difference.
* Points.

The compact default columns are:

| Pos | Team |  P | W-D-L | GD | Pts |
| --- | ---- | -: | ----: | -: | --: |

Full goals-for and goals-against values may appear in a row tooltip.

### 9.3 Qualification treatments

Rows must indicate:

* First and second: currently direct qualifiers.
* Third and among the best eight third-place teams: currently qualifying.
* Third and outside the best eight: currently eliminated.
* Fourth: currently eliminated.

Color alone must not convey the state. Include an icon, label, border, or accessible description.

### 9.4 Live group behavior

For an ongoing match:

* Treat the current score as the result for projection purposes.
* Update points, goals, and ordering when the score changes.
* Mark the affected group card with a `Live` chip.
* Animate changed numeric values subtly.
* Avoid moving rows so aggressively that the table becomes difficult to follow.
* Announce important changes through an ARIA live region without announcing every polling cycle.

---

## 10. Best third-place ranking

A separate compact table must appear between the bracket and the group cards.

It must rank the third-place team from each of the 12 groups.

Columns:

| Rank | Group | Team |  P | GD | GF | Conduct | Status |
| ---- | ----- | ---- | -: | -: | -: | ------: | ------ |

Requirements:

* Display a strong qualification line between positions 8 and 9.
* Positions 1–8 show `Qualifying`.
* Positions 9–12 show `Outside`.
* When conduct data is unavailable, display `—` rather than zero.
* A tooltip must explain the tiebreaker used for the current ordering.
* The table may collapse into an accordion on small screens.
* The qualification line and top eight must remain easy to access.

---

## 11. Tournament rules engine

The rules engine is a standalone TypeScript module with no React or ESPN dependencies.

It must be deterministic and covered by unit tests.

### 11.1 Group match points

* Win: 3 points.
* Draw: 1 point.
* Loss: 0 points.

### 11.2 Live projection rule

For projection purposes:

* Completed matches use their final score.
* Live matches use their current score as though the match ended at that moment.
* Scheduled matches contribute nothing.
* Abandoned, suspended, or postponed matches contribute only when ESPN explicitly supplies an official result.

### 11.3 Ranking teams tied within the same group

When two or more teams in one group are equal on points, apply:

#### Step 1: Matches among the tied teams

1. Points obtained in matches among the tied teams.
2. Goal difference in matches among the tied teams.
3. Goals scored in matches among the tied teams.

#### Step 2: Remaining tied subset

When only a subset remains tied after Step 1:

* Reapply the three head-to-head criteria to matches among the remaining tied teams only.
* Continue with the unresolved subset as specified by the tournament rules.

If still tied, apply:

4. Overall group-stage goal difference.
5. Overall group-stage goals scored.
6. Team conduct score.

Conduct deductions:

* Yellow card: −1
* Indirect red card from two yellow cards: −3
* Direct red card: −4
* Yellow card plus direct red card: −5

Only one applicable deduction is counted for a person in a single match.

The team with the higher conduct score ranks higher.

#### Step 3: FIFA ranking

If teams remain tied:

1. Most recently published FIFA men’s ranking.
2. Immediately preceding ranking edition.
3. Continue through preceding editions until separated.

### 11.4 Ranking the 12 third-place teams

Rank the third-place finishers using:

1. Total group-stage points.
2. Overall goal difference.
3. Overall goals scored.
4. Team conduct score.
5. Most recent FIFA men’s ranking.
6. Preceding ranking editions until separated.

The first eight teams qualify.

Head-to-head results do not apply between teams from different groups.

### 11.5 Incomplete tiebreaker data

ESPN disciplinary data may not include all cards shown to players or team officials.

When required data is incomplete:

* Calculate all criteria that can be calculated.
* Mark the ordering as `Provisional`.
* Do not silently assume a conduct score of zero.
* Do not conceal uncertainty.
* Record the unresolved criterion in diagnostic metadata.
* Allow a versioned static correction only after an official result is confirmed.

The application must not contact another provider to resolve the tie at runtime.

### 11.6 FIFA ranking data

Store ranking editions as versioned static JSON:

```text id="4g8o52"
src/data/fifa-rankings/
  2026-04.json
  2026-01.json
  previous-editions.json
```

Each file contains:

```ts id="y1k7ec"
interface FifaRankingEntry {
  teamId: string;
  fifaCode: string;
  rank: number;
}
```

The application build must record which ranking editions are bundled.

### 11.7 Third-place bracket assignment

FIFA defines 495 possible combinations of eight qualifying group letters.

The application must include all combinations in a versioned static data file:

```text id="up6dhh"
src/data/third-place-assignments.json
```

Conceptual shape:

```ts id="fnhpc4"
interface ThirdPlaceAssignment {
  qualifyingGroups: string;
  slots: {
    "1A": string;
    "1B": string;
    "1D": string;
    "1E": string;
    "1G": string;
    "1I": string;
    "1K": string;
    "1L": string;
  };
}
```

Algorithm:

1. Rank all 12 third-place teams.
2. Select the top eight.
3. Sort their group letters alphabetically.
4. Find the corresponding Annex C row.
5. Assign each third-place team to the specified group-winner slot.
6. Populate the eight applicable Round-of-32 matches.

The application must never infer these assignments using a greedy algorithm.

---

## 12. Fixed bracket topology

Store the official bracket topology as static configuration rather than deriving it from visual position.

Example:

```ts id="jnxbfi"
interface BracketMatchDefinition {
  matchNumber: number;
  round:
    | "ROUND_OF_32"
    | "ROUND_OF_16"
    | "QUARTER_FINAL"
    | "SEMI_FINAL"
    | "THIRD_PLACE"
    | "FINAL";
  homeSource: SlotSource;
  awaySource: SlotSource;
  winnerFeedsMatch?: number;
  winnerFeedsSide?: "HOME" | "AWAY";
}
```

The configuration must cover matches M73 through M104.

Bracket rendering consumes this topology but does not own advancement logic.

---

## 13. Data source

### 13.1 Selected primary and sole runtime source

Use ESPN’s public FIFA World Cup scoreboard JSON as the sole runtime data source for the MVP.

The application will fetch ESPN data directly from the browser.

Primary endpoint:

```text id="8d8zbg"
https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard
```

Additional ESPN endpoints or query parameters may be used when necessary to retrieve:

* Specific dates.
* Tournament stages.
* Match details.
* Event details.
* Expanded fixture ranges.

The implementation must document every ESPN endpoint and parameter it depends on.

### 13.2 Expected ESPN data

The ESPN source is expected to provide:

* FIFA World Cup 2026 competition metadata.
* Tournament calendar and stage labels.
* Match fixtures.
* Team identifiers.
* Team names and abbreviations.
* Team flag or logo URLs.
* Match status.
* Match clock and period.
* Scheduled kickoff time.
* Current and final scores.
* Completion state.
* Venue and host-city information.
* Goal and disciplinary events where available.
* Match links and supporting metadata.

Group standings should be calculated locally from match data rather than relying on ESPN’s displayed ordering.

### 13.3 ESPN source caveats

ESPN is the selected source because it is accessible without an API key and appears suitable for direct browser use.

It remains an undocumented endpoint.

Known risks include:

* Endpoint paths may change without notice.
* Response schemas may change without notice.
* Fields may appear or disappear between tournament stages.
* CORS behavior may change.
* Availability is not guaranteed.
* Rate limits are undocumented.
* Commercial reuse rights may be unclear.
* Penalty shootout representation must be validated.
* Disciplinary data may be incomplete.
* Complete fixture-range retrieval may require date-specific requests.

The application must show an error or stale-data state when ESPN is unavailable.

It must not switch to another provider automatically.

### 13.4 No runtime fallback behavior

The MVP must use exactly one provider at runtime: ESPN.

The application must not:

* Query multiple providers in parallel.
* Compare providers during normal operation.
* Fall back to another provider after an ESPN error.
* Select a provider dynamically based on availability.
* Bundle API keys for alternate providers.
* Expose a provider selector to users.
* Merge data from multiple live providers.
* Attempt automatic provider reconciliation.

If ESPN fails:

1. Keep the last successful local snapshot when available.
2. Mark the data as stale.
3. Display a visible warning.
4. Continue retrying ESPN according to the configured backoff policy.
5. Allow manual refresh.
6. Do not contact another provider.

### 13.5 ESPN adapter

Define a source-specific adapter:

```ts id="3jif8f"
interface TournamentDataSource {
  getSnapshot(signal?: AbortSignal): Promise<TournamentSnapshot>;
}
```

Required implementation:

```text id="get9pv"
EspnScoreboardDataSource
```

Supporting test implementations:

```text id="8rr7dr"
MockDataSource
FixtureFileDataSource
```

The mock and fixture-file implementations are for development and automated testing only.

They are not runtime fallbacks.

All UI and rules-engine code must consume normalized domain models rather than raw ESPN response objects.

### 13.6 Future provider references

The following providers are recorded for future architectural evaluation only:

1. football-data.org
2. API-Football / API-Sports
3. worldcup26.ir
4. TheSportsDB
5. Sportmonks
6. Highlightly
7. Live-score API

These providers are not part of the MVP runtime design.

They should not be:

* Integrated into production code unless a future migration is approved.
* Queried by the deployed application.
* Used for automatic fallback.
* Used for live data comparison.
* Presented to users as selectable sources.

If ESPN becomes unsuitable, the team may plan a separate provider-migration project.

Such a migration should replace the ESPN implementation rather than introduce runtime failover.

### 13.7 Source-of-truth hierarchy

Use this order:

1. FIFA tournament regulations for ranking, tiebreaking, and bracket rules.
2. ESPN match data for live and completed match state.
3. Local rules engine for projected standings and qualification.
4. Versioned FIFA ranking data bundled with the application.
5. Versioned Annex C bracket-assignment data.
6. Official FIFA results for manual verification.
7. Versioned manual correction only for confirmed feed discrepancies.

Manual corrections must be reviewed and committed as static application data.

They must not be fetched from another provider at runtime.

### 13.8 ESPN validation checklist

Before release, verify:

* Browser CORS from the deployed origin.
* Full group-stage fixture coverage.
* Full knockout-stage fixture coverage.
* Stable team IDs.
* Stable match IDs.
* Scheduled kickoff times.
* Live match clock.
* In-progress score updates.
* Completed match scores.
* Extra-time state.
* Penalty shootout state.
* Final penalty shootout numbers.
* Yellow card events.
* Second-yellow card events.
* Direct red card events.
* Venue information.
* Date-range query behavior.
* Reasonable response behavior under 15–30 second polling.
* Terms suitable for the intended public display.

---

## 14. Application architecture

### 14.1 Recommended MVP architecture

```text id="7ym1qa"
Browser
  ↓
Static React SPA
  ↓
ESPN public scoreboard JSON
```

The MVP must be built as a pure static single-page application.

The application should require:

* No backend.
* No database.
* No private API key.
* No user accounts.
* No server-side rendering.
* No scheduled server jobs.
* No runtime provider-selection service.

### 14.2 Hosting

The application may be hosted on any static hosting platform that supports:

* HTTPS.
* Custom domains.
* Static asset caching.
* Single-page application routing.
* Content Security Policy headers where possible.
* Compression.
* Immutable asset URLs.

Examples include:

* Cloudflare Pages.
* GitHub Pages.
* Netlify.
* Vercel static hosting.
* Amazon S3 with CloudFront.

Hosting selection is outside the core product requirements.

### 14.3 No proxy requirement

The MVP does not require an API proxy because ESPN does not require a private API key.

A proxy may be considered in a future architecture project only if:

* ESPN begins requiring credentials.
* Browser CORS stops working.
* Public traffic causes operational problems.
* A future paid provider requires secret credentials.
* Shared caching becomes necessary.

Adding a proxy is not part of the current MVP.

### 14.4 Internal data flow

```text id="vdw4fw"
ESPN JSON
  ↓
EspnScoreboardDataSource
  ↓
Runtime schema validation
  ↓
Normalized TournamentSnapshot
  ↓
Standings and qualification rules engine
  ↓
Bracket and group-table view models
  ↓
React UI
```

No UI component may directly inspect raw ESPN fields.

### 14.5 Provider migration design

The provider abstraction exists to reduce future migration cost.

It must not be used for runtime failover.

A future migration would proceed by:

1. Implementing a new `TournamentDataSource`.
2. Validating it against the normalized model.
3. Replacing ESPN as the configured production source.
4. Removing or disabling the ESPN runtime implementation if appropriate.
5. Deploying the new provider as a separate release.

Only one production provider should be active at a time.

---

## 15. Refresh and caching behavior

### 15.1 Browser refresh intervals

When a World Cup match is live:

* Refresh ESPN every 15–30 seconds.
* The exact interval must be configurable.

On a matchday with no currently live match:

* Refresh every 60 seconds during the period from 30 minutes before kickoff until 30 minutes after the expected final whistle.

Outside an active match window:

* Refresh every 10 minutes.

After the tournament is complete:

* Refresh only on page load or manual refresh.

### 15.2 Visibility behavior

* Pause frequent polling when the tab is hidden.
* Refresh immediately when the tab becomes visible again.
* Prevent overlapping requests.
* Cancel obsolete requests when a newer request starts.
* Reset retry delays after a successful ESPN response.

### 15.3 Local snapshot

Persist the latest successful normalized ESPN snapshot in local storage or IndexedDB.

On startup:

1. Render the saved snapshot immediately when available.
2. Mark it as cached.
3. Fetch fresh ESPN data.
4. Replace it after a successful response.

Cached data must include:

* Snapshot timestamp.
* ESPN source timestamp when available.
* Normalized teams.
* Normalized matches.
* Diagnostic metadata.
* Application schema version.

### 15.4 Stale-data thresholds

* More than 45 seconds old during a live match: show `Updates delayed`.
* More than 5 minutes old on a matchday: show `Data may be stale`.
* More than 30 minutes old outside a match window: show `Last known data`.

### 15.5 Retry behavior

When an ESPN request fails:

* Keep the last successful snapshot.
* Use bounded exponential backoff.
* Allow manual refresh at any time.
* Do not issue overlapping retry requests.
* Do not query another provider.
* Reset polling to the normal interval after a successful response.

Suggested retry sequence:

* 15 seconds.
* 30 seconds.
* 60 seconds.
* 2 minutes.
* Maximum 5 minutes between retries.

### 15.6 Cache invalidation

Discard a locally stored snapshot when:

* Its schema version is incompatible.
* It belongs to a different tournament.
* It is structurally invalid.
* It is older than a configured maximum retention period.
* A user explicitly clears cached data.

---

## 16. Domain models

```ts id="cggybm"
interface Team {
  id: string;
  fifaCode: string;
  name: string;
  shortName: string;
  group: GroupId;
  flagUrl?: string;
}

interface MatchScore {
  home: number | null;
  away: number | null;
}

interface Match {
  id: string;
  matchNumber: number;
  round: TournamentRound;
  group?: GroupId;
  kickoffUtc: string;
  venue?: string;
  city?: string;
  status: NormalizedMatchStatus;
  elapsedMinutes?: number;
  homeTeamId?: string;
  awayTeamId?: string;
  normalTime?: MatchScore;
  extraTime?: MatchScore;
  penalties?: MatchScore;
  winnerTeamId?: string;
  disciplinaryEvents?: DisciplinaryEvent[];
  updatedAt?: string;
}

interface StandingRow {
  teamId: string;
  position: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  conductScore?: number;
  qualification:
    | "DIRECT"
    | "THIRD_PLACE_QUALIFIER"
    | "OUTSIDE"
    | "UNRESOLVED";
  tiebreakerUsed?: string;
  provisional: boolean;
}
```

All scores must distinguish `null` from zero.

### 16.1 Tournament snapshot

```ts id="d9z5tz"
interface TournamentSnapshot {
  generatedAt: string;
  sourceUpdatedAt?: string;
  stale: boolean;
  teams: Team[];
  matches: Match[];
  diagnostics: DataDiagnostics;
}
```

### 16.2 Diagnostics

```ts id="2r2rgn"
interface DataDiagnostics {
  provider: "espn";
  rawSchemaVersion?: string;
  warnings: string[];
  unresolvedTiebreakers: UnresolvedTiebreaker[];
  missingFields: string[];
}
```

The `provider` value must always be `espn` in production for this MVP.

---

## 17. Technology stack

### 17.1 Frontend

* React.
* TypeScript with strict mode enabled.
* Vite.
* Material UI.
* Material UI Icons.
* TanStack Query for fetching, caching, retry, and polling.
* A lightweight date library such as date-fns.
* Zod or equivalent runtime schema validation for ESPN responses.

### 17.2 Styling rules

* Use the Material UI theme for colors, typography, spacing, breakpoints, borders, and component defaults.
* Use Material UI components instead of raw HTML controls wherever an appropriate component exists.
* Use the `sx` prop or styled Material UI components for local styling.
* Avoid introducing Tailwind, Bootstrap, Chakra, Mantine, Ant Design, or another general-purpose component library.
* Custom CSS files are permitted only for bracket geometry, scroll behavior, and accessibility utilities.

### 17.3 Testing

* Vitest for unit tests.
* React Testing Library for component behavior.
* Playwright for end-to-end testing.
* Mock Service Worker or equivalent for ESPN API fixtures.

---

## 18. Responsive behavior

### Desktop

* Bracket uses most of the viewport width.
* Multiple rounds should be visible simultaneously.
* Group cards display in a horizontally scrolling row.
* Third-place table may show all columns.

### Tablet

* Bracket remains horizontal and scrollable.
* Match cards retain readable team names.
* Group cards snap one or two at a time.

### Mobile

* Bracket displays one or two rounds at once.
* A round selector provides quick navigation.
* Long team names may use short names.
* Group cards occupy approximately 85–92% of viewport width.
* Third-place table may hide conduct score unless it is actively resolving a tie.
* Touch targets must be at least 44 by 44 CSS pixels.

---

## 19. Accessibility

Target WCAG 2.2 AA.

Requirements:

* Full keyboard access to controls and horizontal scroll regions.
* Visible focus indicators.
* Scores and qualification states readable without color.
* Meaningful alternative text for flags.
* Decorative connector lines hidden from assistive technology.
* Live score updates announced politely rather than interrupting continuously.
* Reduced-motion preference disables score-change and row-movement animations.
* Table headers correctly associated with cells.
* Match-card accessible labels include teams, score, status, and kickoff time.
* Horizontal regions include usage instructions for keyboard and assistive-technology users.
* Data-source and stale-data warnings are exposed to screen readers.

---

## 20. Loading, empty, and error states

### 20.1 Initial load

* Render bracket and group-card skeletons matching final dimensions.
* Avoid a full-screen spinner.
* Load a valid cached ESPN snapshot immediately when available.

### 20.2 Partial ESPN data

If fixtures load but some match fields are missing:

* Render all fields that can be normalized safely.
* Mark affected information as unavailable.
* Add warnings to diagnostic metadata.

If standings are unavailable:

* Compute standings locally from match data.

If disciplinary events are unavailable:

* Continue with points and goal calculations.
* Mark affected ties provisional.

If flags fail:

* Display FIFA code initials in an `Avatar`.

### 20.3 Complete ESPN failure

When no fresh ESPN data can be loaded:

* Display the last cached snapshot if one exists.
* Show a non-blocking `Alert`.
* Display how old the data is.
* Provide manual retry.
* Preserve bracket and group scroll positions.
* Do not contact another provider.

If no cached snapshot exists:

* Show a structured error state.
* Explain that live data is temporarily unavailable.
* Continue retrying ESPN.
* Retain the static bracket structure and group placeholders.

### 20.4 No live matches

Do not present this as an error.

Show scheduled or completed matches normally.

---

## 21. Analytics and privacy

Analytics are optional and outside the core MVP.

If enabled, collect only aggregate events such as:

* Page loaded.
* Manual refresh selected.
* Bracket round selected.
* Group card viewed.
* ESPN refresh failed.
* Cached snapshot displayed.

Do not collect:

* Precise location.
* Account identity.
* Favorite teams unless a future feature explicitly introduces them.
* Cross-site advertising identifiers by default.
* Raw ESPN response payloads containing unnecessary metadata.

The dashboard must work when analytics are blocked.

---

## 22. Acceptance criteria

### 22.1 Bracket

* All matches M73–M104 exist in the correct advancement topology.
* Round-of-32 participants update when projected group positions change.
* Projected and confirmed teams are visually distinct.
* A finished match winner populates the correct next match.
* A live match leader does not populate a future round as an official winner.
* Horizontal bracket scrolling works with mouse, touch, trackpad, and keyboard.

### 22.2 Scores

* A scheduled match shows no fabricated zero score.
* A 0–0 live or completed match displays correctly.
* Extra-time status and score display correctly.
* Shootout scores display separately from the match score.
* Penalty values update while the shootout is in progress when ESPN provides them.
* A completed shootout clearly identifies the advancing team.
* Missing penalty data is shown as unavailable rather than guessed.

### 22.3 Standings

* All 12 groups contain exactly four teams.
* Live scores immediately affect projected points and goal difference.
* Multi-team ties use the required head-to-head subset procedure.
* Conduct score is applied only after the preceding criteria remain tied.
* FIFA rankings are used only after all earlier criteria remain tied.
* Third-place teams are ranked using the cross-group criteria.
* The qualification boundary appears between positions 8 and 9.

### 22.4 Third-place assignment

* Exactly eight third-place teams populate Round-of-32 slots.
* The qualifying group-letter combination selects exactly one Annex C row.
* Each selected third-place team appears exactly once.
* No group winner is paired with an invalid third-place group.
* All 495 Annex C rows pass integrity validation during tests or build.

### 22.5 Data reliability

* Refresh failure preserves the previous ESPN snapshot.
* Polling pauses in hidden tabs.
* Returning to a visible tab triggers an immediate refresh.
* Stale data is visibly labeled.
* Invalid ESPN payloads fail schema validation and do not corrupt rendered state.
* The application never contacts a secondary provider.
* No alternate provider credentials are present in the production bundle.
* The production diagnostics report ESPN as the sole provider.

### 22.6 Component-library consistency

* Visible controls and surfaces use Material UI components where an appropriate component exists.
* No second general-purpose component library is installed.
* Raw HTML is limited to semantic structure or cases where Material UI intentionally renders the underlying semantic element.

---

## 23. Required automated test scenarios

The test suite must include:

1. Two teams tied on group points but separated by head-to-head points.
2. Two teams tied through head-to-head but separated by overall goal difference.
3. Three-team tie where one team separates and the remaining two require the subset procedure.
4. Tie resolved by conduct score.
5. Tie resolved by the latest FIFA ranking.
6. Tie requiring a preceding FIFA ranking edition.
7. Twelve third-place teams with a clear top eight.
8. Third-place qualification boundary resolved by conduct.
9. At least one known Annex C assignment combination.
10. Validation of all 495 assignment rows.
11. Group-stage live goal changing a Round-of-32 participant.
12. Group-stage live goal changing the eight qualifying third-place groups and therefore several bracket slots.
13. Knockout match finishing in normal time.
14. Knockout match finishing in extra time.
15. Shootout in progress.
16. Shootout completed.
17. ESPN returns a missing team flag.
18. ESPN returns an unknown status.
19. ESPN returns malformed JSON.
20. Cached snapshot displayed during an ESPN outage.
21. ESPN scheduled match maps to `SCHEDULED`.
22. ESPN live match maps to the correct normalized status and clock.
23. ESPN full-time match maps to `FINISHED`.
24. ESPN team identifiers map consistently across fixtures.
25. ESPN response with an empty events array does not crash.
26. ESPN response with missing venue information does not crash.
27. ESPN response schema change triggers validation failure.
28. Failed ESPN request triggers stale-data behavior.
29. Failed ESPN request does not trigger any secondary network request.
30. Production build contains no alternate provider API keys.
31. `MockDataSource` is used only in test or development mode.
32. `FixtureFileDataSource` is used only in test or development mode.
33. Visibility restoration triggers an immediate ESPN refresh.
34. Multiple refresh triggers do not create overlapping ESPN requests.
35. Manual refresh works while automatic retries are delayed.

---

## 24. Performance requirements

* Initial JavaScript should be kept appropriate for a single dashboard page.
* Lazy-load nonessential rules and help content.
* Avoid loading full-resolution team artwork.
* Use small optimized flag assets.
* Do not rerender every match card when only one score changes.
* Maintain smooth horizontal scrolling on mid-range mobile hardware.
* Target a Largest Contentful Paint below 2.5 seconds on a typical broadband connection after static assets are cached.
* Serve compressed static assets with immutable cache headers.
* Use browser caching where compatible with ESPN response behavior.
* Avoid duplicate ESPN requests for the same refresh cycle.
* Deduplicate identical requests through TanStack Query.
* Do not prefetch unnecessary date ranges.

---

## 25. Security requirements

* Do not commit secrets to source control.
* The production application must not contain alternate-provider API keys.
* Validate all ESPN responses at runtime.
* Normalize all upstream strings before rendering.
* Do not render provider-supplied HTML.
* Apply a Content Security Policy compatible with ESPN and selected image hosts.
* Restrict network access through the Content Security Policy to known required origins.
* Do not expose development fixture files containing sensitive data.
* Avoid passing raw ESPN payloads to analytics or logging services.
* Sanitize URLs before using them as links or image sources.

---

## 26. Delivery phases

### Phase 1: Static UI prototype

* Material UI theme and responsive page shell.
* Bracket using mock data.
* Horizontal group cards.
* Third-place ranking component.
* Match-card states including penalties.
* No live provider dependency.

### Phase 2: Rules engine

* Group standings calculation.
* Head-to-head tiebreakers.
* Conduct and FIFA ranking support.
* Third-place ranking.
* Fixed bracket topology.
* Annex C data import and validation.

### Phase 3: ESPN integration

* ESPN endpoint investigation.
* ESPN runtime schema definitions.
* ESPN normalization adapter.
* Date and fixture-range retrieval.
* Polling and local caching.
* Live score updates.
* Error and stale-data states.
* Match-status normalization.
* Penalty-data validation.

### Phase 4: Production hardening

* End-to-end tests.
* Accessibility audit.
* Mobile performance audit.
* Cross-check against official FIFA standings.
* Operational monitoring during live matches.
* ESPN schema-change detection.
* Review of ESPN usage and display rights.
* Static-hosting deployment configuration.

A future provider migration is not part of these phases.

---

## 27. Release checklist

Before public release:

* Confirm ESPN endpoint availability from the deployed domain.
* Confirm ESPN browser CORS behavior from production hosting.
* Confirm ESPN provides sufficient date or range queries.
* Confirm all group-stage fixtures can be retrieved.
* Confirm all knockout fixtures can be retrieved.
* Confirm current-score updates during a live match.
* Confirm full-time score handling.
* Confirm extra-time handling.
* Confirm penalty shootout representation.
* Confirm event data coverage for yellow, second-yellow, and red cards.
* Confirm incomplete conduct data is labeled provisional.
* Confirm ESPN team IDs remain stable across requests.
* Confirm ESPN fixture IDs remain stable across requests.
* Confirm ESPN rate behavior under expected polling intervals.
* Confirm terms and rights risk are acceptable for the intended launch.
* Verify no alternate-provider requests occur in production.
* Verify no alternate-provider API keys are present in production assets.
* Verify ESPN is the only production `TournamentDataSource`.
* Keep alternate-provider research in separate project documentation.
* Keep mock and fixture-file data sources restricted to development and tests.
* Verify all provider-independent UI consumes normalized domain models.
* Compare calculated standings against official standings after completed group matches.
* Validate all 495 Annex C third-place assignment rows.
* Test simultaneous final group matches.
* Test page behavior when ESPN returns malformed data.
* Test page behavior when ESPN returns an empty event list.
* Test page behavior when ESPN is unavailable.
* Verify stale-data warnings.
* Verify local cached snapshot behavior.
* Verify keyboard and screen-reader accessibility.
* Verify mobile horizontal scrolling.
* Verify Content Security Policy settings.

---

## 28. Future provider evaluation

The following providers may be reconsidered only if a future project decides to replace ESPN:

* football-data.org
* API-Football / API-Sports
* worldcup26.ir
* TheSportsDB
* Sportmonks
* Highlightly
* Live-score API

A future evaluation should consider:

* Browser CORS.
* Credential exposure.
* World Cup 2026 fixture coverage.
* Live update latency.
* Extra-time support.
* Penalty shootout support.
* Disciplinary-event support.
* Stable identifiers.
* Usage rights.
* Quotas and pricing.
* Whether a backend proxy would become necessary.

The list is informational only.

No code is required for these providers in the MVP.

---

## 29. Final architectural decision

The production MVP will use:

* A static React, TypeScript, and Vite single-page application.
* Material UI as the sole general-purpose component library.
* ESPN public FIFA World Cup JSON as the sole runtime match-data provider.
* Direct browser-to-ESPN requests.
* No application backend.
* No database.
* No private provider credentials.
* No runtime provider switching.
* No automatic fallback provider.
* No provider reconciliation.
* A local, independently tested qualification rules engine.
* Static FIFA ranking data.
* Static Annex C assignment data.
* Local browser persistence of the last successful ESPN snapshot.
* Explicit stale-data and error states when ESPN is unavailable.
* A provider-isolation layer intended only to reduce the cost of a future planned migration.

Other data providers are retained solely as future research references and are not part of the deployed runtime architecture.
