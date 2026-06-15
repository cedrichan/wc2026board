import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { DashboardDataStatus } from "../hooks/useDashboardData";

interface OutageAlertProps {
  status: DashboardDataStatus;
  staleLabel: string | undefined;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function OutageAlert({ status, staleLabel, onRefresh, isRefreshing }: OutageAlertProps): JSX.Element | null {
  if (status === "error") {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRefresh} disabled={isRefreshing}>
            Retry
          </Button>
        }
        sx={{ borderRadius: 0 }}
        role="alert"
        aria-live="assertive"
      >
        <Typography variant="body2">
          Live data temporarily unavailable. Showing last cached data.
          {staleLabel !== undefined && ` (${staleLabel})`}
        </Typography>
      </Alert>
    );
  }

  if (status === "stale" && staleLabel !== undefined) {
    return (
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={onRefresh} disabled={isRefreshing}>
            Refresh
          </Button>
        }
        sx={{ borderRadius: 0 }}
        role="status"
        aria-live="polite"
      >
        <Typography variant="body2">{staleLabel}</Typography>
      </Alert>
    );
  }

  return null;
}
