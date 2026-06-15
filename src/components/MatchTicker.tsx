import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { MatchTickerItemViewModel, MatchTickerViewModel } from "../view-models";

const CARD_WIDTH = 148;

interface MatchTickerProps {
  ticker: MatchTickerViewModel;
}

export default function MatchTicker({ ticker }: MatchTickerProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ticker.anchorId === null || scrollRef.current === null) return;
    const anchor = scrollRef.current.querySelector(`[data-ticker-id="${ticker.anchorId}"]`);
    anchor?.scrollIntoView({ inline: "start", block: "nearest", behavior: "instant" });
  }, [ticker.anchorId]);

  return (
    <Box
      ref={scrollRef}
      role="region"
      aria-label="Match scores"
      sx={{
        overflowX: "auto",
        display: "flex",
        flexDirection: "row",
        gap: 1,
        py: 1,
        px: { xs: 1, sm: 2, md: 3 },
        // Horizontal scroll snapping between cards
        scrollSnapType: "x mandatory",
        "&::-webkit-scrollbar": { height: 4 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "divider",
          borderRadius: 2,
        },
      }}
    >
      {ticker.items.map((item) => (
        <TickerCard key={item.id} item={item} />
      ))}
    </Box>
  );
}

interface TickerCardProps {
  item: MatchTickerItemViewModel;
}

function TickerCard({ item }: TickerCardProps): JSX.Element {
  return (
    <Card
      data-ticker-id={item.id}
      aria-label={item.accessibleName}
      sx={{
        width: CARD_WIDTH,
        flexShrink: 0,
        scrollSnapAlign: "start",
        opacity: item.isFinished ? 0.6 : 1,
        borderLeft: item.isLive ? "3px solid" : "3px solid transparent",
        borderColor: item.isLive ? "error.main" : "transparent",
        transition: "opacity 160ms ease",
      }}
    >
      <Box sx={{ p: 0.75 }}>
        <Stack spacing={0.5}>
          <CardHeader item={item} />
          <Divider />
          <TeamRow team={item.home} score={item.homeScore} />
          <TeamRow team={item.away} score={item.awayScore} />
          {item.penaltiesLabel !== undefined && (
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ display: "block", fontSize: "0.6rem" }}
            >
              {item.penaltiesLabel}
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", fontSize: "0.6rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {item.kickoffLabel}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

interface CardHeaderProps {
  item: MatchTickerItemViewModel;
}

function CardHeader({ item }: CardHeaderProps): JSX.Element {
  const chipLabel = item.clockLabel ?? (item.isFinished ? "FT" : item.isLive ? "Live" : undefined);
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {item.contextLabel}
      </Typography>
      {chipLabel !== undefined && (
        <Chip
          label={chipLabel}
          size="small"
          color={item.isLive ? "error" : "default"}
          variant={item.isLive ? "filled" : "outlined"}
          sx={{ height: 16, fontSize: "0.6rem", flexShrink: 0 }}
        />
      )}
    </Stack>
  );
}

interface TeamRowProps {
  team: MatchTickerItemViewModel["home"];
  score: number | null;
}

function TeamRow({ team, score }: TeamRowProps): JSX.Element {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minHeight: 20 }}>
      {team !== null && (
        <Box
          component="span"
          role="img"
          aria-label={team.flagAlt}
          sx={{ fontSize: "0.75rem", lineHeight: 1, width: 16, textAlign: "center", flexShrink: 0 }}
        >
          {team.flagEmoji}
        </Box>
      )}
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.7rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          color: team === null ? "text.disabled" : "text.primary",
        }}
      >
        {team?.shortName ?? "TBD"}
      </Typography>
      {score !== null && (
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, fontSize: "0.75rem", minWidth: 14, textAlign: "right", flexShrink: 0 }}
        >
          {score}
        </Typography>
      )}
    </Stack>
  );
}
