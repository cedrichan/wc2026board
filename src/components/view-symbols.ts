import CheckIcon from "@mui/icons-material/Check";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

type IconComponent = typeof CheckIcon;

export interface IconEntry<TIcon extends IconComponent = IconComponent> {
  value: TIcon;
  description: string;
}

export interface SymbolEntry<TValue extends string> {
  value: TValue;
  description: string;
}

export const VIEW_ICONS = {
  advancing: {
    value: CheckIcon,
    description: "Marks the participant that has officially advanced from a completed knockout match.",
  },
  info: {
    value: InfoOutlinedIcon,
    description: "Indicates that more explanatory context is available in a tooltip.",
  },
  refresh: {
    value: RefreshIcon,
    description: "Represents a manual data refresh action for the dashboard.",
  },
} as const;

export const VIEW_SYMBOLS = {
  fallbackFlag: {
    value: "🏳️",
    description: "Fallback flag emoji used when no country-specific flag can be resolved for a team.",
  },
  unresolvedSuffix: {
    value: "(?)",
    description: "Suffix appended to a team label when the slot is unresolved.",
  },
  projectedChip: {
    value: "Projected",
    description: "Chip label used for teams that are projected into a slot but not yet confirmed.",
  },
  liveChip: {
    value: "Live",
    description: "Chip label used to mark a group or section currently affected by live matches.",
  },
  staleDataChip: {
    value: "Data may be stale",
    description: "Warning chip shown when the latest refresh may no longer be current.",
  },
  qualificationBoundaryUnresolved: {
    value: "Qualification boundary unresolved",
    description: "Notice shown when the eighth-place third-place qualification line cannot be resolved yet.",
  },
  bracketRoundShortLabels: {
    ROUND_OF_32: {
      value: "R32",
      description: "Compact selector label for the Round of 32 bracket column.",
    },
    ROUND_OF_16: {
      value: "R16",
      description: "Compact selector label for the Round of 16 bracket column.",
    },
    QUARTER_FINAL: {
      value: "QF",
      description: "Compact selector label for the quarter-final bracket column.",
    },
    SEMI_FINAL: {
      value: "SF",
      description: "Compact selector label for the semi-final bracket column.",
    },
    THIRD_PLACE: {
      value: "3rd",
      description: "Compact selector label for the third-place match bracket column.",
    },
    FINAL: {
      value: "Final",
      description: "Compact selector label for the final bracket column.",
    },
  },
  groupQualificationIndicators: {
    DIRECT: {
      value: "Q",
      description: "Position marker for a team directly qualifying from first or second place in its group.",
    },
    THIRD_PLACE_QUALIFIER: {
      value: "Q3",
      description: "Position marker for a third-place team currently inside the best-eight cutoff.",
    },
    UNRESOLVED: {
      value: "?",
      description: "Position marker for a team whose placement or qualification state is unresolved.",
    },
  },
  actions: {
    refresh: {
      value: "Refresh",
      description: "Generic action label for reloading the current dashboard data state.",
    },
    refreshData: {
      value: "Refresh data",
      description: "Accessible label for controls that trigger a manual dashboard refresh.",
    },
    refreshingData: {
      value: "Refreshing data",
      description: "Accessible label for controls while a manual dashboard refresh is in progress.",
    },
    retry: {
      value: "Retry",
      description: "Action label for retrying a failed data request.",
    },
  },
  statuses: {
    loading: {
      value: "Loading…",
      description: "Short status text shown while the initial dashboard snapshot is loading.",
    },
    updating: {
      value: "Updating…",
      description: "Short status text shown while the dashboard is refreshing an existing state.",
    },
    liveDataUnavailableCached: {
      value: "Live data temporarily unavailable. Showing last cached data.",
      description: "Alert copy shown when refresh fails but a cached snapshot is still available.",
    },
    liveDataUnavailableRetrying: {
      value: "Live data is temporarily unavailable. Retrying automatically — the dashboard does not switch to another provider.",
      description: "Alert copy shown when no cached snapshot is available and background retries continue.",
    },
  },
} as const;
