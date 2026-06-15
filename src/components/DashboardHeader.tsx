import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { HeaderViewModel } from "../view-models/dashboard";
import { relativeUpdatedLabel } from "../view-models/dashboard";
import { VIEW_ICONS, VIEW_SYMBOLS } from "./view-symbols";

interface DashboardHeaderProps {
  header: HeaderViewModel;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({ header, isRefreshing, onRefresh }: DashboardHeaderProps): JSX.Element {
  const RefreshIcon = VIEW_ICONS.refresh.value;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const updatedIso = header.sourceUpdatedAtIso ?? header.generatedAtIso;
  const updatedLabel = relativeUpdatedLabel(updatedIso, now);

  return (
    <AppBar position="static" component="header">
      <Toolbar>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ width: "100%", flexWrap: "wrap", rowGap: 1 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ flexWrap: "wrap", flex: "1 1 16rem", minWidth: 0 }}
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{ fontWeight: 700, letterSpacing: 0.5, whiteSpace: { xs: "normal", sm: "nowrap" } }}
            >
              World Cup 2026 Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, whiteSpace: "nowrap" }}>
              {header.stage.label}
            </Typography>
            {header.live.isLive && (
              <Chip
                label={header.live.label}
                size="small"
                aria-label={header.live.accessibleLabel}
                sx={{ bgcolor: "success.main", color: "success.contrastText" }}
              />
            )}
            {header.stale && (
              <Chip
                label={header.staleLabel ?? VIEW_SYMBOLS.staleDataChip.value}
                size="small"
                color="warning"
              />
            )}
          </Stack>

          <Box sx={{ flex: 1, minWidth: { xs: 0, sm: "auto" } }} />

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              flex: { xs: "1 1 100%", sm: "0 0 auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
              minWidth: 0,
            }}
          >
            <Typography
              variant="body2"
              aria-label={header.updatedAccessibleLabel}
              sx={{
                opacity: 0.85,
                whiteSpace: { xs: "normal", sm: "nowrap" },
                overflowWrap: "anywhere",
                minWidth: 0,
              }}
            >
              {updatedLabel}
            </Typography>

            <IconButton
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label={isRefreshing ? VIEW_SYMBOLS.actions.refreshingData.value : VIEW_SYMBOLS.actions.refreshData.value}
              color="inherit"
              sx={{ minWidth: 44, minHeight: 44, flexShrink: 0 }}
            >
              {isRefreshing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Stack>
        </Stack>
      </Toolbar>

      {header.warnings.length > 0 && (
        <Box
          component="span"
          aria-live="polite"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
          }}
        >
          {header.warnings.join(". ")}
        </Box>
      )}
    </AppBar>
  );
}
