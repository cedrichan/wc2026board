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
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "3.5rem 1fr",
        alignItems: "start",
        gap: 1.5,
        px: 1.5,
        py: 1,
        bgcolor: entry.isLive ? "action.hover" : undefined,
      }}
    >
      {/* Event timestamp (match clock) */}
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", pt: 0.3 }}
      >
        {entry.clockDisplay}
      </Typography>

      {/* Match info */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: entry.isLive ? 600 : 400 }}>
          {entry.icon}{" "}
          <span aria-hidden="true">{entry.home.flagEmoji}</span>{" "}
          {entry.home.fifaCode}
          {" vs "}
          <span aria-hidden="true">{entry.away.flagEmoji}</span>{" "}
          {entry.away.fifaCode}
        </Typography>
        <Typography
          variant="caption"
          color={entry.isLive ? "error.main" : "text.secondary"}
        >
          {entry.label} · {entry.matchStatusLabel}
        </Typography>
      </Box>
    </Box>
  );
}
