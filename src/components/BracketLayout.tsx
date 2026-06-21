import { Fragment, forwardRef, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { BRACKET_TOPOLOGY } from "../data/bracket-topology";
import MatchCard from "./MatchCard";
import type { BracketMatchViewModel, BracketRoundViewModel } from "../view-models/dashboard";

// ── Layout constants ──────────────────────────────────────────────────────────
const CARD_WIDTH = 200;
const CARD_HEIGHT = 150;
const BASE_GAP = 8;  // gap between the two cards within a pair
const PAIR_GAP = 32; // additional gap between pairs in R32 (on top of BASE_GAP)
const CELL = CARD_HEIGHT + BASE_GAP; // 138 px — one R32 within-pair slot
// Distance from the start of one R32 pair to the start of the next
const R32_PAIR_CELL = 2 * CELL + PAIR_GAP; // 308 px
const CONNECTOR_W = 24;

// Rounds that appear in the main left-to-right tree
const MAIN_ROUND_IDS = [
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "FINAL",
] as const;

const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINAL: "Quarter-finals",
  SEMI_FINAL: "Semi-finals",
  THIRD_PLACE: "Third-place match",
  FINAL: "Final",
};

// ── Position math ─────────────────────────────────────────────────────────────
//
// R32 cards are laid out in 8 pairs.  Within each pair the gap is BASE_GAP;
// between pairs the gap is BASE_GAP + PAIR_GAP.  All later-round positions are
// derived as the midpoint of their two feeder cards, so they cascade correctly
// without any additional parameters.

function r32CenterY(i: number): number {
  const pair = Math.floor(i / 2);
  const within = i % 2;
  return pair * R32_PAIR_CELL + within * CELL + CARD_HEIGHT / 2;
}

function midpoint(fn: (i: number) => number, i: number): number {
  return (fn(2 * i) + fn(2 * i + 1)) / 2;
}

const r16CenterY = (i: number): number => midpoint(r32CenterY, i);
const qfCenterY  = (i: number): number => midpoint(r16CenterY, i);
const sfCenterY  = (i: number): number => midpoint(qfCenterY, i);
const finalCenterY = (i: number): number => midpoint(sfCenterY, i);

const ROUND_CENTER_FNS: Record<string, (i: number) => number> = {
  ROUND_OF_32:   r32CenterY,
  ROUND_OF_16:   r16CenterY,
  QUARTER_FINAL: qfCenterY,
  SEMI_FINAL:    sfCenterY,
  FINAL:         finalCenterY,
};

function roundTopY(round: string, i: number): number {
  return (ROUND_CENTER_FNS[round]?.(i) ?? 0) - CARD_HEIGHT / 2;
}

// Total height: bottom edge of the last R32 card
const BRACKET_HEIGHT = r32CenterY(15) + CARD_HEIGHT / 2;

// ── Tree ordering ─────────────────────────────────────────────────────────────

/**
 * Walk the bracket topology depth-first from the Final and assign every
 * knockout match a display index within its own round.
 *
 * Home feeders are expanded before away feeders so the upper subtree occupies
 * the top of each column.  A match receives its own index only after its
 * entire subtree has been indexed, which gives the correct inorder placement.
 */
function buildTreeOrder(): Map<number, number> {
  const homeFeeder = new Map<number, number>(); // receiving match → home-side feeder
  const awayFeeder = new Map<number, number>(); // receiving match → away-side feeder

  for (const def of BRACKET_TOPOLOGY) {
    if (def.winnerFeedsMatch !== undefined) {
      if (def.winnerFeedsSide === "HOME") homeFeeder.set(def.winnerFeedsMatch, def.matchNumber);
      else awayFeeder.set(def.winnerFeedsMatch, def.matchNumber);
    }
  }

  const defMap = new Map(BRACKET_TOPOLOGY.map((d) => [d.matchNumber, d]));
  const roundCounters = new Map<string, number>();
  const result = new Map<number, number>();

  function dfs(matchNumber: number): void {
    const home = homeFeeder.get(matchNumber);
    const away = awayFeeder.get(matchNumber);
    if (home !== undefined) dfs(home);
    if (away !== undefined) dfs(away);
    const round = defMap.get(matchNumber)?.round ?? "";
    const idx = roundCounters.get(round) ?? 0;
    result.set(matchNumber, idx);
    roundCounters.set(round, idx + 1);
  }

  const finalDef = BRACKET_TOPOLOGY.find((d) => d.round === "FINAL");
  if (finalDef !== undefined) dfs(finalDef.matchNumber);

  // Third-place is unreachable from the Final; assign it index 0 separately.
  const thirdPlace = BRACKET_TOPOLOGY.find((d) => d.round === "THIRD_PLACE");
  if (thirdPlace !== undefined) result.set(thirdPlace.matchNumber, 0);

  return result;
}

// Computed once at module load; the topology is static.
const TREE_ORDER = buildTreeOrder();

// ── Sub-components ────────────────────────────────────────────────────────────

interface BracketColumnProps {
  round: BracketRoundViewModel;
  orderedMatches: readonly BracketMatchViewModel[];
}

function BracketColumn({ round, orderedMatches }: BracketColumnProps): JSX.Element {
  return (
    <Box
      id={`bracket-round-${round.round.toLowerCase()}`}
      sx={{ scrollSnapAlign: "start", flexShrink: 0, width: CARD_WIDTH, position: "relative", height: BRACKET_HEIGHT }}
    >
      {orderedMatches.map((match, i) => (
        <Box
          key={match.id}
          sx={{ position: "absolute", top: roundTopY(round.round, i), left: 0, width: CARD_WIDTH }}
        >
          <MatchCard match={match} />
        </Box>
      ))}
    </Box>
  );
}

