import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import BracketLayout from "./BracketLayout";
import type { BracketRoundViewModel } from "../view-models/dashboard";

type KnockoutRound =
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTER_FINAL"
  | "SEMI_FINAL"
  | "THIRD_PLACE"
  | "FINAL";

const ROUND_ORDER: readonly KnockoutRound[] = [
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER_FINAL",
  "SEMI_FINAL",
  "THIRD_PLACE",
  "FINAL",
];

const SHORT_LABELS: Record<KnockoutRound, string> = {
  ROUND_OF_32: "R32",
  ROUND_OF_16: "R16",
  QUARTER_FINAL: "QF",
  SEMI_FINAL: "SF",
  THIRD_PLACE: "3rd",
  FINAL: "Final",
};

const LIVE_STATUSES = new Set([
  "FIRST_HALF",
  "HALF_TIME",
  "SECOND_HALF",
  "EXTRA_TIME",
  "EXTRA_TIME_BREAK",
  "PENALTY_SHOOTOUT",
]);

const UPCOMING_STATUSES = new Set(["SCHEDULED", "PRE_MATCH"]);
const FINISHED_STATUSES = new Set([
  "FINISHED",
  "FINISHED_AFTER_EXTRA_TIME",
  "FINISHED_AFTER_PENALTIES",
]);

interface BracketSectionProps {
  rounds: readonly BracketRoundViewModel[];
}

export default function BracketSection({ rounds }: BracketSectionProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedRound, setSelectedRound] = useState<KnockoutRound>(() =>
    deriveActiveRound(rounds),
  );
  const hasScrolledInitially = useRef(false);

  const scrollToRound = useCallback((round: KnockoutRound) => {
    const container = scrollRef.current;
    if (container === null) return;
    const target = container.querySelector(`#bracket-round-${round.toLowerCase()}`);
    if (target instanceof HTMLElement) {
      container.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    }
  }, []);

  // Scroll to active round on first mount only, without stealing focus
  useEffect(() => {
    if (!hasScrolledInitially.current) {
      hasScrolledInitially.current = true;
      const activeRound = deriveActiveRound(rounds);
      setSelectedRound(activeRound);
      scrollToRound(activeRound);
    }
  }, [rounds, scrollToRound]);

  function handleRoundSelect(round: KnockoutRound): void {
    setSelectedRound(round);
    scrollToRound(round);
  }

  return (
    <Box>
      <RoundSelector
        rounds={rounds}
        selectedRound={selectedRound}
        onSelect={handleRoundSelect}
      />
      <BracketLayout ref={scrollRef} rounds={rounds} />
    </Box>
  );
}

interface RoundSelectorProps {
  rounds: readonly BracketRoundViewModel[];
  selectedRound: KnockoutRound;
  onSelect: (round: KnockoutRound) => void;
}

function RoundSelector({ rounds, selectedRound, onSelect }: RoundSelectorProps): JSX.Element {
  const availableRounds = new Set(rounds.map((r) => r.round as KnockoutRound));

  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ mb: 1, overflowX: "auto", pb: 0.5 }}
      role="tablist"
      aria-label="Bracket rounds"
    >
      {ROUND_ORDER.filter((r) => availableRounds.has(r)).map((round) => {
        const isSelected = round === selectedRound;
        return (
          <Chip
            key={round}
            label={SHORT_LABELS[round]}
            size="small"
            variant={isSelected ? "filled" : "outlined"}
            color={isSelected ? "primary" : "default"}
            onClick={() => onSelect(round)}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`bracket-round-${round.toLowerCase()}`}
            sx={{ cursor: "pointer", minWidth: 44, minHeight: 28 }}
          />
        );
      })}
    </Stack>
  );
}

function deriveActiveRound(rounds: readonly BracketRoundViewModel[]): KnockoutRound {
  // Live round (highest) → upcoming (lowest) → finished (highest) → first available
  const allMatches = rounds.flatMap((r) =>
    r.matches.map((m) => ({ round: r.round as KnockoutRound, status: m.status })),
  );

  const liveRound = findRound(allMatches, (s) => LIVE_STATUSES.has(s), "highest");
  if (liveRound !== undefined) return liveRound;

  const upcomingRound = findRound(allMatches, (s) => UPCOMING_STATUSES.has(s), "lowest");
  if (upcomingRound !== undefined) return upcomingRound;

  const finishedRound = findRound(allMatches, (s) => FINISHED_STATUSES.has(s), "highest");
  if (finishedRound !== undefined) return finishedRound;

  return rounds[0]?.round as KnockoutRound ?? "ROUND_OF_32";
}

function findRound(
  matches: Array<{ round: KnockoutRound; status: string }>,
  predicate: (status: string) => boolean,
  direction: "highest" | "lowest",
): KnockoutRound | undefined {
  const qualifying = matches
    .filter((m) => predicate(m.status))
    .map((m) => m.round);

  if (qualifying.length === 0) return undefined;

  const sorted = qualifying.sort((a, b) => {
    const diff = ROUND_ORDER.indexOf(a) - ROUND_ORDER.indexOf(b);
    return direction === "lowest" ? diff : -diff;
  });

  return sorted[0];
}
