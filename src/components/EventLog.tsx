import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { EventLogEntryViewModel, EventLogViewModel } from "../view-models/dashboard";

interface EventLogProps {
  log: EventLogViewModel;
}

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

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto auto 1fr",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 0.75,
        bgcolor: entry.isLive ? "action.hover" : undefined,
      }}
    >
      {/* Countries involved */}
      <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
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
        sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
      >
        {entry.clockDisplay}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        color={isLifecycle ? "text.disabled" : entry.isLive ? "error.main" : "text.secondary"}
        sx={{ fontWeight: isGoal ? 600 : 400 }}
      >
        {entry.description}
      </Typography>
    </Box>
  );
}
