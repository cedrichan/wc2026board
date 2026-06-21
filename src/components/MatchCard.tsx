import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { BracketMatchViewModel, ParticipantViewModel } from "../view-models/dashboard";
import TeamIdentity from "./TeamIdentity";
import { VIEW_ICONS, VIEW_SYMBOLS } from "./view-symbols";

const CARD_WIDTH = 200;

interface MatchCardProps {
  match: BracketMatchViewModel;
}

export default function MatchCard({ match }: MatchCardProps): JSX.Element {
  const isLive =
    match.status === "FIRST_HALF" ||
    match.status === "HALF_TIME" ||
    match.status === "SECOND_HALF" ||
    match.status === "EXTRA_TIME" ||
    match.status === "EXTRA_TIME_BREAK" ||
    match.status === "PENALTY_SHOOTOUT";

  const isScheduled = match.status === "SCHEDULED" || match.status === "PRE_MATCH";

  return (
    <Card
      aria-label={match.accessibleName}
      sx={{ width: CARD_WIDTH, flexShrink: 0 }}
    >
      <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
        <Stack spacing={0.5}>
          <MatchCardHeader match={match} isLive={isLive} />
          <Divider />
          <ParticipantRow
            participant={match.home}
            score={isScheduled ? null : match.score.total.home}
            isLive={isLive}
          />
          <ParticipantRow
            participant={match.away}
            score={isScheduled ? null : match.score.total.away}
            isLive={isLive}
          />
          {match.score.penaltiesLabel !== undefined && (
            <Typography
              variant="caption"
              color="text.secondary"
              align="center"
              sx={{ display: "block" }}
            >
              {match.score.penaltiesLabel}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

interface MatchCardHeaderProps {
  match: BracketMatchViewModel;
  isLive: boolean;
}

function MatchCardHeader({ match, isLive }: MatchCardHeaderProps): JSX.Element {
  return (
    <Stack spacing={0.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {match.matchLabel}
        </Typography>
        <StatusChip status={match.statusLabel} clockLabel={match.clockLabel} isLive={isLive} />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {match.kickoffLabel}
      </Typography>
      {match.locationLabel !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          aria-label={`Location: ${match.locationLabel}`}
        >
          {match.locationLabel}
        </Typography>
      )}
    </Stack>
  );
}

interface StatusChipProps {
  status: string;
  clockLabel?: string;
  isLive: boolean;
}

function StatusChip({ status, clockLabel, isLive }: StatusChipProps): JSX.Element {
  const label = clockLabel !== undefined ? `${clockLabel}` : status;
  return (
    <Chip
      label={label}
      size="small"
      color={isLive ? "error" : "default"}
      variant="outlined"
      sx={{ height: 18, fontSize: "0.65rem" }}
    />
  );
}

interface ParticipantRowProps {
  participant: ParticipantViewModel;
  score: number | null;
  isLive: boolean;
}

function ParticipantRow({ participant, score, isLive }: ParticipantRowProps): JSX.Element {
  const isAhead = isLive && participant.currentlyAhead;
  const CheckIcon = VIEW_ICONS.advancing.value;

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        bgcolor: isAhead ? "action.hover" : "transparent",
        borderLeft: isAhead ? "3px solid" : "3px solid transparent",
        borderColor: isAhead ? "success.main" : "transparent",
      }}
    >
      {participant.team !== undefined ? (
        <TeamIdentity team={participant.team} note={participant.sourceExplanation}>
          <ParticipantName participant={participant} />
        </TeamIdentity>
      ) : (
        <ParticipantName participant={participant} />
      )}
      {participant.advancing && (
        <CheckIcon sx={{ fontSize: 14, color: "success.main", flexShrink: 0 }} aria-hidden="true" />
      )}
      <Box sx={{ flex: 1 }} />
      {score !== null && (
        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 16, textAlign: "right" }}>
          {score}
        </Typography>
      )}
    </Stack>
  );
}

function ParticipantName({ participant }: { participant: ParticipantViewModel }): JSX.Element {
  const isProjected = participant.state === "PROJECTED";
  const isProjectedStyle = isProjected || participant.provisional;
  const isPlaceholder = participant.state === "PLACEHOLDER";
  const isSuperseded = participant.state === "SUPERSEDED";
  const isUnresolved = participant.state === "UNRESOLVED" && !participant.provisional;

  const label = participant.label;

  const nameEl = (
    <Typography
      variant="caption"
      sx={{
        fontWeight: isProjectedStyle ? 500 : 400,
        color: isPlaceholder || isSuperseded ? "text.disabled" : "text.primary",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: 90,
        display: "block",
      }}
    >
      {label}
      {isUnresolved && (
        <Typography component="span" variant="caption" color="text.secondary">
          {" "}{VIEW_SYMBOLS.unresolvedSuffix.value}
        </Typography>
      )}
    </Typography>
  );

  if (isProjectedStyle && participant.sourceExplanation !== undefined) {
    // The qualification source is now surfaced through the team-detail tooltip
    // (folded in as a note), so the chip alone marks the projected placement.
    return (
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          {nameEl}
        </Box>
        <Chip label={VIEW_SYMBOLS.projectedChip.value} size="small" variant="outlined" sx={{ height: 14, fontSize: "0.6rem", flexShrink: 0 }} />
      </Stack>
    );
  }

  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      {nameEl}
    </Box>
  );
}

export { MatchCard };
