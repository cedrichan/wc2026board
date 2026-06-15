import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import GroupCard from "./GroupCard";
import type { GroupViewModel } from "../view-models/dashboard";

const GROUP_IDS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

interface GroupCardStripProps {
  groups: readonly GroupViewModel[];
}

export default function GroupCardStrip({ groups }: GroupCardStripProps): JSX.Element {
  const groupsById = new Map(groups.map((g) => [g.groupId, g]));

  return (
    <Box
      tabIndex={0}
      role="region"
      aria-label="Group tables, horizontally scrollable — use left and right arrow keys or swipe to navigate"
      sx={{
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        outline: "none",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: "2px",
        },
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          flexDirection: "row",
          gap: 2,
          pb: 1,
          minWidth: "max-content",
        }}
      >
        {GROUP_IDS.map((id) => {
          const group = groupsById.get(id);
          if (group !== undefined) {
            return (
              <Box key={id} sx={{ scrollSnapAlign: "start" }}>
                <GroupCard group={group} />
              </Box>
            );
          }
          return <GroupPlaceholder key={id} groupId={id} />;
        })}
      </Box>
    </Box>
  );
}

function GroupPlaceholder({ groupId }: { groupId: string }): JSX.Element {
  return (
    <Card
      sx={{
        width: { xs: "88vw", md: 320 },
        flexShrink: 0,
        scrollSnapAlign: "start",
      }}
      aria-label={`Group ${groupId} — data unavailable`}
    >
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { pb: 1.5 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 120,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.secondary" }}>
          Group {groupId}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Data unavailable
        </Typography>
      </CardContent>
    </Card>
  );
}