interface ConnectorSvgProps {
  leftRound: string;
  rightRound: string;
  pairCount: number;
}

/**
 * SVG connector column drawn between two adjacent rounds.
 *
 * For each pair (upper card 2i, lower card 2i+1) in the left round that feeds
 * card i in the right round, draws:
 *   – horizontal stub from x=0 to x=mid at upper card centre
 *   – horizontal stub from x=0 to x=mid at lower card centre
 *   – vertical bar connecting the two stubs at x=mid
 *   – horizontal stub from x=mid to x=CONNECTOR_W at the midpoint (= right card centre)
 */
function ConnectorSvg({ leftRound, rightRound, pairCount }: ConnectorSvgProps): JSX.Element {
  const leftFn = ROUND_CENTER_FNS[leftRound] ?? (() => 0);
  const rightFn = ROUND_CENTER_FNS[rightRound] ?? (() => 0);
  const mid = CONNECTOR_W / 2;

  return (
    <Box
      component="svg"
      aria-hidden="true"
      width={CONNECTOR_W}
      height={BRACKET_HEIGHT}
      viewBox={`0 0 ${CONNECTOR_W} ${BRACKET_HEIGHT}`}
      sx={{
        flexShrink: 0,
        display: "block",
        color: "divider",
        "& line": { stroke: "currentColor", strokeWidth: 1 },
      }}
    >
      {Array.from({ length: pairCount }, (_, i) => {
        const topY = leftFn(i * 2);
        const botY = leftFn(i * 2 + 1);
        const midY = rightFn(i);
        return (
          <Fragment key={i}>
            <line x1={0} y1={topY} x2={mid} y2={topY} />
            <line x1={0} y1={botY} x2={mid} y2={botY} />
            <line x1={mid} y1={topY} x2={mid} y2={botY} />
            <line x1={mid} y1={midY} x2={CONNECTOR_W} y2={midY} />
          </Fragment>
        );
      })}
    </Box>
  );
}

// ── BracketLayout ─────────────────────────────────────────────────────────────

interface BracketLayoutProps {
  rounds: readonly BracketRoundViewModel[];
}

const BracketLayout = forwardRef<HTMLDivElement, BracketLayoutProps>(function BracketLayout(
  { rounds },
  ref,
) {
  const roundsByType = useMemo(() => new Map(rounds.map((r) => [r.round, r])), [rounds]);

  const mainRounds = useMemo(
    () =>
      MAIN_ROUND_IDS
        .map((id) => roundsByType.get(id))
        .filter((r): r is BracketRoundViewModel => r !== undefined && r.matches.length > 0),
    [roundsByType],
  );

  const thirdPlaceRound = roundsByType.get("THIRD_PLACE");

  const orderedMatchesPerRound = useMemo(
    () =>
      mainRounds.map((round) =>
        [...round.matches].sort(
          (a, b) => (TREE_ORDER.get(a.matchNumber) ?? 0) - (TREE_ORDER.get(b.matchNumber) ?? 0),
        ),
      ),
    [mainRounds],
  );

  return (
    <Box
      ref={ref}
      sx={{
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        pb: 1,
        outline: "none",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: "2px",
        },
      }}
      tabIndex={0}
      role="region"
      aria-label="Knockout bracket, horizontally scrollable"
    >
      <Box sx={{ display: "inline-flex", flexDirection: "column", minWidth: "max-content" }}>

        {/* ── Round label headers ── */}
        <Box sx={{ display: "inline-flex", flexDirection: "row", mb: 1 }}>
          {mainRounds.map((round, idx) => (
            <Fragment key={round.round}>
              {idx > 0 && <Box sx={{ width: CONNECTOR_W, flexShrink: 0 }} />}
              <Typography
                variant="caption"
                component="h3"
                sx={{
                  width: CARD_WIDTH,
                  flexShrink: 0,
                  fontWeight: 600,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  textAlign: round.matches.length === 1 ? "center" : "left",
                }}
              >
                {ROUND_LABELS[round.round] ?? round.label}
              </Typography>
            </Fragment>
          ))}
        </Box>

        {/* ── Bracket tree: columns interleaved with connector SVGs ── */}
        <Box sx={{ display: "inline-flex", flexDirection: "row", alignItems: "flex-start" }}>
          {mainRounds.map((round, idx) => {
            const prevRound = idx > 0 ? mainRounds[idx - 1] : undefined;
            const pairCount =
              prevRound !== undefined ? Math.floor(prevRound.matches.length / 2) : 0;

            return (
              <Fragment key={round.round}>
                {idx > 0 && prevRound !== undefined && (
                  <ConnectorSvg
                    leftRound={prevRound.round}
                    rightRound={round.round}
                    pairCount={pairCount}
                  />
                )}
                <BracketColumn
                  round={round}
                  orderedMatches={orderedMatchesPerRound[idx]}
                />
              </Fragment>
            );
          })}
        </Box>

        {/* ── Third-place match below the main tree ── */}
        {thirdPlaceRound !== undefined && thirdPlaceRound.matches.length > 0 && (
          <Box sx={{ mt: 4, display: "inline-flex", flexDirection: "column" }}>
            <Typography
              variant="caption"
              component="h3"
              sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}
            >
              {ROUND_LABELS.THIRD_PLACE}
            </Typography>
            <MatchCard match={thirdPlaceRound.matches[0]} />
          </Box>
        )}

      </Box>
    </Box>
  );
});

export default BracketLayout;
