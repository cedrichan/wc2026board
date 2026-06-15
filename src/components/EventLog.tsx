import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { EventLogEntryViewModel, EventLogViewModel } from "../view-models/dashboard";

interface EventLogProps {
  log: EventLogViewModel;
}

const EVENT_LOG_COLUMNS = "minmax(7.5rem, 12rem) 4rem minmax(5.5rem, 7.5rem) minmax(0, 1fr)";

export default function EventLog({ log }: EventLogProps): JSX.Element {
  return (
    <Box
      component="section"
      aria-label="Recent match events"
      aria-live="polite"
      aria-atomic="false"
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h6" component="h2" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Recent events
        </Typography>
        {log.hasLive && (
          <Chip
            label="Live"
            size="small"
            color="error"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          />
        )}
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {log.entries.length === 0 ? (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ p: 2, textAlign: "center" }}
          >
            No match events yet
          </Typography>
        ) : (
          <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
            {log.entries.map((entry) => (
              <EventLogRow key={entry.id} entry={entry} />
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

function EventLogRow({ entry }: { entry: EventLogEntryViewModel }): JSX.Element {
  const isGoal = entry.type === "GOAL" || entry.type === "OWN_GOAL" || entry.type === "PENALTY_GOAL";
  const isLifecycle = entry.type === "KICKOFF" || entry.type === "HALF_TIME" || entry.type === "FULL_TIME";
  const typeLabel = formatEventType(entry.type);

  return (
    <Box
      sx={{
        display: "grid",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 0.75,
        bgcolor: entry.isLive ? "action.hover" : undefined,
        gridTemplateColumns: {
          xs: "minmax(0, 1fr) auto",
          sm: EVENT_LOG_COLUMNS,
        },
        gridTemplateAreas: {
          xs: `
            "match clock"
            "description type"
          `,
          sm: `"match clock type description"`,
        },
      }}
    >
      {/* Countries involved */}
      <Typography
        variant="body2"
        sx={{
          gridArea: "match",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <span aria-hidden="true">{entry.home.flagEmoji}</span>{" "}
        {entry.home.fifaCode}
        {" vs "}
        <span aria-hidden="true">{entry.away.flagEmoji}</span>{" "}
        {entry.away.fifaCode}
      </Typography>

      {/* Match time */}
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{
          gridArea: "clock",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          justifySelf: "end",
        }}
      >
        {entry.clockDisplay}
      </Typography>

      <Typography
        variant="caption"
        color={isLifecycle ? "text.disabled" : "text.secondary"}
        sx={{
          gridArea: "type",
          minWidth: 0,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          justifySelf: { xs: "end", sm: "start" },
        }}
      >
        {typeLabel}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color={isLifecycle ? "text.disabled" : entry.isLive ? "error.main" : "text.secondary"}
        sx={{
          gridArea: "description",
          minWidth: 0,
          fontWeight: isGoal ? 600 : 400,
          overflowWrap: "anywhere",
        }}
      >
        {entry.description}
      </Typography>
    </Box>
  );
}

function formatEventType(type: EventLogEntryViewModel["type"]): string {
  switch (type) {
    case "GOAL":
      return "Goal";
    case "OWN_GOAL":
      return "Own goal";
    case "PENALTY_GOAL":
      return "Penalty";
    case "YELLOW_CARD":
      return "Yellow";
    case "RED_CARD":
      return "Red";
    case "YELLOW_RED_CARD":
      return "2nd yellow";
    case "KICKOFF":
      return "Kickoff";
    case "HALF_TIME":
      return "Half";
    case "FULL_TIME":
      return "Full time";
  }
}
