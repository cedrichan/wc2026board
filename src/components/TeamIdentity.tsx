import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { TeamTooltip } from "./TeamTooltip";

export interface TeamIdentityData {
  id: string;
  flagEmoji: string;
  flagAlt: string;
}

interface TeamIdentityProps {
  team: TeamIdentityData;
  children: ReactNode;
  note?: string;
  flagSize?: number;
  sx?: SxProps<Theme>;
}

/** Shared flag-and-country trigger used everywhere an identified team is shown. */
export default function TeamIdentity({
  team,
  children,
  note,
  flagSize = 20,
  sx,
}: TeamIdentityProps): JSX.Element {
  const content = (
    <>
      <Box
        component="span"
        role="img"
        aria-label={team.flagAlt}
        sx={{
          width: flagSize,
          height: flagSize,
          fontSize: `${Math.max(0.7, flagSize / 25)}rem`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {team.flagEmoji}
      </Box>
      {children}
    </>
  );

  const layout = (nodes: ReactNode): JSX.Element => (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, minWidth: 0, ...sx }}
    >
      {nodes}
    </Box>
  );

  return (
    <TeamTooltip teamId={team.id} note={note} fallback={layout}>
      {content}
    </TeamTooltip>
  );
}
