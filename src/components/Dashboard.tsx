import { useMemo } from "react";
import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import BracketSection from "./BracketSection";
import BracketSkeleton from "./BracketSkeleton";
import DashboardFooter from "./DashboardFooter";
import DashboardHeader from "./DashboardHeader";
import EventLog from "./EventLog";
import GroupCardStripSkeleton from "./GroupCardSkeleton";
import GroupCardStrip from "./GroupCardStrip";
import MatchTicker from "./MatchTicker";
import OutageAlert from "./OutageAlert";
import RulesDisclosure from "./RulesDisclosure";
import ThirdPlaceTable from "./ThirdPlaceTable";
import { useDashboardData } from "../hooks/useDashboardData";
import { composeDashboardViewModel } from "../view-models";
import type { DashboardFormatOptions, DashboardViewModel } from "../view-models";
import type { TournamentDataSource } from "../domain";
import { VIEW_ICONS, VIEW_SYMBOLS } from "./view-symbols";

interface DashboardProps {
  dataSource: TournamentDataSource;
}

function resolveLocale(): string {
  return typeof navigator !== "undefined" && navigator.language
    ? navigator.language
    : "en-US";
}

function resolveTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export default function Dashboard({ dataSource }: DashboardProps): JSX.Element {
  const data = useDashboardData(dataSource);
  const { snapshot } = data;

  // Recompute the rules-engine view model only when the snapshot changes, so a
  // single live score update flows through standings, the third-place ranking,
  // and the bracket without a page reload — and unaffected cards are not
  // needlessly rebuilt.
  const viewModel = useMemo<DashboardViewModel | null>(() => {
    if (snapshot === null) return null;
    const options: DashboardFormatOptions = {
      locale: resolveLocale(),
      timeDisplayMode: "LOCAL",
      now: new Date(),
      localTimeZone: resolveTimeZone(),
    };
    try {
      return composeDashboardViewModel(snapshot, options);
    } catch (error) {
      // Never let a rules-engine edge case blank the whole page.
      console.error("Failed to compose dashboard view model", error);
      return null;
    }
  }, [snapshot]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 1. Application header and data status */}
      {viewModel !== null ? (
        <DashboardHeader
          header={viewModel.header}
          isRefreshing={data.isRefreshing}
          onRefresh={data.refresh}
        />
      ) : (
        <PendingHeader onRefresh={data.refresh} isLoading={data.isLoading} />
      )}

      {snapshot !== null && (
        <OutageAlert
          status={data.status}
          staleLabel={data.staleLabel}
          onRefresh={data.refresh}
          isRefreshing={data.isRefreshing}
        />
      )}

      {viewModel !== null && (
        <Box component="section" sx={{ borderBottom: 1, borderColor: "divider" }}>
          <MatchTicker ticker={viewModel.ticker} />
        </Box>
      )}

      <Box component="main" sx={{ flex: 1 }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>
          <Stack spacing={3}>
            {viewModel !== null ? (
              <DashboardContent viewModel={viewModel} />
            ) : data.status === "error" ? (
              <OutageFallback onRefresh={data.refresh} isRefreshing={data.isRefreshing} />
            ) : (
              <LoadingFallback />
            )}

            {/* 5. Compact rules and data-source disclosure */}
            <RulesDisclosure />
          </Stack>
        </Container>
      </Box>

      {/* 6. Footer */}
      <DashboardFooter />
    </Box>
  );
}

function DashboardContent({ viewModel }: { viewModel: DashboardViewModel }): JSX.Element {
  return (
    <>
      {/* Recent events log */}
      <EventLog log={viewModel.eventLog} />

      {/* 2. Horizontally scrolling group tables */}
      <Box component="section" aria-label="Group tables">
        <SectionHeading>Group tables</SectionHeading>
        <GroupCardStrip groups={viewModel.groups} />
      </Box>

      {/* 3. Best third-place ranking */}
      <Box component="section" aria-label="Best third-place ranking">
        <ThirdPlaceTable thirdPlace={viewModel.thirdPlace} />
      </Box>

      {/* 4. Knockout bracket */}
      <Box component="section" aria-label="Knockout bracket">
        <SectionHeading>Knockout bracket</SectionHeading>
        <BracketSection rounds={viewModel.bracket} />
      </Box>
    </>
  );
}

function LoadingFallback(): JSX.Element {
  return (
    <>
      <Box component="section" aria-label="Group tables">
        <SectionHeading>Group tables</SectionHeading>
        <GroupCardStripSkeleton />
      </Box>
      <Box component="section" aria-label="Knockout bracket">
        <SectionHeading>Knockout bracket</SectionHeading>
        <BracketSkeleton />
      </Box>
    </>
  );
}

function OutageFallback({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}): JSX.Element {
  // No cached snapshot is available: explain that live data is temporarily
  // unavailable while retaining the static bracket and group structure. ESPN
  // retries continue automatically in the background.
  return (
    <>
      <Alert
        severity="error"
        role="alert"
        action={
          <Button color="inherit" size="small" onClick={onRefresh} disabled={isRefreshing}>
            {VIEW_SYMBOLS.actions.retry.value}
          </Button>
        }
      >
        {VIEW_SYMBOLS.statuses.liveDataUnavailableRetrying.value}
      </Alert>
      <LoadingFallback />
    </>
  );
}

function SectionHeading({ children }: { children: ReactNode }): JSX.Element {
  return (
    <Typography
      variant="h6"
      component="h2"
      sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
    >
      {children}
    </Typography>
  );
}

function PendingHeader({
  onRefresh,
  isLoading,
}: {
  onRefresh: () => void;
  isLoading: boolean;
}): JSX.Element {
  const RefreshIcon = VIEW_ICONS.refresh.value;

  return (
    <AppBar position="static" component="header">
      <Toolbar>
        <Stack direction="row" alignItems="center" sx={{ width: "100%" }}>
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            World Cup 2026 Dashboard
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" sx={{ opacity: 0.85, whiteSpace: "nowrap" }}>
            {isLoading ? VIEW_SYMBOLS.statuses.loading.value : VIEW_SYMBOLS.statuses.updating.value}
          </Typography>
          <IconButton
            onClick={onRefresh}
            aria-label={VIEW_SYMBOLS.actions.refreshData.value}
            color="inherit"
            sx={{ minWidth: 44, minHeight: 44 }}
          >
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
