import { forwardRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MatchCard from "./MatchCard";
import type { BracketRoundViewModel } from "../view-models/dashboard";

const ROUND_LABELS: Record<string, string> = {
  ROUND_OF_32: "Round of 32",
  ROUND_OF_16: "Round of 16",
  QUARTER_FINAL: "Quarter-finals",
  SEMI_FINAL: "Semi-finals",
  THIRD_PLACE: "Third-place",
  FINAL: "Final",
};

const CARD_GAP = 8;

interface BracketLayoutProps {
  rounds: readonly BracketRoundViewModel[];
}

const BracketLayout = forwardRef<HTMLDivElement, BracketLayoutProps>(function BracketLayout({ rounds }, ref) {
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
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 3,
          minWidth: "max-content",
          py: 1,
        }}
      >
        {rounds.map((round) => (
          <BracketRoundColumn key={round.id} round={round} />
        ))}
      </Box>
    </Box>
  );
});

export default BracketLayout;

interface BracketRoundColumnProps {
  round: BracketRoundViewModel;
}

function BracketRoundColumn({ round }: BracketRoundColumnProps): JSX.Element {
  const isSingleMatch = round.matches.length === 1;

  return (
    <Box
      id={`bracket-round-${round.round.toLowerCase()}`}
      sx={{
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <Typography
        variant="caption"
        component="h3"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          mb: 1,
          textAlign: isSingleMatch ? "center" : "left",
          whiteSpace: "nowrap",
        }}
      >
        {ROUND_LABELS[round.round] ?? round.label}
      </Typography>

      <Stack
        spacing={`${CARD_GAP}px`}
        sx={{ alignItems: "stretch" }}
      >
        {round.matches.map((match) => (
          <Box key={match.id} sx={{ position: "relative" }}>
            <MatchCard match={match} />
            {/* Decorative connector line hidden from assistive technology */}
            {round.round !== "FINAL" && round.round !== "THIRD_PLACE" && (
              <Box
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  right: -12,
                  top: "50%",
                  width: 12,
                  height: 1,
                  bgcolor: "divider",
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
