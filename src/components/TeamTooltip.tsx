import { createContext, useContext, useMemo, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { TeamTooltipViewModel } from "../view-models/dashboard";

const EMPTY = new Map<string, TeamTooltipViewModel>();

const TeamTooltipContext = createContext<ReadonlyMap<string, TeamTooltipViewModel>>(EMPTY);

interface TeamTooltipProviderProps {
  tooltips: readonly TeamTooltipViewModel[];
  children: ReactNode;
}

// Makes the per-team tooltip data available to any descendant trigger without
// threading it through every bracket/group component.
export function TeamTooltipProvider({ tooltips, children }: TeamTooltipProviderProps): JSX.Element {
  const map = useMemo(() => new Map(tooltips.map((tooltip) => [tooltip.teamId, tooltip])), [tooltips]);
  return <TeamTooltipContext.Provider value={map}>{children}</TeamTooltipContext.Provider>;
}

export function useTeamTooltip(teamId: string | undefined): TeamTooltipViewModel | undefined {
  const map = useContext(TeamTooltipContext);
  return teamId === undefined ? undefined : map.get(teamId);
}

interface TeamTooltipProps {
  teamId: string | undefined;
  // Slot-specific qualification source/unresolved reason for the triggering
  // bracket participant, folded into the tooltip so the bracket needs only one.
  note?: string;
  // Flag + name nodes that act as the hover/tap trigger.
  children: ReactNode;
  // Layout container for the trigger when no tooltip data is available, so the
  // flag and name keep their row layout in either case.
  fallback?: (children: ReactNode) => JSX.Element;
}

// Wraps a team flag+name so hovering (pointer) or tapping (touch) reveals the
// team's standing and projected Round-of-32 path. Renders children untouched
// when no tooltip data exists (e.g. placeholder slots or unresolved teams).
export function TeamTooltip({ teamId, note, children, fallback }: TeamTooltipProps): JSX.Element {
  const data = useTeamTooltip(teamId);
  const [open, setOpen] = useState(false);

  if (data === undefined) {
    return fallback !== undefined ? fallback(children) : <>{children}</>;
  }

  const close = (): void => setOpen(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>): void => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((value) => !value);
    }
  };

  return (
    <ClickAwayListener onClickAway={close}>
      <Tooltip
        open={open}
        onOpen={() => setOpen(true)}
        onClose={close}
        title={<TeamTooltipContent data={data} note={note} />}
        placement="bottom-start"
        arrow
        // Touch uses an explicit tap to toggle (handled below); MUI's long-press
        // listener would otherwise compete with it.
        disableTouchListener
        slotProps={{ tooltip: { sx: { maxWidth: 300 } } }}
      >
        <Box
          component="span"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={data.accessibleName}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={handleKeyDown}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            minWidth: 0,
            cursor: "pointer",
            borderRadius: 0.5,
            "&:focus-visible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 1,
            },
          }}
        >
          {children}
        </Box>
      </Tooltip>
    </ClickAwayListener>
  );
}

function TeamTooltipContent({
  data,
  note,
}: {
  data: TeamTooltipViewModel;
  note?: string;
}): JSX.Element {
  const { projection } = data;
  return (
    <Stack spacing={0.5} sx={{ py: 0.25 }}>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box component="span" sx={{ fontSize: "1rem", lineHeight: 1 }} aria-hidden="true">
          {data.team.flagEmoji}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {data.team.name}
        </Typography>
      </Stack>

      <Typography variant="caption" sx={{ opacity: 0.85 }}>
        {data.positionLabel} · {data.groupLabel}
      </Typography>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      <Typography variant="caption" sx={{ display: "block" }}>
        Pts {data.points} · {data.recordLabel} (W-D-L) · GD {data.goalDifferenceLabel}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", opacity: 0.85 }}>
        P {data.played} · GF {data.goalsFor} · GA {data.goalsAgainst}
      </Typography>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        Past results
      </Typography>
      {data.pastMatches.length === 0 ? (
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          No finished matches
        </Typography>
      ) : (
        <Stack component="ul" spacing={0.25} sx={{ m: 0, p: 0, listStyle: "none" }}>
          {data.pastMatches.map((match) => (
            <Stack
              component="li"
              key={match.id}
              direction="row"
              alignItems="baseline"
              spacing={0.5}
              aria-label={match.accessibleName}
            >
              <Typography variant="caption" sx={{ minWidth: 18, fontWeight: 700 }}>
                {match.outcome}
              </Typography>
              <Typography variant="caption" sx={{ minWidth: 55, opacity: 0.75 }}>
                {match.roundLabel} · {match.matchLabel}
              </Typography>
              <Typography variant="caption" sx={{ flex: 1 }} noWrap>
                {match.opponent.flagEmoji} {match.opponent.shortName}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                {match.scoreLabel}{match.penaltiesLabel === undefined ? "" : ` (${match.penaltiesLabel})`}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {note !== undefined && (
        <Typography variant="caption" sx={{ display: "block", opacity: 0.85, fontStyle: "italic" }}>
          {note}
        </Typography>
      )}

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

      <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
        {projection.determined ? (
          <>
            <Chip
              label={projection.statusLabel}
              size="small"
              color={projection.confirmed ? "success" : "default"}
              variant="outlined"
              sx={{ height: 16, fontSize: "0.6rem", color: "inherit", borderColor: "rgba(255,255,255,0.4)" }}
            />
            <Typography variant="caption">
              R32: {projection.matchLabel} vs {projection.opponentLabel}
            </Typography>
          </>
        ) : (
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            R32: {projection.placeholderLabel}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
